using System.Collections.Generic;
using System.Linq;
using mmdb_model;
using mm_global;
using mm_global.Extensions;
using mm_svc.Terms;
using System.Diagnostics;
using System;
using System.Collections;

namespace mm_svc
{
    public static class UserStream
    {
        public static UserStreamReturn GetAllTopics(long user_id)
        {
            using (var db = mm02Entities.Create())
            {
                // current user histories base on user_id
                var me = db.users.Find(user_id);
                var urls_list = FindUserUrls(user_id);
                // find all accepted share base on user_id
                var share_urls = db.share_active.Include("share").AsNoTracking().Where(p => p.user_id == user_id).Distinct().ToListNoLock();
                // 3 types of sharing: url, topic or all
                var shares_list = share_urls.Select(p => new ShareActiveInput()
                {
                    share_id = p.share_id,
                    share_code = p.share.share_code,
                    url_id = p.share.url_id,
                    topic_id = p.share.topic_id,
                    share_all = p.share.share_all,
                    user_id = p.share.source_user_id
                }).ToList();
                return ClassifyUrlSetForUser(me, urls_list, shares_list);
            }
        }

        private static List<ClassifyUrlInput> FindUserUrls(long user_id)
        {
            using (var db = mm02Entities.Create())
            {
                var user_urls = db.user_url.AsNoTracking().Where(p => p.user_id == user_id).Distinct().ToListNoLock();
                return user_urls.Select(p => new ClassifyUrlInput()
                {
                    url_id = p.url_id,
                    hit_utc = p.nav_utc,
                    user_id = p.user_id,
                    im_score = p.im_score ?? 0,
                    time_on_tab = p.time_on_tab ?? 0
                }).ToList();
            }
        }

        private static List<UserStreamUrlInfo> FindUserUrlInfosOfTopic(long user_id, long? term_id)
        {
            using (var db = mm02Entities.Create())
            {
                var user_urls = db.user_url.AsNoTracking().Where(p => p.user_id == user_id).Distinct().ToListNoLock();
                var urls_list = user_urls.Select(p => new ClassifyUrlInput()
                {
                    url_id = p.url_id,
                    hit_utc = p.nav_utc,
                    user_id = p.user_id,
                    im_score = p.im_score ?? 0,
                    time_on_tab = p.time_on_tab ?? 0
                }).ToList();
                var my_url_ids = urls_list.Select(p => p.url_id).ToList();
                var url_parent_terms_qry = db.url_parent_term.AsNoTracking()
                               .Include("term").Include("url")
                               .OrderBy(p => p.url_id).ThenByDescending(p => p.pri)
                               .Where(p => p.term_id == term_id)
                               .Where(p => my_url_ids.Contains(p.url_id));
                var url_parent_terms = url_parent_terms_qry.ToListNoLock();
                var url_suggestions = url_parent_terms.Where(p => p.suggested_dynamic /*&& !p.term.IS_TOPIC*/).Where(p => p.S > 1).OrderByDescending(p => p.S).ToList();
                var urls = url_parent_terms.Select(p => p.url).DistinctBy(p => p.id).ToList();
                return urls.Select(p => new UserStreamUrlInfo()
                {
                    id = p.id,
                    href = p.url1,
                    img = p.img_url,
                    title = p.meta_title,
                    suggestions_for_url = new List<SuggestionInfo>(url_suggestions.Where(p2 => p2.url_id == p.id).Select(p2 => new SuggestionInfo() { term_name = p2.term.name, S = p2.S ?? 0, is_topic = p2.term.IS_TOPIC }).ToList()),
                    hit_utc = urls_list.Single(p2 => p2.url_id == p.id).hit_utc,
                    im_score = urls_list.Single(p2 => p2.url_id == p.id).im_score,
                    time_on_tab = urls_list.Single(p2 => p2.url_id == p.id).time_on_tab,
                }).ToList();
            }
        }

