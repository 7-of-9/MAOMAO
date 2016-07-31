using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Dynamic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;

namespace mm_global
{
    public static partial class Util
    {
        public static void XmlToDynamic(dynamic parent, XElement node)
        {
            if (node.HasElements)
            {
                //var node_name = node.Elements().First().Name.LocalName;
                //if (node_name == "CategoryData")
                //    Debugger.Break();
                //var count = node.Elements(node.Elements().First().Name);
                if (node.Elements(node.Elements().First().Name).Count() > 1)
                {
                    //list
                    var item = new ExpandoObject();
                    var list = new List<dynamic>();
                    foreach (var element in node.Elements())
                    {
                        XmlToDynamic(list, element);
                    }

                    AddProperty(item, node.Elements().First().Name.LocalName, list);
                    AddProperty(parent, node.Name.LocalName, item);
                }
                else
                {
                    var item = new ExpandoObject();

                    foreach (var attribute in node.Attributes())
                    {
                        AddProperty(item, attribute.Name.LocalName/*Name.ToString()*/, attribute.Value.Trim());
                    }

                    //element
                    foreach (var element in node.Elements())
                    {
                        XmlToDynamic(item, element);
                    }

                    AddProperty(parent, node.Name.LocalName, item);
                }
            }
            else
            {
                AddProperty(parent, node.Name.LocalName, node.Value.Trim());
            }
        }

        private static void AddProperty(dynamic parent, string name, object value)
        {
            if (parent is List<dynamic>)
            {
                (parent as List<dynamic>).Add(value);
            }
            else
            {
                (parent as IDictionary<String, object>)[name] = value;
            }
        }
    }
}
