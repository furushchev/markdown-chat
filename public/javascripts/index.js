$(function(){
	// need jquery.taboverride
	$('textarea').tabOverride(true);

	// S-Enter -> submit
	$('textarea').keydown(function(e) {
		if(e.keyCode == 13 && e.shiftKey) {

			if (e.preventDefault) {
				e.preventDefault();
				e.stopPropagation();
			}
			e.returnValue = false;

			var name = $('#namae');
			var message = $('#message');
			console.log(name + " " + message);
			var sendData = {
				"name": name.val(),
				"msg": message.val()
			};
			socket.emit('msg send', sendData);

			message.val('');
		}
	});
});
