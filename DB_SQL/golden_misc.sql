

select * from golden_term

alter table user_url add  time_on_tab bigint null

select * from term where id = 531

select * from term_type
select * from term where term_type_id=1

select top 100 * from url  order by id desc 


select * from term where name = 'peter thiel' -- 28393,28391
select * from url_term where term_id in (28393,28391)
select distinct cal_socialtag_importance from url_term where cal_socialtag_importance is not null order by 1 desc

select * from term_matrix where term_a_id = 15401

select * from cal_entity_type