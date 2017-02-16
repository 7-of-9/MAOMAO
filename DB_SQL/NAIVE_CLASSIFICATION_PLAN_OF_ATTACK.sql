
--
-- (1) SIMPLIFIED (NAIVE) classification: top raw tss_norm (or even Calais S) classification, aggresive removal of low signal URLs
--     > subsequent classifications give priorirty to previously classified terms
--	   > (grouping by [most easily] low-tss or low-S common terms, or [harder] by term correlations or wiki-tree walking)
--	   >> but in principle, subsequent classifcations would cluster around early "seed" terms
--	  TEST MODE: random walk of URLs / process, add to user_url / classify
--	  first: want image extraction -- could be done as part of processing
--	   also: extract nlp_suitability_score -- trivial exclude URLs in DB
select uu.urlId, u.meta_title, uuc.*, t.*, ut.S, ut.tss_norm, ut.candidate_reason
from user_url_classification uuc, user_url uu, term t, url_term ut, url u
where uuc.term_id = t.id and uu.id = uuc.user_url_id and
ut.url_id = uu.urlId and ut.term_id = t.id and
u.id = uu.urlId
order by user_url_id, pri
-- delete from user_url_classification

--
-- (2) UPDATE: doesn't work -- see CalculatePathsToRoot_Test1() for latest thinking
--		 wiki tree is solid, just needs more work -- it will be the basis...

select gtp.*, t.* from gt_path_to_root gtp, term t where t.id = gtp.seq_term_id order by term_id, path_no, seq
-- delete from gt_path_to_root