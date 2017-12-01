import * as _ from "underscore";
import * as redis from "redis";
import {Workers} from "../clustering/workers";
import {config} from "../config/config";

export class RedisChannels {

    private pub;
    private sub;

    constructor() {
    }

    public init() {

        let channels = {
            "1": "data"
        };

        this.pub = redis.createClient(config.redis.port, config.redis.host);
        this.sub = redis.createClient(config.redis.port, config.redis.host);

        let retypingChannels = [];
        _.each(channels, function (channelName, number) {
            retypingChannels.push(config.redis.channelType + config.app.port + channelName);
        });
        for (let i = 0; i < retypingChannels.length; i++) {
            this.sub.subscribe(retypingChannels[i]);
        }

        this.sub.on('message', function (channel, data) {
            let IO = Workers.ioInstance;
            data = JSON.parse(data);
            let channelName = data.channelName;

            let nsp = IO.of(data.nsp);
            nsp.emit(channelName, data.sendData);
        });

    }

    publish(data) {
        let args = Array.prototype.slice.call(arguments);

        this.pub.publish((config.redis.channelType + config.app.port + data.channelName) || '', JSON.stringify(args[0]), function (err) {
            if (err !== null) {
                console.error('Error in publish()');
            }
        });
    }
}
