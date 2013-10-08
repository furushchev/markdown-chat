messageKeydown = function(text, e) {
	if (e.keyCode == 9) { // Tab
		if (e.preventDefault) {
			e.preventDefault();
			e.stopPropagation();
		}
		e.returnValue = false;

		if (text.createTextRange) { // for IE
			var range = document.selection.createRange();
			range.text = "\t";
		} else if (text.setSelectionRange) {
			var top = text.scrollTop;
			var start = text.selectionStart;
			text.value = text.value.substr(0, text.selectionStart)
				+ "\t"+ text.value.substr(text.selectionEnd);
			text.setSelectionRange(start+1,start+1);
			text.scrollTop = top;
		}
	}


	if (e.keyCode == 13 && e.shiftKey) { // S-Enter
		if (e.preventDefault) {
			e.preventDefault();
			e.stopPropagation();
		}
		e.returnValue = false;

		$('#message').submit();
	}
};
