using System.Collections.Generic;
using System.Linq;
using mmdb_model;
using mm_global;
using mm_global.Extensions;
using mm_svc.Terms;
using System.Diagnostics;
using System;
using System.Collections;
using static mm_svc.UserHomepage.Homepage.OthersInfo;
using System.Threading.Tasks;
using System.Collections.Concurrent;

namespace mm_svc
{
    public static class UserHomepage
    {
        const double MIN_S_NORM = 0.7;

        public class Homepage
        {
            public class OwnInfo {
                public class ShareIssuedInfo { // todo: refactor w/ ShareReceivedInfo
                    public long user_id;
                    public string share_code;
                    public string email;
                    public string fullname;
                    public string avatar;

                    public long? url_id;
                    public long? topic_id;
                    public string topic_name;
                    public bool share_all;

                    public bool source_user_deactivated; 
                    public bool target_user_deactivated;
                }

                public string fullname;
                public string avatar;
                public string email;
                public long user_id;
                public List<UserUrlInfo> urls;
                public List<ShareIssuedInfo> shares_issued;
            }
            public OwnInfo mine;

            public class OthersInfo {
                public class ShareReceivedInfo {
                    public string type;
                    public string topic_name;
                    public string share_code;
                    public List<UserUrlInfo> urls;

                    public bool source_user_deactivated;
                    public bool target_user_deactivated;
                }

                public string email;
                public long user_id;
                public string avatar;
                public string fullname;
                public List<ShareReceivedInfo> shares;
            }
            public List<OthersInfo> received;

            public List<TopicInfo> topics;
        }

        public static Homepage Get(long user_id)
        {
            Homepage ret = new Homepage();

            GoldenParents.use_stored_parents_cache = true;
            GoldenTopics.use_topic_link_cache = true;

            var urls_terms = new ConcurrentDictionary<long, List<term>>(); // url_id x term_ids[]

            var sw = new Stopwatch(); sw.Start();
            using (var db = mm02Entities.Create()) {
                // get own history
                var me = db.users.Find(user_id);
                var own_urls = db.user_url.AsNoTracking().Where(p => p.user_id == user_id && p.time_on_tab > 0).Distinct().ToListNoLock();
                var own_url_infos = GetUserUrlInfos_ForUserUrls(me.id, urls_terms);
                Debug.WriteLine($"1 = {sw.ElapsedMilliseconds}ms");

                // get received & accepted shares
                var received_shares = db.share_active.Include("share").Include("share.term").AsNoTracking().Where(p => p.user_id == user_id).Distinct().ToListNoLock();
                ret.received = GetSharesReceivedFrom(received_shares, urls_terms);
                Debug.WriteLine($"2 = {sw.ElapsedMilliseconds}ms");

                ret.mine = new Homepage.OwnInfo() {
                    user_id = me.id, email = me.email, avatar = me.avatar ?? "", fullname = me.firstname + " " + me.lastname,
                    urls = own_url_infos.OrderByDescending(p => p.im_score).ToList(),
                    shares_issued = FindAcceptSharedFromUser(me),
                };
                Debug.WriteLine($"3 = {sw.ElapsedMilliseconds}ms");

                //
                // TODO: 
                //       (2) is_topic buggy
                //
                var received_url_infos = ret.received.SelectMany(p => p.shares.SelectMany(p2 => p2.urls)).ToList();
                var all_url_infos = own_url_infos.Union(received_url_infos).ToList();
                var all_url_ids = all_url_infos.Select(p => p.url_id).ToList();

                ret.topics = GetTopicInfos_ForUserUrls(all_url_ids, all_url_infos, urls_terms);

                Debug.WriteLine($"4 = {sw.ElapsedMilliseconds}ms");
            }

            var ms = sw.ElapsedMilliseconds;
            g.LogInfo($"Homepage/get user_id={user_id} ms={ms}");

            var a = ret.mine.urls.Where(p => p.url_id == 13513).ToList();
            var b = ret.received.SelectMany(p => p.shares.SelectMany(p2 => p2.urls.Where(p3 => p3.url_id == 13513))).ToList();

            return ret;
        }

