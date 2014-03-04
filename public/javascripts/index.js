$(function(){

  function sendFormData() {
    var name = $('#namae');
    var message = $('#message');
    if (message.val().replace(/\s*/g, '').length !== 0) {
      connection.postMessage(name.val(), message.val());
      $("#loading-area").removeClass("hidden");
    }
    message.val('');        // clear message
  };
  
  var connection = new MDChatConnection({user_id: LOGIN_USER_ID,
                                         not_use_open: false});
  connection.open();
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
      sendFormData();
    }
  });

  // update #volume-button according to the cookir
  if ($.cookie("volume-enabled") === "false") {
    $(this).find("#volume-button .glyphicon-volume-up")
      .removeClass("glyphicon-volume-up")
      .addClass("glyphicon-volume-off");
  }
  $("#volume-button").click(function(e) {
    e.preventDefault();
    if ($(this).find(".glyphicon-volume-up").length == 0) {
      $(this).find(".glyphicon-volume-off")
        .removeClass("glyphicon-volume-off")
        .addClass("glyphicon-volume-up");
      $.cookie("volume-enabled", true, {expires: 7});
    }
    else {
      $(this).find(".glyphicon-volume-up")
        .removeClass("glyphicon-volume-up")
        .addClass("glyphicon-volume-off");
      $.cookie("volume-enabled", false, {expires: 7});
    }
    return false;
  });
});
