
--
-- wiki_small analysis
--

select distinct child into #child_nodes from wiki_small_tax -- 459,024

-- parent nodes?
select distinct parent into #root_parents from wiki_small_tax where parent not in (select distinct child from wiki_small_tax) -- 14k wtf?
select * from wiki_small_cat where id in (select parent from #root_parents)
select * from wiki_small_tax where parent = 68

-- leaf nodes?
select distinct child into #leaf_nodes from wiki_small_tax where child not in (select distinct parent from wiki_small_tax) -- 287k
