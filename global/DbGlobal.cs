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
        }

        public const long MAOMAO_ROOT_TERM_ID = 20098;

        public static List<long> EXCLUDE_TERM_IDs = new List<long>()
        {
            // YouTube & PayPal
            468,
            521,
            527,
            533
        };
    }
}
