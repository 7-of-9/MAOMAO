using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace mm_svc
{
    public class UserUrlInfo
    {
        public long url_id;
        public string href;
        public string img;
        public string title;

        [NonSerialized]
        public List<SuggestionInfo> suggestions;

        [NonSerialized]
        public List<List<TopicInfo>> topic_chains = new List<List<TopicInfo>>();

        public DateTime? hit_utc;
        public double? im_score, time_on_tab;

        public long? from_share_id;
    }
}
