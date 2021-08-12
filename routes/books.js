const express = require('express')
const router = express.Router()
const Book = require('../models/book');
const Author = require('../models/author')
const path = require('path')
const fs = require('fs');

const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']

//List all Books
router.get('/', async (req, res) => {
  let query = Book.find()
  if (req.query.title) query.regex('title', new RegExp(req.query.title, 'i'))
  if (req.query.publishedBefore) query.lte('publishDate', req.query.publishedBefore)
  if (req.query.publishedAfter) query.gte('publishDate', req.query.publishedAfter)
  try {
    const books = await query.exec()
    res.render('books/index', {
      books: books,
      searchOptions: req.query
    })
  } catch {
    res.redirect('/')
  }
})

//Get new Book create form
router.get('/new', async (req, res) => {
  renderBookForm(res, new Book())
})

//Create new Book with submitted form data
router.post('/', async (req, res) => {
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    description: req.body.description,
  })

  saveCover(book, req.body.cover)

  try {
    const newBook = await book.save()
    // res.redirect(`books/${newBook.id}`)
    res.redirect('books')
  } catch {
    if (book.thumbnail != null) removeBookImage(book.thumbnail)
    renderBookForm(res, book, true)
  }
})


const renderBookForm = async (res, book, hasError = false) => {
  try {
    const authors = await Author.find({})
    const params = {authors: authors, book: book}
    if(hasError) params.errorMessage = 'Error Creating Book'
    res.render('books/new', params)
  } catch {
    res.redirect('/books')
  }
}

const saveCover = (book, coverEncoded) => {
  if (coverEncoded == null) return
  const cover =JSON.parse(coverEncoded)
  if (cover != null && imageMimeTypes.includes(cover.type)) {
    book.thumbnail = new Buffer(cover.data, 'base64')
    book.thumbnailType = cover.type
  }
}


module.exports = router