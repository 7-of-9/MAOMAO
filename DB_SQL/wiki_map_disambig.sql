
select * from term where name like 'ajax (%' -- for calais matching: preferentially match bracketed terms, or failing that match all bracketed terms!!!
select * from term where name = 'ajax' -- also got exact match

select * from term where name = 'computing' -- exact match
select * from term where name like 'computing (%' -- also got disambiguation matches!!

select * from term where name like 'software (%'

-- ** try to disambiguate first; if that fails use exact match...

select * from term where name = 'ajax'
select * from url_term, term t where url_id = 8437 and t.id = term_id order by term_id desc --term_id = 12332349
-- delete from url_term where url_id = 8437 and term_id > 999999

select count(*) from url_term
select * from url_term, term t where url_id = 55 and t.id = term_id order by term_id desc --term_id = 12332349