        private static List<Homepage.OthersInfo> GetSharesReceivedFrom(List<share_active> received_shares, ConcurrentDictionary<long, List<term>> urls_terms)
        {
            var shares = new List<Homepage.OthersInfo>();
            var share_all_user_ids = new List<long>();
            var user_share_lists = new ConcurrentDictionary<long, List<ShareReceivedInfo>>();

            if (received_shares == null)
                return null;

            // (?todo process each type in one go?)
            //var share_alls = received_shares.Where(p => p.share.share_all).ToList();
            //var share_topics = received_shares.Where(p => p.share.topic_id != null && !share_alls.Select(p2 => p2.share.source_user_id).Contains(p.share.source_user_id)).ToList();
            //var share_urls = received_shares.Where(p => p.share.url_id != null).ToList();

            // we only get share urls if user accept share all
            // or group all share by user 
            // e.g: [ { id: 1, user: 'abc', list: [ { type: 'all', share_code: 'uniq_code', urls: []} ] ]
            using (var db = mm02Entities.Create()) {

                Parallel.ForEach(received_shares, (received_share) => {
                //foreach (var received_share in received_shares) {

                    var source_user_id = received_share.share.source_user_id;

                    if (!user_share_lists.ContainsKey(source_user_id)) {
                        user_share_lists[source_user_id] = new List<ShareReceivedInfo>();
                    }

                    if (received_share.share.share_all) {

                        // share_all --> share all browsing!
                        share_all_user_ids.Add(source_user_id);

                        var url_infos = GetUserUrlInfos_ForUserUrls(source_user_id, urls_terms);

                        var urls_share_list = user_share_lists[source_user_id] as List<ShareReceivedInfo>;

                        urls_share_list.Clear();

                        urls_share_list.Add(new ShareReceivedInfo() {
                            share_code = received_share.share.share_code,
                            type = "all",
                            urls = url_infos.OrderByDescending(p => p.im_score).ToList(),
                            source_user_deactivated = received_share.source_user_deactivated,
                            target_user_deactivated = received_share.user_deactivated,
                        });
                    }

                    else {
                        if (!share_all_user_ids.Contains(source_user_id)) {

                            if (received_share.share.topic_id != null) {
                                // topic_id --> share of topic (main)

                                var url_infos = GetUserUrlInfos_ForTopic(source_user_id, received_share.share.topic_id, urls_terms);

                                var urls_share_list = user_share_lists[source_user_id] as List<ShareReceivedInfo>;
                                urls_share_list.Add(new ShareReceivedInfo() {
                                    share_code = received_share.share.share_code,
                                    type = "topic",
                                    topic_name = received_share.share.term.name,
                                    urls = url_infos.OrderByDescending(p => p.im_score).ToList(),
                                    source_user_deactivated = received_share.source_user_deactivated,
                                    target_user_deactivated = received_share.user_deactivated,
                                });
                            }

                            else {

                                // url_id --> single page/URL share

                                var url_infos = GetUserUrlInfos_ForSingleUrl(received_share.share.url_id, urls_terms);

                                var urls_share_list = user_share_lists[source_user_id] as List<ShareReceivedInfo>;
                                urls_share_list.Add(new ShareReceivedInfo() {
                                    share_code = received_share.share.share_code,
                                    type = "url",
                                    urls = url_infos.OrderByDescending(p => p.im_score).ToList(),
                                    source_user_deactivated = received_share.source_user_deactivated,
                                    target_user_deactivated = received_share.user_deactivated,
                                });
                            }
                        }
                    }
                }
                );

                foreach (long user_id in user_share_lists.Keys) {
                    var urls_share_list = user_share_lists[user_id] as List<ShareReceivedInfo>;
                    var user = db.users.Find(user_id);
                    shares.Add(new Homepage.OthersInfo() {
                        user_id = user.id,
                        email = user.email,
                        avatar = user.avatar ?? "",
                        fullname = user.firstname + " " + user.lastname,
                        shares = urls_share_list
                    });
                }
            }
            return shares.ToList();
        }

