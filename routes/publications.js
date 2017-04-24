
const express = require('express'),
       router = express.Router(),
        Query = require('../model/query.js'),
 Publications = require('../model/publications.js')

// The router consists of endpoints for the following
//

router

    // Add a publication
    //
    // @endpoint {POST} '/publications/'
    //
    // @body {Number} pub_id  - ID of the publication.
    // @body {String} title   - Title of the publication.
    // @body {Number} year    - Year the article was published.
    // @body {String} journal - Journal the article was published in.
    // @body {String} pages   - number of pages
    // @body {Array}  authors - Array consisting of the authors of the publication.
    //
    // @return
    .post('/add', (req, res, done) => {
        console.log('/publications/add/{pub_id} - adding publication')
        Publications.add({
                 id: req.body.pub_id,
              title: req.body.title,
               year: req.body.year,
            journal: req.body.journal,
              pages: req.body.pages,
            authors: req.body.authors
        })
        .then( publication => {
            res.status(201).json(publication)
        })
        .catch( error => {
            res.status(500).send(error)
        })
    })

    // Updates the title or year of a publication
    //
    // @endpoint {PUT} '/publications/{pub_id}'
    //
    // @params {Number} pub_id - ID of the publication.
    // @body   {String} title  - New title.
    // @body   {Number} year   - New year.
    //
    // @return
    .put('/:pub_id', (req, res, done) => {
        console.log('/publications/{pub_id} - updating publication for id: ' + req.params.pub_id)
        Publications.update(req.params.pub_id, {
            title: req.body.title,
             year: req.body.year
        })
        .then( result => {
            res.status(202).json(result)
        })
        .catch( error => {
            res.status(500).send(error)
        })
    })


    .delete('/:pub_id', (req, res, done) => {
        console.log('/publications/{pub_id} - deleting publication for id: ' + req.params.pub_id)
        Publications.removeById(req.params.pub_id)
        .then( result => {
            res.status(202).json(result)
        })
        .catch( error => {
            res.status(500).send(error)
        })
    })

    // Removes publications by title, author, year, and/or journal.
    // Each given parameter must be exacted for the desired publication(s) to be removed.
    //
    // @endpoint /publications/
    //
    // @body {String} title   - Title of the publication.
    // @body {String} author  - Author of the publication.
    // @body {Number} year    - Year of the publication.
    // @body {String} journal - Title of the journal the article was published in.
    .delete('/', (req, res, done) => {
        console.log('/publications/ - deleting publication ')
        Publications.removeBy({
              title: req.body.title,
             author: req.body.author,
               year: req.body.year,
            journal: req.body.journal
        })
        .then( result => {
            res.status(202).json(result)
        })
        .catch( error => {
            res.status(500).send(error)
        })
    })

    // Query a publication by its ID
    //
    // @endpoint /publications/{pub_id}
    //
    // @params {Number} pub_id - ID of the publication.
    //
    .get('/id/:pub_id', (req, res, done) => {
        console.log('/publications/{pub_id} - querying publication for id: ' + req.params.pub_id)
        Query.Publications.queryById(req.params.pub_id)
        .then( publication => {
            res.status(200).json(publication)
        })
        .catch( error => {
            console.error(error);
            res.status(500).send(error)
        })
    })

    // Query publications by title, year, journal, and/or author
    // The results can optionally be sorted by title, year, journal, or author in ascending or descending order.
    //
    // @endpoint {GET} /publications/search?title?={title}&year?={year}&year_op?={year_op}
    //                      &journal?={journal}&author?={author}&sort_by?={sort_by}&descending?={descending}
    //
    // @param {String} author       - name of the author
    // @param {Number} year         - year
    // @param {Number} year_op      - operator for comparing year: =, <, >, <=, >=
    //                                  each are represented by 0, 1, 2, 3, 4 respectively
    //                                  the = operator is used by default.
    // @param {String} title        - title of the publication
    // @param {String} journal      - title of the journal
    //
    // @param {String} sort_by      - Specifies if the result should be sorted by year, journal, author, or title.
    //                                  By default, results will be sorted by pub_id
    // @param {Bool}   descending   - Specifies if the sorting order should be ascending or descending.
    //                                  By default, results are sorted in ascending order.
    //
    .get('/search?:title?:year?:year_op?:journal?:author?:sort_by?:descending?', (req, res, done) => {
        console.log('/publications/search - querying publication ')
        Query.Publications.queryBy({
              title: req.query.title,
               year: req.query.year,
            year_op: req.query.year_op,
            journal: req.query.journal,
             author: req.query.author,
            sort_by: req.query.sort_by,
         descending: req.query.descending,
              limit: req.query.limit
        })
        .then( results => {
            res.status(200).json(results)
        })
        .catch( error => {
            res.status(500).send(error)
        })
    })

module.exports = router
