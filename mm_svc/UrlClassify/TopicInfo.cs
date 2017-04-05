using mm_global.Extensions;
using mm_svc.Terms;
using mmdb_model;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;

namespace mm_svc
{

    [DebuggerDisplay("{term_name} ({child_topics.Count})")]
    public class TopicInfo {
        public string term_name;
        public long term_id;
        public bool url_title_topic;
        public List<long> url_ids = new List<long>();
        public List<TopicInfo> child_topics = new List<TopicInfo>();

        public List<SuggestionInfo> suggestions = new List<SuggestionInfo>();
        public void GetSuggestedTermsForTopicAndChildren() {
            using (var db = mm02Entities.Create()) {
                var parent_terms = GoldenParents.GetStoredParents(this.term_id).Where(p => p.parent_term_id != this.term_id);
                var distinct = parent_terms.DistinctBy(p => p.parent_term.name);
                this.suggestions.AddRange(distinct.Select(p => new SuggestionInfo() {
                    term_name = p.parent_term.name, S = p.S, is_topic = p.is_topic }));
                Parallel.ForEach(this.child_topics, p => p.GetSuggestedTermsForTopicAndChildren());
            }
        }
    }
}