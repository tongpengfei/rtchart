# Real Time Chart
### draw real time chart by tail -f

rtchart.js listen on 3 ports:
* webserver port 80: webserver
* rtchart listen on 8080: rtchart_cli.js send data to this port
* rtchart listen on 8081: html websocket get data from this port

```bash
# data flow as follow:
                                 rtchart.js
                                /          \
                             ws:8080      ws:8081
                              /              \
tail -f a.txt | rtchart_cli.js                browser
```

rtchart_cli.js read data from a.txt，sends to rtchart.js 8080,
browser get data from 8081 over websocket, draw chart on real time
#init
```bash
git clone https://github.com/tongpengfei/rtchart.git

npm install
```

#start server
```bash
node rtchart.js
```

#start client
```bash
$ touch a.txt
$ tail -F a.txt | ./rtchart_cli.js
```

#open url on browser
```bash
http://${REPLACE_TO_YOUR_WEBSERVER_IP}
or
http://${REPLACE_TO_YOUR_WEBSERVER_IP}?port=8081
```

#gen test data
```bash
$ node ./test.js
or
$ echo __id:test,a:1,b:2 >> ./a.txt
```

#filter by uid for multiple user report logs
```bash
http://${REPLACE_TO_YOUR_WEBSERVER_IP}?port=8081&uid=123
$ echo __id:test,__uid:123,a:1,b:2 >> ./a.txt
```
