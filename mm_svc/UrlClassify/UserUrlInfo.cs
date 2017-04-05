using mmdb_model;
using System;
using System.Collections.Generic;

namespace mm_svc
{
    public class UserUrlInfo 
     {
        public url url;
        public List<SuggestionInfo> suggestions;
        public List<List<TopicInfo>> topic_chains = new List<List<TopicInfo>>();
        public DateTime hit_utc;
        public double im_score, time_on_tab;
    }
}