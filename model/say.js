// model/say.js

var mongoose = require("mongoose");

var Schema = mongoose.Schema;
var UserSchema = new Schema({
	name: String,
	date: Date,
	message: String,
	markdown: String
});

mongoose.model('User', UserSchema);
var User = mongoose.model('User');
