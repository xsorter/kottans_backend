const net = require("net");

const openedPortCheck = (host, port, callback) => {
  const server = net.createServer(socket => {
    socket.write("server");
    socket.pipe(socket);
  });
  server.listen(port, host);
  server.on("error", e => {
    callback(true);
  });
  server.on("listening", function(e) {
    server.close();
    callback(false);
  });
  console.log("host is", host);
  console.log("port is", port);
};

openedPortCheck("127.0.0.1", 4200, returnVal => {
  console.log(returnVal);
});
