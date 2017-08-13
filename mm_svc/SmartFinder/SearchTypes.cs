using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace mm_svc.SmartFinder
{
    public class SearchTypes
    {
        public enum SearchTypeNum
        {
            GOOG_MAIN = 1,           // too general - not relevent enough?
            GOOG_LOCAL = 2,          // country + city
            GOOG_DISCUSSION = 3,
            GOOG_YOUTUBE = 4,
            GOOG_NEWS = 5,
            GOOG_COOL = 6,
            GOOG_TRENDING = 7,
            GOOG_LOCAL_EVENTS = 8,
            GOOG_QUORA = 9,
            GOOG_BUZZFEED = 10,
            GOOG_MASHABLE = 11,
            GOOG_MEDIUM = 12,
            GOOG_YCOMBINATOR = 13,
            GOOG_VIMEO = 14,
            GOOG_DAILYMOTION = 15,
            GOOG_LAST_24_HOURS = 16,
        }
    }
}
