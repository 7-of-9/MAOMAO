using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace mm_global
{
    public static partial class g
    {
        public enum TT
        {
            COMBINED = -99,
            CALAIS_TOPIC = 1,
            CALAIS_ENTITY = 2,
            CALAIS_SOCIALTAG = 3,
            WIKI_NS_0 = 0,
            WIKI_NS_14 = 14,
            TLD = 100,
            TLD_TITLE = 101,
        }

        public enum ET
        {
            Movie = 125,
            MusicAlbum = 132,
            MusicGroup = 131,
            Country = 112,
            Continent = 117,
            ProvinceOrState = 121,
            NaturalFeature = 113,
            OperatingSystem = 127,
            Person = 109,
            Organization = 115,
            Product = 118,
            ProgrammingLanguage = 139,
            SportsGame = 122,
            SportsLeague = 140,
            Technology = 116,
            TVShow = 134,
        }

        public const long MAOMAO_ROOT_TERM_ID = 20098;

        public const string WIKI_ROOT_TERM_NAME_CLEANED = "Main topic classifications";

        public static List<long> EXCLUDE_TERM_IDs = new List<long>()
        {
            // YouTube & PayPal
            468,
            521,
            527,
            533
        };

        // special wiki terms, needing special handling
        public enum WIKI_TERM
        {
            History = 4990959,
            Geography = 4990976,
            TopLevelDomain = 12683325 
        }
    }
}
