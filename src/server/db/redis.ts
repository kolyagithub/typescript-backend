import * as redis from "redis";
import {config} from "../config/config";

const redisCl = redis.createClient({
    host: config.redis.host,
    port: config.redis.port
});

redisCl.on('connect', function (err) {
    //log.info('Redis connected.');
});

redisCl.on('error', (err) => {
    console.error('Cannot connect to Redis. ', err);
    process.exit(1);
});

export {redisCl};