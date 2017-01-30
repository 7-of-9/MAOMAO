

/*

(1) problem: 
  current linkage between terms and golden_terms is done by absolute term id (bigint)
  imported wiki terms are all new unique bigint ids; therefore linkage between Calais-type terms and Wiki-golden terms is broken.

(2) solution:
  **refactor Calais import**
    (a) all calais terms need to be mapped (by NAME) to wiki terms (termtype 10) -- DONE.
	(b) synthetic wiki-terms are recorded (with inherited S values) in url_term, alongside underlying calais terms -- DONE.
	(c) >> all existing matching and linking of url_term.term.golden_child_of etc. will then work for these termtype 10 url_terms <<
	(d) we from then on deal exclusively with wiki-type terms; term_matrix correlations also will only have wiki-type term IDs written to it

(3) implementation:
  (a) alter Calais import to write wiki-terms to url_term >> FIRST: need a fully populated wiki golden tree
        >> would want to know roughly what % of calais terms CANNOT match by name to a wiki-term, i.e. how decent our golden tree is...
  (b) alter Calais import to write wiki-terms to term_matrix
  (c) clean down all term_matrix rows
  (d) batch import (crawl) a bunch of sources to populate term_matrix evenly (e.g. planned random walk of wikipedia article texts and/or YT mm02ce)

*/

select top 1 * from url where url='https://www.youtube.com/watch?v=MYUJkP7Bb7A'-- 55
select * from url_term where url_id = 55 -- 35 rows
select count(*) from url_term -- 89059

select * from term_matrix where term_a_id in (select id from term where term_type_id=10 and occurs_count > -1)
select * from term_matrix where term_b_id in (select id from term where term_type_id=10 and occurs_count > -1)
