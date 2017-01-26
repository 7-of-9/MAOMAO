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

namespace winmao
{
    public partial class frmMain : Form
    {
        public frmMain() {
            InitializeComponent();

            // get wiki leaf nodes, random order
            var rnd = new Random();
            using (var db = mm02Entities.Create()) {
                var leaves = db.wiki_catlink.AsNoTracking()
                               .Where(p => p.cl_type == "page" && (p.processed??false) == false)
                               .OrderBy(p => p.id).Skip(rnd.Next(0, 1000)).Take(10).ToListNoLock();
                
                //foreach (var leaf in leaves) {
                Parallel.ForEach(leaves, new ParallelOptions() { MaxDegreeOfParallelism = 10 }, (leaf) =>
                {
                    using (var db2 = mm02Entities.Create())
                    {
                        var page = db2.wiki_page.AsNoTracking().Where(p => p.page_id == leaf.cl_from && p.page_namespace == 0).SingleOrDefault();
                        if (page != null)
                        {
                            Debug.WriteLine($"> starting leaf walk for {page.page_title}...");
                            Debug.Indent();
                            Walk(new List<long>(), leaf.cl_from, page.page_title);
                            Debug.Unindent();
                        }
                        var done = db2.wiki_catlink.Find(leaf.id);
                        done.processed = true;
                        db2.SaveChangesTraceValidationErrors();
                    }
                });
            }
        }

        void Walk(List<long> parent_ids, long page_id, string child_name)
        {
            using (var db = mm02Entities.Create())
            {
                var cat_names = db.wiki_catlink.AsNoTracking().Where(p => p.cl_from == page_id).Select(p => p.cl_to).ToListNoLock();
                //foreach (var cat_name in cat_names)

                Parallel.ForEach(cat_names, new ParallelOptions() { MaxDegreeOfParallelism = 10 }, (cat_name) =>
                {
                    using (var db2 = mm02Entities.Create())
                    {
                        var cat_page = db2.wiki_page.AsNoTracking().Where(p => p.page_title == cat_name && p.page_namespace == 14).FirstOrDefault();
                        if (cat_page == null) { // got a leaf node, ignore
                            //Debug.WriteLine("??");
                            return;// continue;
                        }

                        var not_a_topic = false;
                        if (cat_page.page_title.ltrim().StartsWith("articles_with_")) not_a_topic = true; 
                        if (cat_page.page_title.ltrim().StartsWith("articles_needing")) not_a_topic = true;
                        if (cat_page.page_title.ltrim().StartsWith("articles_containing")) not_a_topic = true;

                        if (cat_page.page_title.ltrim().StartsWith("commons_category_with")) not_a_topic = true;

                        if (cat_page.page_title.ltrim().StartsWith("categories_requiring_diffusion")) not_a_topic = true;
                        if (cat_page.page_title.ltrim().StartsWith("categories_for_deletion"))  not_a_topic = true;
                        if (cat_page.page_title.ltrim().StartsWith("categories_which_are")) not_a_topic = true;

                        if (cat_page.page_title.ltrim().StartsWith("hidden_categories")) not_a_topic = true;
                        if (cat_page.page_title.ltrim().StartsWith("all_redirect_categories")) not_a_topic = true;
                        if (cat_page.page_title.ltrim().StartsWith("tracking_categories")) not_a_topic = true;
                        if (cat_page.page_title.ltrim().StartsWith("pages_using")) not_a_topic = true;

                        if (cat_page.page_title.ltrim().StartsWith("wikipedia_categories_"))  not_a_topic = true;
                        if (cat_page.page_title.ltrim().StartsWith("wikipedia_soft_redirected_categories")) not_a_topic = true;
                        if (cat_page.page_title.ltrim().StartsWith("wikipedia_categorization")) not_a_topic = true;
                        if (cat_page.page_title.ltrim().StartsWith("wikipedia_redirect")) not_a_topic = true;
                        if (cat_page.page_title.ltrim().StartsWith("wikipedia_maintenance")) not_a_topic = true;

                        if (cat_page.page_title.ltrim().StartsWith("redirects_from")) not_a_topic = true;
                        if (cat_page.page_title.ltrim().StartsWith("redirect_tracking")) not_a_topic = true;

                        if (cat_page.page_title.ltrim().StartsWith("monthly_clean_up")) not_a_topic = true;

                        if (cat_page.page_title.ltrim().StartsWith("unprintworthy_redirects")) not_a_topic = true;
                        if (cat_page.page_title.ltrim().StartsWith("printworthy_redirects")) not_a_topic = true;
                        if (cat_page.page_title.ltrim().StartsWith("all_articles_needing")) not_a_topic = true;
                        if (cat_page.page_title.ltrim().StartsWith("pages_with")) not_a_topic = true;
                        if (cat_page.page_title.ltrim().StartsWith("redirects_to")) not_a_topic = true;
                        if (cat_page.page_title.ltrim().StartsWith("main_namespace")) not_a_topic = true;

                        if (cat_page.page_title.ltrim().StartsWith("all_stub_articles")) not_a_topic = true;
                        if (cat_page.page_title.ltrim().StartsWith("container_categories")) not_a_topic = true;
                        if (cat_page.page_title.ltrim().StartsWith("fundamental_categories")) not_a_topic = true;
                        if (cat_page.page_title.ltrim().StartsWith("counter_categories")) not_a_topic = true;
                        if (cat_page.page_title.ltrim().EndsWith("_stubs")) not_a_topic = true;
                        if (not_a_topic)
                            return;// continue;

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
                            Debug.WriteLine($"{child_name}[{page_id}] --> {cat_name}[{cat_page.page_id}]");

                        // recurse
                        if (parent_ids.Contains(cat_page.page_id))
                        {
                            //Debug.WriteLine($"(seen; skipping.)");
                            return;// continue;
                        }
                        else
                            parent_ids.Add(cat_page.page_id);

                        if (cat_name == "Main_topic_classifications" || cat_name == "Wikipedia_categories") { // suffices for root node
                            Debug.WriteLine($"(root; stopping.)");
                            return;// break; //****
                        }
                        else
                            Walk(parent_ids, cat_page.page_id, cat_name);
                    }

                    if (cat_names.Count == 0) // "Main_topic_classifications"
                        Debug.WriteLine($"child_page_id={page_id} ** no parent cats **");
                });
            }
        }

        private bool RecordGoldenTerm(long parent_term_id, long child_term_id)
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

        void SetCols(ListView lvw)
        {
            for(int i=0; i < lvw.Columns.Count; i++) {
                var col = lvw.Columns[i];
                col.Width = -2;
            }
        }
   
    }
}
