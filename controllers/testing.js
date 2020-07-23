const testingRouter = require('express').Router()
const User = require('../models/user')
const Blogs = require('../models/blog')

testingRouter.post('/reset', async (request, response) => {
  await User.deleteMany({})
  await Blogs.deleteMany({})

  response.status(204).end()
})

module.exports = testingRouter