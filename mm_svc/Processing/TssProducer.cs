using mm_global;
using mm_global.Extensions;
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
    public class TssProducer
    {
        private IEnumerable<url_term> tags;
        private IEnumerable<url_term> entities;
        private IEnumerable<url_term> topics;
        private IEnumerable<url_term> all;

        public const int MIN_GOLD_TSS = 100;

        // TSS boosts 
        public const double SOCIAL_TAG_BOOST = 6;
        private Dictionary<g.ET, double> entity_type_boosts = new Dictionary<g.ET, double>() {
            { g.ET.Movie,                SOCIAL_TAG_BOOST * 2.5 },
            { g.ET.TVShow ,              SOCIAL_TAG_BOOST * 2.5 },
            { g.ET.MusicAlbum,           SOCIAL_TAG_BOOST },
            { g.ET.MusicGroup,           SOCIAL_TAG_BOOST },
            { g.ET.Country,              SOCIAL_TAG_BOOST * 0.5 },
            { g.ET.NaturalFeature,       SOCIAL_TAG_BOOST },
            { g.ET.OperatingSystem,      SOCIAL_TAG_BOOST },
            { g.ET.Person,               SOCIAL_TAG_BOOST * 0.5 },
            { g.ET.Organization,         SOCIAL_TAG_BOOST * 2 },
            { g.ET.Product,              SOCIAL_TAG_BOOST },
            { g.ET.ProgrammingLanguage , SOCIAL_TAG_BOOST },
            { g.ET.SportsGame,           SOCIAL_TAG_BOOST },
            { g.ET.SportsLeague,         SOCIAL_TAG_BOOST },
            { g.ET.Technology,           SOCIAL_TAG_BOOST },
        };

        // boosts
        public const double BASE_BOOST = 5;
        public const double TITLE_EXACT_START_BOOST = BASE_BOOST * 3;
        public const double TITLE_DESC_BOOST = 4;

        internal void CalcTSS(dynamic meta_all, List<url_term> url_terms, bool run_l2_boost)
        {
            url_terms.ForEach(p => p.InitExtensionFields());
            this.tags = url_terms.Where(p => p.term.term_type_id == (int)g.TT.CALAIS_SOCIALTAG);
            this.entities = url_terms.Where(p => p.term.term_type_id == (int)g.TT.CALAIS_ENTITY);
            this.topics = url_terms.Where(p => p.term.term_type_id == (int)g.TT.CALAIS_TOPIC);
            this.all = url_terms;
            //const int MIN_STEMMING_LEN = 5;

            var title_ltrim = meta_all.html_title.ToString().ToLower().Trim();
            var title_ltrim_nopunc = ((string)Convert.ChangeType(title_ltrim, typeof(string))).nopunc();

            var desc_ltrim = (meta_all.ip_description ?? "").ToString().ToLower().Trim();
            var desc_ltrim_nopunc = ((string)Convert.ChangeType(desc_ltrim, typeof(string))).nopunc();

            Porter2_English stemmer = new Porter2_English();

            // S2 -- baseline S relevance boosted and scaled
            foreach (var x in all) {
                x.S2 = x.S_CALC * x.s;
                if (x.term.term_type_id == (int)g.TT.CALAIS_SOCIALTAG) {
                    x.S2 = x.S_CALC * SOCIAL_TAG_BOOST;
                }
                else if (x.term.term_type_id == (int)g.TT.CALAIS_ENTITY) {
                    if (entity_type_boosts.ContainsKey((g.ET)x.term.cal_entity_type_id))
                        x.S2 = x.S_CALC * entity_type_boosts[(g.ET)x.term.cal_entity_type_id];
                }
            }

            const int MAX_BOOST_LEN = 6;

            // all fully contained in title - no stemming
            var title_exact_terms = all.Where(p => title_ltrim.ToLower().IndexOf(p.term.name.ltrim()) != -1);
            foreach (var t in title_exact_terms) {
                var boost = BASE_BOOST
                            * t.term.name.LengthNorm(MAX_BOOST_LEN)
                            * t.S2;
                t.candidate_reason += $" TITLE_EXACT({(int)boost}) ";
                t.tss += boost;
            }
            // fully contained in title -- at start
            var title_exact_start_terms = all.Where(p => title_ltrim.ToLower().StartsWith(p.term.name.ltrim()));
            foreach (var t in title_exact_start_terms) {
                var boost = TITLE_EXACT_START_BOOST
                            * t.term.name.LengthNorm(MAX_BOOST_LEN)
                            * t.S2;
                t.candidate_reason += $" TITLE_EXACT_START({(int)boost}) ";
                t.tss += boost;
            }

            // all fully contained in title, no punctuation - no stemming
            foreach (var t in all.Except(title_exact_terms).Where(p => title_ltrim_nopunc.IndexOf(p.term.name.nopunc()) != -1)) {
                var boost = BASE_BOOST
                            * t.term.name.LengthNorm(MAX_BOOST_LEN)
                            * t.S2;
                t.candidate_reason += $" TITLE_EXACT_NOPUNC({(int)boost}[{t.term.name.nopunc()}]) ";
                t.tss += boost;
            }
            // fully contained in title, no punctuation -- at start
            foreach (var t in all.Except(title_exact_start_terms).Where(p => title_ltrim_nopunc.StartsWith(p.term.name.nopunc()))) {
                var boost = TITLE_EXACT_START_BOOST
                            * t.term.name.LengthNorm(MAX_BOOST_LEN)
                            * t.S2;
                t.candidate_reason += $" TITLE_EXACT_START_NOPUNC({(int)boost}[{t.term.name.nopunc()}]) ";
                t.tss += boost;
            }

            if (!string.IsNullOrEmpty(desc_ltrim)) {
                // all fully contained in description - no stemming
                var desc_exact_terms = all.Where(p => desc_ltrim.IndexOf(p.term.name.ltrim()) != -1);
                foreach (var t in desc_exact_terms) {
                    var boost = BASE_BOOST
                                * t.term.name.LengthNorm(MAX_BOOST_LEN)
                                * t.S2;
                    t.candidate_reason += $" DESC_EXACT({(int)boost}) ";
                    t.tss += boost;
                }

                // all fully contained in description, no punctuation - no stemming
                foreach (var t in all.Except(desc_exact_terms).Where(p => desc_ltrim_nopunc.IndexOf(p.term.name.nopunc()) != -1)) {
                    var boost = BASE_BOOST
                                * t.term.name.LengthNorm(MAX_BOOST_LEN)
                                * t.S2;
                    t.candidate_reason += $" DESC_EXACT_NOPUNC({(int)boost}[{t.term.name.nopunc()}]) ";
                    t.tss += boost;
                }
            }

            // title best partial match 
            var title_ex_stopwords = InternalNlp.Utils.Words.TokenizeExStopwords(title_ltrim).ToString();
            var description_ex_stopwords = InternalNlp.Utils.Words.TokenizeExStopwords(desc_ltrim).ToString();

            // porter2 stemming
            var title_ex_stopwords_stemmed = stemmer.stem(title_ex_stopwords);
            var description_ex_stopwords_stemmed = stemmer.stem(description_ex_stopwords);

            foreach (var t in all) {
                //***
                //if (t.term.name.Length >= MIN_STEMMING_LEN) {
                t.words_X_title_stemmed = InternalNlp.Utils.Words.WordsInCommon(stemmer.stem(t.term.name), title_ex_stopwords_stemmed);
                t.words_X_desc_stemmed = InternalNlp.Utils.Words.WordsInCommon(stemmer.stem(t.term.name), description_ex_stopwords_stemmed);
                //}

                // boost
                if (t.words_X_title_stemmed.Count > 0) {
                    var boost = TITLE_DESC_BOOST
                                * t.words_X_title_stemmed.Count
                                * t.S2;
                    t.candidate_reason += $" TITLE(S)({(int)boost}) ";
                    t.tss += boost;
                }
                if (t.words_X_desc_stemmed.Count > 0) {
                    var boost = TITLE_DESC_BOOST
                                * t.words_X_desc_stemmed.Count
                                * t.S2;
                    t.candidate_reason += $" DESC(S)({(int)boost}) ";
                    t.tss += boost;
                }
            }
            var tt = all.Where(p => p.words_X_title_stemmed.Count == all.Max(p2 => p2.words_X_title_stemmed.Count));
            foreach (var t in tt) {
                if (t.words_X_title_stemmed.Count > 0) {
                    var boost = TITLE_DESC_BOOST
                                * t.words_X_title_stemmed.Count
                                * t.S2;
                    t.candidate_reason += $" TITLE(S)_BEST({(int)boost}) ";
                    t.tss += boost;
                }
            }
            tt = all.Where(p => p.words_X_desc_stemmed.Count == all.Max(p2 => p2.words_X_desc_stemmed.Count));
            foreach (var t in tt) {
                if (t.words_X_desc_stemmed.Count > 0) {
                    var boost = TITLE_DESC_BOOST
                                * t.words_X_desc_stemmed.Count
                                * t.S2;
                    t.candidate_reason += $" DESC(S)_BEST({(int)boost}) ";
                    t.tss += boost;
                }
            }

            // parts of speach patterns
            // TODO: replace with lightweight POS tagger - stanfordcore v. hard and slow
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

            // TODO -- finalize/tweak/turn this down...
            // l2 boosting -- for top few terms, get correlated terms: boost non-top root terms matching correlated l2 terms exactly by name
            if (run_l2_boost) {
                var top_terms = url_terms.Except(topics).DistinctBy(p => p.term.name.ltrim()).OrderByDescending(p => p.tss).Take(3);  // take more??
                foreach (var top_term in top_terms.Where(p => p.term_id != g.MAOMAO_ROOT_TERM_ID)) {

                    var correlations = Terms.Correlations.GetTermCorrelations(new corr_input() { main_term = top_term.term.name }).OrderByDescending(p => p.corr_for_main);

                    foreach (var correlation in correlations.Take(8)) { // top n by correlation

                        // boost terms that match correlations of top top terms (exactly by name)
                        foreach (var non_top_term in url_terms
                            .Except(topics).DistinctBy(p => p.term.name.ltrim()) // only boost once per correlation
                            .Where(p => p.term.name.ltrim() == correlation.corr_term_name.ltrim() && p.tss >= 0)
                        ) {

                            Debug.WriteLine($"{top_term.term.name}x{non_top_term.term.name} corr={correlation.corr_for_main}");

                            var other_term_boost = 1
                                                   * (int)(Math.Pow((double)top_term.tss * correlation.corr_for_main, 0.25)
                                                   * non_top_term.S2);
                            non_top_term.candidate_reason += $" L2_BOOST({other_term_boost}:{top_term.term.name})";

                            non_top_term.tss += other_term_boost; // **** was commented out!! note: this can't introduce *new* terms to the equation (only calling L2 stuff is doing that...)
                        }
                    }
                }
            }

            // recurrance boost -- scale sum of all other boosts relative to direct recurrances of the term in other terms
            //SetTagsRepeatedCount(all);
            //foreach (var t in all.Where(p => p.term.name.Length > 3).OrderByDescending(p => p.appearance_count).Take(3)) {
            //    if (t.appearance_count > 1) {
            //        var boost = t.tss * 0.5
            //                    * Math.Pow((double)t.appearance_count, 0.05)
            //                    ;
            //        t.candidate_reason += $" >>> RECURRING({(int)boost}:{t.tss}:{t.appearance_count}) ";
            //        t.tss += boost;
            //    }
            //}

            // last chance saloon -- assign maximum Calais-scored terms that are up to now not scored, with TSS of exactly 1/2 of max. assigned TSS
            if (url_terms.Max(p2 => p2.tss) > 0) {
                url_terms.Where(p => p.tss == 0 && p.S == 9).ToList().ForEach(p => {
                    p.candidate_reason += $" CAL_MAX_LAST_CHANCE(1)";
                    p.tss = url_terms.Max(p2 => p2.tss) / 2;
                });
            }

            // last chance saloon -- assign maximum Calais-scored terms that are up to now not scored, with TSS of exactly 1/2 of max. assigned TSS
            url_terms.Where(p => p.tss == 0 && p.S == 6).ToList().ForEach(p => {
                p.candidate_reason += $" CAL_MAX_LAST_CHANCE(2)";
                p.tss = url_terms.Max(p2 => p2.tss) / 3;
            });

            // FALLBACK: if still no terms with TSS > 0, then assign non-zero TSS values to maximum weighted terms
            if (url_terms.Where(p => p.tss > 0).Count() == 0) {
                url_terms.Where(p => p.S == 9).ToList().ForEach(p => {
                    p.tss = 42.42;
                    p.candidate_reason += " 4242";
                });
            }

            // normalize TSS
            var max_tss = url_terms.Count > 0 ? url_terms.Max(p => p.tss) : 0;
            url_terms.ForEach(p => p.tss_norm = max_tss == 0 ? 0 : p.tss / max_tss);

            // TSS, TSS_norm, reasons, word_x_title, word_x_desc
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
            var db = mm02Entities.Create();
            { //using (var db = mm02Entities.Create()) {
                for (int i = 0; i < url_terms.Count; i++) {
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
