using Newtonsoft.Json;
using RestSharp;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace mm_svc.UrlProcess
{
    public static class CalaisProcessor_WIP
    {
        /// <summary>
        /// Processs a block of text in Calais (ON HOLD)
        /// </summary>
        /// <param name="text"></param>
        public static void ProcessCalais(string text)
        {
            //
            // WIP -- this basic block is working; but figure it's probably best for now
            //        to distribute the calls by IP address (i.e. let mm02ce do them); Reuters will just
            //        ban the accounts if too many come from the server's single IP addr.
            //
            var client = new RestClient("https://api.thomsonreuters.com");
            
            var req = new RestRequest("/permid/calais", Method.POST);

            req.AddParameter("text/xml", text, ParameterType.RequestBody);
            req.AddHeader("X-AG-Access-Token", "tDRSzbuifZKYL2QfH2nM37vpDMiQv4sN");
            req.AddHeader("Content-Type", "text/raw");
            req.AddHeader("outputformat", "application/json");
            IRestResponse response = client.Execute(req);
            var dict = JsonConvert.DeserializeObject<Dictionary<string, dynamic>>(response.Content.ToString()) as Dictionary<string, dynamic>;
            foreach (var key in dict.Keys) {
                if (key != "doc") {
                    var value = dict[key];
                    string typeGroup = value._typeGroup.Value;
                    switch (typeGroup) {
                        case "topics":
                            var topic_name = value.name.Value;
                            var topic_score = value.score.Value;
                            break;

                        case "language":
                            var cal_lang = value.language;
                            break;

                        case "entities":
                            var ent_type = value._type.Value;
                            var ent_typeref = value._typeReference.Value;
                            var ent_name = value.name.Value;
                            var ent_relevance = value.relevance.Value;
                            break;

                        case "socialTag":
                            var tag_name = value.name.Value;
                            var tag_importance = value.importance.Value;
                            break;
                    }
                }
            }
            //var content = response.Content; // raw content as string
        }

        /*
       function nlp_calais(page_meta, test_data, url, user_id) {
         var nlp_items = [];
         var nlp = null;
         var millis = new Date().getTime();
         var content_lang = "?";
         $.ajax({
           type: "POST",
           url: "https://api.thomsonreuters.com/permid/calais",
           data: test_data, // remove unicode from str, Calais doesn't like it
           //async: false,
           contentType: "text/raw",
           crossDomain: true,
           headers: {
             "X-AG-Access-Token": millis % 3 == 0 ? "BFRb8pCzYflF9ndHBGryXZXUZXAZBYXd" // dunghd.it@gmail.com
                                : millis % 3 == 1 ? "tDRSzbuifZKYL2QfH2nM37vpDMiQv4sN" // a12pct@gmail.com
                                :                   "mq9C5G9BrsS8PMEjKjR0FTnmiISABWDx" // khapcd@gmail.com
             ,
             "Content-Type": "text/raw",
             "outputformat": "application/json"
           },
           dataType: "JSON",

           success: function (o) {
             console.dir(o);
             _.each(o, function (obj, prop_name) {
               if (obj.hasOwnProperty("_typeGroup")) {
                 var type = obj._typeGroup;
                 var nlp_info = null;
                 switch (type) {
                   case "topics":
                     nlp_info = new Object();
                     nlp_info.type = "TOPIC";
                     nlp_info.score = obj.score;
                     nlp_info.name = obj.name;
                     break;

                   case "language":
                     nlp_info = new Object();
                     nlp_info.type = "LANG";
                     nlp_info.language = obj.language;
                     content_lang = obj.language;
                     break;

                   case "socialTag":
                     if (obj.name != null && obj.name != "Undefined") {
                       nlp_info = new Object();
                       nlp_info.type = "SOCIAL_TAG";
                       nlp_info.importance = obj.importance;
                       nlp_info.name = obj.name;
                     }
                     break;

                   case "entities":
                     if (obj.name != null && obj.name != "Undefined") {
                       nlp_info = new Object();
                       nlp_info.type = "ENTITY";
                       nlp_info.entity_type = obj._type;
                       nlp_info.name = obj.name;
                       nlp_info.relevance = obj.relevance;
                     }
                     // +... persontype, nationality, confidencelevel
                     break;
                 }
                 if (nlp_info == null) {
                   ;
                 } else {
                   nlp_items.push(nlp_info);
                 }
               }
             });

             nlp = {
               user_id: user_id,
               url: url, // NLP refdata
               meta: page_meta, // NLP refdata
               items: nlp_items, // NLP raw Calais
               content_lang: content_lang, // NLP lang string
               topic_general: "?", // derived/post-process data
               topic_specific: "?", // "
               social_tags: "?" // "
             };

             cslib_info(JSON.stringify(nlp, null, 2));
             // put NLP packet to DB
             ajax_put_UrlNlpInfoCalais(nlp, function (data) {

               cslib_info("%c ]] ajax_put_UrlNlpInfoCalais: " + JSON.stringify(data), "color:green; font-weight:bold;");
               chrome.extension.sendMessage({ type: 'chromex.dispatch', payload: { type: 'NLP_TERMS', payload: { url: remove_hash_url(document.location.href), topics: data.topics, suggestions: data.suggestions } } });
               // TEST MODE: hit next button - or reseed if not english
               if (document.getElementById('maomao-extension-youtube-test')) {
                 if (content_lang != "http://d.opencalais.com/lid/DefaultLangId/English") {
                   console.info("content_lang != ENGLISH -- reseeding...");
                   if (cslib_isYouTubeSite())
                     cslib_test_Reseed();
                 } else cslib_test_NextYouTubeVid();
               } else {
                 console.info("Disable youtube test");
               }
             }, function (error) {
               chrome.extension.sendMessage({ type: 'chromex.dispatch', payload: { type: 'NLP_CALAIS_ERROR', payload: { url: remove_hash_url(document.location.href), error: error, } } });
             });

             // post-process nlp data -- // this then becomes the reference output for the server
             calais_process(nlp); // todo: nop -- server should do this ...
           },
           error: function (jqXHR, status) {
             console.error(jqXHR);
             chrome.extension.sendMessage({ type: 'chromex.dispatch', payload: { type: 'API_CALAIS_ERROR', payload: { url: remove_hash_url(document.location.href), jqXHR: jqXHR, status: status } } });
             if (jqXHR.status == 429) {
               // TODO: handle
               //Object {readyState: 4, responseText: "You exceeded the concurrent request limit for your…later or contact support to upgrade your license.", status: 429, statusText: "Too Many Requests"}
               console.info("429 RATE LIMIT EXCEEDED! -- wait & reseeding...");

               // TEST MODE: reseed the random walk -- wait 5
               setTimeout(function () {
                 if (cslib_isYouTubeSite())
                   cslib_test_Reseed();
               }, 1000 * 5);
             } else if (jqXHR.status == 400) { // get this for non-english/unsupported langs
               // TEST MODE: reseed the random walk
               if (cslib_isYouTubeSite()) {
                 console.info("400 BAD REQUEST! -- reseeding...");
                 cslib_test_Reseed();
               }
             }
           }
         });
         return nlp;
       }

           */

    }
}
