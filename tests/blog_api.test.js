const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const Blog = require('../models/blog')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const api = supertest(app)

describe('when there is initially one user at db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('users are returned as json', async () => {
    await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all users are returned', async () => {
    const response = await api.get('/api/users')

    expect(response.body).toHaveLength(1)
  })

  test('a specific user is within the returned blogs', async () => {
    const response = await api.get('/api/users')

    const usernames = response.body.map(r => r.username)

    expect(usernames).toContain(
      'root'
    )
  })

})

describe('adding a new user', () => {
  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'hkari',
      name: 'Henna Kari',
      password: 'salasana',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('expected `username` to be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('creation fails if username is too short', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'hk',
      name: 'Henna Kari',
      password: 'salasana',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('is shorter than the minimum allowed length (3)')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)

  })

  test('creation fails if password is too short', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'hkari',
      name: 'Henna Kari',
      password: 'hk',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(406)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('password needs to be longer than 3 characters')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)

  })

  test('creation fails if username is missing', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      name: 'Henna Kari',
      password: 'salasana',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('username: Path `username` is required')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)

  })

  test('creation fails if password is missing', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'hkari',
      name: 'Henna Kari',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('password: Path `password` is required')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)

  })
})

describe('when there are initially some blogs saved', () => {

  beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
  })

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)

  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('a specific blog is within the returned blogs', async () => {
    const response = await api.get('/api/blogs')

    const titles = response.body.map(r => r.title)

    expect(titles).toContain(
      'High-Profile Company Data Breaches 2023'
    )
  })
})

describe('addition of a new blog', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
  })

  test('a valid blog can be added', async () => {
    const newBlog = {
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
      likes: 5
    }

    const userinfo = await helper.userLogin()
    const token = userinfo.body.token

    await api
      .post('/api/blogs')
      .set('Authorization' ,`bearer ${token}`)
      .send(newBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const titles = blogsAtEnd.map(n => n.title)

    expect(titles).toContain(
      'Go To Statement Considered Harmful'
    )
  })

  test('addition fails with statuscode 401 if token is missing from request', async () => {
    const newBlog = {
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
      likes: 5
    }

    const token = ''

    await api
      .post('/api/blogs')
      .set('Authorization' ,`bearer ${token}`)
      .send(newBlog)
      .expect(401)
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })


  test('blog without likes is added with 0 likes', async () => {
    const newBlog = {
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    }

    const userinfo = await helper.userLogin()
    const token = userinfo.body.token

    await api
      .post('/api/blogs')
      .set('Authorization' ,`bearer ${token}`)
      .send(newBlog)
      .expect(200)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const likes = blogsAtEnd.map(n => n.likes)
    expect(likes).toHaveLength(helper.initialBlogs.length+1)

    for (let i in likes) {
      expect(likes[i]).toBeDefined()
    }
  })


  test('blog without title is not added', async () => {
    const newBlog = {
      author: 'Edsger W. Dijkstra',
      url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
      likes: 5
    }

    const userinfo = await helper.userLogin()
    const token = userinfo.body.token

    await api
      .post('/api/blogs')
      .set('Authorization' ,`bearer ${token}`)
      .send(newBlog)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })

  test('blog without url is not added', async () => {
    const newBlog = {
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      likes: 5
    }

    const userinfo = await helper.userLogin()
    const token = userinfo.body.token

    await api
      .post('/api/blogs')
      .set('Authorization' ,`bearer ${token}`)
      .send(newBlog)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })

})

describe('viewing a specific blog', () => {

  test('a specific blog can be viewed', async () => {
    const blogsAtStart = await helper.blogsInDb()

    const blogToView = blogsAtStart[0]

    let blogForTestComparison = blogToView
    blogForTestComparison.user = blogToView.user.toString()

    const resultBlog = await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(resultBlog.body).toEqual(blogForTestComparison)
  })

  test('view fails with statuscode 404 if id is valid but does not exist', async () => {
    const validNonexistingId = '64c887fb4024679830ae3410'

    await api
      .get(`/api/blogs/${validNonexistingId}`)
      .expect(404)
  })

  test('view fails with statuscode 400 id is invalid', async () => {
    const invalidId = '64c887fb4024679830'

    await api
      .get(`/api/blogs/${invalidId}`)
      .expect(400)
  })

})

