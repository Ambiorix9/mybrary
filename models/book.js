const mongoose = require('mongoose')
const path = require('path');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String},
  publishDate: { type: Date, required: true },
  pageCount: { type: Number, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
  thumbnail: { type: Buffer, required: true },
  thumbnailType: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'Author', required: true }

})

bookSchema.virtual('coverImagePath').get(function() {
  if(this.thumbnail != null && this.thumbnailType != null) {
    return `data:${this.thumbnailType};charset=utf-8;base64,${this.thumbnail.toString('base64')}`
  }
})

module.exports = mongoose.model('Book', bookSchema)
