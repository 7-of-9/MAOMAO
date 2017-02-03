using mm_global;
using mmdb_model;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static mm_svc.Terms.Correlations;

namespace mm_svc.Terms
{
    public static class GoldenSuggestions
    {
        //private static int MAX_GOLD_LEVEL = 4;

        //public static int ProcessSuggested(List<term> suggested_gold, long originating_url_id) {
        //    var new_gold_count = 0;
        //    foreach (var suggested in suggested_gold) {
        //        if (suggested.is_gold)
        //            continue;

        //        if (suggested.is_countrylike) // *** exclude country like terms from being gold
        //            continue;

        //        // get best gold parent for suggested
        //        var correlated = Correlations.GetTermCorrelations(new corr_input() { main_term = suggested.name, min_corr = 0.1 });
        //        if (correlated.Any(p => p.main_term.is_countrylike)) // *** exclude country like terms from being gold
        //            continue;
        //        var correlated_terms = correlated.SelectMany(p => p.corr_terms)
        //                                         .OrderByDescending(p => p.corr_for_main)
        //                                         .Where(p => p.is_gold);//p.id != g.MAOMAO_ROOT_TERM_ID);

        //        if (correlated_terms.Count() == 1) 
        //            // only gold correlation is mmroot, use it
        //            suggested.suggested_gold_parent = correlated_terms.First();
        //        else
        //            // got other correlated gold terms; remove mmroot and pick most correlated as parent
        //            suggested.suggested_gold_parent = correlated_terms.Where(
        //                                                p => p.id != g.MAOMAO_ROOT_TERM_ID
        //                                                && p.gold_level < MAX_GOLD_LEVEL - 1  // *** cap gold level
        //                                              ).OrderByDescending(p => p.corr_for_main).FirstOrDefault();

        //        // create golden relation
        //        if (suggested.suggested_gold_parent != null ) { 
        //            var db = mm02Entities.Create(); { //using (var db = mm02Entities.Create()) {
        //                var exists = db.golden_term.Where(p => p.child_term_id == suggested.id && p.parent_term_id == suggested.suggested_gold_parent.id).SingleOrDefault();
        //                if (exists != null) {
        //                    Debug.WriteLine("already exists -- why? calling logic failed - maybe caching?");
        //                }
        //                else {
        //                    var golden_term = new golden_term() {
        //                        child_term_id = suggested.id,
        //                        parent_term_id = suggested.suggested_gold_parent.id,
        //                        mmcat_level = suggested.suggested_gold_parent.gold_level + 1,
        //                        autosuggested_at_utc = DateTime.UtcNow,
        //                        url_id = originating_url_id, // todo: remove autosuggest -- use wiki cats
        //                    };
        //                    db.golden_term.Add(golden_term);
        //                    db.SaveChangesTraceValidationErrors();
        //                    new_gold_count++;
        //                }
        //            }        
        //        }
        //    }
        //    return new_gold_count;
        //}

        //public static void RecordUrlGoldenTerms(long url_id, List<golden_term> golden_terms)
        //{
        //    var db = mm02Entities.Create();
        //    db.url_golden_term.RemoveRange(db.url_golden_term.Where(p => p.url_id == url_id));
        //    db.SaveChangesTraceValidationErrors();

        //    for (int i=0; i < golden_terms.Count; i++) {
        //        db.url_golden_term.Add(new url_golden_term()
        //        {
        //            url_id = url_id,
        //            golden_term_id = golden_terms[i].id,
        //            rank = i,
        //            datetime_utc = DateTime.UtcNow
        //        });
        //    }

        //    db.SaveChangesTraceValidationErrors();
        //}
    }
}
