import redis from 'redis';
import * as dotenv from 'dotenv';

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
