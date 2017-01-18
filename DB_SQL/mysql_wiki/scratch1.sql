use wiki;
/*
set global optimizer_switch='derived_merge=OFF';
set @@optimizer_switch='derived_merge=OFF'
select * from categorylinks
*/
-- page_namespace = 0: article page
-- page_namespace = 14: category page

-- leaf: page article
select * from page where page_namespace = 0 and page_title='Anarchism' 

-- parents: categories for page article
 -- *** categories for anarchism: TODO -- need to exclude some of these "categories", e.g. "All_articles_needing_additional_references"
select * from categorylinks where cl_from = 12

	select * from page where page_namespace = 0 and page_title='Anti-capitalism'
	select * from categorylinks where cl_from = 44443