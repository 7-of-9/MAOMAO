using mmdb_model;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Collections.Concurrent;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using mm_global;
using mm_global.Extensions;
using mm_svc.Terms;
using System.Diagnostics;
using static mm_svc.Terms.Correlations;
using System.Data.SqlClient;
using System.Threading;

namespace wiki_walker
{
    public static class Program
    {
        private static Stopwatch sw = new Stopwatch();
        private static int gt_added_count = 0;
        private static int term_added_count = 0;

        private static int term_pairs_checked = 0;
        private static object o_child_pages_fetched = "42";

        private static int parent_page_counter = 0;
        private static object o_parent_pages_fetched = "42";

        private static int child_page_counter_batch = 0;
        private static List<double> child_page_counter_batches_persec = new List<double>();

        private static int max_depth = 23;
        private static bool reprocess_to_max_depth = false;
        private static bool reprocess_gts = true;

        private static bool walk_test_only = false;

        private static string top_term_name;

        public static void Main(string[] args)
        {
            ConsoleTraceListener listener = new ConsoleTraceListener();
            Trace.Listeners.Add(listener);
            sw.Start();

            if (args[0] == "ns")
            {
                Walker_NamespaceCounter.Go();
            }
            else if (args[0] == "gt")
            {
                var parent_page_ids = new List<long>();
                var parent_page_names = new List<string>();

                using (var db = mm02Entities.Create())
                {
                    top_term_name = args[1]; // e.g. Main_topic_classifications for rootcat, or English_women_comedians for a subcat
                    var term = db.terms.Where(p => p.name == top_term_name.Replace("_", " ") && p.term_type_id == (int)g.TT.WIKI_NS_14).Single();
                    var mmcat_level = db.golden_term.Where(p => p.parent_term_id == term.id).Max(p => p.mmcat_level);

                    try { max_depth = Convert.ToInt32(args[2]); } catch { }

                    reprocess_to_max_depth = args.Contains("RMD");

                    Trace.WriteLine($"go: {top_term_name} @ mmcatlevel={mmcat_level}...");
                    WalkDownTree(parent_page_ids, parent_page_names, top_term_name, mmcat_level);
                }

                //WalkDownTree(parent_page_ids, "Main_topic_classifications", 1);
                //WalkDownTree(parent_page_ids, "English_women_comedians", 8);

                //WalkDownTree(parent_page_ids, "Comics", 6);
                //WalkDownTree(parent_page_ids, "Feminism", 6);
                //WalkDownTree(parent_page_ids, "Politics", 3);
            }

            Trace.WriteLine("ALL DONE!! Press any key...");
            Console.ReadKey();

            //WalkUpTreeRandom(); // run first to find/populate root
        }

        //private static ConcurrentDictionary<long, wiki_page> wiki_page_cache; // new ConcurrentDictionary<long, wiki_page>();

