var mqtt=require('mqtt');
const args = require('minimist')(process.argv.slice(2));
var nodeCleanup = require('node-cleanup');
const fs = require('fs');
var port;
var secure = false;
/*
 * -h url (if ommited mqtt://localhost is used)
 * -p port (if ommited port 1883 is used)
 * -q qos_option (0 if ommitted)
 * -u user
 * -s passwd
 * -o output logfile name to write to
 * -d output data file to write to
 * -t topic to subscribe to ("#" if omitted)
 * -z print out time difference with last message
 * -c Certificate file name
 * -k Private key file name
 * -r Root certificate file name
 * -a reject unauthorised connection true or false
 * -v <level> for verbose output
 * -i <client_id>
 * 
 * When using TLS make sure the CA certificate is known. E.g. by
 * specifying the path wit an environment variable:
 * 
 * export NODE_EXTRA_CA_CERTS=/Users/geerd/Developer/geoserver-k8s/etc/ca_certificate.pem
 * 
 */

 // when running on the cluster with rabbitmq use "rabbitmq.default.svc.appfactory.local"
 // for the hostname

var mqtt_url = (typeof args.h === 'undefined' || args.h === null) ? "mqtt://localhost" : args.h;
var client_id = (typeof args.i === 'undefined' || args.i === null) ? "mqttjs02uni" : args.i;

if (mqtt_url.substring(0,5) === "mqtts") {
    secure = true;
 }

if (typeof args.p === 'undefined' || args.p === null) {
    // no port specified, we guess the port
    if (secure) {
        port = 8883;
    } else {
        port = 1883;
    }
} else {
    port = args.p;
}

var mqtt_options = {
    clientId: client_id,
    username: (typeof args.u === 'undefined' || args.u === null) ? "testuser" : args.u,
    password: (typeof args.s === 'undefined' || args.s === null) ? "passwd" : args.s,
    port: port,
    clean:false,
};

mqtt_options.key = (typeof args.k === 'undefined' || args.k === null) ? null : fs.readFileSync(args.k);
mqtt_options.cert = (typeof args.c === 'undefined' || args.c === null) ? null : fs.readFileSync(args.c);
mqtt_options.ca = (typeof args.r === 'undefined' || args.r === null) ? null : fs.readFileSync(args.r);
mqtt_options.rejectUnauthorized = (typeof args.a === 'undefined' || args.a === null || args.a === 'false') ? false : true;

var message_options = {
    retain:false,
    qos:(typeof args.q === 'undefined' || args.q === null) ? 0 : args.q
};

var file_log = (typeof args.o === 'undefined' || args.o === null) ? null : args.o;
var file_data = (typeof args.d === 'undefined' || args.d === null) ? null : args.d;
var topic = (typeof args.t === 'undefined' || args.t === null) ? "#" : args.t;
var verbose = (typeof args.v === 'undefined' || args.v === null) ? 0 : args.v;
var timedif = (typeof args.z === 'undefined' || args.z === null) ? 0 : 1;

var connected = false;
if (verbose) {
    console.log("Connecting to " + mqtt_url);
    console.log("using options:");
    console.log(mqtt_options);
}
var client  = mqtt.connect(mqtt_url,
                           mqtt_options
                           );
var last_timestamp;
var fd_log = null;
var fd_data = null;

// open log file
if (file_log) {
    fs.open(file_log, 'a', function postOpen(errOpen, fd) {
        if (errOpen) {
            console.error("could not open file: " + file_log + " for writing");
            process.exit(1);
        }
        fd_log = fd;
        if (verbose > 1) {
            console.log("opened file " + file_log + " for writing");
        }
    });
} else {
    // set to stdout
    fd_log = 1;
    if (verbose > 1) {
        console.log("writing output to console");
    }
}
// open data file
if (file_data) {
    fs.open(file_data, 'a', function postOpen(errOpen, fd) {
        if (errOpen) {
            console.error("could not open file: " + file_data + " for writing");
            process.exit(1);
        }
        fd_data = fd;
        if (verbose > 1) {
            console.log("opened " + file_data + " for writing data to");
        }
    });
} 

client.on("connect",function(){	
    connected = client.connected;
    if (verbose ) {
        console.log("Connected: " + connected);
        console.log("Subscribing to: " + topic);
    }

    client.subscribe(topic, function (err) {
        if (!err) {
          console.log("subscribed to topic " + topic);
          sendtime = 0; // enable sending
        } else console.log( "error subscribing:" + err );
    });
});

client.on("error", function(error){ 
   console.error("Can't connect"+error);
   process.exit(1);
});

//handle incoming messages
client.on('message',function(topic, message, packet){
    if (verbose >= 2 ) {
        console.log("incomming message with sendtime: " + sendtime + " and message: " + message);
    }
    current_timestamp = Date.now().valueOf();
    var printdif="";
    if (timedif) {
      printdif = ":" + (current_timestamp-last_timestamp);
    }
    fs.write(fd_log, current_timestamp + printdif +  ":" + topic + ":\n",function postWrite(errWrite, written, string){
        if (errWrite) {
            console.error("Error writing log data");
        }
    });
    last_timestamp = current_timestamp;
    if (fd_data) {
        fs.write(fd_data, message,function postWrite(errWrite, written, string){
            if (errWrite) {
                console.error("Error writing message data to: " + file_data);
            }
            process.exit(1);
        });
    }
});


nodeCleanup(function (exitCode, signal) {
    console.log("");
    if (fd_log != null && fd_log != 1) {
        if (verbose > 1) {
            console.log("Closing file " + file_log);
        }
        fs.closeSync(fd_log);
    }
    if (fd_data != null ) {
        if (verbose > 1) {
            console.log("Closing file " + file_data);
        }
        fs.closeSync(fd_data);
    }

});
