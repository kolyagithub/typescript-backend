import * as smtpTransport from 'nodemailer-smtp-transport';
import {Constants} from "./constants";

const nodemailer = require('nodemailer');
const emailExistence = require('email-existence');

export class Emailer {

    private result = {
        message: '',
        success: false
    };
    private transporter: any;

    constructor() {
        this.transporter = nodemailer.createTransport(smtpTransport({
            service: 'Gmail',
            auth: {
                user: Constants.SENDER_GMAIL_SERVICE.email,
                pass: Constants.SENDER_GMAIL_SERVICE.psw
            }
        }));
    }

    checkEmail(email, cb) {
        emailExistence.check(email, (err, success) => {
            if (success) {
                return cb(true);
            }
            cb(false);
        });
    };

    sendEmail(mailTo, msg, cb) {
        let self = this;
        this.checkEmail(mailTo, (success) => {
            if (success) {
                let data = {
                    from: Constants.SENDER_GMAIL_SERVICE.email, // server email
                    to: mailTo,
                    subject: 'HOME CORPORATION', // Subject line
                    html: 'ALARM MESSAGE: ' + msg,
                    text: '' // plaintext body
                };

                this.transporter.sendMail(data, (error, response) => {
                    if (error) {
                        self.result.success = false;
                        self.result.message = 'Message not sent: ' + error;
                    } else {
                        self.result.success = true;
                        self.result.message = 'Message sent: ' + response.response;
                    }
                    this.transporter.close();
                    cb(self.result);
                });
            }
            else {
                self.result.success = false;
                self.result.message = 'Email not found: ' + mailTo;
                cb(self.result);
            }
        });
    };
}