        private static bool WalkDownTree(List<long> parent_page_ids, List<string> parent_page_names, string parent_page_search, int level)
        {
            int par_max_terms = Debugger.IsAttached ? 1 : 1;
            int par_max_recurse = Debugger.IsAttached ? 1 : 16;
            var parent_path = string.Join("/", parent_page_names);

            if (parent_page_counter % 5000 == 0) {
                SqlConnection.ClearAllPools();
                Trace.WriteLine($"** 5000 CLEAR ALL POOLS **");
            }

            List<wiki_page> pages;
            using (var db = mm02Entities.Create()) //***
            {
                // SUBCATS only -- doesn't work well with calais NLP matching -- need leaf page nodes.
                // trying: subcats recurse, page nodes record (no recurse)

                // get supplied parent page - page or subcat
                pages = g.RetryMaxOrThrow(() => db.wiki_page.AsNoTracking()
                              .Where(p => p.page_title == parent_page_search
                                    && (p.page_namespace == 0 || // target: ~14m (!!) including pages (0)
                                        p.page_namespace == 14)) // target: ~4.3m for just subcats (14)
                                                                 //.Where(p => (p.processed_to_depth == null || p.processed_to_depth < max_depth
                                                                 //          || reprocess_to_max_depth == true
                                                                 //          || parent_page_ids.Count == 0)) // ...
                              .OrderBy(p => p.page_id)
                              .ToListNoLock(), 30, 3);
            }

            lock (o_parent_pages_fetched) {
                if (++parent_page_counter % 50 == 0) {
                    var pages_per_sec = parent_page_counter / sw.Elapsed.TotalSeconds;
                    Trace.WriteLine($" >> PARENT - pages-(ns=14||0)-total: {parent_page_counter} @ {pages_per_sec.ToString("0.0")} per/sec >>> D={level} > {parent_path}");
                }
                // the whole thing just slows down over time; no idea why.
                //if (parent_page_counter % 5000 == 0) {
                //    GC.Collect(2);
                //    Trace.WriteLine($" *** GC.COLLECT(2) ***");
                //    Trace.WriteLine($" wait 30, reset sw & counter...");
                //    Thread.Sleep(1000 * 30);
                //    sw.Restart();
                //    parent_page_counter = 0;
                //}

                if (parent_page_counter == 1)
                    Console.Title = $"{top_term_name}: walk_test_only={walk_test_only} max_depth={max_depth} reprocess_to_max_depth={reprocess_to_max_depth} reprocess_gts={reprocess_gts}";
            }

            // for each supplied parent page -- pages & subcats
            var saw_exceptions_on_page_processing = false;
            try
            {
                // PARENT PAGE WALKING -- no concurrency: avoids dupe key inserts!!
                Parallel.ForEach(pages, new ParallelOptions() { MaxDegreeOfParallelism = 1 }, (parent_page) =>
                {
                    List<wiki_catlink> child_cls;
                    using (var db2 = mm02Entities.Create())
                    {
                        // get child cat links for parent page
                        child_cls = g.RetryMaxOrThrow(() => db2.wiki_catlink.AsNoTracking()
                                            .Where(p => p.cl_to == parent_page_search
                                                    && (p.cl_type == "subcat" || p.cl_type == "page") // cl_links to subcats && pages
                                                    && (p.processed_to_depth == null || p.processed_to_depth < max_depth
                                                        || reprocess_to_max_depth == true)
                                                    )
                                            .OrderByDescending(p => p.cl_from).ToListNoLock(), 30, 3);
                    }

                    var child_pages_to_walk = new ConcurrentBag<wiki_page>();
                    bool saw_concurrency_exception_on_GTs_any = false;
                    var child_page_cl_ids_to_update = new List<Guid>();
                    try {
                        // GT INSERTS FOR PARENT-CHILDREN LINKS
                        //ParallelForce.ForEach(child_cls,
                        Parallel.ForEach(child_cls, new ParallelOptions() { MaxDegreeOfParallelism = par_max_terms }, 
                        (child_page_cl) =>
                        { 
                            if (saw_concurrency_exception_on_GTs_any) return;
                            wiki_page child_page;
                            using (var db3 = mm02Entities.Create())
                            {
                                // get child page
                                child_page = g.RetryMaxOrThrow(() => db3.wiki_page.Find(child_page_cl.cl_from), 30, 3);// db3.wiki_page.AsNoTracking().Where(p => p.page_id == child_page_cl.cl_from).FirstOrDefaultNoLock();
                            }
                            if (child_page == null) return;
                            if (child_page.page_namespace != 0 && child_page.page_namespace != 14) return;

                            //var child_pages =
                            //    db3.wiki_page.AsNoTracking()
                            //       .Where(p => p.page_id == child_page_cl.cl_from
                            //           && (p.page_namespace == 14 || p.page_namespace == 0) // pages & subcats
                            //    )
                            //    .OrderBy(p => p.page_id)
                            //    .ToListNoLock();
                            //if (child_pages.Count() == 0) return;

                            lock (o_child_pages_fetched) {
                                if (++child_page_counter_batch % 2000 == 0) {
                                    var child_pages_per_sec = child_page_counter_batch / sw.Elapsed.TotalSeconds;
                                    Trace.WriteLine($"\t(child-pages-(ns=14||0)-total: {child_page_counter_batch} @ {child_pages_per_sec.ToString("0.0")} per/sec");//>> {parent_path})");
                                }
                            }

                            if (exclude_page(child_page.page_title.ltrim())) return;

                            // new: terms now distinct by page_namespace (2x term types - one for each wiki namespace...)
                            bool saw_concurrency_exception_on_GTs, saw_concurrency_exception_on_terms;

                            if (!walk_test_only)
                            {
                                RecordTerms(out saw_concurrency_exception_on_GTs, out saw_concurrency_exception_on_terms,
                                            parent_page,
                                            child_page,
                                            level,
                                            parent_page_search);
                            }

                            //if (saw_concurrency_exception_on_GTs) {
                            //    Trace.WriteLine($"** GOLDEN-TERM CONCURRENCY EXC: ABORTING THIS CHILD! child_page_cl.id={child_page_cl.id} / parent_page.page_id={parent_page.page_id}[{parent_page.page_title}] x child_page.page_id={child_page.page_id}* *");
                            //    saw_concurrency_exception_on_GTs_any = true;
                            //    continue; // assume another task has this chain; abort!
                            //}
                            //if (saw_concurrency_exception_on_terms) {
                            //    Trace.WriteLine($"** TERM CONCURRENCY EXC: ABORTING THIS CHILD! child_page_cl.id={child_page_cl.id} / parent_page.page_id={parent_page.page_id}[{parent_page.page_title}] x child_page.page_id={child_page.page_id}* *");
                            //    continue; // assume another task has this chain; abort!
                            //}

                            if (child_page.page_namespace == 14) // only recurse subcats!
                            {
                                if (level < max_depth
                                    && (child_page.processed_to_depth == null || child_page.processed_to_depth < max_depth || reprocess_to_max_depth == true))
                                {
                                    child_pages_to_walk.Add(child_page);
                                }
                            }
                            else {
                                // can immediately pages as fully processed - they aren't recursed
                                if (!walk_test_only) {
                                    SetPageProcessed(child_page.page_id);
                                    SetCatLinkProcessed(child_page_cl.id);
                                }
                            }
                        });
                    }
                    catch (AggregateException agex) {
                        Trace.WriteLine(agex.ToDetailedString());
                    }

                    // RECURSE
                    try {
                        Parallel.ForEach(child_pages_to_walk.OrderBy(p => p.page_id), new ParallelOptions() { MaxDegreeOfParallelism = par_max_recurse },
                        (child_page_to_walk) =>
                        {
                            // limit recursion
                            if (level < max_depth)
                            {
                                var new_parent_page_ids = new List<long>(parent_page_ids); // each branch in the tree has *its own* unique inheritence chain!
                                var new_parent_page_names = new List<string>(parent_page_names);
                                if (!new_parent_page_ids.Contains(child_page_to_walk.page_id))
                                {
                                    new_parent_page_ids.Add(child_page_to_walk.page_id);
                                    new_parent_page_names.Add(child_page_to_walk.page_title);
                                    WalkDownTree(new_parent_page_ids, new_parent_page_names, child_page_to_walk.page_title, level + 1);
                                }
                            }

                            // mark child page & catlink as processed to depth
                            if (!walk_test_only) {
                                SetPageProcessed(child_page_to_walk.page_id);
                                var child_cl = child_cls.Where(p => p.cl_from == child_page_to_walk.page_id).First();
                                SetCatLinkProcessed(child_cl.id);
                            }
                        });
                    }
                    catch (AggregateException agex) {
                        Trace.WriteLine(agex.ToDetailedString());
                    }

                    //if (saw_exceptions_on_cl_term_processing == false && saw_exceptions_on_cl_recursion == false)
                    //    db2.SaveChangesTraceValidationErrors(); //*** wiki_catlink - processed_to_depth

                    parent_page.processed_to_depth = max_depth; //** page
                });
            }
            catch (AggregateException agex) {
                Trace.WriteLine(agex.ToDetailedString());
                saw_exceptions_on_page_processing = true;
            }

            if (saw_exceptions_on_page_processing == false) {
                if (!walk_test_only) {
                    //db.SaveChangesTraceValidationErrors(); //** page - processed_to_depth
                    foreach (var page in pages)
                        SetPageProcessed(page.page_id);
                }
            }

            return true;
        }

