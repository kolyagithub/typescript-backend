import * as unixCPU from "pidusage";
import {RedisChannels} from "../db/redis-channel";

const LIVR = require('livr');

export class Helper {

    redisChannels: RedisChannels;

    constructor() {
        this.redisChannels = new RedisChannels();
    }

    static validRequest(data, req) {
        LIVR.Validator.defaultAutoTrim(true);
        if (data.headers) {
            let validHeaders = new LIVR.Validator(data.headers);
            if (!validHeaders.validate(req.headers)) {
                let _substring = req.request.originalUrl;
                console.error('Cannot validate request headers: URL ' + _substring + '    ', validHeaders.getErrors());
                return false;
            }
        }
        if (data.params) {
            let validParams = new LIVR.Validator(data.params);
            if (!validParams.validate(req.params)) {
                let _substring = req.request.originalUrl;
                console.error('Cannot validate request params: URL ' + _substring + '    ', validParams.getErrors());
                return false;
            }
        }
        if (data.body) {
            let validBody = new LIVR.Validator(data.body);
            if (!validBody.validate(req.request.body)) {
                let _substring = req.request.originalUrl;
                console.error('Cannot validate request body: URL ' + _substring + '    ', validBody.getErrors());
                return false;
            }
        }
        if (data.query) {
            let validQuery = new LIVR.Validator(data.query);
            if (!validQuery.validate(req.query)) {
                let _substring = req.request.originalUrl;
                console.error('Cannot validate request query: URL ' + _substring + '    ', validQuery.getErrors());
                return false;
            }
        }
        if (data.form_data) {
            let validFormData = new LIVR.Validator(data.form_data);
            if (!validFormData.validate(req.form_data)) {
                console.error('Cannot validate request form-data: ', validFormData.getErrors());
                return false;
            }
        }
        return true;
    }

    public sendWithoutCallback(nsp, sendData, channel) {
        let data = {
            nsp: nsp,
            sendData: sendData,
            channelName: channel
        };
        this.redisChannels.publish(data);
    }

    public static getCPU_Percent(data, cb) {
        unixCPU.stat(data.pid, (err, result) => {
            if (err) {
                console.error('Error in getCPU_Percent', err);
                return cb(null, null);
            }
            cb(null, {"idx": data.idx, "cpu": result.cpu, "pid": data.pid});
        });
    }

    public static getRemoteIP(connection) {
        let remote = connection.remoteAddress, ip;
        if (remote.match(/[0-9]+/g).length > 1) {
            ip = remote.match(/[0-9]+/g)[0] + '.'
                + remote.match(/[0-9]+/g)[1] + '.'
                + remote.match(/[0-9]+/g)[2] + '.'
                + remote.match(/[0-9]+/g)[3];
        }
        else {
            ip = '127.0.0.1';
        }
        return ip;
    }

}