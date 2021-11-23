const fs = require('fs')
var sleep = require('system-sleep');


var y=0;

function gen_log_rtc(){
	var now_ms = (new Date()).getTime();

	var data = {
		__id:"rtc",
		t:now_ms,
		y:parseFloat(Math.sin(y).toFixed(2)),
		dt: Math.floor(Math.random() * 100)
	};

	y += 0.1;
	
	//var str = JSON.stringify(data);
	var str = `__id:${data.__id},t:${data.t},y:${data.y},dt:${data.dt}`;

	fs.appendFile('./a.txt', str + "\n", err => {
		if (err) {
			console.error(err);
			return;
		}
	});

    console.log(str);
}

function gen_log_bw(){
	var now_ms = (new Date()).getTime();

	var data = {
		__id:"bw",
		t:now_ms,
		bw_nack: Math.floor(Math.random() * 100) * 128,
		bw_video: Math.floor(Math.random() * 100) * 1024
	};

	var str = JSON.stringify(data);
	fs.appendFile('./a.txt', str + "\n", err => {
		if (err) {
			console.error(err);
			return;
		}
	});

    console.log(str);
}

while(true){

	gen_log_rtc();
	gen_log_bw();

	sleep(200);
}
