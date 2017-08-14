using mmdb_model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static mm_svc.SmartFinder.Search_Goog;
using static mm_svc.SmartFinder.SearchTypes;
using static mm_svc.SmartFinder.SmartFinder;

namespace mm_svc.SmartFinder
{
    public class ImportUrlInfo
    {
        public string url;
        public SearchTypeNum search_num;
        public long main_term_id;
        public long parent_term_id;
        public bool suggestion;

        public string from;
        public string title;
        public string desc;

        public string image_url;
        public string meta_title;
        public string meta_all;

        public List<OnsiteLinkInfo> osl = new List<OnsiteLinkInfo>();
        public List<CalendarWebContentInfo> cwc = new List<CalendarWebContentInfo>();

        public int result_num;
        public int term_num;

        public string city, country;

        public long awis_site_id;
        public string status;
        public string html;

        public long result_count;
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
