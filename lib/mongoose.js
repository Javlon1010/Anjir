const mongoose = require('mongoose');

// Serverless-friendly mongoose connection caching
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/anjir';

if (!MONGO_URI) {
  console.warn('⚠️ MONGODB_URI is not set. Connect will likely fail.');
}

let cached = global._mongoose;

if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

async function connect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    cached.promise = mongoose.connect(MONGO_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = { connect };
