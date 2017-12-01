import {RTDS} from '../models/schema';
import {RedisAsyncModel} from "../models/redis-async"
import {Helper} from '../utils/helper';
import * as _ from 'underscore';
import {Constants} from '../utils/constants';
import {SocketIOManager} from '../socketio/manage';
import {config} from "../config/config";

const uuidv4 = require('uuid/v4');

export class RtdsCtrl {

    helper: Helper;

    constructor() {
        this.helper = new Helper();
    }

    async getDSByUUID(uuid) {
        try {
            const ds = await RTDS.findOne()
                .where("uuid").in([uuid])
                .exec();
            if (ds) {
                delete ds._doc.__v;
                return ds._doc;
            } else {
                return {};
            }
        } catch (err) {
            throw new Error('Error in getByUUID DS')
        }
    }

    static async getAll() {
        try {
            const ds = await RTDS.find();
            let result = [];
            ds.forEach((item, i) => {
                result.push(item._doc);
            });
            return result;
        } catch (err) {
            console.error('Error in getAll DS');
            return [];
        }
    }

    static async checkPushUrl(dss) {
        try {

            let host = config.app.host;
            let port = config.app.port;

            for (let i = 0; i < dss.length; i++) {
                let pushUrl = dss[i].pushUrl; // http://192.168.1.188:3004/api/60c255ad-0356-49d8-b097-32e0da963d2c
                let a = pushUrl.split('://')[1];
                let b = a.split(':');
                if (host !== b[0] || port !== b[1].split('/')[0]) {
                    let _host = `${host}:${port}`;
                    const ds = await RTDS.findOne({_id: dss[i]._id});
                    ds.pushUrl = `${_host}/api/${dss[i].uuid}`;
                    await ds.save();
                }
            }

        } catch (err) {
            console.error('Error in check host address!');
        }
    }

    create = async (ctx) => {
        try {
            if (!Helper.validRequest({
                    "body": {
                        name: ['required', 'string'],
                        ds_schema: ['required', {
                            'nested_object': {}
                        }],
                        flow: ['required', 'string'],
                        enabled: ['required', {one_of: [true, false]}],
                    }
                }, ctx)) {
                return ctx.res.end('Bad required dates!');
            }
            const ds = RTDS();
            const uuid = uuidv4();
            ds.name = ctx.request.body.name;
            ds.ds_schema = ctx.request.body.ds_schema;
            ds.flow = ctx.request.body.flow;
            ds.enabled = ctx.request.body.enabled;
            ds.pushUrl = `${Constants.apiUrl}${uuid}`;
            ds.uuid = uuid;
            await ds.save();

            // add namespaces to socketIO
            SocketIOManager.add(uuid);

            // add first data to Redis
            RedisAsyncModel.addDefaultDSData(uuid, ctx.request.body.ds_schema);

            ctx.body = ds;
        } catch (err) {
            console.error(err.message);
            ctx.throw(500, err.message);
        }
    };

    checkName = async (ctx) => {
        try {
            if (!Helper.validRequest({
                    "body": {
                        name: ['required', 'string']
                    }
                }, ctx)) {
                return ctx.res.end('Bad required dates!');
            }
            const rtds = await RTDS.find({name: ctx.request.body.name});
            ctx.body = rtds.length > 0;
        } catch (err) {
            console.error(err.message);
            ctx.throw(500, err.message);
        }
    };

    getByName = async (ctx) => {
        try {
            if (!Helper.validRequest({
                    "params": {
                        name: ['required', 'string']
                    }
                }, ctx)) {
                return ctx.res.end('Bad required dates!');
            }
            const ds = await RTDS.findOne({name: ctx.params.name});
            if (ds) {
                delete ds._doc.__v;
                ctx.body = ds._doc;
            } else {
                ctx.throw(404);
            }
        } catch (err) {
            console.error(err.message);
            ctx.throw(500, err.message);
        }
    };

    getById = async (ctx) => {
        try {
            if (!Helper.validRequest({
                    "params": {
                        id: ['required', 'string']
                    }
                }, ctx)) {
                return ctx.res.end('Bad required dates!');
            }
            const ds = await RTDS.findOne({_id: ctx.params.id});
            if (ds) {
                delete ds._doc.__v;
                ctx.body = ds._doc;
            } else {
                ctx.throw(404);
            }
        } catch (err) {
            console.error(err.message);
            ctx.throw(500, err.message);
        }
    };

    all = async (ctx) => {
        try {
            if (!Helper.validRequest({}, ctx)) {
                return ctx.res.end('Bad required dates!');
            }
            const ds = await RTDS.find();
            let result = [];
            ds.forEach((item, i) => {
                delete item._doc.__v;
                result.push(item);
            });
            ctx.body = result;
        } catch (err) {
            console.error(err.message);
            ctx.throw(500, err.message);
        }
    };

