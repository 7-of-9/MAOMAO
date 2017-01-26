using mmdb_model;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
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

namespace wiki_walker
{
    public static class Program
    {
        private static Stopwatch sw = new Stopwatch();
        private static int added_count = 0;

        public static void Main()
        {
            // get wiki leaf nodes, random order
            var rnd = new Random();
            using (var db = mm02Entities.Create())
            {
                var leaves = db.wiki_catlink.AsNoTracking()
                               .Where(p => p.cl_type == "page" && (p.processed ?? false) == false)
                               .OrderBy(p => p.id).Skip(rnd.Next(0, 1000)).Take(100).ToListNoLock();

                //foreach (var leaf in leaves) {
                sw.Start();
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

        private static void Walk(List<long> parent_ids, string orig_page_title, long page_id, string child_name)
        {
            using (var db = mm02Entities.Create())
            {
                var cat_names = db.wiki_catlink.AsNoTracking().Where(p => p.cl_from == page_id).Select(p => p.cl_to).ToListNoLock();
                //foreach (var cat_name in cat_names)

                Parallel.ForEach(cat_names, new ParallelOptions() { MaxDegreeOfParallelism = 100 }, (cat_name) =>
                {
                    using (var db2 = mm02Entities.Create())
                    {
                        var cat_pages = db2.wiki_page.AsNoTracking().Where(p => p.page_title == cat_name
                            && (p.page_namespace == 14 || p.page_namespace == 0)).ToListNoLock();
                        if (cat_pages.Count == 0) { return; }// continue;

                        foreach (var cat_page in cat_pages)
                        {
                            var not_a_topic = false;
                            if (cat_page.page_title.ltrim().Contains("articles_")) not_a_topic = true;
                            else if (cat_page.page_title.ltrim().Contains("_articles")) not_a_topic = true;

                            else if (cat_page.page_title.ltrim() == ("articles")) not_a_topic = true;
                            else if (cat_page.page_title.ltrim() == ("contents")) not_a_topic = true;
                            else if (cat_page.page_title.ltrim() == ("wikiboxes")) not_a_topic = true;

                          //else if (cat_page.page_title.ltrim() == ("good_articles")) not_a_topic = true; //***
                          //else if (cat_page.page_title.ltrim() == ("featured_articles")) not_a_topic = true; //***
                          //else if (cat_page.page_title.ltrim() == ("featured_content")) not_a_topic = true;  //***
                          //else if (cat_page.page_title.ltrim() == ("featured_lists")) not_a_topic = true;  //***
                          //else if (cat_page.page_title.ltrim().Contains("disambiguation")) not_a_topic = true;

                            else if (cat_page.page_title.ltrim().Contains("accuracy_disputes")) not_a_topic = true; 

                            else if (cat_page.page_title.ltrim().StartsWith("commons_category_with")) not_a_topic = true;
                            else if (cat_page.page_title.ltrim().StartsWith("creative_commons")) not_a_topic = true;

                            else if (cat_page.page_title.ltrim().Contains("categories_")) not_a_topic = true;
                            //else if (cat_page.page_title.ltrim().Contains("_categories")) not_a_topic = true; // too broad: "Taxonomic_categories"

                            else if (cat_page.page_title.ltrim().StartsWith("hidden_categories")) not_a_topic = true;
                            else if (cat_page.page_title.ltrim().StartsWith("all_redirect_categories")) not_a_topic = true;
                            else if (cat_page.page_title.ltrim().StartsWith("tracking_categories")) not_a_topic = true;

                            else if (cat_page.page_title.ltrim().Contains("pages_")) not_a_topic = true;

                            else if (cat_page.page_title.ltrim().StartsWith("wikipedia_")) not_a_topic = true;
                            else if (cat_page.page_title.ltrim().Contains("wikipedia_administration")) not_a_topic = true;

                            else if (cat_page.page_title.ltrim().Contains("use_") 
                                 && cat_page.page_title.ltrim().Contains("_english")) not_a_topic = true;
                            else if (cat_page.page_title.ltrim().StartsWith("use_dmy")) not_a_topic = true;
                            else if (cat_page.page_title.ltrim().StartsWith("use_mdy")) not_a_topic = true;
                            else if (cat_page.page_title.ltrim().StartsWith("use_harvard")) not_a_topic = true;

                            else if (cat_page.page_title.ltrim().Contains("-centric")) not_a_topic = true;

                            else if (cat_page.page_title.ltrim().StartsWith("engvar")) not_a_topic = true;

                            else if (cat_page.page_title.ltrim().StartsWith("cs1_")) not_a_topic = true;
                            else if (cat_page.page_title.ltrim().StartsWith("cs2_")) not_a_topic = true;

                            else if (cat_page.page_title.ltrim().Contains("npov")) not_a_topic = true;

                            else if (cat_page.page_title.ltrim().Contains("vague_or_ambiguous")) not_a_topic = true;
                            else if (cat_page.page_title.ltrim().Contains("unverifiable_")) not_a_topic = true;
                            else if (cat_page.page_title.ltrim().Contains("to_be_merged")) not_a_topic = true;

                            else if (cat_page.page_title.ltrim().Contains("Biography_with_signature")) not_a_topic = true;
                            else if (cat_page.page_title.ltrim().Contains("Image_galleries")) not_a_topic = true;

                            else if (cat_page.page_title.ltrim().Contains("incomplete_lists")) not_a_topic = true;
                            else if (cat_page.page_title.ltrim().Contains("related_lists")) not_a_topic = true;

                            else if (cat_page.page_title.ltrim().Contains("infobox")) not_a_topic = true;
                            else if (cat_page.page_title.ltrim().Contains("chembox")) not_a_topic = true;

                            else if (cat_page.page_title.ltrim().Contains("_needing_confirmation")) not_a_topic = true;
                            else if (cat_page.page_title.ltrim().Contains("requests_for")) not_a_topic = true;

                            else if (cat_page.page_title.ltrim().StartsWith("wikiproject_")) not_a_topic = true;
                            else if (cat_page.page_title.ltrim().Contains("wikidata_")) not_a_topic = true;
                            else if (cat_page.page_title.ltrim().Contains("_wikidata")) not_a_topic = true;
                            else if (cat_page.page_title.ltrim().Contains("Wikiquote")) not_a_topic = true;

                            else if (cat_page.page_title.ltrim().Contains("taxoboxes_")) not_a_topic = true;
                            else if (cat_page.page_title.ltrim().Contains("drugboxes_")) not_a_topic = true;
                            else if (cat_page.page_title.ltrim().Contains("interlanguage_")) not_a_topic = true;
                            else if (cat_page.page_title.ltrim().Contains("GraySubject")) not_a_topic = true;
                            else if (cat_page.page_title.ltrim().Contains("GrayPage")) not_a_topic = true;

                            else if (cat_page.page_title.ltrim().Contains("_templates")) not_a_topic = true;
                            else if (cat_page.page_title.ltrim().Contains("template:")) not_a_topic = true;

                            else if (cat_page.page_title.ltrim().Contains("clean_up")) not_a_topic = true;
                            else if (cat_page.page_title.ltrim().Contains("cleanup")) not_a_topic = true;

                            else if (cat_page.page_title.ltrim().Contains("monitored_short")) not_a_topic = true;
                            else if (cat_page.page_title.ltrim().Contains("sources_needing")) not_a_topic = true;
                            else if (cat_page.page_title.ltrim().Contains("subscription_required")) not_a_topic = true;
                            else if (cat_page.page_title.ltrim().Contains("location_maps")) not_a_topic = true;
                            else if (cat_page.page_title.ltrim().Contains("region_topic")) not_a_topic = true;

                            else if (cat_page.page_title.ltrim().Contains("languages_with")) not_a_topic = true;
                            else if (cat_page.page_title.ltrim().Contains("languages_which")) not_a_topic = true;

                            else if (cat_page.page_title.ltrim().StartsWith("redirect_tracking")) not_a_topic = true;
                            else if (cat_page.page_title.ltrim().Contains("redirects")) not_a_topic = true;

                            else if (cat_page.page_title.ltrim().StartsWith("main_namespace")) not_a_topic = true;
                            else if (cat_page.page_title.ltrim().StartsWith("webarchive_")) not_a_topic = true;

                            else if (cat_page.page_title.ltrim().StartsWith("all_stub_articles")) not_a_topic = true;
                            else if (cat_page.page_title.ltrim().StartsWith("container_categories")) not_a_topic = true;
                            else if (cat_page.page_title.ltrim().StartsWith("fundamental_categories")) not_a_topic = true;
                            else if (cat_page.page_title.ltrim().StartsWith("counter_categories")) not_a_topic = true;
                            else if (cat_page.page_title.ltrim().EndsWith("_stubs")) not_a_topic = true;

                            if (not_a_topic)
                                continue; // return;// continue;

                            //if (cat_page.page_title.ltrim().Contains("_by_")) not_a_topic = true; // e.g. Ammonites_by_classificatio

                            var cleaned_cat_name = cat_name.Replace("_", " ");
                            var cleaned_child_name = child_name.Replace("_", " ");

                            // create terms, type=wikicat
                            again1:
                            var child_term = db2.terms.Where(p => p.name == cleaned_child_name && p.term_type_id == (int)g.TT.WIKI_CAT).FirstOrDefault();
                            if (child_term == null)
                            {
                                child_term = new term() { cal_entity_type_id = null, name = cleaned_child_name, occurs_count = -1, term_type_id = (int)g.TT.WIKI_CAT };
                                db2.terms.Add(child_term);
                                if (!db.SaveChanges_IgnoreDupeKeyEx()) goto again1;
                            }
                            again2:
                            var parent_term = db2.terms.Where(p => p.name == cleaned_cat_name && p.term_type_id == (int)g.TT.WIKI_CAT).FirstOrDefault();
                            if (parent_term == null)
                            {
                                parent_term = new term() { cal_entity_type_id = null, name = cleaned_cat_name, occurs_count = -1, term_type_id = (int)g.TT.WIKI_CAT };
                                db2.terms.Add(parent_term);
                                if (!db2.SaveChanges_IgnoreDupeKeyEx()) goto again2;
                            }
                            var added = RecordGoldenTerm(parent_term.id, child_term.id);
                            if (added)
                            {
                                var per_sec = (++added_count) / sw.Elapsed.TotalSeconds;
                                Console.WriteLine($"({orig_page_title}) ... {child_name}[{page_id}] --> {cat_name}[{cat_page.page_id}] ({added_count} in {sw.Elapsed.TotalSeconds.ToString("0")} sec(s) = {per_sec.ToString("0.0")} per/sec)");
                            }

                            // recurse
                            if (parent_ids.Contains(cat_page.page_id))
                            {
                                //Debug.WriteLine($"(seen; skipping.)");
                                continue; // return;// continue;
                            }
                            else
                                parent_ids.Add(cat_page.page_id);

                            if (cat_name == "Main_topic_classifications" || cat_name == "Wikipedia_categories")
                            { // suffices for root node
                                Console.WriteLine($"(root; stopping.)");
                                continue; // return;// break; //****
                            }
                            else
                                Walk(parent_ids, orig_page_title, cat_page.page_id, cat_name);
                        }

                        if (cat_names.Count == 0) // "Main_topic_classifications"
                            Console.WriteLine($"child_page_id={page_id} ** no parent cats **");
                    }
                });
            }
        }

        private static bool RecordGoldenTerm(long parent_term_id, long child_term_id)
        {
            using (var db = mm02Entities.Create())
            {
                // term pair already exists? nop.
                if (db.golden_term.Any(p => p.parent_term_id == parent_term_id && p.child_term_id == child_term_id))
                    return false;

                // record term pair, assign mmcat level = -1 for now (need to calc it later, when tree is complete, by walking from root(s)
                var new_gt = new golden_term() { parent_term_id = parent_term_id, child_term_id = child_term_id, from_wiki = true, mmcat_level = -1 };
                db.golden_term.Add(new_gt);
                db.SaveChanges_IgnoreDupeKeyEx();

                return true;
            }
        }
    }
}
