var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    timers = require("timers"),
    qs = require("querystring"),
    port = process.argv[2] || 8888;

http.createServer(function(request, response) {

    var parsed = url.parse(request.url),
        filename = path.join(process.cwd(), parsed.pathname);

    var args = qs.parse(parsed.query, ',', ':');
    var delays = [];
    for (var arg in args) {
        delays.push([arg, parseInt(args[arg]) || 0]);
    }

    path.exists(filename, function(exists) {
        if (!exists) {
            response.writeHead(404, {"Content-Type": "text/plain"});
            response.write("404 Not Found\n");
            response.end();
            return;
        }

        var rs = fs.createReadStream(filename, {bufferSize: 100});
        var pos = 0;

        rs.on('error', function(err) {
            response.writeHead(500, {"Content-Type": "text/plain"});
            response.write(err + "\n");
            response.end();
        });

        rs.on('open', function() {
            response.writeHead(200, {"Content-Type": "text/html"});
        });

        rs.on('data', function(data) {
            var delay = delays.length && delays[0][1];
            rs.pause();
            timers.setTimeout(function() {
                response.write(data);
                pos += data.length;
                if (delays.length && pos > delays[0][0]) {
                    delays.shift();
                }
                rs.resume();
            }, delay);
        });

        rs.on('end', function() {
            response.end();
        });
    });
}).listen(parseInt(port, 10));

console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");
