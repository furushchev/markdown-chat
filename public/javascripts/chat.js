$(function() {
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
        $data.find(".date-sentence")
            .attr("title", this.date)
            .tooltip();
        $content.append($data);
        this.updateDateFormat();
        return $data;
    }
    
    var all_says = [];

    // call updateDateFormat every 1 seconds
    function updateAllDateFormat() {
        for (var i = 0; i < all_says.length; i++) {
            all_says[i].updateDateFormat();
        }
        setTimeout(updateAllDateFormat, 1000);
    };
    
    updateAllDateFormat();
  function scrollToBottomAnimated() {
    $("html,body").animate({scrollTop: document.body.scrollHeight}, "slow");
  };
  
  // check the cookie to recall name
  if ($.cookie("name")) {
    $('input[name="namae"]').val($.cookie("name"));
  }
    
	socket = io.connect(location.href);

	socket.on('connect', function() {
		socket.emit('msg update');
		console.log('connected.');
	});

	$('#btn').click(function() {
		var name = $('#namae');
    $.cookie("name", name.val());
		var message = $('#message');
		var sendData = {
			"name": name.val(),
			"msg": message.val(),
		};
		socket.emit('msg send', sendData);
		message.val('');        // clear message
	});

	$('#delete').click(function(){
		if(window.confirm("Are you sure?") == true) {
			socket.emit('deleteDB');
			$('#chats').empty();
		}
	});

	socket.on('msg open', function(data) {
		if(data.length == 0) {
			console.log("nothing to load.");
			return;
		} else {
			$('#chats').empty(); // ensure to clear #chats
			$.each(data, function(key, value) {
          var say = new Say(value);
          all_says.push(say);
          say.appendTo($("#chats"));
          //$('#chats').append(value.html);
			});
		}
	});			  

	socket.on('msg push', function(data) {
      var say = new Say(data);
      all_says.push(say);
      var $data = say.appendTo($("#chats"));
    // scroll to bottom
      $data.ready(function() {
          scrollToBottomAnimated();
      });
	});

});
