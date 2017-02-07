--DBCC SQLPERF ('sys.dm_os_wait_stats', CLEAR);

SELECT TOP 10 *
FROM sys.dm_os_wait_stats
ORDER BY wait_time_ms DESC

select * from master..sysprocesses sp cross apply fn_get_sql(sql_handle) order by lastwaittype asc

exec sp_whoisactive
exec sp_BlitzFirst @ExpertMode=1, @Seconds=10;
