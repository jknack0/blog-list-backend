const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
  const users = await User.find({})
  response.json(users)
})

usersRouter.post('', async (request, response) => {
  const body = request.body
  const saltRounds = 10
  const passwordHash = body.password ? await bcrypt.hash(body.password, saltRounds) : 0

  if(!body.username || !body.password)
    return response.status(400).json({error: 'missing username or password'})

  if(body.username.length < 3 || body.password.length < 3)
    return response.status(400).json({error: 'username and password must be longer than 3 characters'})

  const newUser = new User({
    username: body.username,
    name: body.name,
    passwordHash: passwordHash
  })

  const savedUser = await newUser.save()
  response.json(savedUser)
})

module.exports = usersRouter
