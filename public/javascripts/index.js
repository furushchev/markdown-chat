$(function(){
	console.log($('textarea'));
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

			var message = $('#message');
			console.log(message);
			socket.emit('msg send', message.val());
			message.val('');
		}
	});
});
