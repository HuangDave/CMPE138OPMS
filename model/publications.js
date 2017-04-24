
const db = require('../config/database.js'),
  Author = require('./authors.js'),
  Query  = require('./query.js')

module.exports = {

    // Add a publication.
    //
    // @param {Number} id           - ID of the publication
    // @param {Array}  authors      - Array consisting of the authors of the publication
    // @param {Number} year         - The year the publication was published
    // @param {String} title        - Title of the publication
    // @param {String} journal      - Title of the journal
    // @param {String} pages        - Number of pages
    //
    // @return {Promise} Returns the result in JSON.
    add: params => {
        return new Promise(function(resolve, reject) { // insert new publication to Publications table
            db.run('INSERT INTO Publication(pub_id, title, year, journal, pages) VALUES(?,?,?,?,?)',
                [params.id, params.title, params.year, params.journal, params.pages],
                err => {
                    if (err) reject(err)
                    else     resolve(params.id)
            })
        })
        .then( id => { // insert authors to Author table
            var authors = params.authors
            return Promise.all(authors.map( author => {
                return Author.add(id, author)
            }))
            .then(function() {
                return Query.Publications.queryById(params.id)
            })
            .then(result => {
                return {
                    added: true,
                    publication: result.publication
                }
            })
        })
    },

    // Update a publication's title or year
    //
    // @param {Number}     id       - ID of the publication
    // @param {Dictionary} updates  - dictionary containing updates with keys: title, year
    update: (id, updates) => {
        const title = updates.title
        const year = updates.year
        var set_stmt = 'SET '
        var where_stmt = ' WHERE pub_id='+id
        var params = []
        if (title != undefined || title != null) {
            set_stmt += 'title=?'
            params.push(title)
        }
        if (year != undefined || year != null) {
            set_stmt += 'year=?'
            params.push(year)
        }
        return new Promise( (resolve, reject) => {
            const stmt = 'UPDATE Publication '+set_stmt+where_stmt
            //console.log('Publications.update - performing update: ' + stmt)
            db.run(stmt, params, error => {
                if (error) {
                    reject(error)
                } else {
                    //console.log('successfully updated: ' + id);
                    resolve({
                        updated: true,
                        publication: {
                            pub_id: id
                        }
                    })
                }
            })
        })
    },

    // Remove a publication by its id.
    //
    // @param {Number} publication_id
    removeById: publication_id => {
        return new Promise( (resolve, reject) => {
            db.run('DELETE ' +
                   'FROM Publication ' +
                   'WHERE pub_id=?', [publication_id], err => {
                if (err) reject(err)
                else     resolve({
                    removed: true,
                    id: publication_id
                })
            })
        })
    },

    // Remove publications of a title, author, year, and/or journal
    removeBy: req => {
        const title = req.title
        const author =  req.author
        const year = req.year
        const journal = req.journal

        var deletion = 'DELETE FROM Publication WHERE '
        var params = []

        if (author != undefined || author != null) {
            deletion += 'pub_id IN (SELECT DISTINCT pub_id ' +
                             'FROM Author ' +
                             'WHERE name LIKE ?) '
            params.push('%'+author+'%')
        }
        if (title != undefined || title != null) {
            deletion += 'AND title LIKE ? '
            params.push('%'+title+'%')
        }
        if (year != undefined || year != null) {
            deletion += 'AND year=? '
            params.push(year)
        }
        if (journal != undefined || journal != null) {
            deletion += 'AND journal LIKE ? '
            params.push('%'+journal+'%')
        }

        return new Promise( (resolve, reject) => {
            db.run(deletion, params, (error, rows) => {
                if (error) reject(error)
                else       resolve({
                    removed: true
                })
            })
        })
    }
}