        private static void SetCatLinkProcessed(Guid cl_id)
        {
            using (var db_update = mm02Entities.Create())
            {
                g.RetryMaxOrThrow(() =>
                    db_update.ObjectContext().ExecuteStoreCommand(
                    "UPDATE wiki_catlink SET processed_to_depth = {0} WHERE id = {1}",// AND (processed_to_depth != {0} OR processed_to_depth IS NULL)",
                    max_depth,
                    cl_id)
                , 30, 3);
            }
        }

        private static void SetPageProcessed(long page_id)
        {
            using (var db_update = mm02Entities.Create())
            {
                g.RetryMaxOrThrow(() =>
                    db_update.ObjectContext().ExecuteStoreCommand(
                        "UPDATE wiki_page SET processed_to_depth = {0} WHERE page_id = {1}",// AND (processed_to_depth != {0} OR processed_to_depth IS NULL)",
                        max_depth,
                        page_id)
                , 30, 3);
            }
        }

        //private static void WalkUpTreeRandom()
        //{
        //    // get wiki leaf nodes, random order
        //    var rnd = new Random();
        //    using (var db = mm02Entities.Create())
        //    {
        //        var leaves = db.wiki_catlink.AsNoTracking()
        //                       .Where(p => p.cl_type == "page" && (p.processed ?? false) == false)
        //                       .OrderBy(p => p.id).Skip(rnd.Next(0, 1000)).Take(100).ToListNoLock();

