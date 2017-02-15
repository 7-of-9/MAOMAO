select * from user_url

--
-- (1) SIMPLIFIED (NAIVE) classification: top raw tss_norm (or even Calais S) classification, aggresive removal of low signal URLs
--     > subsequent classifications give priorirty to previously classified terms
--	   > (grouping by [most easily] low-tss or low-S common terms, or [harder] by term correlations or wiki-tree walking)
--	   >> but in principle, subsequent classifcations would cluster around early "seed" terms
--	  TEST MODE: random walk of URLs / process, add to user_url / classify
--	  first: want image extraction -- could be done as part of processing
--	   also: extract nlp_suitability_score -- trivial exclude URLs in DB
--
alter table [url] add  img_url nvarchar(256)
select meta_all from url