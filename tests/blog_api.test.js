const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const Blog = require('../models/blog')

const api = supertest(app)


beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
})

describe('when there are initially some blogs saved', () => {

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

  test('a valid blog can be added', async () => {
    const newBlog = {
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
      likes: 5
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const titles = blogsAtEnd.map(n => n.title)

    expect(titles).toContain(
      'Go To Statement Considered Harmful'
    )
  })


  test('blog without likes is added with 0 likes', async () => {
    const newBlog = {
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)

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

    await api
      .post('/api/blogs')
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

    await api
      .post('/api/blogs')
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

    const resultBlog = await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(resultBlog.body).toEqual(blogToView)
  })

  test('fails with statuscode 404 if id is valid but does not exist', async () => {
    const validNonexistingId = '64c887fb4024679830ae3410'

    await api
      .get(`/api/blogs/${validNonexistingId}`)
      .expect(404)
  })

  test('fails with statuscode 400 id is invalid', async () => {
    const invalidId = '64c887fb4024679830'

    await api
      .get(`/api/blogs/${invalidId}`)
      .expect(400)
  })

})

describe('deletig a blog', () => {

  test('a blog can be deleted', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(200)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(
      helper.initialBlogs.length - 1
    )

    const titles = blogsAtEnd.map(r => r.title)

    expect(titles).not.toContain(blogToDelete.title)
  })

  test('fails with statuscode 404 if id is valid but does not exist', async () => {
    const validNonexistingId = '64c887fb4024679830ae3410'

    await api
      .delete(`/api/blogs/${validNonexistingId}`)
      .expect(404)
  })

  test('fails with statuscode 400 id is invalid', async () => {
    const invalidId = '64c887fb4024679830'

    await api
      .delete(`/api/blogs/${invalidId}`)
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

    const updatedBlog = {
      id: firstBlogId,
      title: 'High-Profile Company Data Breaches 2023',
      author: 'Jessica Farrelly',
      url: 'https://www.electric.ai/blog/recent-big-company-data-breaches',
      likes: 20
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
      likes: 13
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

  test('fails with statuscode 404 if id is valid but does not exist', async () => {
    const validNonexistingId = '64c887fb4024679830ae3410'

    const updatedInfo = {
      author: 'Henna Kari',
    }

    const updatedBlog = await api
      .put(`/api/blogs/${validNonexistingId}`)
      .send(updatedInfo)
      .expect(404)

    console.log(updatedBlog)
  })

  test('fails with statuscode 400 id is invalid', async () => {
    const invalidId = '64c887fb4024679830'

    const updatedInfo = {
      author: 'Henna Kari',
    }

    const updatedBlog = await api
      .put(`/api/blogs/${invalidId}`)
      .send(updatedInfo)
      .expect(400)

    console.log(updatedBlog)
  })
})


afterAll(async () => {
  await mongoose.connection.close()
})