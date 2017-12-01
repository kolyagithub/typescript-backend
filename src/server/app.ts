import * as Koa from "koa";
import * as bodyParser from "koa-bodyparser";
import * as koaLog from "koa-logger";
import * as serve from "koa-static";

const cors = require('@koa/cors')
import setRoutes from './routes/routes';
import * as fs from "fs";
import {MongoDB} from "./db/mongo";
import * as socketIO from 'socket.io';
import {Cluster} from "./clustering/cluster";
import {SocketIOManager} from './socketio/manage';
import {config} from "./config/config";
import * as logger from "./utils/logger"

export default class App {

    private app: Koa;
    public static socketIOInstance;

    constructor() {
        this.app = new Koa();
    }

    public start() {

        MongoDB.init();

        this.app.use(cors());
        this.app.use(koaLog());
        this.app.use(bodyParser());

        // create logs folder
        if (!fs.existsSync('../../logs')) {
            fs.mkdirSync('../../logs');
        }

        // serve client code in dist folder
        this.app.use(serve('../client'));

        // routes
        setRoutes(this.app);

        if (config.app.cluster) {
            let cluster = new Cluster();
            cluster.init(this.app);
        }
        else {

            // create HTTP server
            const server = this.app.listen(config.app.port, () => {
                logger.info(`Server process: ${process.pid} listen on port ${config.app.port}`);
            });

            // init Socket.io
            App.socketIOInstance = socketIO(server).listen(server);

            // start listening socketIO namespaces
            let socketIOManager = new SocketIOManager();
            socketIOManager.init(App.socketIOInstance);

        }

        this.app.on("error", (e) => console.log(`SERVER ERROR: ${e.message}`));


    }

}

