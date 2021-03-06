// say class
function Say(spec) {
  if (spec) {
    if (spec.date instanceof Date) {
      this.date = spec.date;
    }
    else {
      this.date = new Date(spec.date);
    }
    this._id = spec._id;
    this.html = spec.html;
  }
};

Say.all_says = [];

Say.createFromHTML = function($html) {
  var say = new Say();
  var id = $html.attr("data-say-id");
  var date = new $html.attr("data-date");
  say._id = id;
  say.date = date;
  say.html = $html.html();
  return say;
};

Say.prototype.dateFormat = function() {
  var now = new Date();
  var diff = (now - this.date) / 1000.0; // diff in sec
  if (diff < 1 * 10) {
    return "now";
  }
  else if (diff < 60) {   // within sec
    return Math.ceil(diff) + " secs ago";
  }
  else if (diff < 60 * 60) { // within hour
    return Math.ceil(diff / 60) + " mins ago";
  }
  else if (diff < 24 * 60 * 60) { // within day
    return Math.ceil(diff / 60 / 60) + " hours ago";
  }
  else {
    return Math.ceil(diff / 24 / 60 / 60) + " days ago";
  }
};

Say.prototype.updateDateFormat = function() {
  $("#say_" + this._id).find(".date-sentence").html(this.dateFormat());
};

Say.prototype.registerCallback = function($data, socket) {
  var self = this;
  $data.find(".say-delete-button").click(function(e) {
    e.preventDefault();
    if (window.confirm("Are you sure to remove this message?")) {
      socket.emit("msg delete", {
        say_id: self._id
      });
      self.remove();
    }
  });
  $data.find(".say-edit-button").click(function(e) {
    e.preventDefault();
    var $parent = $data;
    var $markdown = $parent.find(".markdown");
    var $raw_markdown = $parent.find(".raw-markdown");
    if ($raw_markdown.hasClass("hidden")) {
      $raw_markdown.removeClass("hidden");
      $markdown.addClass("hidden");
    }
    else {
      $raw_markdown.addClass("hidden");
      $markdown.removeClass("hidden");
    }
  });
  $data.find(".edit-button").parent().submit(function(e) {
    e.preventDefault();
    var $markdown = $data.find(".markdown");
    var $raw_markdown = $data.find(".raw-markdown");
    var $loading= $data.find(".loading");
    $raw_markdown.find("form").addClass("hidden");
    $loading.removeClass("hidden");
    // sending message to the server
    socket.emit("msg edit", {
      say_id: self._id,
      markdown: $raw_markdown.find("textarea").val()
    });
    return false;
  });
};

Say.prototype.autoResizeEditZone = function($data) {
  $data.find("textarea").autosize();
};

Say.prototype.remove = function() {
  $("#say_" + this._id).remove();
};

Say.prototype.appendTo = function($content, socket) {
  var $data = $(this.html);
  this.registerCallback($data, socket);
  var date_str = this.date.getFullYear() + "/"
    + (this.date.getMonth() + 1) + "/"
    + (this.date.getDate()) + " "
    + (this.date.getHours()) + ":" + this.date.getMinutes();
  this.autoResizeEditZone($data);
  $data.find(".date-sentence")
    .attr("title", date_str)
    .tooltip();
  $content.append($data);
  this.updateDateFormat();
  Say.all_says.push(this);
  return $data;
}



// call updateDateFormat every 1 seconds
Say.updateAllDateFormat = function() {
  for (var i = 0; i < Say.all_says.length; i++) {
    Say.all_says[i].updateDateFormat();
  }
  setTimeout(Say.updateAllDateFormat, 1000);
};

Say.updateAllDateFormat();

