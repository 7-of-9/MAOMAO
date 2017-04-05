using System.Diagnostics;

namespace mm_svc
{
    [DebuggerDisplay("{term_name} is_topic={is_topic} S={S}s")]
    public class SuggestionInfo 
    {
        public string term_name;
        public double S;
        public bool is_topic;
    }
}