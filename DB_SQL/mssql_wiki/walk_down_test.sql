
-- yes, can walk DOWN now we know the best root...

-- counts done...
 select count(*) from term where term_type_id in (0,14) -- target: all subcats & pages, i.e. 14m!!!
 select count(*) from wiki_page where processed=1 -- 347
 select count(*) from wiki_catlink where processed=1 -- 4055
  select count(*) from wiki_page where page_namespace in (0,14) -- TARGET: 14m !!!
  select distinct count(cl_to) from wiki_catlink where cl_type = 'subcat' -- 4.4m
  select distinct count(cl_to) from wiki_catlink where cl_type = 'page' -- (99m)

 select processed from wiki_page where page_title = 'Main_topic_classifications'
//* restart-
 delete from golden_term where from_wiki=1
 delete from term_matrix where term_a_id in (select id from term where term_type_id=10)
 delete from term_matrix where term_b_id in (select id from term where term_type_id=10)
 delete from term where term_type_id=10
 --update wiki_page set processed=0 where processed=1
	DROP INDEX [IX_wiki_page_processed] ON [dbo].[wiki_page]
		alter table wiki_page drop column processed
		alter table wiki_page add processed bit null
	CREATE NONCLUSTERED INDEX [IX_wiki_page_processed] ON [dbo].[wiki_page] ( [processed] ASC) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]

--update wiki_catlink set processed=0 where processed=1
	DROP INDEX [IX_wiki_catlink_processed] ON [dbo].[wiki_catlink]
		alter table wiki_catlink drop column processed
		alter table wiki_catlink add processed bit null
	CREATE NONCLUSTERED INDEX [IX_wiki_catlink_processed] ON [dbo].[wiki_catlink] ( [processed] ASC) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
 */

 -- test

select * from wiki_page where page_title = 'Main_topic_classifications' and page_namespace in (14,0) -- pageid = 7345184
select *,
 (select page_title from wiki_page where page_id=cl_from) 'cn',
 (select page_namespace from wiki_page where page_id=cl_from)
 from wiki_catlink where cl_to = 'Main_topic_classifications'
 order by 'cn'

 select * from wiki_page where page_id in ((select cl_from from wiki_catlink where cl_to = 'art_genres'))

 -- parent node
select * from term where name = 'arts' -- 456925
select *, (select name from term where id=child_term_id) from golden_term where parent_term_id = 456925 --***

-- child node
select * from golden_term where child_term_id = 456925
