
select processed_at_utc, mapped_wiki_terms, unmapped_wiki_terms, * from url where id = 55
select name, * from url_term, term where url_id = 55 and url_term.term_id = term.id order by wiki_S desc, tss_norm desc
select *,
 (select name from term where id=term_id) 'child',
 (select name from term where id=seq_term_id) 'link'
from gt_path_to_root order by term_id, path_no, seq
--delete from url_term where url_id = 55
--delete from gt_path_to_root 


 
 select * from url where url = 'https://www.youtube.com/watch?v=MYUJkP7Bb7A'
 select * from term where id = '5383748'

select * from term where name = 'ASP.NET' -- 7150135
select * from golden_term where child_term_id = 5371197
select * from term where id = 5204820


select * from term where name = 'Lembit Opik'
select * from term where name = 'Jo Brand' --6744641
select * from golden_term where child_term_id = 6744641

select * from term where name = 'English women comedians'
select * from golden_term where parent_term_id = 5537668

select * from wiki_page where page_title = 'English_women_comedians' --35583960

  select *,
  (select page_title from wiki_page where page_id = cl_from) 'name',
  (select processed_to_depth from wiki_page where page_id = cl_from) 'ptd'
   from wiki_catlink where cl_to = 'English_women_comedians'
   order by 6


     select *,
  (select page_title from wiki_page where page_id = cl_from) 'name',
  (select page_id from wiki_page where page_id = cl_from) 'page id',
  (select processed_to_depth from wiki_page where page_id = cl_from) 'ptd'
   from wiki_catlink where cl_to = 'BBC_panel_games'
   order by 6

select * from wiki_catlink where cl_to = 'bbc_television_comedy'
select * from wiki_catlink where cl_to = 'british_satire'

