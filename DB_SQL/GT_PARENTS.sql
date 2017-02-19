select gtp.*, ct.name, pt.name
from gt_parent gtp, term ct, term pt
where gtp.child_term_id = ct.id and gtp.parent_term_id = pt.id
order by gtp.child_term_id, gtp.S_norm desc