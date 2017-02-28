
-- roots

-- truncate table topic_link
select distinct parent_term_id from topic_link where parent_term_id not in (select distinct child_term_id from topic_link)

--
-- todo: need to manually mark 5-10 topics as ROOTs -- start w/ walk 100 set -- the field [is_topic_root] needs to be on the term table...
-- the logic above fails on larger population of links, because almost all terms are child terms of something!!
-- 

select * from term where id in (5204705, 4990963)
select * from topic_link where parent_term_id = 5204705 and child_term_id = 4990963 -- comp. programming parent of arts??

select distinct term_id into #gt_roots from gt_path_to_root where seq_term_id = 5204705

select term_id, path_no, seq, seq_term_id into #gt_roots2 from gt_path_to_root where term_id in (select term_id from #gt_roots) and seq_term_id = 5204705 order by term_id
select * from #gt_roots2

select * from gt_path_to_root where seq_term_id = 4990963
and exists (select * from #gt_roots2 where term_id = gt_path_to_root.term_id and path_no = gt_path_to_root.path_no)

select * from term where id = 4994469

	select * from topic_link