
-- (*) is_topic + is_topic_root flags on [term]
select [id] into #tmp1 from term  where is_topic=1
update mm02.mm02.dbo.term set is_topic=1 where id in (select id from #tmp1)


-- (*) [topic_link] (all)
-- (*) [gt_parent] (all, replace)
-- (*) [url_parent_term] (all)

