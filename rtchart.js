var yargs = require("yargs");

console.log("Real Time Chart");

const express = require('express')
const path = require('path')
const app = express()

var WebSocketServer = require('websocket').server;
var http = require('http');

var EventController = require('./event_controller');

var argv = require('yargs/yargs')(process.argv.slice(2))
            .usage('Usage: $0 -w 80 -p 8080 -P 8081')
            .example('$0 -w 80 -p 8080 -P 8081', 'webserver listen on:80\nrtchar server listen on:8080\nbrowser wsserver listen on 8081')
            .alias('w', 'port_html').nargs('w', 1).default('w', 80).describe('w', 'webserver port')
            .alias('p', 'port_data').nargs('p', 1).default('p', 8080).describe('p', 'rtchart_cli report data')
            .alias('P', 'port_chart').nargs('P', 1).default('P', 8081).describe('P', 'browser websocket connect to')
            .help('h').alias('h', 'help').describe('h', 'show this help')
            .argv;


var port_html = argv.w;
var port_data = argv.p;
var port_chart = argv.P;


var ec = new EventController();
var data_source = [];
 
app.use(express.static(path.join(__dirname, 'public')))
 
app.listen(port_html, () => {
    console.log(`App listening at port ${port_html}`)
})

/////////////////////////////////////////////////////////////////////////
var server_data = http.createServer(function(request, response){
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});

server_data.listen(port_data, function() {
    console.log((new Date()) + ' Server is listening on port ' + port_data);
});

ws_data = new WebSocketServer({
    httpServer: server_data,
    autoAcceptConnections: false
});

ws_data.on('request', function(request) {
    var conn = request.accept(null, request.origin);

    console.log((new Date()) + ' connection accepted.');
    conn.on('message', function(msg) {
        if (msg.type === 'utf8') {
            //console.log('Received Message: ' + msg.utf8Data);
            //connection.sendUTF(msg.utf8Data);
            //{x:0,y:0}
            //data_source.push( msg.utf8Data );
			var txt = msg.utf8Data;

			var __uid = undefined;
		    if( txt.startsWith('{') ){
                //json
				var jobj = JSON.parse(txt);
				__uid = jobj.__uid;
            }else{
                //k:v,k2,v2
				var keys = txt.split(':');
				for( var str in keys ){
					if( str.startsWith('__uid') ){
						var kv = str.split(',');
						__uid = kv[1];
					}
				}
            }

			if( __uid == undefined ){
				__uid = null;
			}else{
				__uid = __uid.toString();
			}

            //dispatch
            ec.dispatch( "append", __uid, txt );
			//console.log("dispatch", txt);
        } else if (msg.type === 'binary') {
            //console.log('Received Binary Message of ' + msg.binaryData.length + ' bytes');
            conn.sendBytes(msg.binaryData);
        }
    });
    conn.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + conn.remoteAddress + ' disconnected.');
    });
});



/////////////////////////////////////////////////////////////////////////
var server_chart = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server_chart.listen(port_chart, function() {
    console.log((new Date()) + ' Server is listening on port ' + port_chart);
});

ws_chart = new WebSocketServer({
    httpServer: server_chart,
    autoAcceptConnections: false
});

ws_chart.on('request', function(request) {
    var conn = request.accept(null, request.origin);
    console.log((new Date()) + ' Connection accepted.');

	conn.uid = null;
    //register listener
    var cb = function( uid, data ){
		if( conn.uid != null ){
			if( conn.uid != uid ) return;
		}
        conn.sendUTF( data );
    }

    ec.regListener( "append", cb );

    conn.on('message', function(msg) {
        if (msg.type === 'utf8') {
            //console.log('Received Message: ' + msg.utf8Data);
            //conn.sendUTF(msg.utf8Data);
		    var json = JSON.parse(msg.utf8Data)
            if( json.type == "set_uid" ){
                console.log('set_uid: ' + json.uid);
                conn.uid = json.uid;
            }
        } else if (msg.type === 'binary') {
            //console.log('Received Binary Message of ' + msg.binaryData.length + ' bytes');
            //conn.sendBytes(msg.binaryData);
        }
    });
    conn.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + conn.remoteAddress + ' disconnected.');

        //unregister listener
        ec.unregListener( "append", cb );
    });
});