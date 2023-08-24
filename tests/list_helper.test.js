const listHelper = require('../utils/list_helper')

const emptyList = []

const listWithOneBlog = [
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
    __v: 0
  }
]

const listWithTwoBlogs = [
  {
    _id: '5a422a851b54a676234d17f7',
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
    __v: 0
  },
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 7,
    __v: 0
  }
]

const listWithSeveralBlogs = [
  {
    _id: '5a422a851b54a676234d17f7',
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
    __v: 0
  },
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
    __v: 0
  },
  {
    _id: '5a422b3a1b54a676234d17f9',
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
    __v: 0
  },
  {
    _id: '5a422b891b54a676234d17fa',
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 10,
    __v: 0
  },
  {
    _id: '5a422ba71b54a676234d17fb',
    title: 'TDD harms architecture',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
    likes: 0,
    __v: 0
  },
  {
    _id: '5a422bc61b54a676234d17fc',
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2,
    __v: 0
  }
]


describe('dummy', () => {

  test('dummy returns one', () => {
    const result = listHelper.dummy(emptyList)
    expect(result).toBe(1)
  })

})

describe('total likes', () => {

  test('when list has only one blog equals the likes of that', () => {
    const result = listHelper.totalLikes(listWithOneBlog)
    expect(result).toBe(5)
  })

  test('when list is empty', () => {
    const result = listHelper.totalLikes(emptyList)
    expect(result).toBe(0)
  })

  test('when list has several blogs', () => {
    const result = listHelper.totalLikes(listWithSeveralBlogs)
    expect(result).toBe(36)
  })

})

describe('favorite blog', () => {

  test('find max likes when list has several blogs', () => {
    const result = listHelper.favoriteBlog(listWithSeveralBlogs)
    const expected = {
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      likes: 12
    }
    expect(result).toEqual(expected)
  })

  test('find max likes when list is empty', () => {
    const result = listHelper.favoriteBlog(emptyList)
    expect(result).toBe(0)
  })

  test('find max likes when list has only one blog', () => {
    const result = listHelper.favoriteBlog(listWithOneBlog)
    const expected = {
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      likes: 5
    }
    expect(result).toEqual(expected)
  })

  test('find max likes when list has two blogs with max likes', () => {
    // finds the latter one
    const result = listHelper.favoriteBlog(listWithTwoBlogs)
    const expected = {
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      likes: 7
    }
    expect(result).toEqual(expected)
  })

})

describe('most blogs', () => {

  test('author with most blogs when list has several blogs', () => {
    const result = listHelper.mostBlogs(listWithSeveralBlogs)
    const expected = {
      author: 'Robert C. Martin',
      blogs: 3
    }
    expect(result).toEqual(expected)
  })

  test('author with most blogs when list is empty', () => {
    const result = listHelper.mostBlogs(emptyList)
    expect(result).toBe(0)
  })

  test('author with most blogs when list has only one blog', () => {
    const result = listHelper.mostBlogs(listWithOneBlog)
    const expected = {
      author: 'Edsger W. Dijkstra',
      blogs: 1
    }
    expect(result).toEqual(expected)
  })

  test('author with most blogs when list has two blogs from different bloggers', () => {
    const result = listHelper.mostBlogs(listWithTwoBlogs)
    const expected = {
      author: 'Edsger W. Dijkstra',
      blogs: 1
    }
    expect(result).toEqual(expected)
  })

})

describe('most likes', () => {

  test('author with most likes when list has several blogs', () => {
    const result = listHelper.mostLikes(listWithSeveralBlogs)
    const expected = {
      author: 'Edsger W. Dijkstra',
      likes: 17
    }
    expect(result).toEqual(expected)
  })

  test('author with most likes when list is empty', () => {
    const result = listHelper.mostLikes(emptyList)
    expect(result).toBe(0)
  })

  test('author with most likes when list has only one blog', () => {
    const result = listHelper.mostLikes(listWithOneBlog)
    const expected = {
      author: 'Edsger W. Dijkstra',
      likes: 5
    }
    expect(result).toEqual(expected)
  })

  test('author with most likes when list has two blogs from different bloggers with same likes', () => {
    const result = listHelper.mostLikes(listWithTwoBlogs)
    const expected = {
      author: 'Edsger W. Dijkstra',
      likes: 7
    }
    expect(result).toEqual(expected)
  })

})