using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace mm_svc.InternalNlp.Utils
{
    public static class Words
    {
        public static List<string> WordsInCommon(string a, string b)
        {
            if (string.IsNullOrEmpty(a) || string.IsNullOrEmpty(b)) return new List<string>();
            var words_a = a.ToLower().Split(' ');
            var words_b = b.ToLower().Split(' ');
            var words_in_common = new List<string>();
            for (var i = 0; i < words_a.Length; i++) {
                var word_a = words_a[i];
                if (words_b.Contains(word_a))
                    words_in_common.Add(word_a);
            }
            return words_in_common;
        }

        public static string TokenizeExStopwords(string s)
        {
            StringBuilder sb = new StringBuilder();
            var words_naive = s.Split(' ');
            var words = words_naive.Select(p => new InternalNlp.Word() { pos = "?", text = p }); //StanfordCoreNlp.tokenize_pos(s);
            foreach (var word in words) {
                if (!stopwords.Any(p => p.ToLower().Trim() == word.text.ToLower().Trim())) {
                    if (word.pos != "UH" && word.pos != "SYM" && word.pos != "IN" && word.pos != "," && word.pos != "." && word.pos != ":")
                        sb.Append(Regex.Replace(word.text, @"[., -\/#!$%\^&\*;:{}=\-_`~()]/g", "") + " ");
                }
            }
            return sb.ToString();
        }

        public static List<string> stopwords = new List<string>() {
"YouTube",

"	a	",
"	about	",
"	above	",
"	after	",
"	again	",
"	against	",
"	all	",
"	am	",
"	an	",
"	and	",
"	any	",
"	are	",
"	aren't	",
"	as	",
"	at	",
"	be	",
"	because	",
"	been	",
"	before	",
"	being	",
"	below	",
"	between	",
"	both	",
"	but	",
"	by	",
"	can't	",
"	cannot	",
"	could	",
"	couldn't	",
"	did	",
"	didn't	",
"	do	",
"	don't	",
"	does	",
"	doesn't	",
"	doing	",
"	don't	",
"	down	",
"	during	",
"	each	",
"	few	",
"	for	",
"	from	",
"	further	",
"	had	",
"	hadn't	",
"	has	",
"	hasn't	",
"	have	",
"	haven't	",
"	having	",
"	he	",
"	he'd	",
"	he'll	",
"	he's	",
"	her	",
"	here	",
"	here's	",
"	hers	",
"	herself	",
"	him	",
"	himself	",
"	his	",
"	how	",
"	how's	",
"	i	",
"	i'd	",
"	i'll	",
"	i'm	",
"	i've	",
"	if	",
"	in	",
"	into	",
"	is	",
"	isn't	",
"	it	",
"	it's	",
"	its	",
"	itself	",
"	let's	",
"	me	",
"	more	",
"	most	",
"	mustn't	",
"	my	",
"	myself	",
"	no	",
"	nor	",
"	not	",
"	of	",
"	off	",
"	on	",
"	once	",
"	only	",
"	or	",
"	other	",
"	ought	",
"	our	",
"	ours	",
"	ourselves	",
"	out	",
"	over	",
"	own	",
"	same	",
"	shan't	",
"	she	",
"	she'd	",
"	she'll	",
"	she's	",
"	should	",
"	shouldn't	",
"	so	",
"	some	",
"	such	",
"	than	",
"	that	",
"	that's	",
"	the	",
"	their	",
"	theirs	",
"	them	",
"	themselves	",
"	then	",
"	there	",
"	there's	",
"	these	",
"	they	",
"	they'd	",
"	they'll	",
"	they're	",
"	they've	",
"	this	",
"	those	",
"	through	",
"	to	",
"	too	",
"	under	",
"	until	",
"	up	",
"	very	",
"	was	",
"	wasn't	",
"	we	",
"	we'd	",
"	we'll	",
"	we're	",
"	we've	",
"	were	",
"	weren't	",
"	what	",
"	what's	",
"	when	",
"	when's	",
"	where	",
"	where's	",
"	which	",
"	while	",
"	who	",
"	who's	",
"	whom	",
"	why	",
"	why's	",
"	with	",
"	won't	",
"	would	",
"	wouldn't	",
"	you	",
"	you'd	",
"	you'll	",
"	you're	",
"	you've	",
"	your	",
"	yours	",
"	yourself	",
"	yourselves	"
        };

    }
}
