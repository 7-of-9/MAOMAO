using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace mm_global
{
    public static class StringExtensions
    {
        public static string TruncateMax(this string source, int length) {
            if (source == null)
                return null;
            if (source.Length > length)
                return source.Substring(0, length);
            return source;
        }

        public static string TruncateEllipsis(this string source, int length) {
            if (source == null)
                return null;
            if (source.Length > length)
                return source.Substring(0, length - 3) + "...";
            return source;
        }

        // CalcTSS -- used to cap boosts in proportion to str lengths
        public static double LengthNorm(this string s, int max_len) {
            var l = Math.Min(s.Length, max_len);
            return l / (double)max_len;
        }

        public static string ltrim(this string s) { return s.ToLower().Trim(); }
    }
}
