import * as mongoose from 'mongoose';

const rtdsSchema = new mongoose.Schema({
    name: {type: String}
});

const RTDS = mongoose.model('RTDS', rtdsSchema);

export {RTDS};