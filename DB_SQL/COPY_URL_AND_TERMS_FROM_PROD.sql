--
-- RUN FROM DEV: copies missing url & (todo: user_url) prod URL data to dev...
--
-- select count(id) from MM02.mm02.dbo.url where id not in (select id from url)
-- (todo: select count(id) from MM02.mm02.dbo.user_url where id not in (select id from user_url))

-- copy reference data: awis_
	declare db_cursor_outer cursor for select id from MM02.mm02.dbo.awis_cat where id not in (select id from awis_cat)
	declare @awis_cat_id bigint
	open db_cursor_outer;
	fetch next from db_cursor_outer into @awis_cat_id;
	while @@FETCH_STATUS = 0
	begin
		SET IDENTITY_INSERT awis_cat on
		insert into awis_cat (
			id, title, abs_path
		) select * from MM02.mm02.dbo.awis_cat where id not in (select id from awis_cat)
		SET IDENTITY_INSERT awis_cat off

		fetch next from db_cursor_outer into @awis_cat_id;
	end;
	DEALLOCATE db_cursor_outer;

-- copy URL data
	declare db_cursor_outer cursor for select id from MM02.mm02.dbo.url where id not in (select id from url)
	declare @url_id bigint
	open db_cursor_outer;
	fetch next from db_cursor_outer into @url_id;
	while @@FETCH_STATUS = 0
	begin
		declare @msg nvarchar(100) set @msg = N'copying url data: ' + cast(@url_id as nvarchar) + N'...'
		RAISERROR(@msg,0,1) WITH NOWAIT

		exec copy_prod_url_data @url_id

		fetch next from db_cursor_outer into @url_id;
	end;
	DEALLOCATE db_cursor_outer;

-- copy user-URL data
	declare db_cursor_outer cursor for select id from MM02.mm02.dbo.user_url where id not in (select id from user_url)
	declare @user_url_id bigint
	open db_cursor_outer;
	fetch next from db_cursor_outer into @user_url_id;
	while @@FETCH_STATUS = 0
	begin
		declare @msg nvarchar(100) set @msg = N'copying user-url data:' + cast(@user_url_id as nvarchar) + N'...'
		RAISERROR(@msg,0,1) WITH NOWAIT
		SET IDENTITY_INSERT user_url on

		insert into user_url (id, user_id, url_id, nav_utc, im_score, audible_pings, time_on_tab)
		select * from MM02.mm02.dbo.user_url where id = @user_url_id

		SET IDENTITY_INSERT user_url off

		fetch next from db_cursor_outer into @user_url_id;
	end;
	DEALLOCATE db_cursor_outer;


/*
alter proc copy_prod_url_data (@url_id bigint)
as begin

--declare @url_id bigint set @url_id = 10375

	-- copy awis site if missing
	IF NOT EXISTS (SELECT * FROM [awis_site] WHERE id = (select awis_site_id from  MM02.mm02.dbo.url where id = @url_id))
	begin
		SET IDENTITY_INSERT [awis_site] on
		insert into awis_site (
			[id] ,
			[TLD] ,
			[as_of_utc],
			[adult] ,
			[title],
			[desc],
			[lang] ,
			[url] ,
			[awis_cat_id] ,
			[hard_disallow]
		)  select * from MM02.mm02.dbo.awis_site where id = (select awis_site_id from  MM02.mm02.dbo.url where id = @url_id)
		SET IDENTITY_INSERT [awis_site] off
	end

	-- copy url if missing
	IF NOT EXISTS (SELECT * FROM [url] WHERE id = @url_id)
	begin
		SET IDENTITY_INSERT [url] on
		insert into url (
			[id] ,
			[url] ,
			[calais_as_of_utc] ,
			[awis_site_id] ,
			[cal_lang] ,
			[meta_title] ,
			[meta_all] ,
			[processed_at_utc] ,
			[processed_golden_count] ,
			[mapped_wiki_terms] ,
			[unmapped_wiki_terms] ,
			[img_url] ,
			[nlp_suitability_score] 
		)  select * from MM02.mm02.dbo.url where id = @url_id
		SET IDENTITY_INSERT [url] off
	end

	-- copy missing terms
	declare db_cursor cursor for select term_id from MM02.mm02.dbo.url_term where url_id = @url_id;
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

	-- copy url_terms
	IF NOT EXISTS (SELECT * FROM [url_term] WHERE url_id = @url_id)
	begin
		SET IDENTITY_INSERT [url_term] ON
		insert into url_term (
			[id] ,
			[url_id],
			[term_id] ,
			[cal_topic_score],
			[cal_socialtag_importance],
			[cal_entity_relevance] ,
			[wiki_S] ,
			[candidate_reason] ,
			[tss] ,
			[tss_norm],
			[S] ) select * from mm02.mm02.dbo.url_term where url_id = @url_id
		SET IDENTITY_INSERT [url_term] off
	end
end
*/
