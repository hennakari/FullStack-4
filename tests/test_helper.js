const Blog = require('../models/blog')

const initialBlogs = [
  {
    title: 'High-Profile Company Data Breaches 2023',
    author: 'Jessica Farrelly',
    url: 'https://www.electric.ai/blog/recent-big-company-data-breaches',
    likes: 1
  },
  {
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 10
  },
]

const nonExistingId = async () => {
  const blog = new Blog({ content: 'willremovethissoon' })
  await blog.save()
  await blog.remove()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

module.exports = {
  initialBlogs, nonExistingId, blogsInDb
}