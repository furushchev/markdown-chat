/**
 * model/user
 * User model
 */

var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var SALT_WORK_FACTOR = 10;

var UserSchema = new Schema({
  nickname: {type: String},
  email: {type: String},
  password: {type: String},
  created_at: {type: Date},
  updated_at: {type: Date}
});

mongoose.model('User', UserSchema);

var User = mongoose.model('User');

/**
 * save hook
 * 1. before saving user object, automatically encrypt password field with
 *    bcrypt.
 * 2. update timestamp
 * 3. if not specified, automatically fill created_at field
 **/
UserSchema.pre('save', function(next) {
  var user = this;
  var now = new Date();
  // update timestamp
  if (user.isModified('password') ||
      user.isModified('nickname') ||
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

// Password verification
// candidatePassword is not encrypted one
User.prototype.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if(err) return cb(err);
    cb(null, isMatch);
  });
};

// create new user
// cb := function(error, object)
User.newUser = function(spec, cb) {
  if (!spec.nickname) {
    cb(new Error('No nickname is specified'));
  }
  else if (!spec.password) {
    cb(new Error('No password is specified'));
  }
  else {
    // check the uniqness
    User.findOne({nickname: spec.nickname}, function(err, user) {
      if (err) {
        cb(err);
      }
      else if (user) {
        cb(new Error('nickname: ' + spec.nickname + ' is already used'));
      }
      else {
        var user = new User(spec);
        user.save(function(err) {
          cb(err, user);
        });
      }
    });
  }
};

// registering passport methods
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(function(nickname, password, done) {
  User.findOne({ nickname: nickname }, function(err, user) {
    if (err) { return done(err); }
    if (!user) { return done(null, false, { message: 'Unknown user: ' + nickname }); }
    user.comparePassword(password, function(err, isMatch) {
      if (err) return done(err);
      if(isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Invalid password' });
      }
    });
  });
}));
