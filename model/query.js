
const db = require('../config/database.js')

var Query = {

    Author: {

        // Query all authors of a given publication.
        //
        // @param {Number} id - ID of the publications
        list_authors: id => {
            return new Promise( (resolve, reject) => {
                db.all('SELECT DISTINCT name ' +
                       'FROM Author ' +
                       'WHERE pub_id=?', [id], (err, rows) => {
                    if (err) reject(err)
                    else     resolve(rows)
                })
            })
        }
    },

    Publications: {

        // Query a publication by its id.
        //
        // @param {Number} publication_id
        // @return {Promise} Returns the result in JSON.
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
                        publication: []
                    }
                }
                return Query.Author.list_authors(pub.pub_id)
                    .then( authors => {
                        pub.authors = []
                        authors.forEach( author => {
                            pub.authors.push(author.name)
                        })
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
        //
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
            if (author != undefined || author != null) {
                query = 'SELECT DISTINCT p.pub_id, title, journal, pages, year ' +
                        'FROM Publication p, Author a ' +
                        'WHERE a.pub_id = p.pub_id ' +
                            'AND a.name LIKE ? '
                params.push('%'+author+'%')
            }
            if (year != undefined || year != null) {
                var op
                switch (year_op) {
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
            if (title != undefined || title != null) {
                if (params.length > 0) { query += 'AND ' }
                query += 'title LIKE ? '
                params.push('%'+title+'%')
            }
            if (journal != undefined || journal != null) {
                if (params.length > 0) { query += 'AND ' }
                query += 'journal LIKE ? '
                params.push('%'+journal+'%')
            }
            if (sort_by != undefined || sort_by != null) {
                query += 'ORDER BY ' + sort_by + (descending ? ' DESC ' : ' ASC ')
            }
            if (limit != undefined || limit != null) {
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
                if (publications.length == 0) {
                    return Promise.resolve({
                        total_found: 0,
                        publications: []
                    })
                } else {
                    return Promise.all(publications.map( pub => {   // for each publication query its authors
                        return Query.Author.list_authors(pub.pub_id)
                            .then( authors => {
                                pub.authors = []
                                authors.forEach( author => {
                                    pub.authors.push(author.name)
                                })
                            })
                    }))
                    .then(function() {
                        return {
                            total_found: publications.length,
                            publications: publications
                        }
                    })
                }
            })
        }
    }
}
module.exports = Query
