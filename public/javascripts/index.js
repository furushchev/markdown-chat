$(function(){

  function scrollToBottomAnimated() {
    $("html").animate({scrollTop: document.body.scrollHeight}, "slow");
  };

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
});
