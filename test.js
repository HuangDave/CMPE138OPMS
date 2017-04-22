
const database = require('./database.js')

/*
database.Publications.queryBy({
    author: 'Jaehwa Park',
    year: 2000
})
.then(publications => {
    console.log(publications)
    console.log('Total found: ' + publications.length);
})
.catch(err => {
    console.error(err)
})
*/

database.Publications.add({
    id: 1123459,
    title: 'Inserted',
    year: '2017',
    booktitle: 'Insertion',
    pages: '20-25',
    authors: ['David Huang', 'John Appleseed']
})
.then(cb => {
    console.log(cb)
    return database.Publications.queryById(1123459)
})
.then(publication => {
    console.log(publication)
    return database.Author.list_authors(1123459)
})
.then(authors => {
    console.log(authors)
    return database.Publications.remove(1123459)
})
.then(cb => {
    console.log(cb)
})
.catch(err => {
    console.error(err)
})
