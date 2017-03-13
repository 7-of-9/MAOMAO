	
	select [id] into #tmp1 from mm02.mm02.dbo.url_parent_term
	select [id] into #tmp2 from #tmp1 where [id] not in (select [id] from url_parent_term)

	select term_id into #tmp3 from mm02.mm02.dbo.url_parent_term where term_id not in (select [id] from [term])

	--SET IDENTITY_INSERT [term] ON
	--insert into [term] (id, name, term_type_id, cal_entity_type_id, occurs_count, wiki_nscount, is_topic, is_topic_root)
	--select * from mm02.mm02.dbo.[term] where id in (select term_id from #tmp3)
	--SET IDENTITY_INSERT [term] OFF

	SET IDENTITY_INSERT [url_parent_term] ON
	insert into url_parent_term (id, url_id, term_id, pri, suggested_dynamic, found_topic, S, avg_S, S_norm, min_d_paths_to_root_url_terms, max_d_paths_to_root_url_terms, perc_ptr_topics, mmtopic_level, avg_TSS_leaf, url_title_topic)
	select * from mm02.mm02.dbo.url_parent_term
	where id in (select [id] from #tmp2)
	and term_id not in (select term_id from #tmp3)
	and url_id in (select [id] from [url])
	SET IDENTITY_INSERT [url_parent_term] OFF
