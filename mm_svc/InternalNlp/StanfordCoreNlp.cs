using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using System.IO;
using System.Diagnostics;

/*using edu.stanford.nlp.pipeline;
using edu.stanford.nlp.sentiment;
using edu.stanford.nlp.ling;
using edu.stanford.nlp.util;
using java.util;
using java.io;
*/

namespace mm_svc.InternalNlp
{
    /*
    // http://stanfordnlp.github.io/CoreNLP/
    // https://sergey-tihon.github.io/Stanford.NLP.NET/StanfordCoreNLP.html

    public static class StanfordCoreNlp
    {
        private static StanfordCoreNLP pipeline_pos;
      //private static StanfordCoreNLP pipeline_pos_exstopwords;

        static StanfordCoreNlp()
        {
            var jarRoot = @".\stanford-corenlp-3.6.0-models"; // @"Y:\src\fs\stanford-corenlp-full-2015-12-09\stanford-corenlp-3.6.0-models"; // @"..\..\..\..\paket-files\nlp.stanford.edu\stanford-corenlp-full-2015-12-09\models";
            var curDir = Environment.CurrentDirectory;
            Directory.SetCurrentDirectory(jarRoot);

            // very expensive initialization!
            var props = new Properties();
            props.setProperty("annotators", "tokenize, ssplit, pos, lemma"); //, ner, parse, dcoref");
            props.setProperty("ner.useSUTime", "0");
            pipeline_pos = new StanfordCoreNLP(props);

            //props = new Properties();
            //props.setProperty("annotators", "tokenize, ssplit, pos, stopword");
            //props.setProperty("customAnnotatorClass.stopword", "intoxicant.analytics.coreNlp.StopwordAnnotator");
            //props.setProperty("ner.useSUTime", "0");
            //pipeline_pos_exstopwords = new StanfordCoreNLP(props);

            Directory.SetCurrentDirectory(curDir);
        }

        // only used for POS tagging -- find a lighter replacement, deployments (and perf) is ridiculous
        public static List<InternalNlp.Word> tokenize_pos(string text)
        {
            var annotation = new Annotation(text);
            pipeline_pos.annotate(annotation);
            var words = new List<InternalNlp.Word>();

           //var x = annotation.get(new CoreAnnotations.TokensAnnotation().ge0tClass());
           //foreach (var y in x as ArrayList)
           //    Trace.WriteLine(y.ToString());

            var sentences = annotation.get(new CoreAnnotations.SentencesAnnotation().getClass());
            foreach (CoreMap sentence in sentences as ArrayList) {
                foreach(CoreLabel token in sentence.get(new CoreAnnotations.TokensAnnotation().getClass()) as ArrayList) {
                    var word = token.get(new CoreAnnotations.TextAnnotation().getClass()).ToString();
                    var pos = token.get(new CoreAnnotations.PartOfSpeechAnnotation().getClass()).ToString();
                    words.Add(new InternalNlp.Word() { text = word, pos = pos });
                    Trace.WriteLine(word + " / " + pos);
                }
            }
            return words;
        }

        // https://sergeytihon.wordpress.com/2013/10/26/stanford-corenlp-is-available-on-nuget-for-fc-devs/
        //public static void test1()
        //{
        //    // Path to the folder with models extracted from `stanford-corenlp-3.6.0-models.jar`
        //    var jarRoot = @".\stanford-corenlp-3.6.0-models"; // @"Y:\src\fs\stanford-corenlp-full-2015-12-09\stanford-corenlp-3.6.0-models"; // @"..\..\..\..\paket-files\nlp.stanford.edu\stanford-corenlp-full-2015-12-09\models";

        //    // Text for processing
        //    var text = "I didn't send that email. Why can't you tokenize, you silly thing?";

        //    // Annotation pipeline configuration
        //    var props = new Properties();
        //    props.setProperty("annotators", "tokenize, ssplit, pos, lemma, ner, parse, dcoref");
        //    props.setProperty("ner.useSUTime", "0");

        //    // We should change current directory, so StanfordCoreNLP could find all the model files automatically
        //    var curDir = Environment.CurrentDirectory;
        //    Directory.SetCurrentDirectory(jarRoot);
        //    var pipeline = new StanfordCoreNLP(props);
        //    Directory.SetCurrentDirectory(curDir);

        //    // Annotation
        //    var annotation = new Annotation(text);
        //    pipeline.annotate(annotation);

        //    // Result - Pretty Print
        //    using (var stream = new ByteArrayOutputStream())
        //    {
        //        pipeline.prettyPrint(annotation, new PrintWriter(stream));
        //        System.Diagnostics.Debug.WriteLine(stream.toString());
        //        stream.close();
        //    }
        //}
        
    };*/
}
