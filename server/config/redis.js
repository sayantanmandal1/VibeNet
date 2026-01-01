const redis = require('redis');
require('dotenv').config();

const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

client.on('error', (err) => {
  console.error('Redis Client Error', err);
});

client.on('connect', () => {
  console.log('Connected to Redis');
});

const connectRedis = async () => {
  try {
    await client.connect();
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
  }
};

module.exports = { client, connectRedis };