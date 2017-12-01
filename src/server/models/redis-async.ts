import {redisAsyncCl} from "../db/redis-async"

export class RedisAsyncModel {

    constructor() {
    }

    static addDefaultDSData(uuid, data) {
        redisAsyncCl.hset('ds_data', uuid, JSON.stringify([data]));
    }

    static async updateDSData(uuid, data) {
        try {
            const isHas = await redisAsyncCl.hexists('ds_data', uuid);
            if (isHas) {
                redisAsyncCl.hdel(['ds_data', uuid]);
                redisAsyncCl.hset('ds_data', uuid, JSON.stringify([data]));
                return true;
            }
            else {
                redisAsyncCl.hset('ds_data', uuid, JSON.stringify([data]));
                return true;
            }
        }
        catch (err) {
            throw new Error('Error in update DS data')
        }
    }

    static async removeDSDataByUUID(uuid) {
        const isHas = await redisAsyncCl.hexists('ds_data', uuid);
        if (isHas)
            redisAsyncCl.hdel(['ds_data', uuid]);
    }

}
