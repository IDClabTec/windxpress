// contactModel.js
var mongoose = require('mongoose');
// Setup schema
var UsersSchema = mongoose.Schema({
    Name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    pass: { 
        type: String,
        required: true
    },
    ipaddress:{
        type: String
    },
    Actuators:{
        type: Array,
        default: [null]
    },
    Alarms: {
        type:Array,
        default:[]

        },
    Topics: {
        type: Array,
        require: false
    }
     
        });


// Export Contact model
var Users = module.exports = mongoose.model('Users', UsersSchema);
module.exports.get = function (callback, limit) {
    Users.find(callback).limit(limit);
}
