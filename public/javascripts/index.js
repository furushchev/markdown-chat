$(function(){

  function scrollToBottomAnimated() {
    $("html,body").animate({scrollTop: document.body.scrollHeight}, "slow");
  };

  function sendFormData() {
    var name = $('#namae');
    var message = $('#message');
    var sendData = {
      "name": name.val(),
      "msg": message.val(),
    };
    socket.emit('msg send', sendData);
    // $.cookie("name", name.val()); // store the name value
    message.val('');        // clear message
  };
  
  // check the cookie to recall name
  // if ($.cookie("name")) {
  //   $('input[name="namae"]').val($.cookie("name"));
  // }

  var socket = io.connect(location.href);

  socket.on('connect', function() {
    // sending login information
    socket.emit('msg update', {
      user_id: LOGIN_USER_ID
    });
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
        say.appendTo($("#chats"));
        //$('#chats').append(value.html);
      });
    }
  });         

  socket.on('msg push', function(data) {
    var say = new Say(data);
    var $data = say.appendTo($("#chats"));
    // scroll to bottom
    $data.ready(function() {
      scrollToBottomAnimated();
    });
  });

  
  // need jquery.taboverride
  $('textarea').tabOverride(true);
  $('#btn').click(sendFormData);
  
  // S-Enter -> submit
  $('textarea').keydown(function(e) {
    if(e.keyCode == 13 && e.shiftKey) {
      if (e.preventDefault) {
        e.preventDefault();
        e.stopPropagation();
      }
      e.returnValue = false;
      sendFormData();
    }
  });
});
