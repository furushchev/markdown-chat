$(function() {
    function scrollToBottomAnimated() {
        $("html,body").animate({scrollTop: document.body.scrollHeight}, "slow");
    };
    
	socket = io.connect(location.href);

	socket.on('connect', function() {
		socket.emit('msg update');
		console.log('connected.');
	});

	$('#btn').click(function() {
		var name = $('#namae');
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
                $('#chats').append(value);
			});
		}
	});			  

	socket.on('msg push', function(data) {
        var $data = $(data);
        $('#chats').append($data);
        // scroll to bottom
        $data.ready(function() {
            console.log("hoge");
            scrollToBottomAnimated();
        });
	});

});
