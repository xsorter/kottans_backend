const net = require("net");
const dns = require("dns");
const args = require("minimist")(process.argv.slice(2));
let range;

if (args.ports) {
  range = args.ports.toString().split("-");
} else {
  range = [0, 65500];
}

let firstPort = +range[0];
const lastPort = +range[1];
const openedPorts = [];

const openedPortCheck = (host, port, callback) => {
  const socket = net.createConnection(port, host);
  var time = setTimeout(() => {
    socket.destroy();
    callback(false);
  }, 300);

  socket.on("connect", () => {
    console.log("CONNECTED");
    clearTimeout(time);
    socket.destroy();
    process.stdout.write(".");
    openedPorts.push(port);
    callback(true);
  });
  socket.on("error", function() {
    console.log("ERROR");
    clearTimeout(timer);
    callback(false);
  });
};

const showResult = host => {
  if (args.help) {
    process.stdout.write(`
    Port sniffer CLI tool. \n
    Parameters:
    --ports - type ports range
    --host - provide host IP adress or domain name \n
    Usage example: node program.js --ports 80-87 --host 172.217.3.110
    `);
    return false;
  }

  openedPortCheck(host, firstPort, function next() {
    if (firstPort === lastPort) {
      if (openedPorts.length) {
        process.stdout.write(`\nports ${openedPorts.join()} are opened`);
        return false;
      } else {
        process.stdout.write(`No opened ports was found`);
        return false;
      }
    }
    openedPortCheck(host, ++firstPort, next);
  });
};

const ipLookup = () => {
  return new Promise((resolve, reject) => {
    dns.lookup(args.host, (err, address, family) => {
      if (err) reject(err);
      resolve(address);
    });
  });
};

ipLookup()
  .then(res => {
    showResult(res);
  })
  .catch(err => {
    process.stdout.write(`Adress not found`);
  });
