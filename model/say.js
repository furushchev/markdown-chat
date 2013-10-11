// model/say.js

var mongoose = require("mongoose");

var Schema = mongoose.Schema;
var SaySchema = new Schema({
	name: String,
	date: Date,
	message: String,
	markdown: String
});

mongoose.model('Say', SaySchema);
var Say = mongoose.model('Say');