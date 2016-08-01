using System.Collections.Generic;
using System;
using System.Data.Entity.Core.Objects;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Linq.Expressions;
using System.Transactions;

namespace mmdb_model
{
    /// <summary>
    /// IsolationLevel.ReadUncommitted read extensions.
    /// </summary>
    public static class NoLockExtensions
    {
        public static List<T> ToListNoLock<T>(this IQueryable<T> query) // nice
        {
            using (var scope = new TransactionScope(TransactionScopeOption.Required, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted })) 
            {
                var result = query.ToList();
                scope.Complete();
                return result;
            }
        }

        public static T[] ToArrayNoLock<T>(this IQueryable<T> query)
        {
            using (var scope = new TransactionScope(TransactionScopeOption.Required, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
            {
                var result = query.ToArray();
                scope.Complete();
                return result;
            }
        }

        public static T FirstOrDefaultNoLock<T>(this IQueryable<T> query)
        {
            using (var scope = new TransactionScope(TransactionScopeOption.Required, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
            {
                var result = query.FirstOrDefault();
                scope.Complete();
                return result;
            }
        }
    }
}
