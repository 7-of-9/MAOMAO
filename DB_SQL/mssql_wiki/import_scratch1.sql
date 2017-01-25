
ALTER TABLE wiki_page ADD CONSTRAINT PK_wiki_page_id PRIMARY KEY (page_id)
CREATE INDEX IX_wiki_page ON wiki_page (page_title)
CREATE INDEX IX_wiki_namespace ON wiki_page (page_namespace)

alter database mm02_local set recovery simple
dbcc shrinkfile('mm02_log',100)
DBCC SHRINKDATABASE('mm02_local') 
alter database mm02_local set recovery full

select count(*) from wiki_catlink
alter table wiki_catlink alter column cl_to nvarchar(255) not null
ALTER TABLE wiki_catlink ADD CONSTRAINT PK_wiki_catlink_id PRIMARY KEY (cl_from, cl_to)

