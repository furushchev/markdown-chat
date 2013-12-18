// model/index.js

var files = ["./say.js", "./user.js"]

for (var i = 0; i < files.length; i++) {
    require(files[i]);
}

