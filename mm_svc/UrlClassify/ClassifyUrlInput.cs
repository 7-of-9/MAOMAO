using System;

namespace mm_svc
{
    public class ClassifyUrlInput
    {
        public long user_id, url_id;
        public DateTime hit_utc;
        public double im_score, time_on_tab;
    }
}