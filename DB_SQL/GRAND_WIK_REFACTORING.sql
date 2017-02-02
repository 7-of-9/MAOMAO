

/*

-- UPDATED: 
 
 * no need to record wiki terms for urls - just go with calais terms
 * CalcTss: turn down L2 matching -- quite suspect
 * simply: take top n terms by tss_norm, match them to wiki terms (ns=0 terms, e.g. "republican party" won't match - they're not imported) 
 *
 * look at the paths to root for the matching wiki terms -- are there any path nodes in common across the matching wiki terms' paths to root? 
 *   if so, this is a confirmation signal for a grouping topic
 *
 * if no. matching wiki_terms < 2; we have no confirmation - don't output any GT
 *
 * does the paths to root nodes help in picking out or confirming any ns=0 calais topics?
 *
 * conclusion: topics for a page could consist of calais terms (not in GT!) OR wiki terms (in GT) OR a TLD
 *  topic { wiki_term || calais_term || TLD }
 *
 * QUESTION >> are topics for a URL static (and same) for every user?!
 *			or, does the user's previous history affect things?
 *
 *	answer: ideally, a user would initially get grouped under "politics" and then it would subdivide automatically to "uk politics" 
 *			and "us politics" when the number of items in it warranted that - groupings would be dynamic, in other words.
 *
 *  ... SO - what actually needs to happen is that topics are derived for a ** set of URLs ** -- not from a single URL.
 *			(that set being each individual user's set)
 * i.e. -- (from old notes in CalcTss) 
            //       (2) want to arrive at BROADLY bucketed "approved" MM CATS, e.g. for sample set: 
            //              * chess, astronomy, atheism, US politics, comedy, maths,  > and not much more than that ...
            //                > the granularity has to be "just right"
            //
            //       (3) acutally, it's more like 2 or 3 MM CATS (hierarchical) for each URL ...
            //
 *
 *	>> probably then: CalcTss is the static stuff that doesn't vary for each URL -- that should be pre-calc'd and saved into url_term rows.
 *
 * then: build fast batch categorizer for a set of URLs; depending on # of URLs, target is to build a set of hiearchical topics
 *		 that the URL set can be grouped against.
 *
 *... fallback: is always TLD as "topic" for XP
 *



--- OLD:

(1) problem: 
  current linkage between terms and golden_terms is done by absolute term id (bigint)
  imported wiki terms are all new unique bigint ids; therefore linkage between Calais-type terms and Wiki-golden terms is broken.

(2) solution:
  **refactor Calais import**
    (a) all calais terms need to be mapped (by NAME) to wiki terms (termtype 0||14) -- DONE.
	(b) synthetic wiki-terms are recorded (with inherited S values) in url_term, alongside underlying calais terms -- DONE.
	(c) >> all existing matching and linking of url_term.term.golden_child_of etc. will then work for these termtype 0||14 url_terms <<
	(d) we from then on deal exclusively with wiki-type terms; term_matrix correlations also will only have wiki-type term IDs written to it

(3) implementation:
  (a) alter Calais import to write wiki-terms to url_term >> FIRST: need a fully populated wiki golden tree
        >> would want to know roughly what % of calais terms CANNOT match by name to a wiki-term, i.e. how decent our golden tree is...
  (b) alter Calais import to write wiki-terms to term_matrix -- DONE
  (c) clean down all term_matrix rows
  (d) batch import (crawl) a bunch of sources to populate term_matrix evenly (e.g. planned random walk of wikipedia article texts and/or YT mm02ce)

*/

select top 1 * from url where url='https://www.youtube.com/watch?v=MYUJkP7Bb7A'-- 55
select * from url_term where url_id = 55 -- 35 rows
select count(*) from url_term -- 89059

select * from term_matrix where term_a_id in (select id from term where term_type_id=10 and occurs_count > -1)
select * from term_matrix where term_b_id in (select id from term where term_type_id=10 and occurs_count > -1)