        //        //foreach (var leaf in leaves) {
        //        Parallel.ForEach(leaves, new ParallelOptions() { MaxDegreeOfParallelism = 100 }, (leaf) =>
        //        {
        //            using (var db2 = mm02Entities.Create())
        //            {
        //                var page = db2.wiki_page.AsNoTracking().Where(p => p.page_id == leaf.cl_from && p.page_namespace == 0).SingleOrDefault();
        //                if (page != null)
        //                {
        //                    Console.WriteLine($"> starting leaf walk for {page.page_title}...");
        //                    Walk(new List<long>(), page.page_title, leaf.cl_from, page.page_title);
        //                }
        //                var done = db2.wiki_catlink.Find(leaf.id);
        //                done.processed = true;
        //                db2.SaveChangesTraceValidationErrors();
        //            }
        //        });
        //    }
        //}


        //private static void Walk(List<long> parent_ids, string orig_page_title, long page_id, string child_name)
        //{
        //    using (var db = mm02Entities.Create())
        //    {
        //        var cat_names = db.wiki_catlink.AsNoTracking().Where(p => p.cl_from == page_id).Select(p => p.cl_to).ToListNoLock();
        //        //foreach (var cat_name in cat_names)

        //        Parallel.ForEach(cat_names, new ParallelOptions() { MaxDegreeOfParallelism = 10 }, (cat_name) =>
        //        {
        //            using (var db2 = mm02Entities.Create())
        //            {
        //                var cat_pages = db2.wiki_page.AsNoTracking().Where(p => p.page_title == cat_name
        //                    && (p.page_namespace == 14 || p.page_namespace == 0)).ToListNoLock();
        //                if (cat_pages.Count == 0) { return; }// continue;

        //                foreach (var cat_page in cat_pages)
        //                {
        //                    var exclude = exclude_page(cat_page.page_title.ltrim());
        //                    if (exclude)
        //                        continue;

