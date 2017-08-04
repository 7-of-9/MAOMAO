using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static mm_svc.Discovery.SmartFinder;

namespace mm_svc.Discovery
{
    public class ImportUrlInfo
    {
        public string url;
        public SearchTypeNum search_num;
        public long user_reg_topic_id;
        public long parent_term_id;
        public bool suggestion;

        public string source;
        public string title;
        public string desc;

        public string image_url;
        public string meta_title;
        public string meta_all;

        public List<OnsiteLinkInfo> osl = new List<OnsiteLinkInfo>();
        public List<CalendarWebContentInfo> cwc = new List<CalendarWebContentInfo>();
    }

    public class OnsiteLinkInfo
    {
        public ImportUrlInfo url_info;
        public string href;
        public string desc;
    }

    public class CalendarWebContentInfo
    {
        public ImportUrlInfo url_info;
        public string href;
        public DateTime date;
        public string desc;
    }
}
