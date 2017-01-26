


-- terms where from_wiki = 1

-- golden_terms (all)
select * from golden_term where from_wiki=1
select * from term where term_type_id=10 order by name

-- delete from term where term_type_id=10
-- delete from golden_term where from_wiki=1
-- update wiki_catlink set processed=0 where processed=1

-- potential roots
select * from term where id in (
  select parent_term_id from golden_term where from_wiki=1 and parent_term_id not in
    (select child_term_id from golden_term where from_wiki=1))

select count(*) from term where term_type_id=10 
select count(*) from wiki_catlink where processed=1 -- target: ~1m

select * from wiki_page where page_title = 'Wikipedia_requested_images_of_Marvel_Comics'
select * from term where name like '%Social%' and term_type_id=3
select * from wiki_catlink where cl_to = 'Digital_currencies'