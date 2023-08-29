const Blog = require('../models/blog')
const User = require('../models/user')
const app = require('../app')
const supertest = require('supertest')
const api = supertest(app)

const initialBlogs = [
  {
    title: 'High-Profile Company Data Breaches 2023',
    author: 'Jessica Farrelly',
    url: 'https://www.electric.ai/blog/recent-big-company-data-breaches',
    likes: 1,
    user: {
      _id: '64ec7807c97c5a2d6ad750aa',
      username: 'hkari',
      name: 'Henna Kari'
    },
  },
  {
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 10,
    user: {
      _id: '64ec7806c97c5a2d6ad750a4',
      username: 'root',
      name: 'Root'
    },
  },
]


const nonExistingId = async () => {
  const blog = new Blog({
    title: 'Test purposes only',
    author: 'Testing Guru',
    url: 'noaddressgiven'
  })
  await blog.save()
  await blog.remove()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

const userLogin = async () => {
  const user = {
    username: 'hkari',
    password: 'salasana',
  }

  const userinfo = await api
    .post('/api/login')
    .send(user)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  return userinfo

}

module.exports = {
  initialBlogs,
  nonExistingId,
  blogsInDb,
  usersInDb,
  userLogin
}