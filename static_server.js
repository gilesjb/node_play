var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    timers = require("timers"),
    port = process.argv[2] || 8888;

http.createServer(function(request, response) {

    var parsed = url.parse(request.url),
        filename = path.join(process.cwd(), parsed.pathname);

    console.log(parsed);

    path.exists(filename, function(exists) {
        if (!exists) {
            response.writeHead(404, {"Content-Type": "text/plain"});
            response.write("404 Not Found\n");
            response.end();
            return;
        }

        var rs = fs.createReadStream(filename, {bufferSize: 10});

        rs.on('error', function(err) {
            response.writeHead(500, {"Content-Type": "text/plain"});
            response.write(err + "\n");
            response.end();
        });

        rs.on('open', function() {
            response.writeHead(200);
        });

        rs.on('data', function(data) {
            response.write(data);
            rs.pause();
            timers.setTimeout(function() {
                rs.resume();
            }, 10);
        });

        rs.on('end', function() {
            response.end();
        });
    });
}).listen(parseInt(port, 10));

console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");
