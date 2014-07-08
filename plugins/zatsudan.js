var request = require('request');
var config = require('../config');

exports.containsMentions = function(msg){
  var slist = msg.split(' ');
  var to = [];
  for (var i = 0; i < slist.length; ++i){
    var s = slist[i];
    if (s[0] === '@' && s.length >= 2){
      to.push(s.slice(1));
    }
  }
  return to;
};

exports.getZatsudan = function(data, onGet){
  var options = {
    uri: 'https://api.apigw.smt.docomo.ne.jp/dialogue/v1/dialogue/?APIKEY=' + config.DOCOMO_API_KEY,
    headers: {
      'Content-Type': 'application/json',
    },
    json: true,
    body: JSON.stringify({
      'utt': data.question,
      'nickname': data.name
    });
  };

  request.post(options, function(err, res, body){
    onGet(err, res, body);
  });
};



