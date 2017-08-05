select * from [user]
select * from user_reg_topic

select * from [term] where name = 'buddhism'

insert into user_reg_topic values (20, 5032082)

select * from gt_parent where child_term_id = 4995445

/* delete from disc_url_cwc
delete from disc_url_osl
delete from disc_url */
select (select [name] from [term] where id=user_reg_topic_id) 'main', (select [name] from [term] where id=term_id) 'term',
  [url], [desc], meta_title, img_url, search_num, term_num, result_num, city, country  from disc_url where search_num = 6
  order by user_reg_topic_id, term_id, search_num, term_num, result_num

select * from disc_url_cwc
select * from disc_url_osl

https://www.meetup.com/Boardgames-Singapore/messages/boards/thread/50319968
<meta name="ICBM" content="1.3,103.85" />
<meta name="geo.position" content="1.3;103.85" />
<meta name="geo.placename" content="Singapore, Singapore" />
<meta name="geo.region" content="SG" />