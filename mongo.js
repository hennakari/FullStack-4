const mongoose = require('mongoose')
//const config = require('./utils/config')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url =
    `mongodb+srv://hennakari:${password}@cluster0.k0hycjh.mongodb.net/testBlogApp?
    retryWrites=true&w=majority`

mongoose.set('strictQuery',false)
mongoose.connect(url)

const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: String,
})

const Blog = mongoose.model('Blog', blogSchema)

/* const blog = new Blog({
  title: 'First class tests',
  author: 'Robert C. Martin',
  url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
  likes: 10
})

blog.save().then(result => {
  console.log('blog saved!')
  console.log(result)
  mongoose.connection.close()
}) */

Blog.find({}).then(result => {
  result.forEach(blog => {
    console.log(blog)
  })
  mongoose.connection.close()
})