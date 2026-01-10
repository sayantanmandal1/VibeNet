const redis = require('redis');
require('dotenv').config();

const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  retry_strategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      // End reconnecting on a specific error and flush all commands with a individual error
      return new Error('The server refused the connection');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      // End reconnecting after a specific timeout and flush all commands with a individual error
      return new Error('Retry time exhausted');
    }
    if (options.attempt > 10) {
      // End reconnecting with built in error
      return undefined;
    }
    // reconnect after
    return Math.min(options.attempt * 100, 3000);
  }
});

client.on('error', (err) => {
  console.error('Redis Client Error', err);
});

client.on('connect', () => {
  console.log('Connected to Redis');
});

client.on('reconnecting', () => {
  console.log('Reconnecting to Redis...');
});

const connectRedis = async () => {
  try {
    await client.connect();
    console.log('Redis connection established successfully');
    return true;
  } catch (error) {
    console.error('Failed to connect to Redis:', error.message);
    console.log('Server will continue without Redis. Some features may be limited.');
    console.log('To enable Redis, make sure it\'s running: docker-compose up -d');
    return false;
  }
};

module.exports = { client, connectRedis };