using mmdb_model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace mm_svc.Discovery
{
    public class DiscoveryInfo {
        public string url;
        public string title;
        public string desc;
        public DateTime utc;
        public string img;

        [NonSerialized]
        public term main_term;
        public string main_term_name;
        public long main_term_id;
        public string main_term_img;

        [NonSerialized]
        public term sug_term;
        public string sug_term_name;
        public long? sug_term_id;
        public string sug_term_img;

        public int search_num;
        public bool suggested_topic;
        public int result_num;
        public int term_num;
        public string city;
        public string country;
    }
}
