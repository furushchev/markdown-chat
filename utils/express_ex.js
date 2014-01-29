// express_ex.js

var utils = require("connect").utils;
var unauthorized = utils.unauthorized;

// we define basicAuth rather than using express.basicAuth
// because express.basicAuth sets req.user and it make passport
// confuse.
exports.basicAuth = function basicAuth(callback, realm) {
  var username, password;

  // user / pass strings
  if ('string' == typeof callback) {
    username = callback;
    password = realm;
    if ('string' != typeof password) throw new Error('password argument required');
    realm = arguments[2];
    callback = function(user, pass){
      return user == username && pass == password;
    }
  }

  realm = realm || 'Authorization Required';

  return function(req, res, next) {
    var authorization = req.headers.authorization;

    if (req.basicUser) return next();
    if (!authorization) return unauthorized(res, realm);

    var parts = authorization.split(' ');

    if (parts.length !== 2) return next(utils.error(400));

    var scheme = parts[0]
    , credentials = new Buffer(parts[1], 'base64').toString()
    , index = credentials.indexOf(':');

    if ('Basic' != scheme || index < 0) return next(utils.error(400));

    var user = credentials.slice(0, index)
    , pass = credentials.slice(index + 1);

    // async
    if (callback.length >= 3) {
      var pause = utils.pause(req);
      callback(user, pass, function(err, user){
        if (err || !user)  return unauthorized(res, realm);
        req.basicUser = req.remoteUser = user;
        next();
        pause.resume();
      });
      // sync
    } else {
      if (callback(user, pass)) {
        req.basicUser = req.remoteUser = user;
        next();
      } else {
        unauthorized(res, realm);
      }
    }
  }
};
