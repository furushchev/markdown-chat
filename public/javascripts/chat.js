$(function() {
	socket = io.connect('http://localhost');
	socket.on('connect', function() {
		console.log('connected.');
	});

	$('#btn').click(function() {
		var name = $('#namae');
		var message = $('#message');
		console.log(name.val());
		console.log(message.val());
		var sendData = {
			"name": name.val(),
			"msg": message.val(),
		};
//		socket.emit('msg send', message.val());
		socket.emit('msg send', sendData);
		message.val('');
	});

	socket.on('msg push', function(data) {
		console.log(data);
		var date = new Date();
		$('#list').prepend($('<dt>@' + data.name + ': ' + date + '</dt><dd>' + data.markdown + '</dd>'));
	});

	socket.on('msg updateDB', function(data) {
		// TODO: mongoDBにつっこむ予定
		console.log(data);
	});
});