        //                    RecordTerms(cat_name, cat_page.page_id, child_name, page_id, -1, orig_page_title);

        //                    // recurse - stop at root
        //                    if (parent_ids.Contains(cat_page.page_id))
        //                        continue;
        //                    else
        //                        parent_ids.Add(cat_page.page_id);

        //                    if (cat_name == "Main_topic_classifications" || cat_name == "Wikipedia_categories") {
        //                        Trace.WriteLine($"(root; stopping.)");
        //                        continue;
        //                    }
        //                    else
        //                        Walk(parent_ids, orig_page_title, cat_page.page_id, cat_name);
        //                }
        //                if (cat_names.Count == 0) 
        //                    Trace.WriteLine($"child_page_id={page_id} ** no parent cats **");
        //            }
        //        });
        //    }
        //}

        //private static ConcurrentDictionary<string, term> term_cache;// = new ConcurrentDictionary<string, term>();

        private static void RecordTerms(
            out bool saw_concurrency_exception_on_GTs, 
            out bool saw_concurrency_exception_on_terms,
            wiki_page parent, wiki_page child, int level = -1, string info = null)
        {
            saw_concurrency_exception_on_GTs = false;
            saw_concurrency_exception_on_terms = false;

            string parent_name = parent.page_title;
            long parent_page_id = parent.page_id;
            string child_name = child.page_title;
            long child_page_id = child.page_id;
            var cleaned_parent_name = parent_name.Replace("_", " ");
            var cleaned_child_name = child_name.Replace("_", " ");

            //Debug.WriteLine($"{child_name}");
            //if (child_name == "Jo_Brand")
            //    Debugger.Break();

            var new_child_term = false;
            var new_parent_term = false;
            using (var db = mm02Entities.Create())  // create terms, type=wikicat
            {
                term child_term = null, parent_term = null;

                //var child_allow = new List<int>();
                //if (child.page_namespace == 14) { child_allow.Add((int)g.TT.WIKI_NS_14); }
                //else if (child.page_namespace == 0) { child_allow.Add((int)g.TT.WIKI_NS_14); child_allow.Add((int)g.TT.WIKI_NS_0); }

                //var parent_allow = new List<int>();
                //if (parent.page_namespace == 14) { parent_allow.Add((int)g.TT.WIKI_NS_14); }
                //else if (parent.page_namespace == 0) { parent_allow.Add((int)g.TT.WIKI_NS_14); parent_allow.Add((int)g.TT.WIKI_NS_0); }

                // one hit - both terms
                //again:
                //var terms_qry = db.terms.AsNoTracking().Where(
                //    p => (p.name == cleaned_child_name && (p.term_type_id == (int)g.TT.WIKI_NS_14 || p.term_type_id == (int)g.TT.WIKI_NS_0))
                //      || (p.name == cleaned_parent_name && (p.term_type_id == (int)g.TT.WIKI_NS_14 || p.term_type_id == (int)g.TT.WIKI_NS_0)))
                //      .Take(2);
                ////Debug.WriteLine(terms_qry.ToString());
                //var terms = terms_qry.ToListNoLock();
                //foreach (var term in terms)
                //{
                //    if (term.name.ltrim() == cleaned_child_name.ltrim()) child_term = term;
                //    if (term.name.ltrim() == cleaned_parent_name.ltrim()) parent_term = term;
                //}

                again1:
                if (child.page_namespace == 14)
                    child_term = db.terms.AsNoTracking().Where(p => p.name == cleaned_child_name && p.term_type_id == (int)g.TT.WIKI_NS_14).FirstOrDefaultNoLock();
                else // don't add ns0 terms if matching ns14 term already exists
                    child_term = db.terms.AsNoTracking().Where(p => p.name == cleaned_child_name && (p.term_type_id == (int)g.TT.WIKI_NS_14 || p.term_type_id == (int)g.TT.WIKI_NS_0)).FirstOrDefaultNoLock();
                if (child_term == null && cleaned_child_name.Length <= 128) {
                    new_child_term = true;
                    child_term = new term() { cal_entity_type_id = null, name = cleaned_child_name, occurs_count = -1, term_type_id = child.page_namespace };
                    db.terms.Add(child_term);
                    term_added_count++;
                    if (!g.RetryMaxOrThrow(() => db.SaveChanges_IgnoreDupeKeyEx($"child_term: {child_term.ToString()} // child: [{child.page_title}]ns={child.page_namespace} -> parent: [{parent.page_title}]ns={parent.page_namespace}"), 30, 3))
                        { saw_concurrency_exception_on_terms = true;  Thread.Sleep(1); goto again1; }
                }

                again2:
                if (parent.page_namespace == 14)
                    parent_term = db.terms.AsNoTracking().Where(p => p.name == cleaned_parent_name && p.term_type_id == (int)g.TT.WIKI_NS_14).FirstOrDefaultNoLock();
                else // don't add ns0 terms if matching ns14 term already exists
                    parent_term = db.terms.AsNoTracking().Where(p => p.name == cleaned_parent_name && (p.term_type_id == (int)g.TT.WIKI_NS_14 || p.term_type_id == (int)g.TT.WIKI_NS_0)).FirstOrDefaultNoLock();
                if (parent_term == null && cleaned_parent_name.Length <= 128) {
                    new_parent_term = true;
                    parent_term = new term() { cal_entity_type_id = null, name = cleaned_parent_name, occurs_count = -1, term_type_id = parent.page_namespace };
                    db.terms.Add(parent_term);
                    term_added_count++;
                    if (!g.RetryMaxOrThrow(() => db.SaveChanges_IgnoreDupeKeyEx("parent - " + parent_term.ToString()), 30, 3))
                        { saw_concurrency_exception_on_terms = true; Thread.Sleep(1); goto again2; }
                }

                term_pairs_checked++;

                // record relation
                if (new_child_term || new_parent_term || reprocess_gts)
                {
                    if (parent_term != null && child_term != null)
                    {
                        var added = RecordGoldenTerm(out saw_concurrency_exception_on_GTs, parent_term.id, child_term.id, level);
                        if (added)
                        {
                            var per_sec = (++gt_added_count) / sw.Elapsed.TotalSeconds;
                            if (gt_added_count % 100 == 0)
                                Trace.WriteLine($"\t\t({info}) ... @D={level} :: {child_name}[{child_page_id}]ns={child.page_namespace} --> {parent_name}[{parent_page_id}]ns={parent.page_namespace} ({gt_added_count} in {sw.Elapsed.TotalSeconds.ToString("0")} sec(s) = {per_sec.ToString("0.0")} GTs per/sec)");
                        }
                    }
                }

                //if (term_added_count % 100 == 0) { 
                //    var terms_per_sec = (term_added_count) / sw.Elapsed.TotalSeconds;
                //    Trace.WriteLine($"TERMS ADDED: ({term_added_count} in {sw.Elapsed.TotalSeconds.ToString("0")} sec(s) = {terms_per_sec.ToString("0.0")} TERMS per/sec)");
                //}

                //if (term_pairs_checked % 100 == 0) {
                //    var term_pairs_checked_per_sec = term_pairs_checked / sw.Elapsed.TotalSeconds;
                //    Trace.WriteLine($"term_pairs_checked: {term_pairs_checked} in {sw.Elapsed.TotalSeconds.ToString("0")} sec(s) = {term_pairs_checked_per_sec.ToString("0.0")} per/sec)");
                //}
            }
        }

