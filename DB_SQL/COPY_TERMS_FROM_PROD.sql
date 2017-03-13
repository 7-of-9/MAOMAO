--
-- RUN FROM DEV: copies missing terms from prod to dev...
--

select distinct term_id into #tmp1 from mm02.mm02.dbo.url_term 
select term_id into #tmp2 from #tmp1 where term_id not in (select [id] from term)

-- copy missing terms
	declare db_cursor cursor for select term_id from #tmp2
	declare @term_id bigint
	open db_cursor;
	fetch next from db_cursor into @term_id;
	while @@FETCH_STATUS = 0
	begin
		IF NOT EXISTS (SELECT * FROM [term] WHERE id = @term_id)
		begin
			SET IDENTITY_INSERT [term] ON
			insert into [term] (
				[id] ,
				[name],
				[term_type_id] ,
				[cal_entity_type_id] ,
				[occurs_count] ,
				[wiki_nscount],
				[is_topic] ,
				[is_topic_root]) select * from mm02.mm02.dbo.term where id = @term_id
			SET IDENTITY_INSERT [term] off
		end

		fetch next from db_cursor into @term_id;
	end;
	DEALLOCATE db_cursor;