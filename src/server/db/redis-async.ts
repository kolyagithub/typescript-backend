import * as redis from "async-redis";
import {config} from "../config/config";

const redisAsyncCl = redis.createClient({
    host: config.redis.host,
    port: config.redis.port
});

redisAsyncCl.on('connect', (err) => {
    //log.info('Redis Async connected.');
});

redisAsyncCl.on('error', (err) => {
    console.error('Cannot connect to Redis Async. ', err);
    process.exit(1);
});

export {redisAsyncCl};