        private static List<UserStreamUrlInfo> FindUserUrlInfosOfUrl(long? url_id)
        {
            using (var db = mm02Entities.Create())
            {
                var user_urls = db.user_url.AsNoTracking().Where(p => p.url_id == url_id).Distinct().ToListNoLock();
                var urls_list = user_urls.Select(p => new ClassifyUrlInput()
                {
                    url_id = p.url_id,
                    hit_utc = p.nav_utc,
                    user_id = p.user_id,
                    im_score = p.im_score ?? 0,
                    time_on_tab = p.time_on_tab ?? 0
                }).ToList();
                var my_url_ids = urls_list.Select(p => p.url_id).ToList();
                var url_parent_terms_qry = db.url_parent_term.AsNoTracking()
                               .Include("term").Include("url")
                               .OrderBy(p => p.url_id).ThenByDescending(p => p.pri)
                               .Where(p => my_url_ids.Contains(p.url_id));
                var url_parent_terms = url_parent_terms_qry.ToListNoLock();
                var url_suggestions = url_parent_terms.Where(p => p.suggested_dynamic /*&& !p.term.IS_TOPIC*/).Where(p => p.S > 1).OrderByDescending(p => p.S).ToList();
                var urls = url_parent_terms.Select(p => p.url).DistinctBy(p => p.id).ToList();
                return urls.Select(p => new UserStreamUrlInfo()
                {
                    id = p.id,
                    href = p.url1,
                    img = p.img_url,
                    title = p.meta_title,
                    suggestions_for_url = new List<SuggestionInfo>(url_suggestions.Where(p2 => p2.url_id == p.id).Select(p2 => new SuggestionInfo() { term_name = p2.term.name, S = p2.S ?? 0, is_topic = p2.term.IS_TOPIC }).ToList()),
                    hit_utc = urls_list.Single(p2 => p2.url_id == p.id).hit_utc,
                    im_score = urls_list.Single(p2 => p2.url_id == p.id).im_score,
                    time_on_tab = urls_list.Single(p2 => p2.url_id == p.id).time_on_tab,
                }).ToList();
            }
        }

        private static List<UserStreamUrlInfo> FindUserUrlInfos(List<ClassifyUrlInput> urls_list)
        {
            var my_url_ids = urls_list.Select(p => p.url_id).ToList();
            using (var db = mm02Entities.Create())
            {
                var url_parent_terms_qry = db.url_parent_term.AsNoTracking()
                               .Include("term").Include("url")
                               .OrderBy(p => p.url_id).ThenByDescending(p => p.pri)
                               .Where(p => my_url_ids.Contains(p.url_id));
                var url_parent_terms = url_parent_terms_qry.ToListNoLock();
                var url_suggestions = url_parent_terms.Where(p => p.suggested_dynamic /*&& !p.term.IS_TOPIC*/).Where(p => p.S > 1).OrderByDescending(p => p.S).ToList();
                var urls = url_parent_terms.Select(p => p.url).DistinctBy(p => p.id).ToList();
                return urls.Select(p => new UserStreamUrlInfo()
                {
                    id = p.id,
                    href = p.url1,
                    img = p.img_url,
                    title = p.meta_title,
                    suggestions_for_url = new List<SuggestionInfo>(url_suggestions.Where(p2 => p2.url_id == p.id).Select(p2 => new SuggestionInfo() { term_name = p2.term.name, S = p2.S ?? 0, is_topic = p2.term.IS_TOPIC }).ToList()),
                    hit_utc = urls_list.Single(p2 => p2.url_id == p.id).hit_utc,
                    im_score = urls_list.Single(p2 => p2.url_id == p.id).im_score,
                    time_on_tab = urls_list.Single(p2 => p2.url_id == p.id).time_on_tab,
                }).ToList();
            }
        }

