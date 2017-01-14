using mm_global;
using mm_svc.InternalNlp;
using mmdb_model;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static mm_svc.Terms.Correlations;

namespace mm_svc
{
    public  class MmCat
    {
        public string log = "";

        private IEnumerable<url_term> tags;
        private IEnumerable<url_term> entities;
        private IEnumerable<url_term> topics;
        private IEnumerable<url_term> all;

        private const double SOCIAL_TAG_BOOST = 6;

        private Dictionary<g.ET, double> entity_type_boosts = new Dictionary<g.ET, double>() {
            { g.ET.Movie,                SOCIAL_TAG_BOOST },
            { g.ET.MusicAlbum,           SOCIAL_TAG_BOOST },
            { g.ET.MusicGroup,           SOCIAL_TAG_BOOST },
            { g.ET.NaturalFeature,       SOCIAL_TAG_BOOST },
            { g.ET.OperatingSystem,      SOCIAL_TAG_BOOST },
            { g.ET.Person,               SOCIAL_TAG_BOOST * 2},
            { g.ET.Product,              SOCIAL_TAG_BOOST },
            { g.ET.ProgrammingLanguage , SOCIAL_TAG_BOOST },
            { g.ET.SportsGame,           SOCIAL_TAG_BOOST },
            { g.ET.SportsLeague,         SOCIAL_TAG_BOOST },
            { g.ET.Technology,           SOCIAL_TAG_BOOST },
            { g.ET.TVShow ,              SOCIAL_TAG_BOOST } 
        };

