/**
 * model/user
 * User model
 */

var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var gravatar = require('gravatar');
var Schema = mongoose.Schema;
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var Q = require('q');
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

User.checkNicknameUniqness = function(nickname, skip) {
  // returns q object
  var defered = Q.defer();
  if (!skip) {
    User.findOne({nickname: nickname}, function(err, user) {
      if (err) {
        defered.reject(err);
      }
      else if (user) {
        defered.reject(new Error('nickname is not uniq: ' + nickname));
      }
      else {
        defered.resolve(true);
      }
    });
  }
  else {
    defered.resolve(true);
  }
  return defered.promise;
};

/**
 * save hook
 * 1. before saving user object, automatically encrypt password field with
 *    bcrypt.
 * 2. update timestamp
 * 3. if not specified, automatically fill created_at field
 * 4. if not nickname is specified, return error
 * 5. check the nickname uniqness
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
  if (!user.nickname) {
    return next(new Error('need to specify nickname'));
  }
  else if (!user.password) {
    return next(new Error('need to specify password'));
  }
  else {
    return User.checkNicknameUniqness(user.nickname,
                                      !user.isModified('nickname'))
      .then(function() {
        if (user.isModified('password')) {
          bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
            if(err) {
              return next(err);
            }
            bcrypt.hash(user.password, salt, function(err, hash) {
              if(err) {
                return next(err);
              }
              user.password = hash;
              next();
            });
          });
        }
        else {
          next();
        }
      })
      .fail(next);
  }
});

// Password verification
// candidatePassword is not encrypted one
User.prototype.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if(err) {
      return cb(err);
    }
    cb(null, isMatch);
  });
};

// returns the icon of url using gravatar
User.prototype.getIconURL = function(spec) {
  var self = this;
  if (!spec) {
    spec = {s: '100'};
  }
  return gravatar.url(self.email, spec);
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
      if (err) {
        return done(err);
      }
      if(isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Invalid password' });
      }
    });
  });
}));
