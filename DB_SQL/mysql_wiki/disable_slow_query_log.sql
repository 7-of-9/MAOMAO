use wiki;

select * from page order by page_id asc;-- order by page_title;
select * from page where page_id = 42; -- index not working on page_title?


select count(*) from categorylinks; -- 92,296,090
select * from categorylinks; 


-- SET GLOBAL slow_query_log = 0;
-- flush logs;