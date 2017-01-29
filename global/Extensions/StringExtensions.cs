using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace mm_global.Extensions
{
    public static class StringEx
    {
        /// <summary>
        /// remove accents from strings, e.g. é to e
        /// </summary>
        /// <param name="text">with accents</param>
        /// <returns>with accounts</returns>
        public static string RemoveAccents(string text)
        {
            // http://stackoverflow.com/questions/249087/how-do-i-remove-diacritics-accents-from-a-string-in-net
            var normalizedString = text.Normalize(NormalizationForm.FormD);
            var stringBuilder = new StringBuilder();

            foreach (var c in normalizedString)
            {
                var unicodeCategory = CharUnicodeInfo.GetUnicodeCategory(c);
                if (unicodeCategory != UnicodeCategory.NonSpacingMark)
                {
                    stringBuilder.Append(c);
                }
            }

            return stringBuilder.ToString().Normalize(NormalizationForm.FormC);
        }

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
