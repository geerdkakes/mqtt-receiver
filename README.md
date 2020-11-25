# mqtt-receiver

This app can be used to test the delay to a mqtt server with different payload sizes and timing intervals. The app can be build into a container or run from the command line.

## Run from command line

Make sure you have npm and node installed on your system.

Install packages using: 
```
npm install
```

run the app with:
```
node server.js -u user -s passwd -h localhost
```
the flags stand for:
 * -h `hostname` (if ommited mqtt://localhost is used)
 * -p `port` (if ommited port 1883 is used)
 * -u `user`
 * -s `passwd`
 * -o `output_file` file to write message info to (if ommited stdout is used)
 * -d `data_file` file to write message data to
 * -t `topic` to subscribe to (use # as a wildcard for all)
 * -q `qos_option` (0 if ommitted)
 * -z `true:flase` print out time difference with last message
 * -c `Certificate_file` Certificate for tls authentication name
 * -k `Private_key_file` Private key file name for tls authentication
 * -r `Root_certificate_file` Root Certificate file name
 * -a `true:false` reject unauthorised connection true or false
 * -v `level` for verbose output

example usage:
```
node server.js -u username -s 'password' -v 2 -t '#' -z true -h mqtts://localhost -p 8883 -k client_key.pem -c client_certificate.pem -r ca_certificate.pem -a true
```

## Optional using docker

Build docker image
```
docker build -t mqtt-receiver .
```

Run the docker image using:
```
docker run -it mqtt-receiver -u user -s passwd -h localhost
```


