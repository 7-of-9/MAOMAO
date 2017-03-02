select top 100 * from gt_parent

select max(S) from gt_parent where is_topic=1 -- +2.4
select min(S) from gt_parent where is_topic=0 -- -0.03

-- well maintained terms
select max(s) from gt_parent where is_topic=1 child_term_id=6833042 -- ian hislop