        private static List<UserStreamTopicInfo> FindUserTopicInfos(List<ClassifyUrlInput> urls_list, List<UserStreamUrlInfo> url_infos)
        {
            var my_url_ids = urls_list.Select(p => p.url_id).ToList();
            using (var db = mm02Entities.Create())
            {
                // load - get url parent terms: found topics, & url title terms
                var url_parent_terms_qry = db.url_parent_term.AsNoTracking()
                               .Include("term").Include("url")
                               .OrderBy(p => p.url_id).ThenByDescending(p => p.pri)
                               .Where(p => my_url_ids.Contains(p.url_id));
                var url_parent_terms = url_parent_terms_qry.ToListNoLock();

                var url_title_topics = url_parent_terms.Where(p => p.url_title_topic).ToList();
                var url_topics = url_parent_terms.Where(p => p.found_topic && p.S_norm > 0.8).ToList();

                // get topic link chains - regular topics & url title topics
                var topic_chains = new Dictionary<long, List<UserStreamTopicInfo>>();
                foreach (var topic in url_topics.Union(url_title_topics) // regular topics & url title topics
                                                .DistinctBy(p => p.term_id))
                {
                    var topic_term = topic.term;
                    var topic_chain = topic.url_title_topic
                                            ? new List<topic_link>() { new topic_link() { term1 = db.terms.Find((int)g.WIKI_TERM.TopLevelDomain) } }
                                            : GoldenTopics.GetTopicLinkChain(topic_term.id); // todo: cache topic_links in GoldenTopics
                                                                                            
                    var chain = topic_chain.Select(p => new UserStreamTopicInfo() { term_name = p.parent_term.name, term_id = p.parent_term_id }).ToList();
                    chain.Reverse();

                    chain.Add(new UserStreamTopicInfo() { term_name = topic_term.name, term_id = topic_term.id });
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
                                                   .Where(p => p.url_id == url_info.id).ToList();
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
                        var urls_ids_matching = url_infos.Where(p => p.topic_chains.Any(p2 => p2.Any(p3 => p3.term_id == topic.term_id))).Select(p => p.id).ToList();
                        //.Select(p => new UserUrlInfo() { url = p.url,
                        //                     suggestions = url_infos.Single(p2 => p2.url.id == p.url.id).suggestions } );
                        topic.url_ids.AddRange(urls_ids_matching);//.Select(p => p.url.id));
                    }
                }

                // clean topic_chain 
                foreach (var url_info in url_infos)
                {
                    url_info.topic_chains.Clear();
                }

                return topic_chains.Values.OrderBy(p => string.Join("/", p.Select(p2 => p2.term_name))).Select(p => p.First()).DistinctBy(p => p.term_id).ToList();
            }
        }

        private static UserStreamReturn ClassifyUrlSetForUser(user me, List<ClassifyUrlInput> urls_list, List<ShareActiveInput> shares_list)
        {
            // get all topics, urls for user
            // json output
            // { me: { owner: 'me', urls: [], accept_shared: []} , { shares: [ { owner: 'demo',{ urls: []} }]}
            // borrow code from ClassifyUrlSet()
            var url_infos = FindUserUrlInfos(urls_list);
            var ret = new UserStreamReturn()
            {
                shares = ClassifyUrlSetShares(shares_list),
                me = new UserStreamInfo()
                {
                    user_id = me.id,
                    email = me.email,
                    fullname = me.firstname + " " + me.lastname,
                    urls = url_infos.OrderByDescending(p => p.im_score).ToList(),
                    topics = FindUserTopicInfos(urls_list, url_infos),
                    accept_shares = FindAcceptSharedFromUser(me)
                }
            };

            return ret;
        }

        private static List<AcceptShareInfo> FindAcceptSharedFromUser(user me)
        {
            using (var db = mm02Entities.Create())
            {
                var shares = db.share_active.Include("share").Include("user").Where(p => p.share.source_user_id == me.id);
                return shares.Select(p => new AcceptShareInfo()
                {
                    user_id = p.user_id,
                    email = p.user.email,
                    fullname = p.user.firstname + " " + p.user.lastname,
                    share_code = p.share.share_code,
                    url_id = p.share.url_id,
                    share_all = p.share.share_all,
                    topic_id = p.share.topic_id
                }).ToList();
            }
        }

