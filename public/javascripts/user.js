// user.js

$(function() {
  var connection = new MDChatConnection({user_id: LOGIN_USER_ID,
                                         not_use_open: true,
                                         not_use_push: true
                                        });
  connection.open();
  console.log(connection);
});
