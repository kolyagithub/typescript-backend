import * as Router from "koa-router";

import {RtdsCtrl} from '../controllers/rtds';

export default function setRoutes(app) {

    const baseRouter = new Router();

    // RTDS routes
    const rtdsRouter = new Router();
    const rtdsCtrl = new RtdsCtrl();
    rtdsRouter.post('/create', rtdsCtrl.create);

    // define base routes
    baseRouter.use('/rtds', rtdsRouter.routes());

    app.use(baseRouter.routes());
    app.use(baseRouter.allowedMethods());
}