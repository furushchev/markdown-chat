/**
 * User model
 */

var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  nick_name: {type: String, required: true, unique: true},
  email: {type: String},
  password: {type: String, required: true}
});

mongoose.model('User', UserSchema);

var User = mongoose.model('User');
