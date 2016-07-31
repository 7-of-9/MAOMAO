using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Security.Cryptography;
using System.Web;
using System.Net;
using System.Diagnostics;
using mm_global;
using System.Xml.Linq;
using System.Dynamic;

/* Pricing
Pay only for what you use. There is no minimum fee, and no start-up cost.
Up to 1,000 requests/ month - Free
1,001 to 1,000,000 requests/ month -  $0.00045 per request
Over 1,000,000 requests/ month - $0.00030 per request */

namespace mm_aws
{
    public static class AWIS
    {
        private static string AWSAccessKeyId = "AKIAI5FVHEVEIKYXUVHA"; //{ get; set; }
        private static string AWSSecret = "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"; //{ get; set; }

        public static dynamic GetTldInfo(string tld)
        {
            string request = "UrlInfo";

            // add the extra values
            var extra = new Dictionary<string, string>();
            extra.Add("Url", tld);

            // run the request with amazon
            var res = RunRequest(request, extra);

            Debug.WriteLine(res);

            XDocument doc = XDocument.Parse(res);
            dynamic info = new ExpandoObject();
            Util.XmlToDynamic(info, doc.Elements().First());

            return info;
        }

        private static string GenerateSignature(string param)
        {
            var sign = "GET\n" + "awis.amazonaws.com" + "\n/\n" + param;

            // create the hash object
            var shaiSignature = new HMACSHA256(Encoding.UTF8.GetBytes(AWSSecret));

            // calculate the hash
            var binSig = shaiSignature.ComputeHash(Encoding.UTF8.GetBytes(sign));

            // convert to hex
            var signature = Convert.ToBase64String(binSig);

            return signature;
        }

        // this is one of the key problems with the Amazon code and C#.. C# by default returns excaped values in lower case
        // for example %3a but Amazon expects them in upper case i.e. %3A, this function changes them to upper case..
        //
        private static string UpperCaseUrlEncode(string s)
        {
            char[] temp = HttpUtility.UrlEncode(s).ToCharArray();
            for (int i = 0; i < temp.Length - 2; i++)
            {
                if (temp[i] == '%')
                {
                    temp[i + 1] = char.ToUpper(temp[i + 1]);
                    temp[i + 2] = char.ToUpper(temp[i + 2]);
                }
            }
            return new string(temp);
        }

        private static string GetQueryParams(string action, Dictionary<string, string> extra)
        {
            var time = DateTime.UtcNow;

            // set the correct format for the date string
            var timestamp = time.ToString("yyyy-MM-ddTHH:mm:ss.fffZ", System.Globalization.CultureInfo.InvariantCulture);

            // create a sortable dict
            var vals = new Dictionary<string, string>();

            vals.Add("AWSAccessKeyId", AWSAccessKeyId);
            vals.Add("Action", action);

          //vals.Add("ResponseGroup", "Rank,ContactInfo,LinksInCount");
            vals.Add("ResponseGroup", "RelatedLinks,Categories,AdultContent,Language,LinksInCount,SiteData,OwnedDomains,UsageStats");
          //vals.Add("ResponseGroup", "Categories,AdultContent,SiteData");

            vals.Add("Timestamp", timestamp);
            vals.Add("Count", "100");
            vals.Add("Start", "1");
            vals.Add("SignatureVersion", "2");
            vals.Add("SignatureMethod", "HmacSHA256");

            // add any extra values
            foreach (var v in extra)
            {
                if (vals.ContainsKey(v.Key) == false)
                    vals.Add(v.Key, v.Value);
            }

            // sort the values by ordinal.. important!
            var sorted = vals.OrderBy(p => p.Key, StringComparer.Ordinal).ToArray();

            var url = new StringBuilder();

            foreach (var v in sorted)
            {
                if (url.Length > 0)
                    url.Append("&");

                url.Append(v.Key + "=" + UpperCaseUrlEncode(v.Value));
            }

            return url.ToString();
        }

        private static string RunRequest(string request, Dictionary<string, string> extra)
        {
            // generate the query params
            var queryParams = GetQueryParams(request, extra);

            // calculate the signature
            var sig = GenerateSignature(queryParams);

            // generate the url
            var url = new StringBuilder();
            url.Append("http://awis.amazonaws.com?");
            url.Append(queryParams);
            url.Append("&Signature=" + UpperCaseUrlEncode(sig));

            // get the request
            var c = new WebClient();
            var res = c.DownloadString(url.ToString());
            return res;
        }
    }
}
