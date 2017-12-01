import * as mongoose from 'mongoose';
import * as cluster from 'cluster'
import {config} from "../config/config"

export class MongoDB {

    constructor() {
    }

    public static init() {

        mongoose.Promise = global.Promise;
        mongoose.connect(config.mongoose.url, config.mongoose.options);

        let db = mongoose.connection;

        db.on('connected', function () {

            // check MongoDB Server version
            if (cluster.isMaster || !config.app.cluster) {
                let admin = new mongoose.mongo.Admin(mongoose.connection.db);
                admin.buildInfo(function (err, info) {
                    let version = info.version;
                    let major = version.split('.')[0];
                    let minor = version.split('.')[1];
                    if (major < 3 || (major = 3 && minor < 4) || (major < 3 && minor < 4)) {
                        log.error('Required MongoDB Server version >= 3.4.0. Your version is %s', version);
                        process.exit(1);
                    }
                });
            }

        });

        db.on('error', function (err) {
            console.error('Cannot connect to MongoDB. ', err);
            process.exit(1)
        });

    }

}