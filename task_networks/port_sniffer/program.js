const mapLimit = require("async/mapLimit");

const net = require("net");
const dns = require("dns");
const args = require("minimist")(process.argv.slice(2));
const range = findPortsRange();

const ports = {
  //fill list from range here
  portList: [
    79,
    80,
    81,
    82,
    83,
    84,
    85,
    86,
    87,
    88,
    89,
    90,
    91,
    92,
    93,
    94,
    95,
    96,
    97,
    98,
    99,
    100,
    101,
    102,
    103,
    442,
    443,
    444,
    445
  ],
  firstPort: +range[0],
  lastPort: +range[1] ? +range[1] : +range[0],
  openedPorts: []
};

const openedPortCheck = (host, port, callback) => {
  const socket = net.createConnection(port, host);
  let time = socket.setTimeout(300, () => {
    socket.destroy();
    callback(false);
  });

  socket.on("connect", () => {
    clearTimeout(time);
    socket.destroy();
    process.stdout.write(".");
    ports.openedPorts.push(port);
    callback(true);
  });
  socket.on("error", function() {
    clearTimeout(time);
    callback(false);
  });
};

const showResult = host => {
  if (args.help) {
    process.stdout.write(messages().help);
    process.exit(1);
  }
  if (!args.host) {
    process.stdout.write(messages().noHost);
    process.exit(1);
  } else {
    mapLimit(ports.portList, 20, async (e, i) => {
      await openedPortCheck(host, e, () => {
        if (e === 445) {
          //if current == last port from list
          if (ports.openedPorts.length) {
            process.stdout.write(
              messages(ports.openedPorts.join()).openedPorts
            );
            process.exit();
          } else {
            process.stdout.write(messages().portsNotFound);
            process.exit(1);
          }
        }
      });
    });
    /*openedPortCheck(host, ports.firstPort, function nextIteration() {
      if (ports.firstPort === ports.lastPort) {
        if (ports.openedPorts.length) {
          process.stdout.write(messages(ports.openedPorts.join()).openedPorts);
          process.exit();
        } else {
          process.stdout.write(messages().portsNotFound);
          process.exit(1);
        }
      }
      openedPortCheck(host, ++ports.firstPort, nextIteration);
    });*/
  }
};

function findPortsRange() {
  if (args.ports) {
    if (args.ports.length) {
      return args.ports.toString().split("-");
    } else {
      process.stdout.write(messages().emptyPortsParameter);
      process.exit(1);
    }
  } else {
    return ["0", "65535"];
  }
}

function messages(openedPortsNumbers) {
  return {
    help: `Port sniffer CLI tool. \n
    Parameters:
    --ports - type ports range
    --host - provide host IP adress or domain name \n
    Usage example: node program.js --ports 80-87 --host google.com`,
    noHost: "Please provide host name. Type --help for usage manual.",
    openedPorts: `\nports ${openedPortsNumbers} are opened`,
    portsNotFound: "No opened ports was found",
    emptyPortsParameter:
      "Please provide a port numbers range or skip --port parameter for default values (0-65535)"
  };
}

function fillArrayRange(arrLength, firstVal) {
  return Array.from(new Array(arrLength), (val, i) => i + firstVal);
}

const ipLookup = () => {
  return new Promise((resolve, reject) => {
    dns.lookup(args.host, (err, address) => {
      if (err) reject(err);
      resolve(address);
    });
  });
};

ipLookup()
  .then(res => showResult(res))
  .catch(() => process.stdout.write(`Adress not found`));
