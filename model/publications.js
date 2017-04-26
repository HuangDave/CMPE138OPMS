
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
    // @return {Dictionary} Returns a dictionary containing the added publication.
    //      {boolean} updated        - True if the publication was inserted to the database.
    //      {Dictionary} publication - The added publication.
    add: params => {
        //console.log('attempting to insert publication: ' + JSON.stringify(params))
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
    //
    // @return {Dictionary} On success returns a dictionary containing the updated publication.
    //      {boolean} updated        - True if the publication was updated.
    //      {Dictionary} publication - Update publication
    update: (id, updates) => {
        const title = updates.title
        const year = updates.year
        const journal = updates.journal
        var set_stmt = 'SET '
        var where_stmt = ' WHERE pub_id='+id
        var params = []
        if (title != undefined || title != null) {
            set_stmt += 'title=?'
            params.push(title)
        }
        if (year != undefined || year != null) {
            set_stmt += (params.length > 0) ? ', year=? ' : 'year=? '
            params.push(year)
        }
        if (journal != undefined || journal != null) {
            set_stmt += (params.length > 0) ? ', journal=? ' : 'journal=? '
            params.push(journal)
        }
        return new Promise( (resolve, reject) => {
            if (title == undefined && year == undefined && journal == undefined) {
                resolve(true)
            } else {
                const stmt = 'UPDATE Publication '+set_stmt+where_stmt
                db.run(stmt, params, error => {
                    if (error) reject(error)
                    else       resolve(true)
                })
            }
        })
        .then( success => {
            const author = updates.author
            if (author.new_author != undefined) {
                if (author.old_author == undefined || author.old_author == null) {
                    return Author.add(id, author.new_author)
                        .then( function() {
                            return success
                        })
                } else {
                    return Author.update(id, author.old_author, author.new_author)
                        .then( function() {
                            return success
                        })
                }
            } else {
                return success
            }
        })
        .then( success => {
            return Query.Publications.queryById(id)
                .then( query => {
                    return {
                        updated: success,
                        publication: query.publication
                    }
                })
        })
    },

    // Remove a publication by its id.
    //
    // @param {Number} publication_id - ID of the publication to remove.
    //
    // @return {Dictionary} Returns a dictionary describing the deletion.
    //      {boolean} removed         - True if the publication with the provided id is removed.
    //      {Number}  id              - ID of the publication to remove.
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

    // Remove publications with a particular title, author, year, and/or journal
    //
    // @param {String} title    - Title of publication
    // @param {String} author   - An author of the publication
    // @param {Number} year     - Year published
    // @param {String} journal  - Journal the publication is in
    //
    // @return {Dictionary} Returns a dictionary describing the deletion.
    //      {boolean} removed         - True if publications that satifies the parameters are found and removed.
    //      {Number}  total_deletions - Total number of publications removed.
    removeBy: req => {
        const title = req.title
        const author =  req.author
        const year = req.year
        const journal = req.journal
        var deletion = 'FROM Publication WHERE '
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
            // get the number of deletions...
            db.all('SELECT COUNT(*) AS num_remove ' + deletion, params, (error, rows) => {
                if (error) reject(error)
                else       resolve(rows[0].num_remove)
            })
        })
        .then( num_remove => {
            if (num_remove == 0) {
                return Promise.resolve({
                    removed: false,
                    total_deletions: num_remove
                })
            } else {
                return new Promise( (resolve, reject) => {
                    db.all('DELETE '+deletion, params, error => {
                        if (error) reject(error)
                        else       resolve({
                                        removed: true,
                                        total_deletions: num_remove
                                    })
                    })
                })
            }
        })
    }
}
