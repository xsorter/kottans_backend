const net = require("net");
const dns = require("dns");
const args = require("minimist")(process.argv.slice(2));
let range;

if (args.ports) {
  if (args.ports.length) {
    range = args.ports.toString().split("-");
  } else {
    process.stdout.write(
      "Please provide a port number range or do not use --port parameter for default values (0-65535)"
    );
    process.exit(1);
  }
} else {
  range = ["0", "65535"];
}

let firstPort = +range[0];
const lastPort = +range[1] ? +range[1] : +range[0];
const openedPorts = [];

const openedPortCheck = (host, port, callback) => {
  const socket = net.createConnection(port, host);
  var time = setTimeout(() => {
    socket.destroy();
    callback(false);
  }, 300);

  socket.on("connect", () => {
    clearTimeout(time);
    socket.destroy();
    process.stdout.write(".");
    openedPorts.push(port);
    callback(true);
  });
  socket.on("error", function() {
    clearTimeout(time);
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
    process.exit(1);
  }

  if (!args.host) {
    process.stdout.write(
      "Please provide host name. Type --help for usage manual."
    );
    process.exit(1);
  } else {
    openedPortCheck(host, firstPort, function next() {
      if (firstPort === lastPort) {
        if (openedPorts.length) {
          process.stdout.write(`\nports ${openedPorts.join()} are opened`);
          process.exit();
        } else {
          process.stdout.write(`No opened ports was found`);
          process.exit(1);
        }
      }
      openedPortCheck(host, ++firstPort, next);
    });
  }
};

const ipLookup = () => {
  return new Promise((resolve, reject) => {
    dns.lookup(args.host, (err, address) => {
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
