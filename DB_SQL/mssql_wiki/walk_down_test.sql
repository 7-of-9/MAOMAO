
-- yes, can walk DOWN now we know the best root...
					
-- counts done...
 select count(*) from term where term_type_id in (0,14) -- (800k @ d6, ns14 only) -- 7414238 ***
 select count(*) from golden_term -- 27866222 ***

-- 25m links processed, 6m pages
select count(*) from wiki_page where processed_to_depth is not null -- 6.4m
select count(*) from wiki_catlink where processed_to_depth is not null -- 25m

-- TODO: after all special pages have run; then run all top-level terms again RMD to pick up links again (might update mmcat more accurately, too)

-- TODO: 
-- missing term analysis > case sensitivity < -- need to set column sensitivities, then rerun small test parent node for Ajax (disambiguation page?)
-- have not get any valid info for "ajax"
-- surely, first need to remove all terms that are ambiguous by case (from term and golden_term)??

--
-- UPDATE: seems NOT ... maybe good: https://en.wikipedia.org/wiki/Ajax
--			disambiguation is done by BRACKETS, e.g. 
select * from term where name = 'ajax (programming)' -- i.e. we should match Calais term "ajax" to all wiki terms **sans brackets**

select * from term where name = 'ajax'	--12332349
 -- 1569 (Ajax 0 wiki_catlink:Disambiguation_pages) **
 -- 12595654 (AjaX 0 wiki_catlink:Redirects_from_members)
 -- 2447624 (AJAX 0 wiki_catlink:NONE!)
 -- 24138217 (Ajax 14 wiki_catlink:Disambiguation_categories) **
select * from wiki_page where page_title = 'ajax'
select * from wiki_catlink where cl_from = 24138217

	select * from wiki_page where page_title = 'Redirects_from_other_capitalisations' -- 4411633
	select * from wiki_catlink where cl_from = 4411633

		select * from wiki_page where page_title = 'Main_namespace_redirects' -- All_redirect_categories Redirect_tracking_categories
		select * from wiki_catlink where cl_from = 30017226

			select * from wiki_page where page_title = 'Wikipedia_redirects' -- Container_categories
			select * from wiki_catlink where cl_from = 16635674

				select * from wiki_page where page_title = 'Category-Class_redirect_pages' 
				select * from wiki_catlink where cl_from = 47250883

					select * from wiki_page where page_title = 'Category-Class_articles' --  WikiProject_Redirect_pages
					select * from wiki_catlink where cl_from = 9432874

						select * from wiki_page where page_title = 'Container_categories' --  Container_categories
						select * from wiki_catlink where cl_from = 30176254

							select * from wiki_page where page_title = 'Wikipedia_categories' --  Tracking_categories Wikipedia_categorization
							select * from wiki_catlink where cl_from = 35505592

								select * from wiki_page where page_title = 'Wikipedia_navigation'
								select * from wiki_catlink where cl_from = 52091499

									select * from wiki_page where page_title = 'Contents'
									select * from wiki_catlink where cl_from = 14105005
							
select top 100 * from term order by id desc		
				
							

select count(*) from wiki_page where processed_to_depth is null --34,172,917
select count(*) from wiki_page where processed_to_depth is not null --6,476,279

---

  select count(*) from wiki_page where page_namespace in (14) -- -- 1.4m
  select count(*) from wiki_page where page_namespace in (0) -- -- 12.8m
  select distinct count(cl_to) from wiki_catlink where cl_type = 'subcat' -- 4.4m
  select distinct count(cl_to) from wiki_catlink where cl_type = 'page' -- (99m)

 select processed_to_depth from wiki_page where page_title = 'Main_topic_classifications'
 select count(*) from wiki_page where processed_to_depth=12
 
 ---update wiki_page set processed_to_depth=3 where  page_title = 'Main_topic_classifications'
 --select * from term where name = 'software engineering'
 --select * from golden_term where parent_term_id = 5006393

 -- ns=0 (pages, leaf nodes - no dupes by name)
 --delete from term where term_type_id = 0
 --delete from golden_term where child_term_id in (select id from term where term_type_id = 0)
 --delete from golden_term where parent_term_id in (select id from term where term_type_id = 0)
 select count(*) from term where term_type_id = 0 -- how about don't add ns=0 pages where exists same term name ns=14?? surely.
 select count(*) from term where term_type_id = 14

 select * from term where name = 'republican party'
 select * from golden_term where child_term_id = 5817718


//* restart-
 delete from golden_term where from_wiki=1
 delete from term_matrix where term_a_id in (select id from term where term_type_id in (0,14))
 delete from term_matrix where term_b_id in (select id from term where term_type_id in (0,14))
 delete from term where term_type_id in (0,14)
 --update wiki_page set processed_to_depth=null where processed_to_depth is not null
	DROP INDEX [IX_wiki_page_processed] ON [dbo].[wiki_page]
		alter table wiki_page drop column processed
		alter table wiki_page add processed_to_depth int null
	CREATE NONCLUSTERED INDEX [IX_wiki_page_processed] ON [dbo].[wiki_page] ( [processed_to_depth] ASC) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]

--update wiki_catlink set processed_to_depth=null where processed_to_depth is not null
	DROP INDEX [IX_wiki_catlink_processed] ON [dbo].[wiki_catlink]
		alter table wiki_catlink drop column processed
		alter table wiki_catlink add processed_to_depth int null
	CREATE NONCLUSTERED INDEX [IX_wiki_catlink_processed] ON [dbo].[wiki_catlink] ( [processed_to_depth] ASC) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
 */

 -- test

 select max(processed_to_depth) from wiki_page
 update wiki_page set processed_to_depth = 2 where page_title = 'Main_topic_classifications' 
select * from wiki_page where page_title = 'Main_topic_classifications' and page_namespace in (14,0) -- pageid = 7345184

select *,
 (select page_title from wiki_page where page_id=cl_from) 'cn',
 (select page_namespace from wiki_page where page_id=cl_from) 'namespace'
 from wiki_catlink where cl_to = 'film_genres'
 order by 'cn'

 select * from wiki_page where page_id in ((select cl_from from wiki_catlink where cl_to = 'cartoon'))

 -- parent node
select * from term where name = 'arts' -- 456925
select *, (select name from term where id=child_term_id) from golden_term where parent_term_id = 456925 --***

-- child node
select * from golden_term where child_term_id = 456925

select * from term where name = 'tom and jerry'

select * from term where name = 'wesley so'
 select gt.*, t.name from golden_term gt, term t where t.id = gt.parent_term_id and gt.child_term_id = 5833805

 