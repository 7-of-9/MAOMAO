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
        private static int child_pages_fetched = 0;
        private static object o_child_pages_fetched = "42";

        private static int child_page_counter_batch = 0;
        private static int child_page_counter_total = 0;
        private static List<double> child_page_counter_batches_persec = new List<double>();

        private const int max_depth = 15;
        private const bool reprocess_to_max_depth = true;

        /* depth: 6 (NS14 only)
            child pages searched (ns=14): 1,612,200 in 464 sec(s) = 3471.3 per/sec...
            DONE!! Press any key...
            select count(*) from term where term_type_id in (0,14) = 319,309

            max_depth=6 (NS14 only) - child pages searched (ns=14): 4,192,000 in 18470 sec(s) = 227.0 per/sec...
            DONE!! Press any key...
        */

        public static void Main()
        {
            ConsoleTraceListener listener = new ConsoleTraceListener();
            Trace.Listeners.Add(listener);
            sw.Start();

            //ThreadPool.SetMinThreads(128, 128);
            //ThreadPool.SetMaxThreads(512, 512);

            var parent_page_ids = new List<long>();
            WalkDownTree(parent_page_ids, "Main_topic_classifications", 1);
            //WalkDownTree(parent_page_ids, "Art_genres", -9);

            Trace.WriteLine("DONE!! Press any key...");
            Console.ReadKey();

            //WalkUpTreeRandom(); // run first to find/populate root
        }

        //private static ConcurrentDictionary<long, wiki_page> wiki_page_cache; // new ConcurrentDictionary<long, wiki_page>();

        private static void WalkDownTree(List<long> parent_page_ids, string parent_page_search, int level)
        {
            int par_max = Debugger.IsAttached ? 1 : 20000;
            using (var db = mm02Entities.Create())
            {
                // SUBCATS only -- doesn't work well with calais NLP matching -- need leaf page nodes.
                // trying: subcats recurse, page nodes record (no recurse)

                // get supplied parent page - page or subcat
                var pages = db.wiki_page//.AsNoTracking()
                              .Where(p => p.page_title == parent_page_search 
                                    && (p.page_namespace == 0 || // target: ~14m (!!) including pages (0)
                                        p.page_namespace == 14)) // target: ~4.3m for just subcats (14)
                              .Where(p => (p.processed_to_depth == null || p.processed_to_depth < max_depth || reprocess_to_max_depth == true))
                              .OrderBy(p => p.page_id)
                              .ToListNoLock();

                // for each supplied parent page -- pages & subcats
                var saw_exceptions_on_page_processing = false;
                try
                {
                    // PARENT PAGE WALKING -- no concurrency: avoids dupe key inserts!!
                    Parallel.ForEach(pages, new ParallelOptions() { MaxDegreeOfParallelism = 1 }, (parent_page) =>
                    {
                        using (var db2 = mm02Entities.Create())
                        {
                            // get child cat links for parent page
                            var children_qry = db2.wiki_catlink//.AsNoTracking()
                                              .Where(p => p.cl_to == parent_page_search
                                                      && (p.cl_type == "subcat" || p.cl_type == "page") // cl_links to subcats && pages
                                                      && (p.processed_to_depth == null || p.processed_to_depth < max_depth || reprocess_to_max_depth == true)
                                                      )
                                              .OrderBy(p => p.cl_from);
                            var child_cls = children_qry.ToListNoLock();

                            var child_pages_to_walk = new ConcurrentBag<wiki_page>();
                            bool saw_concurrency_exception_on_GTs_any = false;
                            bool saw_exceptions_on_cl_term_processing = false;
                            var child_page_cl_ids_to_update = new List<Guid>();
                            try
                            {
                                // GT INSERTS FOR PARENT-CHILDREN LINKS
                                Parallel.ForEach(child_cls, new ParallelOptions() { MaxDegreeOfParallelism = 10 }, (child_page_cl) =>
                                { 
                                    if (saw_concurrency_exception_on_GTs_any) return;
                                    using (var db3 = mm02Entities.Create())
                                    {
                                        // get child pages
                                        var child_pages =
                                            db3.wiki_page.AsNoTracking()
                                               .Where(p => p.page_id == child_page_cl.cl_from
                                                   && (p.page_namespace == 14 || p.page_namespace == 0) // pages & subcats
                                            )
                                            .OrderBy(p => p.page_id)
                                            .ToListNoLock();
                                        if (child_pages.Count() == 0) return;

                                        lock (o_child_pages_fetched) {
                                            //child_page_counter_total++;
                                            if (++child_page_counter_batch % 2000 == 0) {
                                                var child_pages_per_sec = child_page_counter_batch / sw.Elapsed.TotalSeconds;
                                                //child_page_counter_batches_persec.Add(child_pages_per_sec);
                                                Trace.WriteLine($"max_depth={max_depth} reprocessing={reprocess_to_max_depth} - child-pages-(ns=14||0)-total: {child_page_counter_batch} in {sw.Elapsed.TotalSeconds.ToString("0")} sec(s) = {child_pages_per_sec.ToString("0.0")} per/sec");// ; AVG = {child_page_counter_batches_persec.Average().ToString("0.0")} per/sec.");
                                                //sw.Restart();
                                                //lock (o_child_pages_fetched) { child_page_counter_batch = 0; }
                                            }
                                        }

                                        foreach (var child_page in child_pages)
                                        {
                                            //if (child_page.page_namespace != 14 && child_page.page_namespace != 0) continue;
                                            if (exclude_page(child_page.page_title.ltrim())) continue;

                                            // new: terms now distinct by page_namespace (2x term types - one for each wiki namespace...)
                                            bool saw_concurrency_exception_on_GTs, saw_concurrency_exception_on_terms;
                                            RecordTerms(out saw_concurrency_exception_on_GTs, out saw_concurrency_exception_on_terms,
                                                        parent_page,
                                                        child_page,
                                                        level,
                                                        parent_page_search);
                                            //if (saw_concurrency_exception_on_GTs) {
                                            //    Trace.WriteLine($"** GT CONCURRENCY EXC: ABORTING THIS CHILD! child_page_cl.id={child_page_cl.id} / parent_page.page_id={parent_page.page_id}[{parent_page.page_title}] x child_page.page_id={child_page.page_id}* *");
                                            //    saw_concurrency_exception_on_GTs_any = true;
                                            //    return; // assume another task has this chain; abort!
                                            //}
                                            if (saw_concurrency_exception_on_terms) {
                                                Trace.WriteLine($"** TERM CONCURRENCY EXC: ABORTING THIS CHILD! child_page_cl.id={child_page_cl.id} / parent_page.page_id={parent_page.page_id}[{parent_page.page_title}] x child_page.page_id={child_page.page_id}* *");
                                                continue; // assume another task has this chain; abort!
                                            }

                                            if (child_page.page_namespace == 14) // only recurse subcats!
                                            {
                                                if (level < max_depth)
                                                    child_pages_to_walk.Add(child_page);
                                            }

                                            child_page_cl.processed_to_depth = max_depth; // *** save later - only after all recursions, as appropriate
                                            //if (child_page_cl.processed_to_depth != max_depth)
                                            //    child_page_cl_ids_to_update.Add(child_page_cl.id);
                                        }
                                    }
                                });
                            }
                            catch (AggregateException agex) {
                                Trace.WriteLine(agex.ToDetailedString());
                                saw_exceptions_on_cl_term_processing = true;
                            }

                            // ???? not sure this is correct - seems maybe not, if full "complete" e2e runs when restarted, result in still more terms being found
                            //if (saw_concurrency_exception_on_GTs_any) 
                            //{
                            //    Trace.WriteLine($"** GT CONCURRENCY EXC: ABORTING THIS PARENT CHAIN! parent_page.page_id={parent_page.page_id}[{parent_page.page_title}] page_search={parent_page_search}* *");
                            //    return;
                            //}

                            // RECURSE
                            var saw_exceptions_on_cl_recursion = false;
                            if (level < max_depth)
                            {
                                try
                                {
                                    Parallel.ForEach(child_pages_to_walk.OrderBy(p => p.page_id), new ParallelOptions() { MaxDegreeOfParallelism = 1 }, (child_page_to_walk) =>
                                    {
                                        var new_parent_page_ids = new List<long>(parent_page_ids); // each branch in the tree has *its own* unique inheritence chain!
                                        if (!new_parent_page_ids.Contains(child_page_to_walk.page_id))
                                        {
                                            new_parent_page_ids.Add(child_page_to_walk.page_id);
                                            WalkDownTree(new_parent_page_ids, child_page_to_walk.page_title, level + 1);
                                        }
                                    });
                                }
                                catch (AggregateException agex)
                                {
                                    Trace.WriteLine(agex.ToDetailedString());
                                    saw_exceptions_on_cl_recursion = true;
                                }
                            }

                            if (saw_exceptions_on_cl_term_processing == false && saw_exceptions_on_cl_recursion == false)
                            {
                                db2.SaveChangesTraceValidationErrors(); //*** wiki_catlink - processed_to_depth
                                //Parallel.ForEach(child_page_cl_ids_to_update, new ParallelOptions() { MaxDegreeOfParallelism = par_max }, (child_page_cl_id) => {
                                //    using (var db_update = mm02Entities.Create()) {
                                //        db_update.ObjectContext().ExecuteStoreCommand(
                                //        "UPDATE wiki_catlink SET processed_to_depth = {0} WHERE id = '{1}' AND processed_to_depth != {0}",
                                //        max_depth,
                                //        child_page_cl_id);
                                //    }
                                //});
                            }
                        }

                        parent_page.processed_to_depth = max_depth; //**
                        //if (parent_page.processed_to_depth != max_depth) {
                        //    using (var db_update = mm02Entities.Create())
                        //    {
                        //        db_update.ObjectContext().ExecuteStoreCommand(
                        //        "UPDATE wiki_page SET processed_to_depth = {0} WHERE page_id = {1} AND processed_to_depth != {0}",
                        //        max_depth,
                        //        parent_page.page_id);
                        //    }
                        //}
                        //GC.Collect(2);
                    });
                }
                catch (AggregateException agex) {
                    Trace.WriteLine(agex.ToDetailedString());
                    saw_exceptions_on_page_processing = true;
                }

                if (saw_exceptions_on_page_processing == false)
                    db.SaveChangesTraceValidationErrors(); //** page - processed_to_depth
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

            var new_child_term = false;
            var new_parent_term = false;
            using (var db = mm02Entities.Create())  // create terms, type=wikicat
            {
                term child_term, parent_term;

//child_term = term_cache?.ContainsKey(cleaned_child_name)==true ? term_cache[cleaned_child_name] : null;//.FirstOrDefault(p => p.name == cleaned_child_name);
//if (child_term == null) {
                again1:
                if (child.page_namespace == 14)
                    child_term = db.terms.AsNoTracking().Where(p => p.name == cleaned_child_name && p.term_type_id == (int)g.TT.WIKI_NS_14).FirstOrDefault();
                else // don't add ns0 terms if matching ns14 term already exists
                    child_term = db.terms.AsNoTracking().Where(p => p.name == cleaned_child_name && (p.term_type_id == (int)g.TT.WIKI_NS_14 || p.term_type_id == (int)g.TT.WIKI_NS_0)).FirstOrDefault();

                if (child_term == null && cleaned_child_name.Length <= 128) {
                    new_child_term = true;
                    child_term = new term() { cal_entity_type_id = null, name = cleaned_child_name, occurs_count = -1, term_type_id = child.page_namespace };
                    db.terms.Add(child_term);
                    term_added_count++;
                    if (!db.SaveChanges_IgnoreDupeKeyEx($"child_term: {child_term.ToString()} // child: [{child.page_title}]ns={child.page_namespace} -> parent: [{parent.page_title}]ns={parent.page_namespace}"))
                        { saw_concurrency_exception_on_terms = true;  Thread.Sleep(1); goto again1; }
                }
//    term_cache?.TryAdd(cleaned_child_name, child_term);//.Add(child_term);
//}


//parent_term = term_cache?.ContainsKey(cleaned_cat_name)==true ? term_cache[cleaned_cat_name] : null;//.FirstOrDefault(p => p.name == cleaned_cat_name);
//if (parent_term == null) {
                again2:
                if (parent.page_namespace == 14)
                    parent_term = db.terms.AsNoTracking().Where(p => p.name == cleaned_parent_name && p.term_type_id == (int)g.TT.WIKI_NS_14).FirstOrDefault();
                else // don't add ns0 terms if matching ns14 term already exists
                    parent_term = db.terms.AsNoTracking().Where(p => p.name == cleaned_parent_name && (p.term_type_id == (int)g.TT.WIKI_NS_14 || p.term_type_id == (int)g.TT.WIKI_NS_0)).FirstOrDefault();

                if (parent_term == null && cleaned_parent_name.Length <= 128) {
                    new_parent_term = true;
                    parent_term = new term() { cal_entity_type_id = null, name = cleaned_parent_name, occurs_count = -1, term_type_id = parent.page_namespace };
                    db.terms.Add(parent_term);
                    term_added_count++;
                    if (!db.SaveChanges_IgnoreDupeKeyEx("parent - " + parent_term.ToString()))
                        { saw_concurrency_exception_on_terms = true; Thread.Sleep(1); goto again2; }
                }
//    term_cache?.TryAdd(cleaned_cat_name, parent_term);//.Add(parent_term);
//}

                term_pairs_checked++;

                // record relation
                if (new_child_term || new_parent_term)//parent_term != null && child_term != null)
                {
                    var added = RecordGoldenTerm(out saw_concurrency_exception_on_GTs, parent_term.id, child_term.id, level);
                    if (added)
                    {
                        var per_sec = (++gt_added_count) / sw.Elapsed.TotalSeconds;
                        if (gt_added_count % 100 == 0)
                            Trace.WriteLine($"({info}) ... {child_name}[{child_page_id}]ns={child.page_namespace} --> {parent_name}[{parent_page_id}]ns={parent.page_namespace} ({gt_added_count} in {sw.Elapsed.TotalSeconds.ToString("0")} sec(s) = {per_sec.ToString("0.0")} GTs per/sec)");
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

        //private static ConcurrentDictionary<string, golden_term> gts_cache;// = new ConcurrentDictionary<string, golden_term>();

        private static bool RecordGoldenTerm(out bool saw_concurrency_exception, long parent_term_id, long child_term_id, int level = -1)
        {
            saw_concurrency_exception = false;
            if (parent_term_id == child_term_id) return false;
            //var cache_key = $"{parent_term_id}x{child_term_id}";
            //var gt = gts_cache?.ContainsKey(cache_key)==true ? gts_cache[cache_key] : null;//.FirstOrDefault(p => p.parent_term_id == parent_term_id && p.child_term_id == child_term_id);
            //if (gt == null) {
                using (var db = mm02Entities.Create())
                {
                    // term pair already exists? nop.
                    var known_gt = db.golden_term.FirstOrDefault(p => p.parent_term_id == parent_term_id && p.child_term_id == child_term_id);
                    if (known_gt != null)
                    {
                        if (known_gt.mmcat_level != level)
                        {
                            known_gt.mmcat_level = level;
                            db.SaveChangesTraceValidationErrors();
                        }
                        //gts_cache?.TryAdd(cache_key, known_gt);//.Add(known_gt);
                        return false;
                    }

                    // record term pair, assign mmcat level = -1 for now (need to calc it later, when tree is complete, by walking from root(s)
                    var new_gt = new golden_term() { parent_term_id = parent_term_id, child_term_id = child_term_id, from_wiki = true, mmcat_level = level };
                    db.golden_term.Add(new_gt);
                    if (db.SaveChanges_IgnoreDupeKeyEx($"GT - {parent_term_id}x{child_term_id}") == false)
                        saw_concurrency_exception = true;

                    //gts_cache?.TryAdd(cache_key, known_gt);//.Add(known_gt);
                    return true;
                }
            //}
            //return false;
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
