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

        public List<string> GetCat(dynamic meta_all, List<url_term> url_terms)
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

            // most repeated 
            SetTagsRepeatedCount(all);
            foreach (var t in all.OrderByDescending(p => p.appearance_count).Take(3)) {
                if (t.appearance_count > 1) {
                    var boost = (t.appearance_count * 2) * (int)t.S;
                    t.candidate_reason += $" RECURRING({boost}) ";
                    t.topic_specifc_score += boost;
                }
            }

            // all fully contained in title - no stemming
            foreach (var t in all.Where(p => title.ToLower().IndexOf(p.term.name.ToLower().Trim()) != -1)) {
                var boost = 5 * t.term.name.Length * (int)t.S;
                t.candidate_reason += $" TITLE_EXACT({boost}) ";
                t.topic_specifc_score += boost;
            }
            // all fully contained in title - w/ stemming
            foreach (var t in all.Where(p => stemmer.stem(title.ToLower()).IndexOf(stemmer.stem(p.term.name.ToLower().Trim())) != -1)) {
                if (t.term.name.Length >= MIN_STEMMING_LEN) {
                    var boost = 5 * t.term.name.Length * (int)t.S;
                    t.candidate_reason += $" TITLE_STEMMED({boost}) ";
                    t.topic_specifc_score += boost;
                }
            }

            if (!string.IsNullOrEmpty(description)) {
                // ** all fully contained in description - no stemming
                foreach (var t in all.Where(p => description.ToLower().IndexOf(p.term.name.ToLower().Trim()) != -1)) {
                    var boost = 5 * t.term.name.Length * (int)t.S;
                    t.candidate_reason += $" DESC_EXACT({boost}) ";
                    t.topic_specifc_score += boost; // (int)(10 * Math.Log(Math.Max(20, tag.term.name.Length), 2)); 
                }
                // ** all fully contained in description - w/ stemming
                foreach (var t in all.Where(p => stemmer.stem(description.ToLower()).IndexOf(stemmer.stem(p.term.name.ToLower().Trim())) != -1)) {
                    if (t.term.name.Length >= MIN_STEMMING_LEN) {
                        var boost = 5 * t.term.name.Length * (int)t.S;
                        t.candidate_reason += $" DESC_STEMMED({boost}) ";
                        t.topic_specifc_score += boost;
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

                // any common words also in entities?
                //t.words_common_to_title_and_entities = t.words_common_to_title.Where(p =>
                //    entities.Any(q => q.term.name.ToLower() == p.ToLower() && q.cal_entity_relevance > 0.5)).ToList();

                //// name common to entities, exact match?
                //t.common_to_entities_exact = entities.Where(
                //    p => p.term.name.ToLower() == t.term.name.ToLower() && t.cal_entity_relevance > 0.1)
                //    .Select(p => p.term.name).ToList();

                // boost
                if (t.words_common_to_title.Count > 0) {
                    var boost = (4 * t.words_common_to_title.Count) * (int)t.S;
                    t.candidate_reason += $" TITLE({boost}) ";
                    t.topic_specifc_score += boost;
                }
                if (t.words_common_to_desc.Count > 0) {
                    var boost = (4 * t.words_common_to_desc.Count) * (int)t.S;
                    t.candidate_reason += $" DESC({boost}) ";
                    t.topic_specifc_score += boost;
                }
            }
            var x = all.OrderByDescending(p => p.words_common_to_title.Count).First();
            if (x.words_common_to_title.Count > 0) {
                var boost = (4 * x.words_common_to_title.Count) * (int)x.S;
                x.candidate_reason += $" TITLE_BEST({boost}) ";
                x.topic_specifc_score += boost;
            }
            x = all.OrderByDescending(p => p.words_common_to_desc.Count).First();
            if (x.words_common_to_desc.Count > 0) {
                var boost = (4 * x.words_common_to_desc.Count) * (int)x.S;
                x.candidate_reason += $" DESC_BEST({boost}) ";
                x.topic_specifc_score += boost;
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
                    var boost = 12 *(int)t.S;
                    t.candidate_reason += $" POS_JJ({boost})";
                    t.topic_specifc_score += boost;
                }
                if (words.Count == 1 && words[0].pos == "NN")
                { // e.g "Skyscraper"
                    var boost = 2 * (int)t.S;
                    t.candidate_reason += $" POS_NN({boost})";
                    t.topic_specifc_score += boost;
                }
                if (words.Count == 1 && words[0].pos == "NNS")
                { // e.g "Skyscrapers"
                    var boost = 8 * (int)t.S;
                    t.candidate_reason += $" POS_NNS({boost})";
                    t.topic_specifc_score += boost;
                }
                if (words.Count == 1 && words[0].pos == "NNP")
                { // e.g "Amy" -- hard-exclude single name: set negative
                    t.candidate_reason += $" -POS_NNP(-999)";
                    t.topic_specifc_score = -999;
                }
                if (words.Count == 2 && words[0].pos == "NNP" && words[1].pos == "NNP")
                { // e.g "Amy Schumer" -- favour meaningful name
                    var boost = 5 * (int)t.S;
                    t.candidate_reason += $" +POS_NNP({boost})";
                    t.topic_specifc_score += boost;
                }
                if (words.Count == 2 && words[0].pos == "JJ" && (words[1].pos == "NN" || words[1].pos == "NNS"))
                { // e.g "giant planets"
                    var boost = 11 * (int)t.S;
                    t.candidate_reason += $" POS_JJ_NN(S)({boost})";
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

            // order by score desc -- for top few terms by score, get correlated terms from DB (first-level correlated terms)
            var top_terms = url_terms.Except(topics).OrderByDescending(p => p.topic_specifc_score).Take(3);  //**** DO MORE!
            //var other_terms = url_terms.Except(top_terms);
            foreach (var top_term in top_terms.Where(p => p.term_id != g.MAOMAO_ROOT_TERM_ID)) {
                // get correlated terms
                var correlations = Terms.Correlations.GetTermCorrelations(new corr_input() { main_term = top_term.term.name }).OrderByDescending(p => p.max_corr);

                // take top n correlations
                foreach (var correlation in correlations.Take(8)) { 

                    // get NLP non-top terms that match top n correlated terms, by name
                    foreach (var other_term in url_terms.Except(topics).Where(p => p.term.name.ToLower() == correlation.corr_term.ToLower() && p.topic_specifc_score >= 0))
                    { // skip hard-excluded -ve's

                        // boost non-top correlated term by correlation * top term's score
                        Debug.WriteLine($"boosting {other_term.term.name} corr={correlation.max_corr} for top term {top_term.term.name}");
                        var boost = (int)((double)top_term.topic_specifc_score * correlation.max_corr);
                        other_term.candidate_reason += $" L1_BOOST({boost}:{top_term.term.name})";
                        //other_term.topic_specifc_score += boost;
                    }
                }
            }

            //       (2) want to arrive at BROADLY bucketed "approved" MM CATS, e.g. for sample set: 
            //              * chess, astronomy, atheism, US politics, comedy, maths,  > and not much more than that ...
            //                > the granularity has to be "just right"
            //
            //       (3) acutally, it's more like 2 or 3 MM CATS (hierarchical) for each URL ...
            //

            // final 3 cats
            var final = new List<string>();
            foreach (var term in url_terms.OrderByDescending(p => p.topic_specifc_score).Take(3))
                final.Add(term.term.name);

            return final;
        }

        private void SetTagsRepeatedCount(IEnumerable<url_term> uts)
        {
            foreach (var ut in uts) {
                var appears_in = tags.Where(p => p.term.name.IndexOf(ut.term.name) != -1);
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
