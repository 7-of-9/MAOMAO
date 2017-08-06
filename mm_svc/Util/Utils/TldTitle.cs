using mm_global.Extensions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace mm_svc.Util.Utils
{
    public static class TldTitle
    {

        /// <summary>
        /// TLD_TITLE-type terms come in a variety of forms. We want to transform them into the best/closest "human readable"
        /// representation. Use case is to filter out Calais/Wiki terms for URLs that relate to the TLD.
        /// 
        /// case 1: split components, also remove trailing '/'
        /// e.g. "500ish.com/" -> "500ish"
        /// e.g. "airbnb.co.uk/" -> "airbnb"
        /// e.g. "blog.carbonfive.com/" -> "carbonfive"
        ///
        /// case 2: separated by ' - ' substr; return LHS assumed to be the site name:
        /// e.g. "1stwebdesigner - Graphic and Web Design Blog" -> "1stwebdesigner"
        /// 
        /// case 3: all others, return unchanged
        /// e.g. "99designs" -> "99designs"
        /// e.g. "Bangkok Post" -> "Bangkok Post"
        /// 
        /// </summary>
        /// <returns></returns>
        public static string GetSimpleTldName(string tld_name)
        {
            var s = tld_name.EndsWith("/") ? tld_name.Substring(0, tld_name.Length - 1) : tld_name;
            var ret = new List<string>();

            // e.g. "1stwebdesigner - Graphic and Web Design Blog"
            if (s.Contains(" - ")) {
                ret = new List<string>();
                return s.Substring(0, s.IndexOf(" - ") + 1);
            }

            // e.g. "blog.carbonfive.com"
            else if (s.Contains(".") && !s.Contains(" ")) {
                // strip known TLD suffixes
                var matching_suffixes = TldSuffixes.all.Where(p => s.ltrim().EndsWith("." + p.ltrim())).OrderByDescending(p => p.Length);
                if (matching_suffixes.Count() > 0) {
                    s = s.Substring(0, s.Length - matching_suffixes.First().Length - 1);
                }

                // remove any remaining TLD prefix, e.g. blog.carbonfive
                if (s.Contains(".")) {
                    var parts = s.Split('.');
                    return parts[parts.Length - 1]; 
                }
            }

            // e.g. "Bangkok Post" 
            return s;
        }

        // e.g. "en.wikipedia.org" -> "wikipedia.org"
        // used for google image finding for sites
        public static string GetPartialTldNameWithSuffix(string tld)
        {
            if (tld.Contains(".") && !tld.Contains(" ")) {
                var matching_suffixes = TldSuffixes.all.Where(p => tld.ltrim().EndsWith("." + p.ltrim())).OrderByDescending(p => p.Length);
                if (matching_suffixes.Count() > 0) {
                    var suffix_start_ndx = tld.ltrim().IndexOf(matching_suffixes.First());
                    var tld_without_suffix = tld.Substring(0, tld.Length - matching_suffixes.First().Length - 1);
                    var last_dot_left_of_suffix = tld_without_suffix.LastIndexOf('.');
                    var ret = tld.Substring(last_dot_left_of_suffix + 1, tld.Length - matching_suffixes.First().Length - last_dot_left_of_suffix - 2);
                    return ret;
                }
            }
            return tld;
        }
    }
}
