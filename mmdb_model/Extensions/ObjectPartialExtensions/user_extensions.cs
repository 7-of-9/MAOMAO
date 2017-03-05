using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace mmdb_model
{ 
    public partial class user
    {
        [NotMapped]
        public string DisplayInfo { set { } private get { return $"{this.email} #={this.user_url.Count()}"; } }
    }
}
