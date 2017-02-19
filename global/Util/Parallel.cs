using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace mm_global
{
    public static class ParallelForce
    {
        public static void ForEach<T>(IEnumerable<T> source, Action<T> action)
        {
            var tasks = new List<Task>();
            foreach (T item in source) {
                tasks.Add(Task.Factory.StartNew(() => action(item)));
            }
            Task.WaitAll(tasks.ToArray());
        }
    }
}