        private static List<UserUrlInfo> GetUserUrlInfos_ForTopic(long user_id, long? term_id, ConcurrentDictionary<long, List<term>> urls_terms)
        {
            using (var db = mm02Entities.Create()) {

                var url_parent_terms_qry = db.url_parent_term
                                             .OrderBy(p => p.url_id).ThenByDescending(p => p.pri)
                                             .Where(p =>
                                                 // topics (regular or TLD title topics)
                                                 (p.term_id == term_id && (p.S_norm > MIN_S_NORM || p.url_title_topic == true))
                                             
                                                 // and top suggestions 
                                                 //|| (p.suggested_dynamic == true && (p.term.is_topic??false) == false && (p.pri == 1 || p.pri == 2))
                                                 )             

                                             .Where(p => p.url.user_url.Any(p2 => p2.user_id == user_id && p2.time_on_tab > 0))
                                             .Select(p => new {
                                                 url_id = p.url_id,
                                                 href = p.url.url1,
                                                 img_url = p.url.img_url,
                                                 meta_title = p.url.meta_title,
                                                 hit_utc = p.url.user_url.FirstOrDefault(p2 => p2.user_id == user_id).nav_utc,
                                                 im_score = p.url.user_url.FirstOrDefault(p2 => p2.user_id == user_id).im_score,
                                                 time_on_tab = p.url.user_url.FirstOrDefault(p2 => p2.user_id == user_id).time_on_tab,
                                                 //suggested_dynamic = p.suggested_dynamic,
                                                 S = p.S,

                                                 term = p.term
                                             });
                //Debug.WriteLine(url_parent_terms_qry.ToString());
                var url_parent_terms = url_parent_terms_qry.ToListNoLock();

                url_parent_terms.ForEach(p => MaintainUrlTermsLookup(p.url_id, p.term, urls_terms));

                //var topic_matching_url_ids = urls.Select(p => p.url_id).Distinct().ToList();
                // seems v slightly faster to get suggestions separately, as compared to trying to get above
                //var url_suggestions_qry = db.url_parent_term
                //                        .Where(p => topic_matching_url_ids.Contains(p.url_id)
                //                                && p.suggested_dynamic == true && p.term.is_topic == false
                //                                && (p.pri == 1 || p.pri == 2) //p.S > 1
                //                                )
                //                        //.OrderByDescending(p => p.S)
                //                        .Select(p => new {
                //                            url_id = p.url_id,
                //                            term_name = p.term.name,
                //                            S = p.S,
                //                        });
                ////Debug.WriteLine(url_suggestions_qry.ToString());
                //var url_suggestions = url_suggestions_qry.ToListNoLock();

                //var url_suggestions = url_parent_terms.Where(p => p.suggested_dynamic).ToList();

                var urls = url_parent_terms.DistinctBy(p => p.url_id).ToList();
                return urls.Select(p => new UserUrlInfo() {
                    url_id = p.url_id,
                    href = p.href,
                    img = p.img_url, 
                    title = p.meta_title,

                    //suggestions = new List<SuggestionInfo>(url_suggestions.Where(p2 => p2.url_id == p.url_id).Select(p2 => new SuggestionInfo() {
                    //    term_name = p2.term_name,
                    //    S = p2.S ?? 0,
                    //    is_topic = false //p2.term.is_topic ?? false
                    //}).ToList()),

                    hit_utc = p.hit_utc, 
                    im_score = p.im_score ?? 0, 
                    time_on_tab = p.time_on_tab ?? 0
                }).ToList();
            }
        }

