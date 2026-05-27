// Simple seeding script to populate MongoDB with mock posts
require('dotenv').config();
const connectDB = require('./config/db');
const Post = require('./models/Post');
const data = require('./data/posts.json');

async function seed() {
  await connectDB();
  await Post.deleteMany({});
  const items = data.map(d => ({
    title: d.title,
    content: d.content,
    platform: d.platform || 'reddit',
    username: d.username || 'anonymous',
    engagement: d.engagement || 0,
    timestamp: d.timestamp ? new Date(d.timestamp) : new Date()
  }));
  await Post.insertMany(items);
  console.log('Seeded', items.length, 'posts');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
