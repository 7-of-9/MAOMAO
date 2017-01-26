
-- ok: concluded -- basically can only walk UP!!

-- need to start with all leaf nodes (pages, not higher level subcats), as so:
select count(*) from wiki_catlink where cl_type = 'page' -- 99,481,656 lollllll

-- then need to walk UP the wiki_catlink table as below for each leaf node!!!
-- so, issue is how to reduce initial leaf nodes to a reasonable/representative spread across all cats?
select * from wiki_page where page_id in (select top 100000 cl_from from wiki_catlink where cl_type = 'page') -- 100k still in films!!

-- ok, so don't even bother adding leaf nodes as golden terms
-- instead, pick at random (order by guid id?) from leaf node pages, and walk up their catlink trees, 
-- inserting new golden terms as we go (if not exists) -- i.e. only adding category: pages as golden terms.
-- if done sufficiently at random, by definition the tree will populate itself (albeit with every more iterations 
-- resulting in no new parts of the tree being discovered)
-- so, maximum golden tree node count:
select count(*) from wiki_page where page_namespace = 14 -- 1,489,640 at least better than 99m leaf nodes!!!
 
-- initial leaf nodes - rnd order
select * from wiki_page where page_id in
 (select top 1000 cl_from from wiki_catlink where cl_type = 'page' order by id desc)



-- walk to top examples...
select * from wiki_page where page_id = 38788193 -- Pachyceras

select * from wiki_catlink where cl_from = 11705105 order by cl_to -- *always returns titles of type 14, i.e. cats*
select * from wiki_page where  page_title='Professional_studies' -- 21722732

select * from wiki_catlink where cl_from = 11705105 order by cl_to
select * from wiki_page where page_namespace = 14 and page_title='Culture' -- 694861

select * from wiki_catlink where cl_from = 694861 order by cl_to
select * from wiki_page where page_namespace = 14 and page_title='Society' -- 1633936

select * from wiki_catlink where cl_from = 1633936 order by cl_to
select * from wiki_page where page_namespace = 14 and page_title='Fundamental_categories' -- 28399759**

-- maths, starting from leaf node page
select * from wiki_page where page_title = 'Index_notation' and page_namespace=0 -- 320026
select * from wiki_catlink where cl_from = 320026

-- leaf nodes in wiki_catlink:  start of upwalks... ***
select top 100 * from wiki_catlink where cl_type = 'page' -- i.e. cl_from ID = page type, not subcat

select * from wiki_page where page_namespace = 14 and page_title='American_documentary_films' -- 7177128
select * from wiki_catlink where cl_from = 7177128 order by cl_to

select * from wiki_page where page_namespace = 14 and page_title='American_films_by_genre' -- 7177128
select * from wiki_catlink where cl_from = 23855550 order by cl_to


