-- terms where from_wiki = 1

-- golden_terms (all)
select * from golden_term where from_wiki=1
select * from term where term_type_id=10 order by name

-- delete from term where term_type_id=10
-- delete from golden_term where from_wiki=1
-- update wiki_catlink set processed=0 where processed=1

-- potential roots: "Main topic classifications"
select * from term where id in (
  select parent_term_id from golden_term where from_wiki=1 and parent_term_id not in
    (select child_term_id from golden_term where from_wiki=1))

select *, (select name from term where id=child_term_id) from golden_term where parent_term_id = 98493 --***

select * from wiki_page where page_title = 'Jokes'
select * from wiki_catlink where cl_to = 'Set_categories'
select * from wiki_catlink where cl_from = 722091 -- 722091

select count(*) from golden_term where from_wiki=1
select count(*) from term where term_type_id=10 -- target: ~4.3m (!!) as below
select count(*) from wiki_catlink where processed=1
select * from term where name = 'peter svidler'

select distinct count (cl_to) from wiki_catlink where cl_type='subcat' -- 4,435,624 ****
select distinct count (cl_to) from wiki_catlink where cl_type='page' -- 99,481,656

-- wiki terms X NLP terms
select t1.name 'wiki_term', (select count(*) from term t2 where t2.name=t1.name and t2.term_type_id!=10) 'nlp_term #' from term t1 where t1.term_type_id=10  order by 2 desc
