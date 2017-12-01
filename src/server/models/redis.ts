import {redisCl} from "../db/redis"
import * as _ from "underscore"
import {config} from "../config/config";

export class RedisModel {

    constructor() {
    }

    public static clearPids() {
        redisCl.keys(config.redis.PID + '*', (err, keys) => {
            _.each(keys, (key) => {
                redisCl.del(key);
            });
        });
    }

}
