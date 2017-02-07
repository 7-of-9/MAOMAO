-- actually COUNT of distinct namespaces for page is good indication of super-gold?

select top 10 * from term order by wiki_nscount desc
select count(*) from term where  wiki_nscount is not null

-- THEN: function of distances to fuzzy supergolds (aka nscount) x supergold-ness --> gives candidate MMCATS for URL or set of URLs.

select top 100000 page_title, count(*)
from wiki_page wp where page_namespace != 3 and page_namespace != 6 and page_namespace != 2 and page_title like 'ba%'
group by page_title
order by 2 desc

-- processed state for wiki node * children
select *,
  (select page_title from wiki_page where page_id = cl_from) 'name',
  (select processed_to_depth from wiki_page where page_id = cl_from) 'ptd'
   from wiki_catlink where cl_to = 'Democratic_Party_(United_States)' and (cl_type = 'subcat' or cl_type = 'page')
   order by cl_type

   select *,
  (select page_title from wiki_page where page_id = cl_from) 'name',
  (select processed_to_depth from wiki_page where page_id = cl_from) 'ptd'
   from wiki_catlink where cl_to = 'regions_of_africa' and (cl_type = 'subcat' or cl_type = 'page')
   order by cl_from

select *,
(select page_title from wiki_page where page_id = cl_from) 'name',
(select processed_to_depth from wiki_page where page_id = cl_from) 'ptd'
from wiki_catlink where cl_to = 'arts' and (cl_type = 'subcat' or cl_type = 'page')
order by processed_to_depth

select processed_to_depth, count(*) from wiki_catlink where cl_to = 'arts' and (cl_type = 'subcat' or cl_type = 'page') group by processed_to_depth
--processed_to_depth	(No column name)
--4		22
--20	71

select *,
(select page_title from wiki_page where page_id = cl_from) 'name',
(select processed_to_depth from wiki_page where page_id = cl_from) 'ptd'
from wiki_catlink where cl_to = 'health' and (cl_type = 'subcat' or cl_type = 'page')
order by processed_to_depth

select * from wiki_catlink where id='7bd20780-06f2-42c1-9320-8d18bcfe4a6c'

	   	   select *,
		  (select page_title from wiki_page where page_id = cl_from) 'name',
		  (select processed_to_depth from wiki_page where page_id = cl_from) 'ptd'
		   from wiki_catlink where cl_to = 'Agriculture' and (cl_type = 'subcat' or cl_type = 'page')
		   order by cl_from

		     select *,
			  (select page_title from wiki_page where page_id = cl_from) 'name',
			  (select processed_to_depth from wiki_page where page_id = cl_from) 'ptd'
			   from wiki_catlink where cl_to = 'Agricultural_buildings' and (cl_type = 'subcat' or cl_type = 'page')
			   order by cl_from

   select * from term where name = 'Extrasynaptic NMDA receptor'

   select *,
  (select page_title from wiki_page where page_id = cl_from) 'name',
  (select processed_to_depth from wiki_page where page_id = cl_from) 'ptd'
   from wiki_catlink where cl_to = 'Main_topic_classifications' and (cl_type = 'subcat' or cl_type = 'page')
   order by name --cl_type



select * from golden_term where parent_term_id = (select id from term where name = 'geography' and term_type_id=14)

-- children of gt
select gt.*, t.* from golden_term gt, term t where parent_term_id=(select top 1 id from term where name='feminism' and (term_type_id in (0,14)))
 and t.id = gt.child_term_id order by name desc--wiki_nscount desc

-- paths to root ...
select gt.*, t.* from golden_term gt, term t where child_term_id=(select top 1 id from term where name='american feminists' and (term_type_id in (0,14)))
 and t.id = gt.parent_term_id order by wiki_nscount desc

select gt.*, t.* from golden_term gt, term t where child_term_id=(select top 1 id from term where name='Feminism in the United States' and (term_type_id in (0,14)))
 and t.id = gt.parent_term_id order by wiki_nscount desc

select gt.*, t.* from golden_term gt, term t where child_term_id=(select top 1 id from term where name='Feminist theory' and (term_type_id in (0,14)))
 and t.id = gt.parent_term_id order by wiki_nscount desc

select gt.*, t.* from golden_term gt, term t where child_term_id=(select top 1 id from term where name='literature' and (term_type_id in (0,14)))
 and t.id = gt.parent_term_id order by wiki_nscount desc


