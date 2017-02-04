-- actually COUNT of distinct namespaces for page is good indication of super-gold?

select top 10 * from term order by wiki_nscount desc
select count(*) from term where  wiki_nscount is not null

-- THEN: function of distances to fuzzy supergolds (aka nscount) x supergold-ness --> gives candidate MMCATS for URL or set of URLs.

select top 100000 page_title, count(*)
from wiki_page wp where page_namespace != 3 and page_namespace != 6 and page_namespace != 2 and page_title like 'ba%'
group by page_title
order by 2 desc



SELECT count(distinct page_namespace) from wiki_page where page_title = 'Reference_work'
select * from wiki_page where page_title = 'Barack_obama'

select * from wiki_page where page_title = 'Banded_Jack_pine_needleminer_Moth'

select * from term where name = 'Che Guevara'
select * from term where name like '% by %'
