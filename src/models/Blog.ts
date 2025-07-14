import mongoose from 'mongoose'

const blogSchema = new mongoose.Schema({
  url: String,
  content: String,
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.models.Blog || mongoose.model('Blog', blogSchema)
