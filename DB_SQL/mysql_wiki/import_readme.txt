C:\src\MM\DB_SQL\mysql_wiki>mysql -u dom -p
password: ***********

use wiki;

(1) run preimport, e.g.
\. preimport.sql

(2) load data, e.g.
\. c:\src\enwiki-latest-page.sql

(3) post import, i.e:
\. postimport.sql


