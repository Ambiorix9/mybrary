const express = require('express')
const router = express.Router()
const Author = require('../models/author');
const Book = require('../models/book');

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


//Edit author
router.get('/:id/edit', async (req, res) => {
  try {
    const author = await Author.findById(req.params.id)
    res.render('authors/edit', { author: author })
    
  } catch {
    res.redirect('/authors')
  }
})

//Update author
router.put('/:id', async (req, res) => {
  let author
  try {
    author = await Author.findById(req.params.id)
    author.name = req.body.authorName
    await author.save()
    res.redirect(`/authors/:${author.id}`)
  } catch {
    if (author == null ) res.redirect('/')
    res.render('authors/edit', {
      author: author,
      errorMessage: "Error updating author"
    })
  }
})

//Delete author
router.delete('/:id', async (req, res) => {
  try {
    const author = await Author.findById(req.params.id)
    await author.remove()
    res.redirect(`/authors`)
  } catch {
    res.redirect(`/authors/${req.params.id}`)
  }
})

//Get new Author create form
router.get('/new', (req, res) => {
  res.render('authors/new', { author: new Author() })
})

//Show single author (must come after new Author route)
router.get('/:id', async (req, res) => {
  try {
    const author = await Author.findById(req.params.id)
    const books = await Book.find({author: author.id}).limit(6).exec()
    res.render('authors/show', {author: author, booksByAuthor: books})
  } catch {
    res.redirect('/')
  }
})


//Create new author with submitted form data
router.post('/', async (req, res) => {
  const author = new Author({
    name: req.body.authorName
  })

  try {
    const newAuthor = await author.save()
    res.redirect(`authors/:${author.id}`)
  } catch {
    res.render('authors/new', {
      author: author,
      errorMessage: "Error creating author"
    })
  }
})


module.exports = router