const mongoose = require('mongoose')
const path = require('path');

const coverImageFolder = 'uploads/bookCovers'

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String},
  publishDate: { type: Date, required: true },
  pageCount: { type: Number, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
  thumbnail: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'Author', required: true }

})

bookSchema.virtual('coverImagePath').get(function() {
  if(this.thumbnail != null) {
    return path.join('/', coverImageFolder, this.thumbnail)
  }
})

module.exports = mongoose.model('Book', bookSchema)
module.exports.coverImageFolder = coverImageFolder