        public void CalcTSS(dynamic meta_all, List<url_term> url_terms, bool run_l2_boost)
        {
            url_terms.ForEach(p => p.InitExtensionFields());
            this.tags = url_terms.Where(p => p.term.term_type_id == (int)g.TT.CALAIS_SOCIALTAG);
            this.entities = url_terms.Where(p => p.term.term_type_id == (int)g.TT.CALAIS_ENTITY);
            this.topics = url_terms.Where(p => p.term.term_type_id == (int)g.TT.CALAIS_TOPIC);
            this.all = url_terms;
            const int MIN_STEMMING_LEN = 5;

            var title = meta_all.html_title.ToString();
            var description = (meta_all.ip_description ?? "").ToString();
            Porter2_English stemmer = new Porter2_English();

            // remove tags that are entities
            //int tags_removed = RemoveSocialTagsThatAreEntities(url_terms);
            //log += $"removed {tags_removed} social tags\r\n";

            // S2 -- baseline S relevance boosted and scaled
            foreach (var x in all) {
                x.S2 = x.S * x.s;
                if (x.term.term_type_id == (int)g.TT.CALAIS_SOCIALTAG) {
                    x.S2 = x.S * SOCIAL_TAG_BOOST;
                }
                else if (x.term.term_type_id == (int)g.TT.CALAIS_ENTITY) {
                    if (entity_type_boosts.ContainsKey((g.ET)x.term.cal_entity_type_id))
                        x.S2 = x.S * entity_type_boosts[(g.ET)x.term.cal_entity_type_id];
                }
            }

            // all fully contained in title - no stemming
            const int max_boost_len = 4;
            foreach (var t in all.Where(p => title.ToLower().IndexOf(p.term.name.ltrim()) != -1)) {
                var boost = 5 
                            * t.term.name.LengthNorm(max_boost_len)
                            * t.S2;
                t.candidate_reason += $" TITLE_EXACT({(int)boost}) ";
                t.tss += boost;
            }
            // fully contained in title -- at start
            foreach (var t in all.Where(p => title.ToLower().StartsWith(p.term.name.ltrim()))) {
                var boost = 10
                            * t.term.name.LengthNorm(max_boost_len)
                            * t.S2;
                t.candidate_reason += $" TITLE_EXACT_START({(int)boost}) ";
                t.tss += boost;
            }

            //
            // (TODO: stemming not working; this is just duplicating title_exact dynamics -- also POS not working: ditch this NLP lib.)
            //
            // all fully contained in title - w/ stemming 
            foreach (var t in all.Where(p => stemmer.stem(title.ToLower()).IndexOf(stemmer.stem(p.term.name.ltrim())) != -1)) {
                if (t.term.name.Length >= MIN_STEMMING_LEN) {
                    var boost = 5
                                * t.term.name.LengthNorm(max_boost_len)
                                * t.S2;
                    t.candidate_reason += $" TITLE_STEMMED({(int)boost}) ";
                    t.tss += boost;
                }
            }

            if (!string.IsNullOrEmpty(description)) {
                // ** all fully contained in description - no stemming
                foreach (var t in all.Where(p => description.ToLower().IndexOf(p.term.name.ltrim()) != -1)) {
                    var boost = 5
                                * t.term.name.LengthNorm(max_boost_len)
                                * t.S2;
                    t.candidate_reason += $" DESC_EXACT({(int)boost}) ";
                    t.tss += boost; // (int)(10 * Math.Log(Math.Max(20, tag.term.name.Length), 2)); 
                }
                // ** all fully contained in description - w/ stemming
                foreach (var t in all.Where(p => stemmer.stem(description.ToLower()).IndexOf(stemmer.stem(p.term.name.ltrim())) != -1)) {
                    if (t.term.name.Length >= MIN_STEMMING_LEN) {
                        var boost = 5
                                    * t.term.name.LengthNorm(max_boost_len)
                                    * t.S2;
                        t.candidate_reason += $" DESC_STEMMED({(int)boost}) ";
                        t.tss += boost;
                    }
                }
            }

            // title best partial match 
            var title_ex_stopwords = InternalNlp.Utils.Words.TokenizeExStopwords(title).ToString();
            var title_ex_stopwords_stemmed = stemmer.stem(title_ex_stopwords);
            var description_ex_stopwords = InternalNlp.Utils.Words.TokenizeExStopwords(description).ToString();
            var description_ex_stopwords_stemmed = stemmer.stem(description_ex_stopwords);
            foreach (var t in all) {
                t.words_common_to_title = InternalNlp.Utils.Words.WordsInCommon(t.term.name, title_ex_stopwords);
                t.words_common_to_desc = InternalNlp.Utils.Words.WordsInCommon(t.term.name, description_ex_stopwords); //**

                if (t.term.name.Length >= MIN_STEMMING_LEN) {
                    t.words_common_to_title_stemmed = InternalNlp.Utils.Words.WordsInCommon(stemmer.stem(t.term.name), title_ex_stopwords_stemmed); //**
                    t.words_common_to_desc_stemmed = InternalNlp.Utils.Words.WordsInCommon(stemmer.stem(t.term.name), description_ex_stopwords_stemmed); //**
                }

                // boost
                if (t.words_common_to_title.Count > 0) {
                    var boost = 4 
                                * t.words_common_to_title.Count
                                * t.S2;
                    t.candidate_reason += $" TITLE({(int)boost}) ";
                    t.tss += boost;
                }
                if (t.words_common_to_desc.Count > 0) {
                    var boost = 4
                                * t.words_common_to_desc.Count
                                * t.S2;
                    t.candidate_reason += $" DESC({(int)boost}) ";
                    t.tss += boost;
                }
            }
            var tt = all.Where(p => p.words_common_to_title.Count == all.Max(p2 => p2.words_common_to_title.Count));
            foreach(var t in tt) {
                if (t.words_common_to_title.Count > 0)
                {
                    var boost = 4 
                                * t.words_common_to_title.Count
                                * t.S2;
                    t.candidate_reason += $" TITLE_BEST({(int)boost}) ";
                    t.tss += boost;
                }
            }
            tt = all.Where(p => p.words_common_to_desc.Count == all.Max(p2 => p2.words_common_to_desc.Count));
            foreach(var t in tt) {
                    if (t.words_common_to_desc.Count > 0) {
                    var boost = 4
                                * t.words_common_to_desc.Count
                                * t.S2;
                    t.candidate_reason += $" DESC_BEST({(int)boost}) ";
                    t.tss += boost;
                }
            }

            //x = all.OrderByDescending(p => p.words_common_to_title_and_entities.Count).First();
            //if (x.words_common_to_title_and_entities.Count > 0) {
            //    x.candidate_reason += " TITLE_ENTITIES_BEST_MATCH ";
            //    // no score?
            //}
            //var y = all.OrderByDescending(p => p.common_to_entities_exact.Count);
            //foreach(var yy in y) { 
            //    if (x.common_to_entities_exact.Count > 0) {
            //        x.candidate_reason += " TAGNAME_ENTITIES_EXACT ";
            //        x.topic_specifc_score += 5;
            //    }
            //}

            // parts of speach patterns
            // TODO: replace with lightweight POS tagger
            /*foreach (var t in all)
            {
                var words = StanfordCoreNlp.tokenize_pos(t.term.name);
                //foreach (var word in words)
                //    t.candidate_reason += "{" + word.pos + "}";

                if (words.Count == 1 && words[0].pos == "JJ")
                { // e.g "astrobioliogy" classified as an adjective for som reason!
                    var boost = 12 *t.S2;
                    t.candidate_reason += $" POS_JJ({(int)boost})";
                    t.topic_specifc_score += boost;
                }
                if (words.Count == 1 && words[0].pos == "NN")
                { // e.g "Skyscraper"
                    var boost = 2 * t.S2;
                    t.candidate_reason += $" POS_NN({(int)boost})";
                    t.topic_specifc_score += boost;
                }
                if (words.Count == 1 && words[0].pos == "NNS")
                { // e.g "Skyscrapers"
                    var boost = 8 * t.S2;
                    t.candidate_reason += $" POS_NNS({(int)boost})";
                    t.topic_specifc_score += boost;
                }
                if (words.Count == 1 && words[0].pos == "NNP")
                { // e.g "Amy" -- hard-exclude single name: set negative
                    t.candidate_reason += $" -POS_NNP(-999)";
                    t.topic_specifc_score = -999;
                }
                if (words.Count == 2 && words[0].pos == "NNP" && words[1].pos == "NNP")
                { // e.g "Amy Schumer" -- favour meaningful name
                    var boost = 5 * t.S2;
                    t.candidate_reason += $" +POS_NNP({(int)boost})";
                    t.topic_specifc_score += boost;
                }
                if (words.Count == 2 && words[0].pos == "JJ" && (words[1].pos == "NN" || words[1].pos == "NNS"))
                { // e.g "giant planets"
                    var boost = 11 * t.S2;
                    t.candidate_reason += $" POS_JJ_NN(S)({(int)boost})";
                    t.topic_specifc_score += boost;
                }
            }*/

            //
            // DONE: (1) consider: taking top 3-4 terms, by score.
            //              > then: lookup the top 4-5 correlated terms of the top 3-4 terms by score.
            //              >       if any of these correlated terms appear in the remaining url_terms, then boost them heavily!
            // 
            //  >> automate now ... will improve, but won't yield desired cateogry (e.g. chess) unless it was in original url_terms list
            //
            // TODO: (2) ADD TOP x/y correlated terms to the url_terms (2nd level terms) and then re-run the entire thing
            //          > target: yield "chess" for URLs that don't directly return it ...
            //
            //**************
            //  JUST NOT POSSIBLE TO DO WITHOUT SOME KIND OF HUMAN INTERVENTION! SO DON'T EVEN TRY!!!!
            // the logic here (unassisted) can work as a "stop gap" or immediate cateogrization, but there should be facility to "recateogrize"
            // or add human-input to the system.
            //
            // UPDATED PLAN: need to be able to MARK terms as desired categories
            //      >> these then get super-max ratings on direct or indirect (2nd level correlated) terms
            // 
            // over time, should only need to mark a few hundred terms as top-level cats;
            // a simple admin view that exposes URLs that don't have first or second level MARKED terms means it will be easy to administer.
            //**************

            // l2 boosting -- for top few terms, get correlated terms: boost non-top root terms matching correlated l2 terms exactly by name
            if (run_l2_boost) { 
                var top_terms = url_terms.Except(topics).OrderByDescending(p => p.tss).Take(3);  // take more??
                foreach (var top_term in top_terms.Where(p => p.term_id != g.MAOMAO_ROOT_TERM_ID)) {

                    var correlations = Terms.Correlations.GetTermCorrelations(new corr_input() { main_term = top_term.term.name }).OrderByDescending(p => p.max_corr);

                    foreach (var correlation in correlations.Take(8)) { // top n by correlation

                        // boost terms that match correlations of top top terms (exactly by name)
                        foreach (var non_top_term in url_terms.Except(topics).Where(p => p.term.name.ToLower() == correlation.corr_term.ToLower() && p.tss >= 0)) {
                            
                            Debug.WriteLine($"{non_top_term.term.name}x{top_term.term.name} corr={correlation.max_corr}");

                            var other_term_boost = 1
                                                   * (int)(Math.Pow((double)top_term.tss * correlation.max_corr, 0.5) 
                                                   * non_top_term.S2);
                            non_top_term.candidate_reason += $" L2_BOOST({other_term_boost}:{top_term.term.name})";

                            non_top_term.tss += other_term_boost; // **** was commented out!! note: this can't introduce *new* terms to the equation (only calling L2 stuff is doing that...)
                        }
                    }
                }
            }

            // recurrance boost -- scale sum of all other boosts relative to direct recurrances of the term in other terms
            SetTagsRepeatedCount(all);
            foreach (var t in all.Where(p => p.term.name.Length > 3).OrderByDescending(p => p.appearance_count).Take(3)) {
                if (t.appearance_count > 1) {
                    var boost = t.tss * 0.15
                                * Math.Pow((double)t.appearance_count, 0.25)
                                ;
                    t.candidate_reason += $" >>> RECURRING({(int)boost}:{t.tss}:{t.appearance_count}) ";
                    t.tss += boost;
                }
            }


            //       (2) want to arrive at BROADLY bucketed "approved" MM CATS, e.g. for sample set: 
            //              * chess, astronomy, atheism, US politics, comedy, maths,  > and not much more than that ...
            //                > the granularity has to be "just right"
            //
            //       (3) acutally, it's more like 2 or 3 MM CATS (hierarchical) for each URL ...
            //

            // final 3 cats
            //var final = new List<string>();
            //foreach (var term in url_terms.OrderByDescending(p => p.TSS).Take(3))
            //    final.Add(term.term.name);

            //return final;

            // normalize TSS
            var max_tss = url_terms.Max(p => p.tss);
            url_terms.ForEach(p => p.tss_norm = max_tss == 0 ? 0 : p.tss / max_tss);
        }

        private void SetTagsRepeatedCount(IEnumerable<url_term> uts)
        {
            foreach (var ut in uts) {
                var appears_in = tags.Where(p => p.term.name.ltrim().IndexOf(ut.term.name.ltrim()) != -1);
                ut.appearance_count = appears_in.Count();
                //log += $"tag {ut.term.name} appears in {ut.appearance_count} tags\r\n";
            }
        }

        private int RemoveSocialTagsThatAreEntities(List<url_term> url_terms)
        {
            int removed = 0;
            using (var db = mm02Entities.Create()) {
                for (int i =0; i < url_terms.Count; i++) {
                    var term = url_terms[i].term;
                    if (term.term_type_id == (int)g.TT.CALAIS_SOCIALTAG) { 
                        if (db.terms.Any(p => p.term_type_id == (int)g.TT.CALAIS_ENTITY && p.name == term.name)) {
                            //log += $"removing social tag '{term.name}' as it is also an entity.\r\n";
                            url_terms.RemoveAt(i);
                            i--;
                            removed++;
                        }
                    }
                }
            }
            return removed;
        }
    }
}
