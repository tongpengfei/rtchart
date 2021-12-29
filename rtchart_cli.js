#!/usr/local/bin/node

var yargs = require("yargs");

var WebSocketClient = require('websocket').client;

function is_number(num){
  return !isNaN(num)
}

var client = new WebSocketClient();

client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});

client.on('connect', function(connection) {
    console.log('WebSocket Client Connected');
    connection.on('error', function(error) {
        console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function() {
        console.log('echo-protocol Connection Closed');
    });
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            //console.log("Received: '" + message.utf8Data + "'");
        }
    });
    
    var readline = require('readline');
    var rl = readline.createInterface({
    	input: process.stdin,
        output: process.stdout,
        terminal: false
    });

	var func_send = function(conn, line){
		if( line.startsWith('{') ){
        	conn.sendUTF(line);
		}else{
			//convert to json
			var list = line.split(",");
			if( list.length <= 0 ){
				console.log(line);
				console.log("unknown log format, eg.: json or key1:value1,key2:value2");
				return;
			}

		    var jobj = {}
			for( var i=0, len=list.length; i<len; ++i ){
				var str = list[i].trim();
				var kv = str.split(":");
				if( kv.length != 2 ){
					console.log(list[i]);
					console.log("unknown log format, eg.: json or key1:value1,key2:value2");
					return;
				}

				var k = kv[0].trim();
				var v = kv[1].trim();
				if( is_number(v) ){
					jobj[k] = Number(v);
				}else{
					jobj[k] = v;
				}
			}

			var jstr = JSON.stringify(jobj);
        	conn.sendUTF(jstr);
		}
	};

	//json
	//{key1:value1,key2:value2}

	//__id:rtc,t:1637134585167,y:0.12,dt:93

	var pre_buff = null;

    rl.on('line', function(line){
		func_send(connection, line);
    })
});


var argv = require('yargs/yargs')(process.argv.slice(2))
            .usage('Usage: $0 -i server_ip -p server_port')
            .example('$0 -i 192.168.1.100 -p 8080', 'connect to server ws://192.168.1.100:8080')
            .alias('i', 'ip').nargs('i', 1).default('i', 'localhost').describe('i', 'server ip')
            .alias('p', 'port').nargs('p', 1).default('p', 8080).describe('p', 'server port')
            .help('h').alias('h', 'help').describe('h', 'show this help')
            .argv;

var ip = argv.i
var port = argv.p
var host = "ws://" + ip + ":" + port + "/";
console.log("connect to server: " + host);
//client.connect('ws://localhost:8080/');
client.connect(host);