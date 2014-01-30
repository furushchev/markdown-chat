// connection.js

MDChatConnection = function(spec) {
  var self = this;
  self.user_id = spec.user_id || null;
  self.not_use_open = spec.not_use_open;
  self.not_use_push = spec.not_use_push;
};

MDChatConnection.prototype.open = function() {
  var self = this;
  var user_id = self.user_id;
  self.socket = io.connect(location.origin);
  self.registerCallback("connect", function() {
    console.log("connected");
    self.emit('msg update', {
      user_id: user_id
    });
  });
  if (!self.not_use_open) {
    self.registerCallback("msg open", function(data) {
      if (data.length > 0) {
        $('#chats').empty(); // ensure to clear #chats
        $.each(data, function(key, value) {
          var say = new Say(value);
          say.appendTo($("#chats"), self.socket);
        });
      }
    });
  }
  if (!self.not_use_push) {
    var sound = new Audio("/sounds/new_message.mp3");
    self.registerCallback("msg push", function(data) {
      if (!self.user_id || self.user_id.toString() !== data.user_id.toString()) {
        var say = new Say({
          html: data.other_html,
          date: data.date,
          _id: data._id
        });
        sound.play();
      }
      else {
        var say = new Say({
          html: data.me_html,
          date: data.date,
          _id: data._id
        });
      }
      var $data = say.appendTo($("#chats"), self);
      // scroll to bottom
      $data.ready(function() {
        $("html,body").animate({scrollTop: document.body.scrollHeight}, "slow");
        $("#loading-area").addClass("hidden");
      });
    });
  }
  self.registerCallback('msg delete-one', function(data) {
    var say_id = data.say_id;
    $("#say_" + say_id).remove();
  });
  
};

MDChatConnection.prototype.registerCallback = function(event, cb) {
  console.log("registering " + event);
  this.socket.on(event, cb);
};

MDChatConnection.prototype.emit = function(msg, data) {
  this.socket.emit(msg, data);
}

MDChatConnection.prototype.postMessage = function(name, msg) {
  var self = this;
  self.emit('msg send', {"name": name, "msg": msg});
};
