import {Workers} from "../clustering/workers";
import {RtdsCtrl} from "../controllers/rtds";
import App from "../app";
import {config} from "../config/config";

export class SocketIOManager {

    constructor() {
    }

    init(IO) {
        RtdsCtrl.getAll().then(function (dss) {
            dss.forEach((ds, i) => {
                let namespace = `/${ds.uuid}`;
                IO.of(namespace);
            });

            RtdsCtrl.checkPushUrl(dss).then(function () {
            });
        });
    }

    static add(nsp) {

        let IO = config.app.cluster ? Workers.ioInstance : App.socketIOInstance;
        IO.of(nsp);

    }

    static delete(nsp) {

        let IO = config.app.cluster ? Workers.ioInstance : App.socketIOInstance;
        delete IO.nsps[nsp];

    }

}
