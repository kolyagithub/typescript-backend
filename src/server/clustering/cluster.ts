import * as cluster from "cluster";
import {Master} from "./master";
import {RedisModel} from "../models/redis";
import {Workers} from "./workers";

export class Cluster {

    constructor() {
    }

    init(app) {
        if (cluster.isMaster) {
            let master = new Master();
            master.setCluster(cluster);
            master.init();

            // clear process pids every 5 minute
            setInterval(RedisModel.clearPids, 5 * 60 * 1000);
        }
        else {
            let workers = new Workers();
            workers.init(app);
        }
    }
}
