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
using mm_svc.Terms;
using System.Diagnostics;
using static mm_svc.Terms.Correlations;
using System.Data.SqlClient;
using System.Threading;
using System.Collections.Concurrent;

namespace wiki_walker
{
    public static class Program
    {
        private static Stopwatch sw = new Stopwatch();
        private static int added_count = 0;

        public static void Main()
        {
            ConsoleTraceListener listener = new ConsoleTraceListener();
            Trace.Listeners.Add(listener);
            sw.Start();

            var parent_page_ids = new ConcurrentDictionary<long, int>();
            WalkDownTree(parent_page_ids, "Main_topic_classifications", 1);
            //WalkDownTree(parent_page_ids, "Art_genres", -9);

            Trace.WriteLine("DONE!! Press any key...");
            Console.ReadKey();

            //WalkUpTreeRandom(); // run first to find/populate root
        }

        private static void WalkDownTree(ConcurrentDictionary<long, int> parent_page_ids, string page_name, int level)
        {
            int par_max = Debugger.IsAttached ? 1 : 15;
            using (var db = mm02Entities.Create())
            {
                // ... *if* the dataset can be managed (searched in reasonable time) then maybe go the whole hog and import
                // pages too, i.e. leaf nodes --> could we mark them as such?
                // just because they're in the taxonomy, doesn't mean that the mmcat selector has to pick the leaf nodes, it can select a bit higher
                //
                var pages = db.wiki_page.Where(p => p.page_title == page_name 
                    && (//p.page_namespace == 0 || // **** EXCLUDE PAGES! otherwise we get everything up to leaf nodes
                        p.page_namespace == 14)) // target: ~4.3m subcats for now wtf should be ample
                .Where(p => (p.processed ?? false) == false)
                .ToListNoLock();

                //foreach (var page in pages) {
                Parallel.ForEach(pages, new ParallelOptions() { MaxDegreeOfParallelism = par_max }, (page) =>
                {
                    using (var db2 = mm02Entities.Create()) { 
                        var children = db2.wiki_catlink
                                          .Where(p => p.cl_to == page_name
                                                  && (p.processed ?? false) == false) //**
                                          .OrderBy(p => p.id) //.cl_to)
                                          .ToListNoLock();

                        var child_pages_to_walk = new List<wiki_page>();
                        Parallel.ForEach(children, new ParallelOptions() { MaxDegreeOfParallelism = par_max }, (child_page_cl) =>
                        {
                            using (var db3 = mm02Entities.Create())
                            {
                                var child_page = db3.wiki_page
                                                    .Where(p => p.page_id == child_page_cl.cl_from)
                                                    .SingleOrDefault();
                                if (child_page == null)
                                    return;

                                if (exclude_page(child_page.page_title.ltrim()))
                                    return;

                                RecordTerms(page.page_title, page.page_id, child_page.page_title, child_page.page_id, level, page_name);

                                child_pages_to_walk.Add(child_page);
                            }
                        });

                        // recurse
                        Parallel.ForEach(child_pages_to_walk, new ParallelOptions() { MaxDegreeOfParallelism = par_max }, (child_page_to_walk) =>
                        {
                            if (!parent_page_ids.ContainsKey(child_page_to_walk.page_id))
                            {
                                parent_page_ids.TryAdd(child_page_to_walk.page_id, 42);
                                WalkDownTree(parent_page_ids, child_page_to_walk.page_title, level + 1);
                            }
                        });

                        // mark catlinks as processed
                        Parallel.ForEach(children, new ParallelOptions() { MaxDegreeOfParallelism = par_max }, (child_page_cl) =>
                        {
                            using (var db3 = mm02Entities.Create())
                            {
                                var cl = db3.wiki_catlink.Find(child_page_cl.id);
                                cl.processed = true;
                                db3.SaveChangesTraceValidationErrors();
                            }
                        });

                    }

                    page.processed = true; //**
                });

                db.SaveChangesTraceValidationErrors(); //** page
            }
        }

        private static void WalkUpTreeRandom()
        {
            // get wiki leaf nodes, random order
            var rnd = new Random();
            using (var db = mm02Entities.Create())
            {
                var leaves = db.wiki_catlink.AsNoTracking()
                               .Where(p => p.cl_type == "page" && (p.processed ?? false) == false)
                               .OrderBy(p => p.id).Skip(rnd.Next(0, 1000)).Take(100).ToListNoLock();

                //foreach (var leaf in leaves) {
                Parallel.ForEach(leaves, new ParallelOptions() { MaxDegreeOfParallelism = 100 }, (leaf) =>
                {
                    using (var db2 = mm02Entities.Create())
                    {
                        var page = db2.wiki_page.AsNoTracking().Where(p => p.page_id == leaf.cl_from && p.page_namespace == 0).SingleOrDefault();
                        if (page != null)
                        {
                            Console.WriteLine($"> starting leaf walk for {page.page_title}...");
                            Walk(new List<long>(), page.page_title, leaf.cl_from, page.page_title);
                        }
                        var done = db2.wiki_catlink.Find(leaf.id);
                        done.processed = true;
                        db2.SaveChangesTraceValidationErrors();
                    }
                });
            }
        }

        //private static ConcurrentBag<term> known_terms = new ConcurrentBag<term>();

