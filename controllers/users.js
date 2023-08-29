const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')


usersRouter.get('/', async (request, response) => {
  const users = await User
    .find({}).populate('blogs', { url: 1, title: 1, author: 1 })
  response.json(users)
})


usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body

  if (password) {
    if (password.length < 3) {
      response.status(406).send({ error: 'password needs to be longer than 3 characters' })
    } else {
      const saltRounds = 10
      const passwordHash = await bcrypt.hash(password, saltRounds)

      const user = new User({
        username,
        name,
        passwordHash,
      })

      const savedUser = await user.save()

      response.status(201).json(savedUser)
    }
  } else {
    response.status(400).send({ error: 'User validation failed: password: Path `password` is required.' })
  }
})

module.exports = usersRouter