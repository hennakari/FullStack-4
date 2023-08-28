const blogsRouter = require('express').Router()
//const jwt = require('jsonwebtoken')
//const userExtractor = require('../utils/middleware.userExtractor')
const middleware = require('../utils/middleware')
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.post('/', middleware.userExtractor, async (request, response) => {
  const body = request.body
  const user = await User.findById(request.user)

  let likes = body.likes
  if (!likes) {
    likes = 0
  }

  let blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: likes,
    user: user._id
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.json(savedBlog)
})

blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  if (blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  }
})

blogsRouter.delete('/:id', middleware.userExtractor, async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  const user = await User.findById(request.user)
  const blogId = blog.user.toString()

  if (user.id === blogId) {
    const deleted = await Blog.findByIdAndRemove(request.params.id)
    if (deleted) {
      response.status(200).end()
    } else {
      response.status(404).end()
    }
  } else {
    response.status(401).send({ error: 'Authentication failed' })
  }

})

blogsRouter.put('/:id', async (request, response) => {
  const { title, author, url, likes } = request.body

  const blog = await Blog.findByIdAndUpdate(request.params.id,
    { title, author, url, likes },
    { new: true, runValidators: true, context: 'query' } )
  if (blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  }
  response.json(blog)
})

module.exports = blogsRouter