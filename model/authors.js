
const db = require('../config/database.js'),
   Query = require('../model/query.js')

module.exports = {

    // Add an author for a publication.
    //
    // @param {Number} id   - ID of the publication.
    // @param {String} name - Full name of the author of the publciation.
    add: (id, name) => {
        return new Promise( (resolve, reject) => {
            db.run('INSERT INTO Author(name, pub_id) VALUES(?,?)', [name, id],
                err => {
                    if (err) reject(err)
                    else {
                        resolve({
                            msg: 'Author inserted',
                            author: {
                                pub_id: id,
                                name: name
                            }
                        })
                    }
                })
        })
    },

    // Update the name of an author of a publication.
    //
    //
    update: (id, old_name, new_name) => {
        return new Promise( (resolve, reject) => {
            //console.log('Author.update - performing update: ' + 'Update Author SET name=? WHERE pub_id=? AND old_name=?');
            db.run('Update Author SET name=? WHERE pub_id=? AND name=?', [new_name, id, old_name], error => {
                if (error) reject(error)
                else       resolve(id)
            })
        })
        .then( id => {
            return Query.Publications.queryById(id)
        })
        .then( publication => {
            return {
                updated: true,
                publication: publication
            }
        })
    },

    remove: (id, name) => {
        return new Promise( (resolve, reject) => {
            db.run('DELETE FROM Author WHERE pub_id=? AND name=?', [id, name], error => {
                if (error) reject(error)
                else       resolve(id)
            })
        })
        .then( id => {
            return Query.Publications.queryById(id)
        })
        .then( publication => {
            return {
                removed: true,
                name: name,
                publication: publication
            }
        })
    }
}
