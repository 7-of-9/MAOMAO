select * from [user]
select * from user_reg_topic
select * from [term] where id in ( 4990979,  4990980 ) --name = 'buddhism'

insert into user_reg_topic values (20, 5032082) -- dom

-- all browsed topics for user
select distinct term_id, t.name --  (select meta_title from [url] where id=url_id) 'meta_title', t.name, *
from url_parent_term, term t, user_url uu where suggested_dynamic in (0) and pri in (1) and t.id = term_id  and uu.url_id = url_parent_term.url_id and uu.user_id = 20
--and url_id in (select url_id from user_url where [user_id] = 15) -- dung // -- Software architecture / Feminism / Computer programming / Artificial intelligence

/* delete from disc_url_cwc
delete from disc_url_osl
delete from disc_url */

-- disc_term
select *, t.name from disc_term, term t where t.id = term_id order by 1 desc -- delete from disc_term where id in (20,21) -- truncate table disc_term
select distinct count (term_id) from disc_term
select term_id, count(*) from disc_term group by term_id order by 2 desc 

-- disc_url
select id, (select [name] from [term] where id=main_term_id) 'main', (select [name] from [term] where id=term_id) 'term', city, country, search_num, 
  [url], [desc], meta_title, img_url, term_num, result_num, url_hash from disc_url where id > 70983
  order by id desc -- main_term_id, term_id, search_num, term_num, result_num

-- disc_url++
select * from disc_url_cwc
select * from disc_url_osl
select count(*) from disc_url_html 

-- retrieving for term: interleaving of search types; consistent ordering
select top 10 --HashBytes('MD5', [url]), 
     * from disc_url where main_term_id = 5010985


https://www.meetup.com/Boardgames-Singapore/messages/boards/thread/50319968
<meta name="ICBM" content="1.3,103.85" />
<meta name="geo.position" content="1.3;103.85" />
<meta name="geo.placename" content="Singapore, Singapore" />
<meta name="geo.region" content="SG" />