        private static List<UserUrlInfo> GetUserUrlInfos_ForSingleUrl(long? url_id, ConcurrentDictionary<long, List<term>> urls_terms)
        {
            using (var db = mm02Entities.Create())
            {
                var user_urls = db.user_url.AsNoTracking().Where(p => p.url_id == url_id && p.time_on_tab > 0).Distinct().ToListNoLock();
                var url_ids = user_urls.Select(p => p.url_id).ToList();

                var url_parent_terms_qry = db.url_parent_term//.AsNoTracking()
                                             //.Include("term").Include("url")
                                             .OrderBy(p => p.url_id).ThenByDescending(p => p.pri)
                                             .Where(p => p.S_norm > MIN_S_NORM)
                                             .Where(p => url_ids.Contains(p.url_id))
                                             .Select(p => new {
                                                 url_id = p.url_id,
                                                 href = p.url.url1,
                                                 img_url = p.url.img_url,
                                                 meta_title = p.url.meta_title,
                                                 suggested_dynamic = p.suggested_dynamic,
                                                 S = p.S,

                                                 term = p.term //**
                                             });
                //Debug.WriteLine(url_parent_terms_qry.ToString());

                var url_parent_terms = url_parent_terms_qry.ToListNoLock();

                url_parent_terms.ForEach(p => MaintainUrlTermsLookup(p.url_id, p.term, urls_terms));

                //var url_suggestions = url_parent_terms.Where(p => p.suggested_dynamic /*&& !p.term.IS_TOPIC*/).Where(p => p.S > 1).OrderByDescending(p => p.S).ToList();

                var urls = url_parent_terms.DistinctBy(p => p.url_id).ToList(); 
                return urls.Select(p => new UserUrlInfo()
                {
                    url_id = p.url_id,
                    href = p.href, //{ get { return url.url1; } }
                    img = p.img_url, //{ get { return url.img_url; } }
                    title = p.meta_title, //{ get { return url.meta_title; } }

                    //suggestions = new List<SuggestionInfo>(url_suggestions.Where(p2 => p2.url_id == p.url_id).Select(p2 => new SuggestionInfo() { term_name = p2.term_name, S = p2.S ?? 0, is_topic = p2.is_topic }).ToList()),

                    hit_utc = user_urls.FirstOrDefault(p2 => p2.url_id == p.url_id).nav_utc,
                    im_score = user_urls.FirstOrDefault(p2 => p2.url_id == p.url_id).im_score ?? 0,
                    time_on_tab = user_urls.FirstOrDefault(p2 => p2.url_id == p.url_id).time_on_tab ?? 0,
                }).ToList();
            }
        }
     
        private static List<UserUrlInfo> GetUserUrlInfos_ForUserUrls(long user_id, ConcurrentDictionary<long, List<term>> urls_terms)
        {
            using (var db = mm02Entities.Create())
            {
                var url_parent_terms_qry = db.url_parent_term
                                             .OrderBy(p => p.url_id).ThenByDescending(p => p.pri)
                                             .Where(p => (p.S_norm > MIN_S_NORM))
                                             
                                             .Where(p => p.url.user_url.Any(p2 => p2.user_id == user_id))
                                             
                                             .Select(p => new {
                                                 url_id = p.url_id,
                                                 href = p.url.url1,
                                                 img_url = p.url.img_url,
                                                 meta_title = p.url.meta_title,

                                                 hit_utc = p.url.user_url.FirstOrDefault(p2 => p2.user_id == user_id).nav_utc,
                                                 im_score = p.url.user_url.FirstOrDefault(p2 => p2.user_id == user_id).im_score,
                                                 time_on_tab = p.url.user_url.FirstOrDefault(p2 => p2.user_id == user_id).time_on_tab,

                                                 term = p.term //**
                                             });
                //Debug.WriteLine(url_parent_terms_qry.ToString());
                var url_parent_terms = url_parent_terms_qry.ToListNoLock();

                //var url_suggestions_qry = db.url_parent_term
                //                          //.Where(p => url_ids.Contains(p.url_id))
                //                            .Where(p => p.url.user_url.Any(p2 => p2.user_id == user_id))

                //                            .Where(p => p.suggested_dynamic == true)
                //                            .Select(p => new {
                //                                url_id = p.url_id,
                //                                term_name = p.term.name,
                //                                S = p.S,
                //                                is_topic = p.term.is_topic ?? false,
                //});
                //Debug.WriteLine(url_suggestions_qry.ToString());
                //var url_suggestions = url_suggestions_qry.ToListNoLock(); 

                url_parent_terms.ForEach(p => MaintainUrlTermsLookup(p.url_id, p.term, urls_terms));

                var urls = url_parent_terms.DistinctBy(p => p.url_id).ToList(); 
                var ret = urls.Select(p => new UserUrlInfo()
                {
                    url_id = p.url_id,
                    href = p.href, 
                    img = p.img_url,
                    title = p.meta_title, 

                    //suggestions = new List<SuggestionInfo>(url_suggestions.Where(p2 => p2.url_id == p.url_id).Select(p2 => new SuggestionInfo() { term_name = p2.term_name, S = p2.S ?? 0, is_topic = p2.is_topic }).ToList()),

                    hit_utc = p.hit_utc, 
                    im_score = p.im_score ?? 0, 
                    time_on_tab = p.time_on_tab ?? 0, 
                }).ToList();

                return ret;
            }
        }

