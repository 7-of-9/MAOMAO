use wiki;

select * from page order by page_id asc;-- order by page_title;
select * from page where page_id = 42; -- index not working on page_title?

select count(*) from page -- 40,649,193
select count(*) from categorylinks; -- 109,039,429


-- SET GLOBAL slow_query_log = 0;
-- flush logs;name_title