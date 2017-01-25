
ALTER TABLE wiki_page ADD CONSTRAINT PK_wiki_page_id PRIMARY KEY (page_id)
ALTER TABLE wiki_page alter column page_title nvarchar(512) null
CREATE INDEX IX_wiki_page ON wiki_page (page_title)
CREATE INDEX IX_wiki_namespace ON wiki_page (page_namespace)


BACKUP DATABASE mm02_local TO DISK = 'C:\DBs\mm02_local.BAK'

alter database mm02_local set recovery simple
dbcc shrinkfile('mm02_log',100)
alter database mm02_local set recovery full


