
alter index IX_golden_term_parentTermId on golden_term DISABLE
alter index IX_term_wiki_nscount on term DISABLE

-- run wiki_walker gt mode ...

alter index IX_term_wiki_nscount on term REBUILD
alter index IX_golden_term_parentTermId on golden_term REBUILD