        private static bool RecordGoldenTerm(out bool saw_concurrency_exception, long parent_term_id, long child_term_id, int level = -1)
        {
            saw_concurrency_exception = false;
            if (parent_term_id == child_term_id) return false;
            using (var db = mm02Entities.Create())
            {
                // term pair already exists? nop.
                // PERF -- just try to insert; ignore error. reduce one read
                // UPDATE: causes lots of PAGELATCH_EX contention if just trying the insert without first checking if it's needed!
                // probably - should run the initial SELECT if tree is mostly already populated; and should NOT run the initial SELECT
                // while populating the tree -- so, when reprocessing to max depth, run with it ON
                // when not reprocessing to max depth, run with it OFF
                /*var known_gt = db.golden_term.FirstOrDefault(p => p.parent_term_id == parent_term_id && p.child_term_id == child_term_id);
                if (known_gt != null) {
                    //if (known_gt.mmcat_level != level) {
                    //    known_gt.mmcat_level = level;
                    //    db.SaveChangesTraceValidationErrors();
                    //}
                    return false;
                }*/

                // record term pair, assign mmcat level = -1 for now (need to calc it later, when tree is complete, by walking from root(s)
                var new_gt = new golden_term() { parent_term_id = parent_term_id, child_term_id = child_term_id, from_wiki = true, mmcat_level = level };
                db.golden_term.Add(new_gt);
                if (!g.RetryMaxOrThrow(() => db.SaveChanges_IgnoreDupeKeyEx($"GT - {parent_term_id}x{child_term_id}"), 0, 0))
                    return false; // don't care //saw_concurrency_exception = true;

                return new_gt.id != 0; // saved, got new ID
            }
        }

