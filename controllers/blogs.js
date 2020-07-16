const blogsRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const body = request.body
  const token = request.token
  const decodedToken = jwt.verify(token, process.env.SECRET)

  if(!token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  if(!body.author || !body.title)
    response.status(400).json({error: 'missing author or title'})

  const user = await User.findById(decodedToken.id)

  const blog = new Blog({
    author: body.author,
    title: body.title,
    url: body.url,
    likes: body.likes || 0,
    user: user._id
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
  const id = request.params.id
  const token = request.token
  const decodedToken = jwt.verify(token, process.env.SECRET)

  const userId = decodedToken.id
  const blog = await Blog.findById(id)

  if(!token || !decodedToken.id)
    return response.status(401).json({error: 'token missing or invalid'})

  if(userId === blog.user.toString()) {
    await Blog.findByIdAndRemove(id)
    response.status(204).end()
  } else {
    response.status(401).json({error: 'this user cannot delete this blog'})
  }
  
})

blogsRouter.put('/:id', async (request, response) => {
  const updatedBlog = request.body
  const id = request.params.id
  const updatedResponse = await Blog.findByIdAndUpdate(id, updatedBlog, {new: true})
  response.json(updatedResponse)
})

module.exports = blogsRouter