        private static void MaintainUrlTermsLookup(long url_id, term term, ConcurrentDictionary<long, List<term>> urls_terms)
        {
            //if (url_id == 13513)
            //    Debugger.Break(); //***

            if (urls_terms.ContainsKey(url_id)) {
                if (!urls_terms[url_id].Any(p => p.id == term.id))
                    urls_terms[url_id].Add(term);
            }
            else
                urls_terms.TryAdd(url_id, new List<term>() { term });
        }

        private static List<TopicInfo> GetTopicInfos_ForUserUrls(List<long> url_ids, List<UserUrlInfo> url_infos, ConcurrentDictionary<long, List<term>> urls_terms)
        {
            using (var db = mm02Entities.Create())
            {
                var wiki_term_TLD = db.terms.Find((int)g.WIKI_TERM.TopLevelDomain);

                var all_url_terms = urls_terms.SelectMany(p => p.Value);

                // get topic link chains - regular topics & url title topics
                var topic_chains = new Dictionary<long, List<TopicInfo>>(); // term_id, chain
                foreach (var topic_term in all_url_terms.DistinctBy(p => p.id)) {
                    var topic_chain = topic_term.term_type_id == (int)g.TT.TLD_TITLE
                                            ? new List<topic_link>() { new topic_link() { term1 = wiki_term_TLD } }
                                            : GoldenTopics.GetTopicLinkChain(topic_term.id); 

                    var chain = topic_chain.Select(p => new TopicInfo() { term_name = p.parent_term.name, term_id = p.parent_term_id }).ToList();
                    chain.Reverse();

                    chain.Add(new TopicInfo() { term_name = topic_term.name, term_id = topic_term.id });
                    topic_chains.Add(topic_term.id, chain);
                }

                //foreach (var topic_chain in topic_chains.Values)
                //    Debug.WriteLine($"\t\t({string.Join(" > ", topic_chain.Select(topic => topic.term_name + $" ({topic.url_ids.Count} urls)"))})");
              
                // urls --> topic chains
                foreach (var url_info in url_infos) {
                    //if (url_info.url_id == 13513)
                    //    Debugger.Break();

                    var topics_for_url = urls_terms[url_info.url_id];
                    foreach (var topic in topics_for_url) {
                        if (topic_chains.ContainsKey(topic.id))
                        {
                            var topic_chain = topic_chains[topic.id];
                            url_info.topic_chains.Add(topic_chain);
                        }
                    }
                }

                // dedupe chains -- remove chain if the first topic in the chain is contained in any other chains
                var topic_ids_to_remove = new List<long>();
                foreach (var chain_id in topic_chains.Keys) {
                    var other_chains = topic_chains.Where(p => p.Key != chain_id).Select(p => p.Value);
                    if (other_chains.Any(p => p.Any(p2 => p2.term_id == chain_id)))
                        topic_ids_to_remove.Add(chain_id);
                }
                topic_ids_to_remove.ForEach(p => topic_chains.Remove(p));

                // walk topic chains; add urls that match each topic in chain
                foreach (var topic_chain in topic_chains.Values) {
                    foreach (var topic in topic_chain) {
                        var urls_ids_matching = url_infos.Where(p => p.topic_chains.Any(p2 => p2.Any(p3 => p3.term_id == topic.term_id))).Select(p => p.url_id).ToList();
                        topic.url_ids.AddRange(urls_ids_matching);
                    }
                }

                // dbg: order & print 
                var chains = topic_chains.Values.OrderBy(p => string.Join("/", p.Select(p2 => p2.term_name))).ToList();
                chains.RemoveAll(p => p.Count == 0);
                foreach (var topic_chain in chains)
                    Debug.WriteLine($"\t\t({string.Join(" > ", topic_chain.Select(topic => topic.term_name + $" ({topic.url_ids.Count} urls)"))})");

                // ***
                // convert flat chains of TopicInfo to tree of TopicInfo

                // (1) link > each TopcInfo to its single child, for each chain, e.g.
                //      (Television (4 urls) > Film (4 urls) > Animation (1 urls))
                //      (Science(2 urls) > Anthropology(1 urls))
                //  ...
                foreach (var chain in chains)
                    for (int i = 0; i < chain.Count - 1; i++)
                        chain[i].child_topics.Add(chain[i + 1]);

                // (2) combine TopicInfo children for identical topics
                for (int i = 0; i < chains.Count; i++) {
                    var chain = chains[i];

                    if (chain.Count > 0) {
                        for (int j = chain.Count - 1; j >= 0; j--) {
                            var topic = chain[j];

                            var identical_topics = chains.SelectMany(p => p.Where(p2 => p2.term_id == topic.term_id)).Where(p => p != topic).Except(chain).ToList();
                            foreach (var same_topic in identical_topics) {
                                // add children to new master TopicInfo
                                topic.child_topics.AddRange(same_topic.child_topics.Where(p => !topic.child_topics.Select(p2 => p2.term_id).Contains(p.term_id)));

                                // remove from other chain
                                var other_chain = chains.Single(p => p.Contains(same_topic));
                                var ndx = other_chain.IndexOf(same_topic);
                                other_chain.RemoveRange(ndx, other_chain.Count - ndx);
                            }
                        }
                    }
                }
                chains.RemoveAll(p => p.Count == 0);
                chains.ForEach(p => { if (p.Count > 1) p.RemoveRange(1, p.Count - 1); });
                var tree_roots = chains.Select(p => p.First()).ToList();

                tree_roots.ForEach(p => p.GetSuggestedTermsForTopicAndChildren());
                return tree_roots;

                // clean topic_chain 
                //foreach (var url_info in url_infos)
                //{-
                //    url_info.topic_chains.Clear();
                //}

                //var a = topic_chains.Values.OrderBy(p => string.Join("/", p.Select(p2 => p2.term_name)));
                //var b = a.Select(p => p.First());
                //return b.DistinctBy(p => p.term_id).ToList();
            }
        }

        private static List<Homepage.OwnInfo.ShareIssuedInfo> FindAcceptSharedFromUser(user me)
        {
            using (var db = mm02Entities.Create()) {
                var shares = db.share_active.AsNoTracking()
                               .Include("share").Include("user").Include("share.term")
                               .Where(p => p.share.source_user_id == me.id)
                               .ToListNoLock();
                return shares.Select(p => new Homepage.OwnInfo.ShareIssuedInfo() {
                    user_id = p.user_id,
                    email = p.user.email,
                    avatar = p.user.avatar,
                    fullname = p.user.firstname + " " + p.user.lastname,
                    share_code = p.share.share_code,
                    url_id = p.share.url_id,
                    share_all = p.share.share_all,
                    topic_id = p.share.topic_id,
                    topic_name = p.share.term?.name,
                    source_user_deactivated = p.source_user_deactivated,
                    target_user_deactivated = p.user_deactivated,
                }).ToList();
            }
        }
    }
}