        private static void Walk(List<long> parent_ids, string orig_page_title, long page_id, string child_name)
        {
            using (var db = mm02Entities.Create())
            {
                var cat_names = db.wiki_catlink.AsNoTracking().Where(p => p.cl_from == page_id).Select(p => p.cl_to).ToListNoLock();
                //foreach (var cat_name in cat_names)

                Parallel.ForEach(cat_names, new ParallelOptions() { MaxDegreeOfParallelism = 10 }, (cat_name) =>
                {
                    using (var db2 = mm02Entities.Create())
                    {
                        var cat_pages = db2.wiki_page.AsNoTracking().Where(p => p.page_title == cat_name
                            && (p.page_namespace == 14 || p.page_namespace == 0)).ToListNoLock();
                        if (cat_pages.Count == 0) { return; }// continue;

                        foreach (var cat_page in cat_pages)
                        {
                            var exclude = exclude_page(cat_page.page_title.ltrim());
                            if (exclude)
                                continue;

                            RecordTerms(cat_name, cat_page.page_id, child_name, page_id, -1, orig_page_title);

                            // recurse - stop at root
                            if (parent_ids.Contains(cat_page.page_id))
                                continue;
                            else
                                parent_ids.Add(cat_page.page_id);

                            if (cat_name == "Main_topic_classifications" || cat_name == "Wikipedia_categories") {
                                Trace.WriteLine($"(root; stopping.)");
                                continue;
                            }
                            else
                                Walk(parent_ids, orig_page_title, cat_page.page_id, cat_name);
                        }
                        if (cat_names.Count == 0) 
                            Trace.WriteLine($"child_page_id={page_id} ** no parent cats **");
                    }
                });
            }
        }

        private static void RecordTerms(string parent_name, long parent_page_id, string child_name, long child_page_id, int level = -1, string info = null)
        {
            var cleaned_cat_name = parent_name.Replace("_", " ");
            var cleaned_child_name = child_name.Replace("_", " ");
            using (var db = mm02Entities.Create())
            {
                // create terms, type=wikicat
                term child_term, parent_term;
                //child_term = known_terms.FirstOrDefault(p => p.name == cleaned_child_name);
                //if (child_term == null) {
                    again1:
                    child_term = db.terms.AsNoTracking().Where(p => p.name == cleaned_child_name && p.term_type_id == (int)g.TT.WIKI_CAT).FirstOrDefault();
                    //Trace.WriteLine($"checking: child={cleaned_child_name}");
                    if (child_term == null) {
                        child_term = new term() { cal_entity_type_id = null, name = cleaned_child_name, occurs_count = -1, term_type_id = (int)g.TT.WIKI_CAT };
                        db.terms.Add(child_term);
                        if (!db.SaveChanges_IgnoreDupeKeyEx()) goto again1;
                    }
                //    known_terms.Add(child_term);
                //}

                //parent_term = known_terms.FirstOrDefault(p => p.name == cleaned_cat_name);
                //if (parent_term == null) {
                    again2:
                    parent_term = db.terms.AsNoTracking().Where(p => p.name == cleaned_cat_name && p.term_type_id == (int)g.TT.WIKI_CAT).FirstOrDefault();
                    //Trace.WriteLine($"checking: parent={cleaned_cat_name}");
                    if (parent_term == null) {
                        parent_term = new term() { cal_entity_type_id = null, name = cleaned_cat_name, occurs_count = -1, term_type_id = (int)g.TT.WIKI_CAT };
                        db.terms.Add(parent_term);
                        if (!db.SaveChanges_IgnoreDupeKeyEx()) goto again2;
                    }
                //    known_terms.Add(parent_term);
                //}

                // record relation
                var added = RecordGoldenTerm(parent_term.id, child_term.id, level);
                if (added) {
                    var per_sec = (++added_count) / sw.Elapsed.TotalSeconds;
                    if (added_count % 100 == 0)
                        Trace.WriteLine($"({info}) ... {child_name}[{child_page_id}] --> {parent_name}[{parent_page_id}] ({added_count} in {sw.Elapsed.TotalSeconds.ToString("0")} sec(s) = {per_sec.ToString("0.0")} per/sec)");
                }
            }
        }

        //private static ConcurrentBag<golden_term> known_gts = new ConcurrentBag<golden_term>();

        private static bool RecordGoldenTerm(long parent_term_id, long child_term_id, int level = -1)
        {
            if (parent_term_id == child_term_id) return false;

            //var gt = known_gts.FirstOrDefault(p => p.parent_term_id == parent_term_id && p.child_term_id == child_term_id);
            //if (gt == null) {
                using (var db = mm02Entities.Create())
                {
                //Trace.WriteLine($"checking: gt {parent_term_id}x{child_term_id} (known_gts={known_gts.Count})");
                    //if (child_term_id == 456922 && parent_term_id == 150471)
                    //    Debugger.Break();

                    // term pair already exists? nop.
                    var known_gt = db.golden_term.FirstOrDefault(p => p.parent_term_id == parent_term_id && p.child_term_id == child_term_id);
                    if (known_gt != null)
                    {
                        if (known_gt.mmcat_level != level)
                        {
                            known_gt.mmcat_level = level;
                            db.SaveChangesTraceValidationErrors();
                        }
                        //known_gts.Add(known_gt);
                        return false;
                    }

                    // record term pair, assign mmcat level = -1 for now (need to calc it later, when tree is complete, by walking from root(s)
                    var new_gt = new golden_term() { parent_term_id = parent_term_id, child_term_id = child_term_id, from_wiki = true, mmcat_level = level };
                    db.golden_term.Add(new_gt);
                    db.SaveChanges_IgnoreDupeKeyEx();

                    //known_gts.Add(new_gt);
                    return true;
                }
            //}
            //Trace.WriteLine($"(nop: known GT)");
            return false;
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
