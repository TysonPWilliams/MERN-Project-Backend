// tests/setup.js
import 'dotenv/config'
import mongoose from 'mongoose'

let isConnected = false

export async function setupDatabase() {
  if (!isConnected) {
    const uri = process.env.DATABASE_URL
    if (!uri) {
      throw new Error('DATABASE_URL environment variable not set')
    }
    await mongoose.connect(uri)
    isConnected = true
  }
  return mongoose.connection
}

export async function cleanDatabase() {
  if (isConnected && mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections
    for (const key in collections) {
      await collections[key].deleteMany({})
    }
  }
}

export async function closeDatabase() {
  if (isConnected && mongoose.connection.readyState === 1) {
    await mongoose.connection.close()
    isConnected = false
  }
}