        private static bool exclude_page(string page_name_ltrim)
        {
            var exclude = false;

            if (page_name_ltrim.Contains("articles_")) exclude = true;
            else if (page_name_ltrim.Contains("_articles")) exclude = true;

            else if (page_name_ltrim == ("articles")) exclude = true;
            else if (page_name_ltrim == ("contents")) exclude = true;
            else if (page_name_ltrim == ("wikiboxes")) exclude = true;

            // include: could be interesting
            //else if (page_name_ltrim == ("good_articles")) not_a_topic = true; //***
            //else if (page_name_ltrim == ("featured_articles")) not_a_topic = true; //***
            //else if (page_name_ltrim == ("featured_content")) not_a_topic = true;  //***
            //else if (page_name_ltrim == ("featured_lists")) not_a_topic = true;  //***
            //else if (page_name_ltrim.Contains("disambiguation")) not_a_topic = true; // prevent otherwise orphaned things

            else if (page_name_ltrim.Contains("accuracy_disputes")) exclude = true;

            else if (page_name_ltrim.StartsWith("commons_category_with")) exclude = true;
            else if (page_name_ltrim.StartsWith("creative_commons")) exclude = true;

            else if (page_name_ltrim.Contains("categories_")) exclude = true;
            //else if (page_name_ltrim.Contains("_categories")) not_a_topic = true; // too broad: "Taxonomic_categories"
            else if (page_name_ltrim.Contains("underpopulated_")
                  && page_name_ltrim.Contains("_categories")) exclude = true;
            else if (page_name_ltrim.Contains("very_large_categories")) exclude = true;
            else if (page_name_ltrim.StartsWith("hidden_categories")) exclude = true;
            else if (page_name_ltrim.StartsWith("all_redirect_categories")) exclude = true;
            else if (page_name_ltrim.StartsWith("tracking_categories")) exclude = true;

            else if (page_name_ltrim.Contains("pages_")) exclude = true;

            else if (page_name_ltrim.StartsWith("wikipedia_")) exclude = true;
            else if (page_name_ltrim.Contains("wikipedia_administration")) exclude = true;

            else if (page_name_ltrim.Contains("use_")
                 && page_name_ltrim.Contains("_english")) exclude = true;
            else if (page_name_ltrim.StartsWith("use_dmy")) exclude = true;
            else if (page_name_ltrim.StartsWith("use_mdy")) exclude = true;
            else if (page_name_ltrim.StartsWith("use_harvard")) exclude = true;

            else if (page_name_ltrim.Contains("-centric")) exclude = true;

            else if (page_name_ltrim.StartsWith("engvar")) exclude = true;

            else if (page_name_ltrim.StartsWith("cs1_")) exclude = true;
            else if (page_name_ltrim.StartsWith("cs2_")) exclude = true;

            else if (page_name_ltrim.Contains("npov")) exclude = true;

            else if (page_name_ltrim.Contains("blp")) exclude = true;

            else if (page_name_ltrim.Contains("m_w")) exclude = true;
            else if (page_name_ltrim.Contains("g7")) exclude = true;

            else if (page_name_ltrim.Contains("vague_or_ambiguous")) exclude = true;
            else if (page_name_ltrim.Contains("unverifiable_")) exclude = true;
            else if (page_name_ltrim.Contains("to_be_merged")) exclude = true;

            else if (page_name_ltrim.Contains("biography_with_signature")) exclude = true;
            else if (page_name_ltrim.Contains("image_galleries")) exclude = true;

            else if (page_name_ltrim.Contains("incomplete_lists")) exclude = true;
            else if (page_name_ltrim.Contains("related_lists")) exclude = true;
            else if (page_name_ltrim.Contains("lists_")) exclude = true;

            else if (page_name_ltrim.Contains("infobox")) exclude = true;
            else if (page_name_ltrim.Contains("chembox")) exclude = true;

            else if (page_name_ltrim.Contains("_needing_confirmation")) exclude = true;
            else if (page_name_ltrim.Contains("requests_for")) exclude = true;

            else if (page_name_ltrim.StartsWith("wikiproject_")) exclude = true;
            else if (page_name_ltrim.Contains("wikidata_")) exclude = true;
            else if (page_name_ltrim.Contains("_wikidata")) exclude = true;
            else if (page_name_ltrim.Contains("Wikiquote")) exclude = true;

            else if (page_name_ltrim.Contains("taxoboxes_")) exclude = true;
            else if (page_name_ltrim.Contains("drugboxes_")) exclude = true;
            else if (page_name_ltrim.Contains("interlanguage_")) exclude = true;
            else if (page_name_ltrim.Contains("GraySubject")) exclude = true;
            else if (page_name_ltrim.Contains("GrayPage")) exclude = true;

            else if (page_name_ltrim.Contains("_template")) exclude = true; // "Geobox2 template"
            else if (page_name_ltrim.Contains("template:")) exclude = true;
            else if (page_name_ltrim.Contains("geobox")) exclude = true;

            else if (page_name_ltrim.Contains("clean_up")) exclude = true;
            else if (page_name_ltrim.Contains("cleanup")) exclude = true;

            else if (page_name_ltrim.Contains("monitored_short")) exclude = true;
            else if (page_name_ltrim.Contains("sources_needing")) exclude = true;
            else if (page_name_ltrim.Contains("subscription_required")) exclude = true;
            else if (page_name_ltrim.Contains("location_maps")) exclude = true;
            else if (page_name_ltrim.Contains("region_topic")) exclude = true;

            else if (page_name_ltrim.Contains("languages_with")) exclude = true;
            else if (page_name_ltrim.Contains("languages_which")) exclude = true;

            else if (page_name_ltrim.StartsWith("redirect_tracking")) exclude = true;
            else if (page_name_ltrim.Contains("redirects")) exclude = true;

            else if (page_name_ltrim.StartsWith("main_namespace")) exclude = true;
            else if (page_name_ltrim.StartsWith("webarchive_")) exclude = true;

            else if (page_name_ltrim.StartsWith("all_stub_articles")) exclude = true;
            else if (page_name_ltrim.StartsWith("container_categories")) exclude = true;
            else if (page_name_ltrim.StartsWith("fundamental_categories")) exclude = true;
            else if (page_name_ltrim.StartsWith("counter_categories")) exclude = true;
            else if (page_name_ltrim.EndsWith("_stubs")) exclude = true;

            return exclude;
        }


       
    }
}
