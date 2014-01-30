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

Say.prototype.appendTo = function($content) {
  var $data = $(this.html);
  var date_str = this.date.getFullYear() + "/"
    + (this.date.getMonth() + 1) + "/"
    + (this.date.getDate()) + " "
    + (this.date.getHours()) + ":" + this.date.getMinutes();
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

