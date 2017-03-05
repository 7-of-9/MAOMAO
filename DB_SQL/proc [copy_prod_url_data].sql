USE [mm02_local]
GO

/****** Object:  StoredProcedure [dbo].[copy_prod_url_data]    Script Date: 3/5/2017 6:01:34 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE proc [dbo].[copy_prod_url_data] (@url_id bigint)
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
GO


