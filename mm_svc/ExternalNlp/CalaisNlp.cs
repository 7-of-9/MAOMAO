using mm_global;
using mmdb_model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace mm_svc
{
    public static class CalaisNlp
    {
        public static void ProcessResult(dynamic nlp_info, out int new_terms, out int new_pairs)
        {
            new_pairs = new_terms = -1;
            if (nlp_info.url == null) throw new ArgumentException("missing url");
            if (nlp_info.meta == null) throw new ArgumentException("missing meta");
            if (nlp_info.items == null) throw new ArgumentException("missing items");
            var url = mm_global.Util.RemoveHashFromUrl(nlp_info.url.href.ToString());

            // get awis site -- prep/sanity checking
            bool returned_from_db;
            var awis_site = mm_svc.SiteInfo.GetOrQueryAwis(url, out returned_from_db);
            if (awis_site == null) throw new ApplicationException("bad site");
            if (!mm_svc.SiteInfo.IsSiteAllowable(awis_site)) throw new ApplicationException("bad site");

            // get URL, should not be known
            var db_url = mm_svc.UrlInfo.GetNlpInfo(url);
            if (db_url != null) throw new ApplicationException("url already known");

            // create new URL record 
            var db = mm02Entities.Create(); { //using (var db = mm02Entities.Create()) {
                // get calais language
                var cal_langs = ((IEnumerable<dynamic>)nlp_info.items).Where(p => p.type == "LANG").ToList();
                string cal_lang = null;
                if (cal_langs.Count > 0)
                    cal_lang = cal_langs.First().language.ToString();

                // create new url row
                db_url = new url();
                db_url.url1 = url;
                db_url.awis_site_id = awis_site.id;
                db_url.cal_lang = cal_lang;
                db_url.calais_as_of_utc = DateTime.UtcNow;
                db_url.meta_title = nlp_info.meta.html_title.ToString();
                db_url.meta_all = Newtonsoft.Json.JsonConvert.SerializeObject(nlp_info.meta);
                db.urls.Add(db_url);
                db.SaveChangesTraceValidationErrors();
                g.LogLine($"wrote new url url1={db_url.url1}");
            }

            // record calais NLP terms
            var term_ids = mm_svc.CalaisNlp.MaintainTerms(nlp_info, db_url.id, out new_terms);

            // add the master "root node" term - acts as the most common "anchor" for hierarchy inference
            term_ids.Add(g.MAOMAO_ROOT_TERM_ID);

            // compute unqiue combinations of term pairs
            var pairs = mm_svc.TermPair.GetUniqueTermPairs(term_ids);

            // update term-pair appearance matrix
            foreach (var pair in pairs) {
                var new_pair = mm_svc.TermPair.MaintainAppearanceMatrix(pair);
                if (new_pair)
                    new_pairs++;
            }

            //
            // TODO: ...  getNlpInfo should then return KNOWN so counts don't get inc'd on subsequent views
            // make F5 refresh work for easier debugging !!!
            //
        }

        public static List<long> MaintainTerms(dynamic nlp_info, long url_id, out int new_terms)
        {
            new_terms = -1;
            var term_ids = new List<long>();

            using (var db = mm02Entities.Create())
            {
                // process calais entities
                foreach (var item in ((IEnumerable<dynamic>)nlp_info.items).Where(
                    p => p.type == "ENTITY" || p.type == "SOCIAL_TAG" || p.type == "TOPIC"))
                {
                    string item_name = item.name.ToString();
                    if (string.IsNullOrEmpty(item_name) || item_name.Length > 128)
                        continue;

                    string item_type = item.type.ToString();

                    int term_type_id;
                    switch (item_type) {
                        case "ENTITY": term_type_id = (int)g.TT.CALAIS_ENTITY; break;
                        case "SOCIAL_TAG": term_type_id = (int)g.TT.CALAIS_SOCIALTAG; break;
                        case "TOPIC": term_type_id = (int)g.TT.CALAIS_TOPIC; break;
                        default: throw new ApplicationException($"unknown calais item type {item_type}");
                    }
                    string ent_typename = item_type == "ENTITY" ? item.entity_type.ToString() : null;

                    // if entity, is entity-type known in DB?
                    int? cal_entity_type_id = null;
                    if (ent_typename != null) {
                        if (ent_typename == "EmailAddress" || ent_typename == "PhoneNumber") {
                            // not of interest, don't pollute DB
                            continue;
                        }

                        var db_ent_type = db.cal_entity_type.Where(p => p.name == ent_typename).FirstOrDefaultNoLock();
                        if (db_ent_type == null) {
                            db_ent_type = new cal_entity_type();
                            db_ent_type.name = ent_typename;
                            db.cal_entity_type.Add(db_ent_type);
                            db.SaveChangesTraceValidationErrors();
                            g.LogLine($"wrote new cal_entity_type name={db_ent_type.name}");
                        }
                        else
                            g.LogLine($"known cal_entity_type name={db_ent_type.name}");
                        cal_entity_type_id = db_ent_type.id;
                    }

                    // is term known in DB?
                    var db_term = db.terms.Where(p => p.name == item_name
                                                   && p.term_type_id == term_type_id
                                                   && p.cal_entity_type_id == cal_entity_type_id).FirstOrDefaultNoLock();
                    if (db_term == null) {
                        db_term = new term();
                        db_term.name = item_name;
                        db_term.term_type_id = term_type_id;
                        db_term.cal_entity_type_id = cal_entity_type_id;
                        db_term.occurs_count = 1;
                        db.terms.Add(db_term);
                        db.SaveChangesTraceValidationErrors();
                        new_terms++;
                        g.LogLine($"wrote new term name={db_term.name}, term_type_id={term_type_id}, cal_entity_type_id={cal_entity_type_id}");
                    }
                    else {
                        g.LogLine($"++occurs_count for known term name={db_term.name}, term_type_id={term_type_id}, cal_entity_type_id={cal_entity_type_id}");
                        db_term.occurs_count++;
                        db.SaveChangesTraceValidationErrors();
                    }
                    term_ids.Add(db_term.id);

                    // record term-url link
                    var db_url_term = new url_term();
                    db_url_term.term_id = db_term.id;
                    db_url_term.url_id = url_id;
                    switch (term_type_id) {
                        case (int)g.TT.CALAIS_ENTITY:
                            db_url_term.cal_entity_relevance = Convert.ToDouble(item.relevance.ToString()); break;
                        case (int)g.TT.CALAIS_SOCIALTAG:
                            db_url_term.cal_socialtag_importance = Convert.ToInt32(item.importance.ToString()); break;
                        case (int)g.TT.CALAIS_TOPIC:
                            db_url_term.cal_topic_score = Convert.ToDouble(item.score.ToString()); break;
                    }
                    db.url_term.Add(db_url_term);
                    db.SaveChangesTraceValidationErrors();
                    g.LogLine($"wrote new url_term url_id={url_id}, term_id={db_term.id}");
                }
            }
            return term_ids;
        }
    }
}
