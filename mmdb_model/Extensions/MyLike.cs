using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace mmdb_model
{
    // http://shahzy1.blogspot.sg/2014/12/entity-framework-escaping-issue-with.html
    public static class MyLike
    {
        // proxy:  EF will use the def. in the EDMX
        [System.Data.Entity.DbFunctionAttribute("mm02Model", "MyLike")]
        public static bool My_Like(this string searchingIn, string lookingFor) 
        {
            throw new Exception("Not implemented");
        }
    }
}
