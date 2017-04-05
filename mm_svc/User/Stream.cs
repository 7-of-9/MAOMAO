using System.Collections.Generic;
using System.Linq;
using mmdb_model;
using mm_global;
using mm_global.Extensions;
using mm_svc.Terms;
using System.Diagnostics;

namespace mm_svc
{
    public static class UserStream
    {
        public static ClassifyReturn GetAllTopics( long user_id)
        {
            using (var db = mm02Entities.Create())
            {
                var user_urls = db.user_url.Include("url").AsNoTracking().Where(p => p.user_id == user_id).Distinct().ToListNoLock();
                return ClassifyUrlSetForUser(user_urls.Select(p => new ClassifyUrlInput()
                {
                    url_id = p.url_id,
                    hit_utc = p.nav_utc,
                    user_id = p.user_id,
                    im_score = p.im_score ?? 0,
                    time_on_tab = p.time_on_tab ?? 0
                }).ToList());
            }
        }

        public static ClassifyReturn ClassifyUrlSetForUser(List<ClassifyUrlInput> inputs)
        {
            var url_ids = inputs.Select(p => p.url_id).ToList();
            using (var db = mm02Entities.Create())
            {

                // load - get url parent terms: found topics, & url title terms
                var url_parent_terms_qry = db.url_parent_term.AsNoTracking()
                               .Include("term").Include("url")
                               .OrderBy(p => p.url_id).ThenByDescending(p => p.pri)
                               .Where(p => url_ids.Contains(p.url_id));
                var url_parent_terms = url_parent_terms_qry.ToListNoLock();

                var url_title_topics = url_parent_terms.Where(p => p.url_title_topic).ToList();
                var url_topics = url_parent_terms.Where(p => p.found_topic && p.S_norm > 0.8).ToList();
                var url_suggestions = url_parent_terms.Where(p => p.suggested_dynamic /*&& !p.term.IS_TOPIC*/).Where(p => p.S > 1).OrderByDescending(p => p.S).ToList();

                var urls = url_parent_terms.Select(p => p.url).DistinctBy(p => p.id).ToList();
                var url_infos = urls.Select(p => new UserUrlInfo()
                {
                    url = p,
                    suggestions = new List<SuggestionInfo>(url_suggestions.Where(p2 => p2.url_id == p.id).Select(p2 => new SuggestionInfo() { term_name = p2.term.name, S = p2.S ?? 0, is_topic = p2.term.IS_TOPIC }).ToList()),
                    hit_utc = inputs.Single(p2 => p2.url_id == p.id).hit_utc,
                    im_score = inputs.Single(p2 => p2.url_id == p.id).im_score,
                    time_on_tab = inputs.Single(p2 => p2.url_id == p.id).time_on_tab,
                }).ToList();

                // get topic link chains - regular topics & url title topics
                var topic_chains = new Dictionary<long, List<TopicInfo>>();
                foreach (var topic in url_topics.Union(url_title_topics) // regular topics & url title topics
                                                .DistinctBy(p => p.term_id))
                {
                    var topic_term = topic.term;
                    var topic_chain = topic.url_title_topic
                                            ? new List<topic_link>() { new topic_link() { term1 = db.terms.Find((int)g.WIKI_TERM.TopLevelDomain) } }
                                            : GoldenTopics.GetTopicLinkChain(topic_term.id); // todo: cache topic_links in GoldenTopics

                    var chain = topic_chain.Select(p => new TopicInfo() { term_name = p.parent_term.name, term_id = p.parent_term_id, }).ToList();
                    chain.Reverse();

                    chain.Add(new TopicInfo() { term_name = topic_term.name, term_id = topic_term.id, url_title_topic = topic.url_title_topic });
                    topic_chains.Add(topic_term.id, chain);
                }

                // dedupe chains -- remove chain if the first topic in the chain is contained in any other chains
                var topic_ids_to_remove = new List<long>();
                foreach (var chain_id in topic_chains.Keys)
                {
                    var other_chains = topic_chains.Where(p => p.Key != chain_id).Select(p => p.Value);
                    if (other_chains.Any(p => p.Any(p2 => p2.term_id == chain_id)))
                        topic_ids_to_remove.Add(chain_id);
                }
                topic_ids_to_remove.ForEach(p => topic_chains.Remove(p));

                // urls --> topic chains
                foreach (var url_info in url_infos)
                {
                    var topics_for_url = url_topics.Union(url_title_topics) // regular topics & url title topics
                                                   .Where(p => p.url_id == url_info.url.id).ToList();
                    foreach (var topic in topics_for_url)
                    {
                        if (topic_chains.ContainsKey(topic.term_id))
                        {
                            var topic_chain = topic_chains[topic.term_id];
                            url_info.topic_chains.Add(topic_chain);
                        }
                    }
                    //url_info.topic_chains = url_info.topic_chains.OrderByDescending(p => p.Max(p2 => p2.topic_S_norm)).ToList();
                }

                // walk topic chains; add urls that match each topic in chain
                foreach (var topic_chain in topic_chains.Values)
                {
                    foreach (var topic in topic_chain)
                    {
                        var urls_ids_matching = url_infos.Where(p => p.topic_chains.Any(p2 => p2.Any(p3 => p3.term_id == topic.term_id))).Select(p => p.url.id).ToList();
                        //.Select(p => new UserUrlInfo() { url = p.url,
                        //                     suggestions = url_infos.Single(p2 => p2.url.id == p.url.id).suggestions } );
                        topic.url_ids.AddRange(urls_ids_matching);//.Select(p => p.url.id));
                    }
                }

                // dbg: order & print 
                var chains = topic_chains.Values.OrderBy(p => string.Join("/", p.Select(p2 => p2.term_name))).ToList();
                foreach (var topic_chain in chains)
                    Debug.WriteLine($"\t\t({string.Join(" > ", topic_chain.Select(topic => topic.term_name + $" ({topic.url_ids.Count} urls)"))})");

                // ***
                // convert flat chains of TopicInfo to tree of TopicInfo

                // (1) link each TopcInfo to its single child, for each chain, e.g.
                //      (Television (4 urls) > Film (4 urls) > Animation (1 urls))
                //      (Science(2 urls) > Anthropology(1 urls))
                //  ...
                foreach (var chain in chains)
                    for (int i = 0; i < chain.Count - 1; i++)
                        chain[i].child_topics.Add(chain[i + 1]);

                // (2) combine TopicInfo children for identical topics
                for (int i = 0; i < chains.Count; i++)
                {
                    var chain = chains[i];

                    for (int j = chain.Count - 1; j >= 0; j--)
                    {
                        var topic = chain[j];

                        var identical_topics = chains.SelectMany(p => p.Where(p2 => p2.term_id == topic.term_id)).Where(p => p != topic).ToList();
                        foreach (var same_topic in identical_topics)
                        {
                            // add children to new master TopicInfo
                            topic.child_topics.AddRange(same_topic.child_topics.Where(p => !topic.child_topics.Select(p2 => p2.term_id).Contains(p.term_id)));

                            // remove from other chain
                            var other_chain = chains.Single(p => p.Contains(same_topic));
                            var ndx = other_chain.IndexOf(same_topic);
                            other_chain.RemoveRange(ndx, other_chain.Count - ndx);
                        }
                    }
                }
                chains.RemoveAll(p => p.Count == 0);
                chains.ForEach(p => { if (p.Count > 1) p.RemoveRange(1, p.Count - 1); });
                var tree_roots = chains.Select(p => p.First()).ToList();

                var ret = new ClassifyReturn()
                {
                    topics = tree_roots,
                    urls = url_infos.OrderByDescending(p => p.im_score).ToList()
                };

                ret.topics.ForEach(p => p.GetSuggestedTermsForTopicAndChildren());
                return ret;
               
            }
        }
    }
}
