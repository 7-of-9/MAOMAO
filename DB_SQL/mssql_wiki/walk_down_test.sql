
-- yes, can walk DOWN now we know the best root...

select * from wiki_page where page_title = 'Main_topic_classifications' and page_namespace=14 -- pageid = 7345184
select * from wiki_catlink where cl_to = 'Main_topic_classifications'

select * from wiki_page where page_id = 695027
select * from wiki_catlink where cl_to = 'Politics'

