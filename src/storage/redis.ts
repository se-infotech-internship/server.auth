import redis from 'redis';
import * as dotenv from 'dotenv';

// Uncoment next lines to use Redis with Redis Labs keys
dotenv.config();

const redisPort = process.env.REDIS_PORT as string;
const redisPassword = process.env.REDIS_PASSWORD as string;
const redisHost = process.env.REDIS_HOST as string;

export const client = redis.createClient({
    port: +redisPort,
    host: redisHost,
    password: redisPassword,
    no_ready_check: true
  }).on('error', (err: Error)=>{
    console.error('ERR:REDIS:', err)
  })

// Uncoment next lines to use Redis locally
// export const client = redis.createClient({
//   port: 6379,
// });