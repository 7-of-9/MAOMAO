
-- yes, can walk DOWN now we know the best root...

select * from wiki_page where page_title = 'Main_topic_classifications' and page_namespace in (14,0) -- pageid = 7345184
select *,
 (select page_title from wiki_page where page_id=cl_from) 'cn',
 (select page_namespace from wiki_page where page_id=cl_from)
 from wiki_catlink where cl_to = 'Main_topic_classifications'
 order by 'cn'
 
 select * from wiki_page where page_id in ((select cl_from from wiki_catlink where cl_to = 'art_genres'))

 -- count done...
 select count(*) from term where term_type_id=10 -- target: 4.4m
 select distinct count(cl_to) from wiki_catlink where cl_type = 'subcat' -- 4,435,624

 -- parent node
select * from term where name = 'arts' -- 456925
select *, (select name from term where id=child_term_id) from golden_term where parent_term_id = 456925 --***

-- child node
select * from golden_term where child_term_id = 456925