    getByUUID = async (ctx) => {
        try {
            if (!Helper.validRequest({
                    "params": {
                        uuid: ['required', 'string']
                    }
                }, ctx)) {
                return ctx.res.end('Bad required dates!');
            }

            // get DS by uuid
            let ds = await this.getDSByUUID(ctx.params.uuid);

            if (_.isEmpty(ds)) {
                console.log('DS not found. UUID: ', ctx.params.uuid);
                return ctx.res.end('DS not found!');
            }

            ctx.body = ds;

        }
        catch (err) {
            console.error(err.message);
            ctx.throw(500, err.message);
        }

    };

    update = async (ctx) => {
        try {
            if (!Helper.validRequest({
                    "body": {
                        name: ['required', 'string'],
                        ds_schema: ['required', {
                            'nested_object': {}
                        }],
                        flow: ['required', 'string'],
                        enabled: ['required', {one_of: [true, false]}],
                    }
                }, ctx)) {
                return ctx.res.end('Bad required dates!');
            }
            const ds = await RTDS.findOne({_id: ctx.params.id});
            if (ds) {
                if (ctx.request.body.name) {
                    ds.name = ctx.request.body.name;
                }
                if (ctx.request.body.ds_schema) {
                    ds.ds_schema = ctx.request.body.ds_schema;
                }
                if (ctx.request.body.flow) {
                    ds.flow = ctx.request.body.flow;
                }
                ds.enabled = ctx.request.body.enabled;
                await ds.save();
                delete ds._doc.__v;

                // update data to Redis
                RedisAsyncModel.updateDSData(ds.uuid, ctx.request.body.ds_schema);

                ctx.body = ds._doc;
            } else {
                ctx.throw(404);
            }
        } catch (err) {
            console.error(err.message);
            ctx.throw(500, err.message);
        }
    };

    remove = async (ctx) => {
        try {
            if (!Helper.validRequest({
                    "params": {
                        id: ['required', 'string']
                    }
                }, ctx)) {
                return ctx.res.end('Bad required dates!');
            }
            const ds = await RTDS.findOne({_id: ctx.params.id});
            if (ds) {
                const ds_deleted = await RTDS.findByIdAndRemove(ds._id);
                delete ds_deleted._doc.__v;
                ctx.body = ds_deleted._doc;

                // remove namespaces from socketIO
                SocketIOManager.delete(ds_deleted._doc.uuid);

                // remove data from Redis
                await RedisAsyncModel.removeDSDataByUUID(ds_deleted._doc.uuid);

            } else {
                ctx.throw(404);
            }
        } catch (err) {
            console.error(err.message);
            ctx.throw(500, err.message);
        }
    };

    pushData = async (ctx) => {
        try {
            if (!Helper.validRequest({
                    "params": {
                        uuid: ['required', 'string']
                    }
                }, ctx)) {
                return ctx.res.end('Bad required dates!');
            }

            const uuid = ctx.params.uuid;

            // get DS by uuid
            let ds = await this.getDSByUUID(uuid);

            if (_.isEmpty(ds)) {
                console.log('DS not found. UUID: ', uuid);
                return ctx.res.end('DS not found!');
            }

            // get schema DS
            let schema = ds.ds_schema;

            // get requested body schema keys
            let body_schema_keys = [];
            _.mapObject(ctx.request.body, (val, key) => {
                body_schema_keys.push(key);
            });

            // check body schema keys with DS schema keys
            let notRequiredColumns = [];
            body_schema_keys.forEach((key, i) => {
                if (!_.has(schema, key)) notRequiredColumns.push(key);
            });

            // update DS data in Redis
            let temp = {};
            _.mapObject(schema, (val, key) => {
                temp[key] = ctx.request.body[key];
            });

            if (await RedisAsyncModel.updateDSData(uuid, temp)) {

                // send DS data to customer
                if (config.app.cluster) {
                    this.helper.sendWithoutCallback(`/${uuid}`, temp, 'data');
                }
                else {
                    //let nsp = require('../app').of(`/${uuid}`);
                    //nsp.emit('data', temp);
                }

                if (ctx) ctx.body = notRequiredColumns.length > 0 ? `Updated! But columns ${notRequiredColumns} not found!` : `Updated!`;
            }
            else {
                if (ctx) ctx.body = 'Error in update data';
            }

        } catch (err) {
            console.error('Error in /pusher: ', err.message);
            ctx.throw(500, err.message);
        }
    };
}