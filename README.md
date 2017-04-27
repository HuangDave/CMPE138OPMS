**Overview**
---
OPMS, Online Publication Management System, is a web service that manages real scientific publications in Computer
Engineering and allows users to add, update, remove, or query publications from the database. The format of the results can be specified to be either returned in JSON or XML.

**Web Service**
---

**Installation**

The web service can be accessed [here](https://cmpe138opms.herokuapp.com/).
Ensure [Node](https://nodejs.org/en/download/) and [npm](https://www.npmjs.com/) are installed.

Alternatively, the web service can be run locally on port 8080, go to the directory (ensure [Node](https://nodejs.org/en/download/) and [npm](https://www.npmjs.com/) are installed):
~~~
npm update
npm start
~~~

**RESTful Endpoints**

Add a publication:
~~~
{POST} /publications/add
~~~

Update a publication’s title, year, journal, and/or author name:
~~~
{PUT} /publications/update/{pub_id}
~~~

Remove a publication by ID:
~~~
{DELETE} /publications/remove/id/{pub_id}
~~~

Remove a publication by title, year, author, and/or journal:
~~~
{DELETE} /publications/remove
~~~

Query a publication by its ID:
~~~
{GET} /publication/id/{pub_id}
~~~

Query publications by by title, year, journal, and/or author name, result can be sorted by title, journal, year, or author name. Additionally a subset of the results can be requested:
~~~
{GET} /publications/search?title?={title}&year?={year}&year_op?={year_op}&journal?={journal}&author?={author}&sort_by?={sort_by}
~~~

Examples:
--

Query publications with 'recog' in the title, from the year 2000, published in the journal CVPR, written by Venu Govindaraju and get the result as XML:
~~~
curl -X GET \
  'https://cmpe138opms.herokuapp.com/publications/search?title=recog&year=2000&year_op=1&journal=CVPR&author=Venu%20Govindaraju' \
  -H 'content-type: text/xml' \
  ~~~

Remove publications by John Appleseed:
~~~
curl -X DELETE \
  https://cmpe138opms.herokuapp.com/publications/remove/ \
  -H 'content-type: application/x-www-form-urlencoded' \
  -d author=John%20Appleseed
  ~~~

Test:
--
~~~
npm test
~~~
