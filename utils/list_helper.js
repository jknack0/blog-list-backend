const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  const reducer = (sum, item) => {
    return sum + item.likes
  }

  return blogs.length === 0 ? 0 : blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
  let favoriteBlog = blogs[0]
  for(blog of blogs) {
    if(blog.likes > favoriteBlog.likes)
      favoriteBlog = blog
  }
  return blogs.length === 0 ? 0 : {title: favoriteBlog.title, author: favoriteBlog.author, likes: favoriteBlog.likes}
}

const mostBlogs = (blogs) => {
  const frequencyMap = new Map()

  for(blog of blogs) {
    if(frequencyMap.get(blog.author)){
      frequencyMap.set(blog.author, frequencyMap.get(blog.author) + 1)
    } else {
      frequencyMap.set(blog.author, 1)
    }
  }

  let result = {blogs: 0}
  for([author, blogs] of frequencyMap){
    if(blogs > result.blogs)
      result = {author, blogs}
      
  }

  return blogs.length === 0 ? 0 : result
}

const mostLikes = (blogs) => {
  const frequencyMap = new Map()

  for(blog of blogs) {
    if(frequencyMap.get(blog.author)){
      frequencyMap.set(blog.author, frequencyMap.get(blog.author) + blog.likes)
    } else {
      frequencyMap.set(blog.author, blog.likes)
    }
  }

  let result = {likes: 0}
  for([author, likes] of frequencyMap){
    if(likes > result.likes)
      result = {author, likes}
      
  }

  return blogs.length === 0 ? 0 : result
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}