        private static List<UserShareStreamInfo> ClassifyUrlSetShares(List<ShareActiveInput> shares_list)
        {
            var shares = new List<UserShareStreamInfo>();
            var user_share_all = new List<long>();
            var user_share_lists = new Hashtable();
            // we only get share urls if user accept share all
            // or group all share by user 
            // e.g: [ { id: 1, user: 'abc', list: [ { type: 'all', share_code: 'uniq_code', urls: []} ] ]
            using (var db = mm02Entities.Create())
            {
                foreach (var share in shares_list)
                {
                    if (!user_share_lists.ContainsKey(share.user_id))
                    {
                        user_share_lists[share.user_id] = new List<ShareListReturn>();
                    }
                    if (share.share_all)
                    {
                        // share_all = true --> get all urls
                        user_share_all.Add(share.user_id);
                        var urls_list = FindUserUrls(share.user_id);
                        var url_infos = FindUserUrlInfos(urls_list);
                        var urls_share_list = user_share_lists[share.user_id] as List<ShareListReturn>;
                        urls_share_list.Clear();
                        urls_share_list.Add(new ShareListReturn()
                        {
                            share_code = share.share_code,
                            type = "all",
                            urls = url_infos.OrderByDescending(p => p.im_score).ToList(),
                        });
                    }
                    else
                    {
                        if (!user_share_all.Contains(share.user_id))
                        {
                            // topic_id --> get all urls belongs
                            if (share.topic_id != null)
                            {
                                var url_infos = FindUserUrlInfosOfTopic(share.user_id, share.topic_id);
                                var urls_share_list = user_share_lists[share.user_id] as List<ShareListReturn>;
                                urls_share_list.Add(new ShareListReturn()
                                {
                                    share_code = share.share_code,
                                    type = "topic",
                                    urls = url_infos.OrderByDescending(p => p.im_score).ToList(),
                                });
                            }
                            else
                            {
                                // url_id --> check exist url or not, and insert last one
                                var url_infos = FindUserUrlInfosOfUrl(share.url_id);
                                var urls_share_list = user_share_lists[share.user_id] as List<ShareListReturn>;
                                urls_share_list.Add(new ShareListReturn()
                                {
                                    share_code = share.share_code,
                                    type = "url",
                                    urls = url_infos.OrderByDescending(p => p.im_score).ToList(),
                                });
                            }
                        }
                        else
                        {
                            // DO NOTHING
                        }
                        
                    }
                }

                foreach (long user_id in user_share_lists.Keys)
                {
                    var urls_share_list = user_share_lists[user_id] as List<ShareListReturn>;
                    var user = db.users.Find(user_id);
                    shares.Add(new UserShareStreamInfo()
                    {
                        user_id = user.id,
                        email = user.email,
                        fullname = user.firstname + " " + user.lastname,
                        list = urls_share_list
                    });
                }
            }
            return shares.ToList();
        }

        public class UserStreamReturn
        {
            public UserStreamInfo me;
            public List<UserShareStreamInfo> shares;

        }


        public class UserStreamInfo
        {
            public string fullname;
            public string email;
            public long user_id;
            public List<UserStreamUrlInfo> urls;
            public List<UserStreamTopicInfo> topics;
            public List<AcceptShareInfo> accept_shares;
        }

        public class ShareActiveInput
        {

            public long share_id { get; set; }
            public long user_id { get; set; }
            public bool share_all { get; set; }
            public string share_code { get; set; }
            public Nullable<long> url_id { get; set; }
            public Nullable<long> topic_id { get; set; }
        }

        public class UserStreamTopicInfo
        {
            public string term_name;
            public long term_id;
            public List<long> url_ids = new List<long>();
        }

        public class UserStreamUrlInfo
        {

            public DateTime hit_utc { get; set; }
            public string href { get; set; }
            public long id { get; set; }
            public string img { get; set; }
            public double im_score { get; set; }
            public List<SuggestionInfo> suggestions_for_url { get; set; }
            public double time_on_tab { get; set; }
            public string title { get; set; }

            public List<List<UserStreamTopicInfo>> topic_chains = new List<List<UserStreamTopicInfo>>();
        }

        public class ShareListReturn
        {
            public string type;
            public string share_code;
            public List<UserStreamUrlInfo> urls;
        }

        public class UserShareStreamInfo
        {
            public string email { get; set; }
            public long user_id { get; set; }
            public List<ShareListReturn> list { get; set; }
            public string fullname { get; set; }
        }
    }

    public class AcceptShareInfo
    {
        public long user_id { get; internal set; }
        public bool share_all { get; internal set; }
        public string share_code { get; internal set; }
        public long? url_id { get; internal set; }
        public long? topic_id { get; internal set; }
        public string email { get; internal set; }
        public string fullname { get; internal set; }
    }
}
