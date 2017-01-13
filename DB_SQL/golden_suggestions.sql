-- get closest correlated golden term (for golden suggestions)
-- "learning engine"

-- "tim kaine" 5661
-- "peter svidler" 547
-- "slutwalk" 1660

-- direct correlations (have appeared together) --
-- (need to recurse if none found? maybe NOT -- better to identify topics that have no direct golden correlation)
--  > these need manual correction, i.e. creation of golden category that best matches.

-- then need to find root golden term of direct correlated golden term
-- suggestion is then for candidate to be a new child of root golden term

-- steps -- (1) any direct-correlated golden term?
--			(2)	(if so, find root of that direct correlated term (?), and mark candidate as direct child of root
--				  > not sure here; sometimes best under direct child, sometimes best under root??)
--			(3) if not direct corrleated golden term, flag URL as needing manual classification
--

select term_matrix.*, (select name from term where id = term_matrix.term_b_id) 'term_b', (select name from term where id = term_matrix.term_a_id) 'term_a'
--(select child_term_id from golden_term where child_term_id = term_matrix.term_b_id) 'golden correlation?'
from term_matrix
where (select name from term where id = term_a_id) = 'Sergey Karjakin'
and (select child_term_id from golden_term where child_term_id = term_matrix.term_b_id) is not null
order by occurs_together_count desc

select term_matrix.*, (select name from term where id = term_matrix.term_a_id) 'term_a', (select name from term where id = term_matrix.term_b_id) 'term_b'
--(select child_term_id from golden_term where child_term_id = term_matrix.term_a_id) 'golden correlation?'
from term_matrix
where (select name from term where id = term_b_id) = 'Sergey Karjakin'
and (select child_term_id from golden_term where child_term_id = term_matrix.term_a_id) is not null
order by occurs_together_count desc
