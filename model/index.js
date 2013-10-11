// model/index.js

var files = ["./say.js"]

for (var i = 0; i < files.length; i++) {
    require(files[i]);
}

