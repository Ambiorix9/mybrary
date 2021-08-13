const mongoose = require('mongoose')
const Book = require('./book')

const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
})

authorSchema.pre('remove', function(next) {
  Book.find({author: this.id}, (err, books) => {
    if (err) next(err)
    if (books.length > 0) {
      next(new Error("Can't delete this author. They have books in the DB."))
    }
    next()
  })
})

module.exports = mongoose.model('Author', authorSchema)