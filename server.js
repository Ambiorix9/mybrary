if (process.env.NODE_ENV !== 'production') require('dotenv').config()
const express = require('express')
const app = express()
const expLayouts = require('express-ejs-layouts')
const mongoose = require('mongoose');
const bodyParser = require('body-parser')

const indexRoutes = require('./routes/index');
const authorsRoutes = require('./routes/authors');

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expLayouts)
app.use(express.static('public'))

app.use(bodyParser.urlencoded({extended: false, limit: '10mb'}))

app.use('/', indexRoutes)
app.use('/authors', authorsRoutes)

mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
})

const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Mongoose connection open.'))

app.listen(process.env.PORT || 3000, () => {
  console.log("Listening on:",  process.env.PORT || 3000)
})