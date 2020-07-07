const config = require('./utils/config')
const express = require('express')
const app = express()
const cors = require('cors')
const blogsRouter = require('./controllers/blogs')
const logger = require('./utils/logger')
const mongoose = require('mongoose')

logger.info('Connecting to MongoDB...')
mongoose
  .connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    logger.info('Sucessfully connected to MongoDb')
  })
  .catch(() => {
    logger.error('Error connecting to the database.')
  })

app.use(cors())
app.use(express.json())

app.use('/api/blogs', blogsRouter)

module.exports = app