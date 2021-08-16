const express = require('express')
const router = express.Router()
const Book = require('../models/book');
const Author = require('../models/author')


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
    res.redirect(`books/${newBook.id}`)
  } catch {
    if (book.thumbnail != null) removeBookImage(book.thumbnail)
    renderBookForm(res, book, true)
  }
})

//Update Book with submitted form data
router.put('/:id', async (req, res) => {
  let book
  try {
    book = await Book.findById(req.params.id)
    book.title = req.body.title
    book.description = req.body.description
    book.publishDate = new Date(req.body.publishDate)
    book.pageCount = req.body.pageCount
    book.author = req.body.author
    if(req.body.cover) saveCover(book, req.body.cover)
    await book.save()
    res.redirect(`/books/${book.id}`)
  } catch {
    if (book != null) renderEditForm(res, book, true)
      else redirect('/')
  }
})

//Delete route
router.delete('/:id', async (req, res) => {
  let book
  try {
    book = await Book.findById(req.params.id)
    await book.remove()
    res.redirect('/books')
  } catch {
    if(book != null) {
      res.render('books/show', {
        book: book,
        errorMessage: 'Could not delete book!'
      })
    } else {
      res.redirect('/')
    }
  }
})

//Show specific book by id
router.get('/:id', async (req,res) => {
  try {
    const book = await Book.findById(req.params.id).populate('author').exec()
    res.render('books/show', {book: book})
  } catch (error) {
    res.redirect('/')
  }
})

//Edit book - get form
router.get('/:id/edit', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
    renderEditForm(res, book)
  } catch {
    res.render('/')
  }
})

const renderFormPage = async (res, book, form, hasError = false) => {
  try {
    const authors = await Author.find({})
    const params = {authors: authors, book: book}
    if(hasError) params.errorMessage = `Error Processing ${form} Book`
    res.render(`books/${form}`, params)
  } catch {
    res.redirect('/books')
  }
}

const renderEditForm = async (res, book, hasError = false) => {
  renderFormPage(res, book, "edit" ,hasError)
}

const renderBookForm = async (res, book, hasError = false) => {
  renderFormPage(res, book, "new" ,hasError)
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