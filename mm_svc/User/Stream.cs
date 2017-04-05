using System.Collections.Generic;
using System.Linq;
using mmdb_model;
using mm_global;
using mm_global.Extensions;
using mm_svc.Terms;
using System.Diagnostics;
using System;

namespace mm_svc
{
    public static class UserStream
    {
        public static UserStreamReturn GetAllTopics( long user_id)
        {
            using (var db = mm02Entities.Create())
            {
                // current user histories base on user_id
                var user_urls = db.user_url.AsNoTracking().Where(p => p.user_id == user_id).Distinct().ToListNoLock();
                var urls_list = user_urls.Select(p => new ClassifyUrlInput()
                {
                    url_id = p.url_id,
                    hit_utc = p.nav_utc,
                    user_id = p.user_id,
                    im_score = p.im_score ?? 0,
                    time_on_tab = p.time_on_tab ?? 0
                }).ToList();
                // find all accepted share base on user_id
                var share_urls = db.share_active.AsNoTracking().Where(p => p.user_id == user_id).Distinct().ToListNoLock();
                // 3 types of sharing: url, topic or all
                var shares_list = share_urls.Select(p => new ShareActiveInput()
                {
                    share_id = p.share_id,
                    user_id = p.user_id
                }).ToList();
                return ClassifyUrlSetForUser(urls_list, shares_list);
            }
        }

        private static UserStreamReturn ClassifyUrlSetForUser(List<ClassifyUrlInput> urls_list, List<ShareActiveInput> shares_list)
        {
            // get all topics, urls for user 
            // json output
            // { me: { owner: 'me', urls: []} , { shares: [ { owner: 'demo',{ urls: []} }]}
            // borrow code from ClassifyUrlSet()
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
                var url_suggestions = url_parent_terms.Where(p => p.suggested_dynamic /*&& !p.term.IS_TOPIC*/).Where(p => p.S > 1).OrderByDescending(p => p.S).ToList();
                var urls = url_parent_terms.Select(p => p.url).DistinctBy(p => p.id).ToList();
                var url_infos = urls.Select(p => new UserStreamUrlInfo()
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

                var ret = new UserStreamReturn()
                {
                    shares = new List<UserStreamInfo>(),
                    me = new UserStreamInfo()
                    {
                        urls = url_infos.OrderByDescending(p => p.im_score).ToList()
                    }
                };

                return ret;
            }
        }

        public class UserStreamReturn
        {
            public UserStreamInfo me;
            public List<UserStreamInfo> shares;

        }


        public class UserStreamInfo
        {
            public string owner;
            public long owner_id;
            public List<UserStreamUrlInfo> urls;
            
        }

        public class ShareActiveInput
        {
       
            public long share_id { get; set; }
            public long user_id { get; set; }
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
        }
    }
}
