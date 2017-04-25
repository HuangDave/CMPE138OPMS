import sys
import xml.etree.ElementTree as ET
from lxml import etree
import sqlite3
import re

# parse input file...
parser = etree.XMLParser(recover=True)
with open(sys.argv[1]) as f:
    xml = '<root>' + f.read() + '</root>'
pubs = ET.fromstring(xml, parser=parser)

# initialize an sqlite database...
db = sqlite3.connect('database.db')
cursor = db.cursor()

# setup database tables...

# create Publication table
cursor.execute('DROP TABLE IF EXISTS Publication')
cursor.execute('''CREATE TABLE Publication(
                    pub_id  INT NOT NULL UNIQUE PRIMARY KEY,
                    title   VARCHAR(200),
                    year    INT,
                    journal VARCHAR(200),
                    pages   VARCHAR(100)
                )''')

# create Author table
# The table is a relational table for authors and their publications
# pub_id's are weak references to publications written by an author.
cursor.execute('DROP TABLE IF EXISTS Author')
cursor.execute('''CREATE TABLE Author(
                    pub_id  INT NOT NULL,
                    name    VARCHAR(100) NOT NULL,
                    FOREIGN KEY (pub_id) REFERENCES Publication(pub_id) ON DELETE CASCADE
                )''')

# iterate through all publications and add them to the database...
for pub in pubs.iter('pub'):
    pub_id = int(pub.find('ID').text)
    title = pub.find('title').text
    year = pub.find('year').text
    journal = pub.find('booktitle').text
    pages = pub.find('pages').text

    cursor.execute('''INSERT INTO Publication(pub_id, title, year, journal, pages) VALUES(:pub_id, :title, :year, :journal, :pages)''', {
        'pub_id':    pub_id,
        'title':     title,
        'year':      year,
        'journal':   journal,
        'pages':     pages
    })
    for auth in pub.find('authors'):
        cursor.execute('''INSERT INTO Author(name, pub_id) VALUES(:name, :pub_id)''', {
            'name':     auth.text,
            'pub_id':  pub_id
        })

db.commit()
db.close()
