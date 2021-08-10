const express = require('express')
const router = express.Router()
const Book = require('../models/book');
const Author = require('../models/author')
const path = require('path')
const fs = require('fs');
const multer = require('multer')
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']
const upload = multer({
  dest: path.join('public', Book.coverImageFolder),
  fileFilter: (req, file, cb) => {
    cb(null, imageMimeTypes.includes(file.mimetype))
  }
})

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
router.post('/', upload.single('cover'), async (req, res) => {
  const fileName = req.file != null ? req.file.filename : null
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    thumbnail: fileName,
    description: req.body.description,
  })

  try {
    const newBook = await book.save()
    // res.redirect(`books/${newBook.id}`)
    res.redirect('books')
  } catch {
    if (book.thumbnail != null) removeBookImage(book.thumbnail)
    renderBookForm(res, book, true)
  }
})

const removeBookImage = (fileName) => {
  fs.unlink(path.join('public', Book.coverImageFolder, fileName), err => {
    if (err) console.error(err)
  })
}

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


module.exports = router