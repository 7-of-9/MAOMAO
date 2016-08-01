using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Security.Cryptography;
using System.Web;
using System.Net;

namespace awis.service
{
    public class AmazonAWIS
    {
        public string AWSAccessKeyId { get; set; }
        public string AWSSecret { get; set; }

        protected string GenerateSignature(string param)
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
        public static string UpperCaseUrlEncode(string s)
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

        string GetQueryParams(string action, Dictionary<string, string> extra)
        {
            var time = DateTime.UtcNow;

            // set the correct format for the date string
            var timestamp = time.ToString("yyyy-MM-ddTHH:mm:ss.fffZ", System.Globalization.CultureInfo.InvariantCulture);

            // create a sortable dict
            var vals = new Dictionary<string, string>();

            vals.Add("AWSAccessKeyId", AWSAccessKeyId);
            vals.Add("Action", action);
            vals.Add("ResponseGroup", "Rank,ContactInfo,LinksInCount");
            vals.Add("Timestamp", timestamp);
            vals.Add("Count", "10");
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

        public void UrlInfo(string domain)
        {
            string request = "UrlInfo";

            // add the extra values
            var extra = new Dictionary<string, string>();
            extra.Add("Url", domain);

            // run the request with amazon
            try
            {
                var res = RunRequest(request, extra);

                // process the results...
                Console.WriteLine(res);
            }
            catch (Exception ex)
            {
            }
        }

        private string RunRequest(string request, Dictionary<string, string> extra)
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
