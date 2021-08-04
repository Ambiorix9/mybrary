const express = require('express')
const router = express.Router()
const Author = require('../models/author');

//List all authors
router.get('/', async (req, res) => {
  let searchOptions = {}
  if(req.query.name) searchOptions.name = new RegExp(req.query.name, 'i')
  try {
    const authors = await Author.find(searchOptions)
    res.render('authors/index', {authors: authors, searchOptions: req.query})
  } catch {
    res.redirect('/')
  }
})

//Get new Author create form
router.get('/new', (req, res) => {
  res.render('authors/new', { author: new Author() })
})

//Create new author with submitted form data
router.post('/', async (req, res) => {
  const author = new Author({
    name: req.body.authorName
  })

  try {
    const newAuthor = await author.save()
    // res.redirect(`authors/:${author.id}`)
    res.redirect('authors')
  } catch {
    res.render('authors/new', {
      author: author,
      errorMessage: "Error creating author"
    })
  }

  author.save((err, author) => {
    if(err) {
    } else {
    }
  })
})


module.exports = router