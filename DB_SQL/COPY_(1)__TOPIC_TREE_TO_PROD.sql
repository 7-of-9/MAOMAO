
--
-- RUN FROM LOCAL *** REPLACES ALL TOPIC TREE DATA ON PROD, with data from local!! ***
--
-- ( also: Export Data (SMSS) for [gt_parent] and [url_parent_term] )
--
-- some (3) urls missing in prod compared to local (strange) -- prevents [url_parent_term] bulk copy:
--
--   select distinct url_id into #tmp1 from url_parent_term
--   delete from url_parent_term where url_id in (select url_id from #tmp1 where url_id not in (select id from mm02.mm02.dbo.url))
--

declare @term_id bigint

-- sync is_topic_root -> prod
exec MM02.mm02.dbo.upd_term_clear_topic_root_all_terms;
	declare db_cursor cursor for select id from term where is_topic_root=1;
	open db_cursor;
	fetch next from db_cursor into @term_id;
	while @@FETCH_STATUS = 0
	begin
		exec MM02.mm02.dbo.upd_term_is_topic_root @term_id, 1;
		fetch next from db_cursor into @term_id;
	end;
	DEALLOCATE db_cursor;
select count(*) from MM02.mm02.dbo.term where is_topic_root=1
select count(*) from term where is_topic_root=1

-- sync is_topic -> prod
exec MM02.mm02.dbo.upd_term_clear_topic_all_terms;
	declare db_cursor cursor for select id from term where is_topic=1;
	open db_cursor;
	fetch next from db_cursor into @term_id;
	while @@FETCH_STATUS = 0
	begin
		exec MM02.mm02.dbo.upd_term_is_topic @term_id, 1;
		fetch next from db_cursor into @term_id;
	end;
	DEALLOCATE db_cursor;
select count(*) from MM02.mm02.dbo.term where is_topic=1
select count(*) from term where is_topic=1

-- truncate prod topic_link
	EXEC MM02.MM02.sys.sp_executesql N'TRUNCATE TABLE dbo.topic_link'

-- insert prod topic_link -- NOTE: no identity_insert on linked servers; different prod topic_link IDs
	insert into MM02.mm02.dbo.topic_link (
		[child_term_id],
		[parent_term_id] ,
		[min_distance] ,
		[max_distance] ,
		[seen_count],
		[disabled] ,
		[mmtopic_level] )
		select [child_term_id],
			   [parent_term_id] ,
		       [min_distance] ,
			   [max_distance] ,
			   [seen_count],
			   [disabled] ,
			   [mmtopic_level] from topic_link
