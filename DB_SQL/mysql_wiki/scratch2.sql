use wiki;

select * from page where page_title like '%Portal:Contents%' order by page_title
-- 	38413662	109	Wikipedia_Portal:Contents	...	0	0	0	0.635904170693	20170101000456	20170101011338	712909487	935	wikitext	
-- 	38355427	108	Wikipedia_Portal:Contents	...	0	0	1	0.8182057625910001	20161001193741	20161001172735	535378336	308	wikitext	
    
select * from page where page_title like '%Category:Contents%' order by page_title
-- 	35883448	10	Editnotices/Page/Category:Contents	...	0	0	0	0.140218551573	20161231131736	20161115195918	672153816	476	wikitext	

select * from page where page_namespace = 0 and page_title  like '%sql%' order by page_title
select * from categorylinks where cl_to like '%sql%'

-- select distinct cl_type from categorylinks: page, subcat, file

select page_id, page_title from page where page_namespace = 0 and page_title like 'SQ%' order by page_title

select * from page where page_namespace = 0 and page_title='Anarchism' -- namespace:0 topic page
select * from categorylinks where cl_from = 12 -- children AND parents

-- ----

select * from page where page_title like 'category:%' order by page_title
select * from categorylinks


select * from page where page_namespace = 0 and page_title='Anarchism' -- namespace:0 topic page
select * from categorylinks where cl_from = 12 -- children AND parents

select * from page where page_namespace = 14 and page_title='Political_culture' -- namespace:14 category page
select * from categorylinks where cl_from = 21722732 -- cl_type = 'subcat'

select * from page where page_namespace = 14 and page_title='Politics' 
select * from categorylinks where cl_from = 695027 

select * from page where page_namespace = 14 and page_title='Humanities' 
select * from categorylinks where cl_from = 1004110 

select * from page where page_namespace = 14 and page_title='Culture' 
select * from categorylinks where cl_from = 694861 