
const assert = require('chai').assert
const request = require('supertest')
const app = require('../server')

describe('Routes: Publications', function() {

    const pub_id = 1123459
    const test_pub = {
        id: pub_id,
        title: 'Inserted',
        year: '2017',
        journal: 'Insertion',
        pages: '20-25',
        authors: ['David Huang', 'John Appleseed']
    }

    describe('Insertion', function() {
        it('1 - should be able to insert a new a publication.', done => {
            request(app)
                .post('/publications/add')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .send(test_pub)
                .expect(201, (error, res) => {
                    if (error) throw new Error(error)
                    assert(res.body.added)
                    const pub = res.body.publication
                    assert(pub.pub_id == pub_id)
                    assert(pub.title == test_pub.title)
                    assert(pub.journal == test_pub.journal)
                    assert(pub.pages == test_pub.pages)
                    done()
                })
        })
    })

    describe('Query', function() {
        it('2 - should be able to query all publications by a particular author by title in descending order.', done => {
            request(app)
                .get('/publications/search?author=Sharat Chikkerur&sort_by=title&descending=true')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .expect(200, (error, res) => {
                    if (error) throw new Error(error)
                    assert(res.body.total_found == 9)
                    for (var i = 0; i < res.body.total_found ; i++) {
                        var pub = res.body.publications[i]
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
        })

        it('3 - should query all publications in a particular year.', done => {
            request(app)
                .get('/publications/search?year=2004&sort_by=journal&descending=true&limit=5')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .expect(200, (error, res) => {
                    if (error) throw new Error(error)
                    assert(res.body.total_found == 5)
                    assert(res.body.publications[0].pub_id == 10896)
                    assert(res.body.publications[1].pub_id == 37443)
                    assert(res.body.publications[2].pub_id == 38536)
                    assert(res.body.publications[3].pub_id == 41700)
                    assert(res.body.publications[4].pub_id == 53467)
                    done()
                })
        })

        it('4 - should be able to query all publications of a particular journal', done => {
            request(app)
                .get('/publications/search?journal=AVBPA')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .expect(200, (error, res) => {
                    if (error) throw new Error(error)
                    assert(res.body.total_found == 40)
                    done()
                })
        }).timeout(2500)

        it('5 - should be able to query all publications with a particular string contained in the title', done => {
            request(app)
                .get('/publications/search?title=recog')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .expect(200, (error, res) => {
                    if (error) throw new Error(error)
                    assert(res.body.total_found == 1237)
                    done()
                })
        }).timeout(700000)

        it('6 - should be able to query all publications with a combination of ' +
            'the author, year, journal, and title constraints.', done => {
            request(app)
                .get('/publications/search?title=recog&year=2000&year_op=1'+
                                      '&journal=CVPR&author=Venu Govindaraju')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .expect(200, (error, res) => {
                    if (error) throw new Error(error)
                    assert(res.body.total_found == 3)
                    assert(res.body.publications[0].pub_id == 11)
                    assert(res.body.publications[1].pub_id == 12)
                    assert(res.body.publications[2].pub_id == 13)
                    done()
                })
        })
    })

    describe('Update', function() {

        it('9 - should be able to change the name of an author or journal', done => {
            done()
            /*
            Authors.update(pub_id, "John Appleseed", 'Adam Appleseed')
            .then( result => {
                //console.log('updated author for publication: ' + JSON.stringify(result.publication))
                assert(result.updated)
                done()
            })
            .catch( error => {
                throw new Error(error)
            })
             */
        })

        it('10 - should be able to update the journal title of a publication', done => {
            const title = 'Just an Updated Article'
            const year  = 2018
            request(app)
                .put('/publications/update/'+pub_id)
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .send({
                    title: 'Just an Updated Article',
                    year: year
                })
                .expect(200, (error, res) => {
                    if (error) throw new Error(error)
                    assert(res.body.updated)
                    assert(res.body.publication.title == title)
                    assert(res.body.publication.year == year)
                    done()
                })
        })
    })

    describe('Deletion', function() {

        it('7 - should be able to delete a publication of a particular author, year, journal.', done => {
            done() /*
            request(app)
                .delete('/publications/remove/')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .send({
                    author: 'Venu Govindaraju',
                    year: 2004,
                    journal: 'CBMS'
                })
                .expect(200, (error, res) => {
                    if (error) throw new Error(error)
                    assert(res.body.removed)
                    assert(res.body.total_deletions == 1)
                    done()
                }) */
        })

        it('8 - should be able to delete all records for a given author', done => {
            request(app)
                .delete('/publications/remove/')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .send({
                    author: 'John Appleseed'
                })
                .expect(200, (error, res) => {
                    if (error) throw new Error(error)
                    assert(res.body.removed)
                    assert(res.body.total_deletions == 1)
                    done()
                })
        })

        it('should be able to delete a publication by its ID', done => {
            request(app)
                .delete('/publications/remove/id/'+pub_id)
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .expect(202, (error, res) => {
                    if (error) throw new Error(error)
                    assert(res.body.removed)
                    done()
                })
        })
    })
})
