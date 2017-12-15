using mmdb_model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace mm_svc.Discovery
{
    public class DiscoveryInfo {
        public long disc_url_id;
        public string url;
        public string title;
        public string desc;
        public DateTime utc;
        public string img;

        [NonSerialized]
        public term main_term;

        public string main_term_name; 
        public long main_term_id;
        //public string main_term_img; 
        public List<long> main_term_related_topics_term_ids;
        public List<long> main_term_related_suggestions_term_ids;

        [NonSerialized]
        public term sub_term;

        public string sub_term_name; 
        public long? sub_term_id;
        //public string sub_term_img; 
        public List<long> sub_term_related_topics_term_ids;
        public List<long> sub_term_related_suggestions_term_ids;

        public int search_num;
        public bool suggested_topic;
        public int result_num;
        public int term_num;
        public string city;
        public string country;

        public string site_tld;
        public string site_img;

        public List<CwcInfo> cwc;
        public List<OslInfo> osl;
    }

    public class CwcInfo {
        public DateTime date;
        public string desc;
        public string url;
    }

    public class OslInfo {
        public string desc;
        public string url;
    }
}
