-- get closest correlated golden term (for golden suggestions)


select term_matrix.*, (select name from term where id = term_matrix.term_b_id) 'term_b', (select name from term where id = term_matrix.term_a_id) 'term_a',
(select child_term_id from golden_term where child_term_id = term_matrix.term_b_id) 'golden correlation?'
from term_matrix
where (select name from term where id = term_a_id) = 'sports'
and (select child_term_id from golden_term where child_term_id = term_matrix.term_b_id) is not null
order by occurs_together_count desc

select term_matrix.*, (select name from term where id = term_matrix.term_a_id) 'term_a', (select name from term where id = term_matrix.term_b_id) 'term_b',
(select child_term_id from golden_term where child_term_id = term_matrix.term_a_id) 'golden correlation?'
from term_matrix
where (select name from term where id = term_b_id) = 'sports'
and (select child_term_id from golden_term where child_term_id = term_matrix.term_a_id) is not null
order by occurs_together_count desc
