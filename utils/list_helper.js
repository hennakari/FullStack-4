
const dummy = (blogs) => {
  console.log(blogs)
  return 1
}


const totalLikes = (blogs) => {
  if (blogs.length === 0) {
    return 0
  } else {
    let likes = blogs.reduce(function(sum, blog) {
      return sum + blog.likes}, 0)
    return likes
  }
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) {
    return 0
  } else {
    let blogMaxLikes = blogs.reduce((max, current) => max.likes > current.likes ? max : current)
    let result = {}
    result.title = blogMaxLikes.title
    result.author = blogMaxLikes.author
    result.likes = blogMaxLikes.likes
    return result
  }
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return 0
  } else {
    let authors = blogs.map((x) => x.author)

    let authorsCounted = {}
    let counter = keys => {
      authorsCounted[keys] = ++authorsCounted[keys] || 1
    }

    authors.forEach(counter)

    let authorWithMostBlogs = Object.keys(authorsCounted).reduce((a, b) => authorsCounted[a] > authorsCounted[b] ? a : b)

    let result = {}
    result.author = authorWithMostBlogs
    result.blogs = authorsCounted[authorWithMostBlogs]
    return result
  }
}


module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs
}