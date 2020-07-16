const mongoose = require('mongoose')
const app = require('../app')
const supertest = require('supertest')
const helper = require('./test_helper')
const Blog = require('../models/blog')
const User = require('../models/user')

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})
  const blogObjects = helper.initialBlogs.map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)

  await User.deleteMany({})
  await api.post('/api/users').send({username: "jknack0", password: "Alphabet1", name: "Jonathon Knack"})
})

test('blogs are returned in JSON format', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')
  expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('toJSON method changes _id to id', async () => {
  const response = await api.get('/api/blogs')
  const blogs = response.body
  
  blogs.map(blog => {
    expect(blog.id).toBeDefinded
  })
})

test('a valid blog can be added', async () => {
  const loginResponse = await api.post('/api/login').send({username: 'jknack0', password: 'Alphabet1'})
  const body = loginResponse.body
  const token = body.token

  const newBlog = {
    title: 'Test blog',
    author: 'Jonathon Knack',
    url: 'https://www.github.com/jknack0',
    likes: 10
  }

  await api.post('/api/blogs')
    .set('Authorization', 'bearer ' + token)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
})

test('blog is rejected if token isn\'t provided and errors with status 401', async () => {
  const newBlog = {
    title: 'Test blog',
    author: 'Jonathon Knack',
    url: 'https://www.github.com/jknack0',
    likes: 10
  }

  await api.post('/api/blogs')
    .send(newBlog)
    .expect(401)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
})

test('votes of new blog defaults to 0', async () => {
  const loginResponse = await api.post('/api/login').send({username: 'jknack0', password: 'Alphabet1'})
  const body = loginResponse.body
  const token = body.token

  const newBlog = {
    title: 'Blog without votes',
    author: 'Ramona Quimby',
    url: 'https://www.raton.com'
  }

  await api.post('/api/blogs')
    .set('Authorization', 'bearer ' + token)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogs = await helper.blogsInDb()
  const addedBlog = blogs.find(blog => blog.title === newBlog.title)
  expect(addedBlog.likes).toBe(0)
})

test('if a new blog is missing a title and url the response is 400', async () => {
  const loginResponse = await api.post('/api/login').send({username: 'jknack0', password: 'Alphabet1'})
  const body = loginResponse.body
  const token = body.token

  const newBlog = {
    url:'https://www.derp.com'
  }
  await api.post('/api/blogs')
    .set('Authorization', 'bearer ' + token)
    .send(newBlog)
    .expect(400)
})

test('if a note can be deleted', async () => {
  const loginResponse = await api.post('/api/login').send({username: 'jknack0', password: 'Alphabet1'})
  const loginBody = loginResponse.body
  const token = loginBody.token

  const newBlog = {
    title: 'Blog without votes',
    author: 'Ramona Quimby',
    url: 'https://www.raton.com'
  }
  
  const blogResponse = await api.post('/api/blogs')
    .set('Authorization', 'bearer ' + token)
    .send(newBlog)
  const body = blogResponse.body
  const id = body.id

  const blogsAtBeggining = await helper.blogsInDb()

  await api.delete(`/api/blogs/${id}`)
    .set('Authorization', 'bearer ' + token)
    .expect(204)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(blogsAtBeggining.length - 1)

  const contents = blogsAtEnd.map(r => r.title)
  expect(contents).not.toContain(newBlog.title)
})

test('if a note can be updated', async () => {
  const blogs = await helper.blogsInDb()
  const blogToBeUpdated = blogs[0]

  const updatedBlog = {...blogToBeUpdated, likes: 50}

  await api.put(`/api/blogs/${blogToBeUpdated.id}`)
    .send(updatedBlog)
    .expect(200)

  const blogsAfterUpdate = await helper.blogsInDb()
  const blogAfterUpdate = blogsAfterUpdate.find(blog => blog.id === blogToBeUpdated.id)
  expect(blogAfterUpdate.likes).toBe(updatedBlog.likes)
})

afterAll(async () => {
  mongoose.connection.close()
})