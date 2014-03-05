// user.js

$(function() {
  var connection = new MDChatConnection({user_id: LOGIN_USER_ID,
                                         not_use_open: true,
                                         not_use_push: true
                                        });
  connection.open();
  // create say objects from html
  
  $('#chats .say-wrapper').each(function() {
    var say = Say.createFromHTML($(this));
    say.registerCallback($(this), connection);
  });
});
