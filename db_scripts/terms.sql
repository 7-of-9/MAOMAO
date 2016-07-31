select t.*, tt.*, cet.*
from term_type tt, term t
 left outer join cal_entity_type cet on t.cal_entity_type_id = cet.id
where t.term_type_id = tt.id

select * from cal_entity_type
select * from term_matrix
select * from [url] order by id desc -- 3103, 3111, 3113
select * from url_term


-- urls & terms
select u.id, u.url, u.meta_title, ut.term_id, ut.cal_entity_relevance, ut.cal_socialtag_importance, ut.cal_topic_score, t.name, tt.type, t.occurs_count 'term_occurs', cet.name 'entity_type'
from [url] u, url_term ut, term_type tt, term t
 left outer join cal_entity_type cet on t.cal_entity_type_id = cet.id
where ut.url_id = u.id and ut.term_id = t.id and tt.id = t.term_type_id
order by u.id desc


-- term correlation matrix -- related terms
select tm.id, tm.term_a_id, tm.term_b_id, tm.occurs_together_count ,
(select name from term where id = tm.term_a_id) 'a',
(select occurs_count from term where id = tm.term_a_id) 'a-#',
(select name from term where id = tm.term_b_id) 'b',
(select occurs_count from term where id = tm.term_b_id) 'b-#',

	-- normalized corr. is just the # of times the terms appear together / the number of times the most prevalent term has appeared
	cast(tm.occurs_together_count as float) / cast((dbo.InlineMax(
		(select occurs_count from term where id = tm.term_a_id),
		(select occurs_count from term where id = tm.term_b_id)
	)) as float) 'normalized_correlation'
		
from term_matrix tm
where term_a_id not in (468, 521, 533, 527) and term_b_id not in (468, 521, 533, 527) -- youtube | paypal
--and tm.occurs_count > 5 -- discard small data set pairs
and ((select name from term where id = tm.term_a_id) = 'angus deayton' or (select name from term where id = tm.term_b_id) ='angus deayton')
and ((select name from term where id = tm.term_a_id) = 'richard curtis' or (select name from term where id = tm.term_b_id) ='richard curtis')
order by 4 desc --8 desc


-- clean up
-- delete from url_term where url_id in (3103, 3111, 3113)
-- delete from url where id in (3103, 3111, 3113)

select * from term where name ='paypal' -- 533, 527
select * from term where name like '%Magnus Carlsen%'
select * from term where name like '%magnus carlsen%'
select * from term_type where id = 3

/*
delete from url_term
delete from [url]
delete from term_matrix
delete from term
delete from cal_entity_type
*/
