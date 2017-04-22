
const sqlite3 = require('sqlite3').verbose(),
           db = new sqlite3.Database('../database.db')

db.run('PRAGMA foreign_keys = ON')  // enable foreign keys for ON DELETE CASCADE

var self = {

    Author: {

        add: (id, name) => {
            return new Promise( (resolve, reject) => {
                console.log("inserting author: " + name + ' for pub_id: ' + id)
                db.run('INSERT INTO Author(name, pub_id) VALUES(?,?)', [name, id],
                    err => {
                        if (err) reject(err)
                        else {
                            console.log('Author inserted: ' + JSON.stringify({ pub_id: id, author: name }));
                            resolve()
                        }
                    })
            })
        },

        list_authors: id => {
            return new Promise( (resolve, reject) => {
                db.all("SELECT DISTINCT name FROM Author WHERE pub_id=?", [id], (err, rows) => {
                    if (err) reject(err)
                    else     resolve(rows)
                })
            })
        }
    },

    Publications: {

        // Add a publication.
        //
        // @param {Number} id           - ID of the publication
        // @param {Array}  authos       - Array consisting of the authors of the publication
        // @param {Number} year         - The year the publication was published
        // @param {String} title        - Title of the publication
        // @param {String} booktitle    - Title of the journal
        // @param {String} pages        - Number of pages
        // 
        // @return {Promise} Returns the result in JSON.
        add: params => {
            return new Promise(function(resolve, reject) { // insert new publication to Publications table
                db.run('INSERT INTO Publication(pub_id, title, year, booktitle, pages) VALUES(?,?,?,?,?)',
                    [params.id, params.title, params.year, params.booktitle, params.pages],
                    err => {
                        if (err) reject(err)
                        else     resolve(params.id)
                })
            })
            .then( id => { // insert authors to Author table
                var authors = params.authors
                return Promise.all(authors.map( author => {
                    return self.Author.add(id, author)
                }))
                .then(function() {
                    return Promise.resolve('Added publication with id: ' + params.id)
                })
            })
        },

        // Remove a publication by its id.
        //
        // @param {Number} publication_id
        remove: publication_id => {
            return new Promise( (resolve, reject) => {
                db.run('DELETE FROM Publication WHERE pub_id=?', [publication_id], err => {
                    if (err) reject(err)
                    else     resolve('Removed publication with id: ' + publication_id)
                })
            })
        },

/*
        removeWith: params => {
            return new Promise( (resolve, reject) => {
                db.run('DELETE FROM Publication WHERE pub_id IN (SELECT DISTINCT pub_id FROM Author WHERE pub_id=?)', [publication_id], err => {
                    if (err) reject(err)
                    else     resolve('Removed publication with id: ' + publication_id)
                })
            })
        },
*/
*
        // Query a publication by its id.
        //
        // @param {Number} publication_id
        // @return {Promise} Returns the result in JSON.
        queryById: publication_id => {
            return new Promise( (resolve, reject) => {
                db.all("SELECT DISTINCT * FROM Publication WHERE pub_id=?", [publication_id], (err, row) => {
                    if (err) { reject(err) }
                    else {
                        resolve(row)
                    }
                })
            })
        },

        // Query a publication with by author, year, title, and/or booktitle.
        //
        // @param {String} author       - name of the author
        // @param {Number} year         - year
        // @param {Number} year_op      - operator for comparing year: =, <, >, <=, >=
        //                                  each are represented by 0, 1, 2, 3, 4 respectively
        //                                  the = operator is used by default.
        // @param {String} title        - title of the publication
        // @param {String} booktitle    - title of the journal
        // @return {Promise} Returns an array consisting of the results in JSON format.
        queryBy: req => {
            const author = req.author
            const year = req.year
            const year_op = req.year_op
            const title = req.title
            const booktitle = req.booktitle
            var query = 'SELECT DISTINCT * FROM Publication p WHERE '
            var params = []
            if (author != undefined || author != null) {
                query = 'SELECT DISTINCT p.pub_id, year, title, booktitle, author AS authors FROM Publication p, Author a WHERE a.pub_id=p.pub_id AND a.name=? '
                params.push(author)
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
                params.push(title)
            }
            if (booktitle != undefined || booktitle != null) {
                if (params.length > 0) { query += 'AND ' }
                query += 'booktitle LIKE ? '
                params.push(booktitle)
            }
            return new Promise( (resolve, reject) => {
                db.all(query, params, (err, rows) => {
                    if (err) reject(err)
                    else     resolve(rows)
                })
            })
        }
    }
}
module.exports = self
