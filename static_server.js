var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs")
    port = process.argv[2] || 8888;

http.createServer(function(request, response) {

  var uri = url.parse(request.url).pathname
    , filename = path.join(process.cwd(), uri);
  
  path.exists(filename, function(exists) {
    if (!exists) {
      response.writeHead(404, {"Content-Type": "text/plain"});
      response.write("404 Not Found\n");
      response.end();
      return;
    }

    var rs = fs.createReadStream(filename);
    
    rs.on('error', function(err) {
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.write(err + "\n");
        response.end();
    });
    
    rs.on('open', function() {
      response.writeHead(200);
    });
    
    rs.on('data', function(data) {
        if (!response.write(data)) rs.pause();
    });
    
    response.on('drain', function() {
        rs.resume();
    });
    
    rs.on('end', function() {response.end()});
  });
}).listen(parseInt(port, 10));

console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");
