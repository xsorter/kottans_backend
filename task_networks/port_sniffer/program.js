const net = require("net");
const args = require("minimist")(process.argv.slice(2));

const range = args.ports.split("-");
const firstPort = +range[0];
const lastPort = +range[1];
const openedPorts = [];

const ports =
  range.length === 1 ? [firstPort] : populateArray(firstPort, lastPort);

const openedPortCheck = (host, port, callback) => {
  const server = net.createServer(socket => {
    socket.write("server");
    socket.pipe(socket);
  });

  server.listen(port, host);
  server.on("error", err => {
    callback(false);
  });
  server.on("listening", () => {
    server.close();
    callback(true);
  });
};

function populateArray(first, last) {
  return Array.from({ length: last - first }, (_, k) => k + first);
}

async function showResult(ports) {
  await ports.map(e => {
    openedPortCheck(args.host, e, isOpened => {
      if (isOpened) {
        openedPorts.push(Buffer.from(e.toString()));
      }
      process.stdout.write(isOpened + " " + e + "\n");
    });
  });

  process.stdout.write(`ports ${openedPorts.join()} are opened`);
}

showResult(ports);