describe('deleting a blog', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
  })

  test('a blog can be deleted', async () => {

    const userinfo = await helper.userLogin()
    const token = userinfo.body.token
    const decodedToken = jwt.verify(token, process.env.SECRET)

    const newBlog = {
      title: 'New test blog to be deleted',
      author: 'Testing Guru',
      url: 'http://www',
      likes: 1,
      user: {
        _id: decodedToken.id,
        username: userinfo.body.username,
        name: userinfo.body.name
      }
    }

    const testBlogAdded = await api
      .post('/api/blogs')
      .set('Authorization' ,`bearer ${token}`)
      .send(newBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const blogToDelete = testBlogAdded.body.id

    await api
      .delete(`/api/blogs/${blogToDelete}`)
      .set('Authorization' ,`bearer ${token}`)
      .expect(200)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(
      helper.initialBlogs.length
    )

    const titles = blogsAtEnd.map(r => r.title)

    expect(titles).not.toContain(blogToDelete.title)
  })

  test('delete fails with statuscode 404 if id is valid but does not exist', async () => {
    const validNonexistingId = '64c887fb4024679830ae3410'

    const userinfo = await helper.userLogin()
    const token = userinfo.body.token

    await api
      .delete(`/api/blogs/${validNonexistingId}`)
      .set('Authorization' ,`bearer ${token}`)
      .expect(404)
  })

  test('delete fails with statuscode 400 id is invalid', async () => {
    const invalidId = '64c887fb4024679830'

    const userinfo = await helper.userLogin()
    const token = userinfo.body.token

    await api
      .delete(`/api/blogs/${invalidId}`)
      .set('Authorization' ,`bearer ${token}`)
      .expect(400)
  })

})

describe('checking the id-field', () => {

  test('identifying field is called id', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const firstBlogId = blogsAtStart[0].id
    expect(firstBlogId).toBeDefined()
  })

})

describe('updating a blog', () => {

  test('existing blog can be updated', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const firstBlogId = blogsAtStart[0].id
    const firstBlogUser = blogsAtStart[0].user

    const updatedBlog = {
      id: firstBlogId,
      title: 'High-Profile Company Data Breaches 2023',
      author: 'Jessica Farrelly',
      url: 'https://www.electric.ai/blog/recent-big-company-data-breaches',
      likes: 20,
      user: firstBlogUser._id.toString()
    }

    await api
      .put(`/api/blogs/${firstBlogId}`)
      .send(updatedBlog)
      .expect('Content-Type', /application\/json/)

    const resultBlog = await api
      .get(`/api/blogs/${firstBlogId}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(resultBlog.body).toEqual(updatedBlog)

  })

  test('only given info is updated, else remains the same', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const firstBlogId = blogsAtStart[0].id

    const updatedInfo = {
      title: 'High-Profile Company Data Breaches 2024',
      likes: 20
    }

    const updatedBlog = await api
      .put(`/api/blogs/${firstBlogId}`)
      .send(updatedInfo)
      .expect('Content-Type', /application\/json/)

    const resultBlog = await api
      .get(`/api/blogs/${firstBlogId}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(resultBlog.body).toEqual(updatedBlog.body)

  })

  test('update fails with statuscode 404 if id is valid but does not exist', async () => {
    const validNonexistingId = '64c887fb4024679830ae3410'

    const updatedInfo = {
      author: 'Henna Kari',
    }

    await api
      .put(`/api/blogs/${validNonexistingId}`)
      .send(updatedInfo)
      .expect(404)

  })

  test('update fails with statuscode 400 id is invalid', async () => {
    const invalidId = '64c887fb4024679830'

    const updatedInfo = {
      author: 'Henna Kari',
    }

    await api
      .put(`/api/blogs/${invalidId}`)
      .send(updatedInfo)
      .expect(400)

  })
})


afterAll(async () => {
  await mongoose.connection.close()
})