
select count(*) from term -- migration script: just copy 14||0 terms, should be no conflicts -- DONE: 7454046 total
  --select count(*) from term where term_type_id = 0
  --select count(*) from term where term_type_id = 14
  --delete from term where term_type_id = 14

select count(*) from golden_term -- empty: easy -- biggest table: ~28m -- DONE: 27932051
  -- truncate table golden_term

select count(*) from gt_path_to_root -- empty: easy -- RUNNING ...

select count(*) from gt_parent -- empty: easy


-----

SET NOCOUNT ON
GO

DECLARE updatestats CURSOR FOR
SELECT table_schema, table_name  
FROM information_schema.tables
   where TABLE_TYPE = 'BASE TABLE'
OPEN updatestats

DECLARE @tableSchema NVARCHAR(128)
DECLARE @tableName NVARCHAR(128)
DECLARE @Statement NVARCHAR(300)

FETCH NEXT FROM updatestats INTO @tableSchema, @tableName

WHILE (@@FETCH_STATUS = 0)
BEGIN
   PRINT N'UPDATING STATISTICS ' + '[' + @tableSchema + ']' + '.' + '[' + @tableName + ']'
   SET @Statement = 'UPDATE STATISTICS '  + '[' + @tableSchema + ']' + '.' + '[' + @tableName + ']' + '  WITH FULLSCAN'
   --PRINT @Statement
   EXEC sp_executesql @Statement
   FETCH NEXT FROM updatestats INTO @tableSchema, @tableName
END

CLOSE updatestats
DEALLOCATE updatestats
GO
SET NOCOUNT OFF
GO

