-- raw inputs:
select id, raw_text from [url] where raw_text is not null -- 3201
select top 10 * from [term]
select * from dbo.term_type

-- wiki mapping/graph [golden_term]
select top 1000
	(select [name] from term where id=parent_term_id),
	(select [name] from term where id=child_term_id)
from golden_term
select count(*) from golden_term -- 27,932,051

-- current MM graph model - final output is in [url_parent_term]
select top 10 t.name, t.term_type_id, upt.*, t.* from url_parent_term upt, term t where url_id = 14851 and t.id = upt.term_id