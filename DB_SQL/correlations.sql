
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
and ((select name from term where id = tm.term_a_id) = 'white house' or (select name from term where id = tm.term_b_id) ='white house')
--and ((select name from term where id = tm.term_a_id) = 'richard curtis' or (select name from term where id = tm.term_b_id) ='richard curtis')
order by 4 desc --8 desc

