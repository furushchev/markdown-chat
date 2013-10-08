$(function() {
	socket = io.connect(location.href);
	socket.on('connect', function() {
		socket.emit('msg update');
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

	$('#delete').click(function(){
		if(window.confirm("Are you sure?") == true) {
			socket.emit('deleteDB');
			$('#list').empty();
		}
	});

	socket.on('msg open', function(data) {
		if(data.length == 0) {
			console.log("nothing to load.");
			return;
		} else {
			console.log(data);
			$('#list').empty();
			$.each(data, function(key, value) {
				console.log("hoge");
				$('#list').prepend($('<dt>@' + value.name + ': ' + value.date + '</dt><dd>' + value.markdown + '</dd>'));
			});
		}
	});			  

	socket.on('msg push', function(data) {
		console.log(data);
		var date = new Date();
		$('#list').prepend($('<dt>@' + data.name + ': ' + date + '</dt><dd>' + data.markdown + '</dd>'));
	});

});
