// connection.js

MDChatConnection = function(spec) {
  var self = this;
  self.user_id = spec.user_id || null;
  self.not_use_open = spec.not_use_open;
  self.not_use_push = spec.not_use_push;
};

MDChatConnection.prototype.open = function() {
  var self = this;
  var sound = new Audio("/sounds/new_message.mp3");
  var user_id = self.user_id;
  self.socket = io.connect(location.origin);
  self.registerCallback("connect", function() {
    console.log("connected");
    self.emit('msg update', {
      user_id: user_id
    });
  });
  self.registerCallback("msg changed", function(data) {
    var html = data.html;
    var raw_markdown = data.raw_markdown;
    var say_id = data.say_id;
    var $say = $("#say_" + say_id);
    $say.find(".markdown").html(html);
    $say.find(".raw-markdown textarea").val(raw_markdown);
    if (!$say.find(".raw-markdown .loading").hasClass("hidden")) {
      $say.find(".raw-markdown .loading").addClass("hidden");
      $say.find(".raw-markdown form").removeClass("hidden");
      $say.find(".raw-markdown").addClass("hidden");
      $say.find(".markdown").removeClass("hidden");
    }
    if (!self.user_id || self.user_id.toString() !== data.user_id.toString()
        && $("#volume-button .glyphicon-volume-up").length != 0) {
      sound.play();
    }
  });
  if (!self.not_use_open) {
    self.registerCallback("msg open", function(data) {
      if (data.length > 0) {
        $('#chats').empty(); // ensure to clear #chats
        $.each(data, function(key, value) {
          var say = new Say(value);
          say.appendTo($("#chats"), self.socket);
        });
        $("html").animate({scrollTop: document.body.scrollHeight}, "slow");
      }
    });
  }
  if (!self.not_use_push) {
    self.registerCallback("msg push", function(data) {
      if (!self.user_id || self.user_id.toString() !== data.user_id.toString()) {
        var say = new Say({
          html: data.other_html,
          date: data.date,
          _id: data._id
        });
        if ($("#volume-button .glyphicon-volume-up").length != 0) {
          sound.play();
        }
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
  var previous_login_users = [];
  self.registerCallback('users active', function(data) {
    var user_data = data.users;
    var current_ids = _.map(user_data, function(u) {
      return u.id;
    });
    var previous_ids = _.map(previous_login_users, function(u) {
      return u.id;
    });
    // check the user_data is updated or not...
    if(_.difference(current_ids, previous_ids).length === 0 ||
       _.difference(previous_ids, current_ids).length === 0) {
      previous_login_users = user_data;
      $("#active-user-image-container").empty();
      _.forEach(user_data, function(data) {
        $("#active-user-window").removeClass("hidden");
        var user_name = data.name;
        var url = data.url;
        var user_id = data.id;
        // inserting image with tooltip
        var $img = $('<a href="/user/' + user_id + '" data-toggle="tooltip" title="' + user_name + '"><img src="' + url + '" alt="' + user_name + '"/></a>');
        $("#active-user-image-container").append($img);
        $img.tooltip();
      });
    }
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

