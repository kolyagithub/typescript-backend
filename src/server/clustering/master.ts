import * as _ from "underscore";
import * as async from "async";
import * as os from "os";
import {redisCl} from "../db/redis"
import {Helper} from "../utils/helper"
import {config} from "../config/config";

export class Master {

    private cluster;
    private num_processes: number;

    constructor() {
        this.cluster = null;
        this.num_processes = os.cpus().length;
    }

    setCluster(value) {
        this.cluster = value;
    }

    init() {
        let workers = [];
        let worker_pids = [];
        let cluster = this.cluster;
        let spawn = (i) => {
            workers[i] = cluster.fork();
            worker_pids.push({"idx": i, "pid": workers[i].process.pid});
            workers[i].on('exit', (worker, code, signal) => {
                console.log('restarting worker', i);
                worker_pids = _.without(worker_pids, _.findWhere(worker_pids, {"idx": i}));
                spawn(i);
            });
        };
        for (let i = 0; i < this.num_processes; i++) {
            spawn(i);
        }
        let net = require('net')
        let server = net.createServer({pauseOnConnect: true}, (connection) => {
            let ip = Helper.getRemoteIP(connection);

            redisCl.keys(config.redis.PID + ip, (err, keys) => {
                if (_.contains(keys, config.redis.PID + ip)) {
                    redisCl.hget(config.redis.PID + ip, 'idx', (err, idx) => {
                        if (err !== null) {
                            console.error("get PID idx error");
                            return;
                        }
                        let worker = workers[idx];
                        worker.send('sticky-session:connection', connection);
                    });
                }
                else {
                    async.map(worker_pids, Helper.getCPU_Percent, (err, result) => {
                        let resultArrWithoutNull: any = _.without(result, null);
                        let minObject: any = _.min(resultArrWithoutNull, (resultArrWithoutNull) => {
                            return resultArrWithoutNull.cpu;
                        });
                        let multi = redisCl.multi();
                        multi.hset(config.redis.PID + ip, 'idx', minObject.idx);
                        multi.hset(config.redis.PID + ip, 'pid', minObject.pid);
                        multi.exec();
                        let worker = workers[minObject.idx];
                        worker.send('sticky-session:connection', connection);
                    });
                }
            });

        });
        server.maxConnections = Infinity;
        server.listen(config.app.port);
    }
}
