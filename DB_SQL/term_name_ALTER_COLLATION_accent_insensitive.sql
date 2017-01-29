
DROP INDEX [UIX_term_name_term_type_cal_ent_type] ON [dbo].[term]
GO

ALTER TABLE term ALTER COLUMN Name [nvarchar](128) COLLATE SQL_Latin1_General_CP1_CI_AI

select name, count(*) 'c' into #tmp1 from term where term_type_id=10 group by name having count(*) > 1 --order by 2 desc
delete from golden_term where parent_term_id in (select id from term where name in (select name from #tmp1))
delete from golden_term where child_term_id in (select id from term where name in (select name from #tmp1))
delete from term_matrix where term_a_id in  (select id from term where name in (select name from #tmp1))
delete from term_matrix where term_b_id in  (select id from term where name in (select name from #tmp1))
delete from url_term where term_id in (select id from term where name in (select name from #tmp1))
delete from term where name in (select name from #tmp1)

select name, term_type_id, cal_entity_type_id, count(*) 'c' into #tmp2 from term where term_type_id!=10
group by name, term_type_id, cal_entity_type_id having count(*) > 1 --order by 2 desc
delete from golden_term where parent_term_id in (select id from term where name in (select name from #tmp2))
delete from golden_term where child_term_id in (select id from term where name in (select name from #tmp2))
delete from term_matrix where term_a_id in  (select id from term where name in (select name from #tmp2))
delete from term_matrix where term_b_id in  (select id from term where name in (select name from #tmp2))
delete from url_term where term_id in (select id from term where name in (select name from #tmp2))
delete from term where name in (select name from #tmp2)


--select name, count(*) from term where term_type_id!=10 group by name having count(*) > 1 --order by 2 desc


CREATE UNIQUE NONCLUSTERED INDEX [UIX_term_name_term_type_cal_ent_type] ON [dbo].[term]
(
	[name] ASC,
	[term_type_id] ASC,
	[cal_entity_type_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
GO

