using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace System.Collection.Generic
{
    [DebuggerDisplay("{DebuggerDisplay}")]
    public partial class List<T>
    {
        private string DebuggerDisplay {  get { return string.Join(",", this); } }
    }
}
