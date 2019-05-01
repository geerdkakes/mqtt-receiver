# mqtt-delay

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
 * -h hostname (if ommited localhost is used)
 * -p port (if ommited port 1883 is used)
 * -u user
 * -s passwd
 * -o output file to write output to (if ommited stdout is used)
 * -d data file to write messages to
 * -t topic to subscribe to


## Optional using docker

Build docker image
```
docker build -t mqtt-receiver .
```

Run the docker image using:
```
docker run -it mqtt-receiver -u user -s passwd -h localhost
```


