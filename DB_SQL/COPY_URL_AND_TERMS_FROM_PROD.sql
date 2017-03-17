--
-- RUN FROM DEV: copies missing url & user_url prod URL data to dev...
--
-- select count(id) from MM02.mm02.dbo.url where id not in (select id from url)

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

-- copy user-url data
	declare db_cursor_outer cursor for select id from MM02.mm02.dbo.user_url where id not in (select id from user_url)
	declare @user_url_id bigint
	open db_cursor_outer;
	fetch next from db_cursor_outer into @user_url_id;
	while @@FETCH_STATUS = 0
	begin
		declare @msg3 nvarchar(100) set @msg3 = N'copying user-url data:' + cast(@user_url_id as nvarchar) + N'...'
		RAISERROR(@msg3,0,1) WITH NOWAIT
		SET IDENTITY_INSERT user_url on

		insert into user_url (id, user_id, url_id, nav_utc, im_score, audible_pings, time_on_tab)
		select * from MM02.mm02.dbo.user_url where id = @user_url_id

		SET IDENTITY_INSERT user_url off

		fetch next from db_cursor_outer into @user_url_id;
	end;
	DEALLOCATE db_cursor_outer;

