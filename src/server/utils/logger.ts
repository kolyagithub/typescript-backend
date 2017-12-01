import {transports, Container, ContainerInstance} from 'winston';
import * as _ from "underscore";
import * as path from "path";

let baseDir = path.resolve(process.cwd(), '..');
let rotate = require('winston-daily-rotate-file');
let keys = [];

let container: ContainerInstance = new Container({});

function formatter(args) {
    let optionsDate = {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    let dateTimeComponents = new Date().toLocaleTimeString('en-us', optionsDate).split(',');
    return dateTimeComponents[0] + dateTimeComponents[1] + ' - ' + args.level + ':    ' + args.label + '    ' + args.message;
}

function timeFormat() {
    let optionsDate = {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    let dateTimeComponents = new Date().toLocaleTimeString('en-us', optionsDate).split(',');
    return dateTimeComponents[0] + dateTimeComponents[1];
}

function log(): any {

    let filename = module.parent.filename;
    let label = path.relative(baseDir, filename);

    if (!_.contains(keys, label)) {
        container.add("exception", {
            transports: [
                //new (winston.transports.Console)({
                new (transports.Console)({
                    handleExceptions: true,
                    label: "EXCEPTION",
                    colorize: true,
                    prettyPrint: true,
                    timestamp: timeFormat
                }),
                new (rotate)({
                    datePattern: 'dd-MM-yyyy.log',
                    level: 'error',
                    filename: '../../logs/file_',
                    json: false,
                    maxsize: 1000000, // ~1 Mb
                    maxFiles: 10,
                    handleExceptions: true,
                    label: label,
                    formatter: formatter,
                    zippedArchive: true
                })
            ]
        });
        container.get("exception", {handleExceptions: true, exitOnError: false});
        container.add(label, {
            transports: [
                new (rotate)({
                    datePattern: 'dd-MM-yyyy.log',
                    level: 'error',
                    filename: '../../logs/file_',
                    json: false,
                    timestamp: timeFormat,
                    maxsize: 1000000, // ~1 Mb
                    maxFiles: 20,
                    label: label,
                    zippedArchive: true
                }),
                new (transports.Console)({
                    level: 'debug',
                    colorize: true,
                    silent: false,
                    label: label,
                    prettyPrint: true,
                    timestamp: timeFormat
                })
            ]
        });
        keys.push(label);
    }
    return <any>container.get(label, {handleExceptions: true, exitOnError: false});

}

function info(msg) {
    log().info(msg);
}

function warn(msg) {
    log().warn(msg);
}

function error(msg) {
    log().error(msg);
}

export {info, warn, error};