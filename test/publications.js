
const assert = require('chai').assert,
       Query = require('../model/query.js'),
Publications = require('../model/publications.js'),
     Authors = require('../model/authors.js')

describe('Publications', function() {

    const pub_id = 1123459

    const test_pub = {
             id: pub_id,
          title: 'Inserted',
           year: '2017',
        journal: 'Insertion',
          pages: '20-25',
        authors: ['David Huang', 'John Appleseed']
    }

    it('1 - should be able to insert a new a publication.', done => {
        Publications.add(test_pub)
        .then( result => {
            assert(result.added)
            const pub = result.publication
            assert(pub.pub_id == pub_id)
            assert(pub.title == test_pub.title)
            assert(pub.journal == test_pub.journal)
            assert(pub.pages == test_pub.pages)
            //console.log(query)
            done()
        })
        .catch( error => {
            throw new Error(error)
        })
    })

    it('2 - should be able to query all publications by a particular author by title in descending order.', done => {
        Query.Publications.queryBy({
            author: 'Sharat Chikkerur',
            sort_by: 'title',
            descending: true
        })
        .then( result => {
            assert(result.total_found == 9)
            for (var i = 0; i < result.total_found ; i++) {
                pub = result.publications[i]
                switch (i) {
                    case 0: assert(pub.pub_id == 84); break
                    case 1: assert(pub.pub_id == 70); break
                    case 2: assert(pub.pub_id == 34); break
                    case 3: assert(pub.pub_id == 6); break
                    case 4: assert(pub.pub_id == 112); break
                    case 5: assert(pub.pub_id == 31); break
                    case 6: assert(pub.pub_id == 2); break
                    case 7: assert(pub.pub_id == 36); break
                    case 8: assert(pub.pub_id == 8); break
                    default: break
                }
            }
            done()
        })
        .catch( error => {
            throw new Error(error)
        })
    })

    it('3 - should query all publications in a particular year.', done => {
        Query.Publications.queryBy({
            year: 2004,
            sort_by: 'journal',
            descending: true,
            limit: 5
        })
        .then( result => {
            assert(result.total_found == 5)
            assert(result.publications[0].pub_id == 10896)
            assert(result.publications[1].pub_id == 37443)
            assert(result.publications[2].pub_id == 38536)
            assert(result.publications[3].pub_id == 41700)
            assert(result.publications[4].pub_id == 53467)
            done()
        })
        .catch( error => {
            throw new Error(error)
        })
    })

    it('6 - should be able to query all publications with a combination of ' +
        'the author, year, journal, and title constraints.', done => {
        Query.Publications.queryBy({
            title: 'recog',
            year: 2000,
            year_op: 1,
            journal: 'CVPR',
            author: 'Venu Govindaraju'
        })
        .then( result => {
            assert(result.total_found == 3)
            assert(result.publications[0].pub_id == 11)
            assert(result.publications[1].pub_id == 12)
            assert(result.publications[2].pub_id == 13)
            done()
        })
        .catch( error => {
            throw new Error(error)
        })
    })

    it('7 - should be able to delete a publication of a particular author, year, journal.', done => {
        Publications.removeBy({
            author: 'Venu Govindaraju',
            year: 2004,
            journal: 'CBMS'
        })
        .then( result => {
            assert(result.removed)
            done()
        })
        .catch( error => {
            throw new Error(error)
        })
    })

    it('8 - should be able to delete all records for a given author.', done => {
        Publications.removeBy({
            author: 'Jaehwa Park'
        })
        .then( result => {
            assert(result.removed)
            done()
        })
        .catch( error => {
            throw new Error(error)
        })
    })

    it('9 - should be able to change the name of an author or journal', done => {
        Authors.update(pub_id, "John Appleseed", 'Adam Appleseed')
        .then( result => {
            //console.log('updated author for publication: ' + JSON.stringify(result.publication))
            assert(result.updated)
            done()
        })
        .catch( error => {
            throw new Error(error)
        })
    })

    it('10 - should be able to update a publications title or year', done => {
        const new_title = 'Just an Article'
        Publications.update(pub_id, {
            title: new_title
        })
        .then( result => {
            assert(result.updated)
            return Query.Publications.queryById(result.publication.pub_id)
        })
        .then( result => {
            //console.log('updated pub: ' + JSON.stringify(publication));
            assert(result.publication.pub_id == pub_id)
            assert(result.publication.title == new_title)
            done()
        })
        .catch( error => {
            throw new Error(error)
        })
    })

    it('should be able to delete a publication', done => {
        Publications.removeById(pub_id)
        .then( success => {
            assert(success.removed)
            //console.log(success)
            done()
        })
        .catch( error => {
            throw new Error(error)
        })
    })
})
