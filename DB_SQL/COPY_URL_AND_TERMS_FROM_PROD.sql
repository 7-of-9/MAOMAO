declare @url_id bigint set @url_id = 10369

-- copy url
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

