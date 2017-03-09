 -- delete from url_parent_term where url_title_topic=1

 --
 -- make dev term [term] ident seed LARGE (so no id conflicts w/ prod) -- done
 -- make url_title_terms is_topic=true (so they sync to prod as part of topic tree sync script) -- done 
 --
 -- dbcc checkident ([term], RESEED, 8000000000000000000)
 dbcc checkident ([term], NORESEED) -- ok, done on dev: 8000000000000000000
 
 select * from term where term_type_id in (100,101) -- waiting to populate...

 -- TODO: check COPY_TOPIC_TREE works on url_title_terms...
 -- TODO: check inclusion of url_title_terms in CategorizeUrl

 -- sync all prod urls > dev
 --   delete url_title_term (done)
 --   delete wiki terms added

-- clean up new terms added in dev:
-- select max(id) from term where term_type_id in (0,14) -- 12837446 VS. PROD 12834028
-- delete from url_term where term_id in (select [id] from term where [id] > 12834028)
-- delete from url_parent_term where term_id in (select [id] from term where [id] > 12834028)
-- delete from golden_term where child_term_id in (select [id] from term where [id] > 12834028)
-- delete from golden_term where parent_term_id in (select [id] from term where [id] > 12834028)
-- delete from [term] where [id] > 12834028



