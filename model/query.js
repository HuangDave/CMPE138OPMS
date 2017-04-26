
const db = require('../config/database.js')

var Query = {

    Author: {

        // Query all authors of a given publication.
        //
        // @param {Number} id - ID of the publications
        //
        // @return {Array} Array consisting of all the authors of the publication.
        list_authors: id => {
            return new Promise( (resolve, reject) => {
                db.all('SELECT DISTINCT name ' +
                       'FROM Author ' +
                       'WHERE pub_id=?', [id], (err, rows) => {
                    if (err) reject(err)
                    else     resolve(rows)
                })
            })
            .then( rows => {
                var authors = []
                rows.forEach( auth => {
                    authors.push(auth.name)
                })
                return authors
            })
        }
    },

    Publications: {

        // Query a publication by its id.
        //
        // @param {Number} publication_id
        //
        // @return {Dictionary}
        //      {Number}     total_found - Total number of publications queried.
        //      {Dictionary} publication
        queryById: publication_id => {
            return new Promise( (resolve, reject) => {
                db.all('SELECT DISTINCT * ' +
                       'FROM Publication ' +
                       'WHERE pub_id=?', [publication_id], (err, row) => {
                    if (err) { reject(err) }
                    else if (row.length == 0) {
                        resolve(null)
                    } else {
                        resolve(row[0])
                    }
                })
            })
            .then( pub => {
                if (pub == null) {
                    return {
                        total_found: 0,
                        publication: null
                    }
                }
                // query all authors of the publication and add them to the output...
                return Query.Author.list_authors(pub.pub_id)
                    .then( authors => {
                        pub.authors = authors
                        return {
                            total_found: 1,
                            publication: pub
                        }
                    })
            })
        },

        // Query a publication with by author, year, title, and/or journal.
        // The results can also be specified to be sorted by year, journal, author,
        // or title in ascending or descending order.
        //
        // @param {String} author       - name of the author
        // @param {Number} year         - year
        // @param {Number} year_op      - operator for comparing year: =, <, >, <=, >=
        //                                  each are represented by 0, 1, 2, 3, 4 respectively
        //                                  the = operator is used by default.
        // @param {String} title        - title of the publication
        // @param {String} journal      - title of the journal
        // @param {String} sort_by      - Specifies if the result should be sorted by year, journal, author, or title.
        //                                  By default, results will be sorted by pub_id
        // @param {Bool}   descending   - Specifies if the sorting order should be ascending or descending.
        //                                  By default, results are sorted in ascending order.
        //
        // @return {Promise} Returns an array consisting of the results in JSON format.
        queryBy: req => {
            const author = req.author
            const year = req.year
            const year_op = req.year_op
            const title = req.title
            const journal = req.journal
            const sort_by = req.sort_by
            const descending = req.descending ? req.descending : false
            const limit = req.limit

            var query = 'SELECT DISTINCT * ' +
                        'FROM Publication p ' +
                        'WHERE '
            var params = []
            if (author != undefined || author != null) {        // If the author parameter is supplied, adjust the query statement to also include the Author table.
                query = 'SELECT DISTINCT p.pub_id, title, journal, pages, year ' +
                        'FROM Publication p, Author a ' +
                        'WHERE a.pub_id = p.pub_id ' +
                            'AND a.name LIKE ? '
                params.push('%'+author+'%')
            }
            if (year != undefined || year != null) {            // If year parameter is supplied, include it in the query
                var year_op_int                                 // convert input to an int if its a string ex. '0' to 0
                if (year_op != undefined || year_op != null) {
                    year_op_int = (typeof year_op === 'string' ? parseInt(year_op) : year_op)
                } else {
                    year_op_int = 0
                }
                var op                                          // Check if a operator for comparing years is also included
                switch (year_op_int) {                          // If none is included, the default operator is =, or 0
                    case 1: op = '<? ';  break;
                    case 2: op = '>? ';  break;
                    case 3: op = '<=? '; break;
                    case 4: op = '>=? '; break;
                    default:op = '=? ';  break;

                }
                if (params.length > 0) { query += 'AND ' }
                query += 'year'+op
                params.push(year)
            }
            if (title != undefined || title != null) {          // If title parameter is supplied, include it in the query
                if (params.length > 0) { query += 'AND ' }
                query += 'title LIKE ? '
                params.push('%'+title+'%')
            }
            if (journal != undefined || journal != null) {      // If journal parameter is supplied, include it in the query
                if (params.length > 0) { query += 'AND ' }
                query += 'journal LIKE ? '
                params.push('%'+journal+'%')
            }
            if (sort_by != undefined || sort_by != null) {      // If sorting options are supplied, include it in the query
                query += 'ORDER BY ' + sort_by + (descending ? ' DESC ' : ' ASC ')
            }
            if (limit != undefined || limit != null) {          // If a limit is supplied, include it in the query
                query += 'LIMIT ? '
                params.push(limit)
            }

            return new Promise( (resolve, reject) => {          // query the list of publications
                    db.all(query, params, (err, rows) => {
                        if (err) reject(error)
                        else     resolve(rows)
                    })
                }).
                then( publications => {
                    return Promise.all(publications.map( pub => {   // for each publication query its authors
                        return Query.Author.list_authors(pub.pub_id)
                            .then( authors => {
                                pub.authors = authors
                            })
                    }))
                    .then(function() {
                        return publications
                    })
                })
                .then( publications => {
                    return {
                        total_found: publications.length,
                        publications: publications
                    }
                })
        }
    }
}
module.exports = Query
