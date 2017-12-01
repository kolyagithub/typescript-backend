import {RedisChannels} from "../db/redis-channel";
import {SocketIOManager} from '../socketio/manage';
import {config} from "../config/config";

const socketIO = require('socket.io');

export class Workers {

    public static ioInstance: any;

    constructor() {
    }


    init(app) {

        let redisChannels = new RedisChannels();
        redisChannels.init();

        let server = app.listen(0, () => {
            console.log('Server listening on port:%d PID:', config.app.port, process.pid);
        });

        // init Socket.io
        Workers.ioInstance = socketIO(server);

        // start listening socketIO namespaces
        let socketIOManager = new SocketIOManager();
        socketIOManager.init(Workers.ioInstance);

        process.on('message', (message, connection) => {
            if (message !== 'sticky-session:connection') {
                return;
            }
            server.emit('connection', connection);

            connection.on('close', function () {
                // eventing when socketIO connecting and pusher request finished
            });

        });
    }
}
