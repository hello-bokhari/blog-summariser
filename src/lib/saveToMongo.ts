import mongoose from 'mongoose'
import Blog from '@/models/Blog'


export async function saveToMongo({ url, content }: { url: string; content: string }) {
  await mongoose.connect(process.env.MONGODB_URI!)
  const blog = new Blog({ url, content, createdAt: new Date() })
  await blog.save()
}
