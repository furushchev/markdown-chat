/**
 * User model
 */

var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;

var SALT_WORK_FACTOR = 10;

var UserSchema = new Schema({
  nick_name: {type: String, required: true, unique: true},
  email: {type: String},
  password: {type: String, required: true},
  created_at: {type: Date, required: true},
  updated_at: {type: Date, required: true}
});

mongoose.model('User', UserSchema);

var User = mongoose.model('User');

/**
 * save hook
 * 1. before saving user object, automatically encrypt password field with
 *    bcrypt.
 * 2. update timestamp
 **/
UserSchema.pre('save', function(next) {
  var user = this;
  var now = new Date();
  // update timestamp
  if (user.isModified('password') ||
      user.isModified('nick_name') ||
      user.isModified('email')) {
    user.updated_at = now;
  }
  if (!user.created_at) {
    user.created_at = now;
  }
  if(!user.isModified('password')) return next();
  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if(err) return next(err);
    bcrypt.hash(user.password, salt, function(err, hash) {
      if(err) return next(err);
      user.password = hash;
      next();
    });
  });
});
