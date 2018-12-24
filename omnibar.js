var canvas;
var ctx;
var websocket;
var state = 0;
var tempstate = 0;
var click = new Audio('spinningsound.ogg');
var apData = [];
var bwData = [];
var dgData = [];
var pzData = [];
var mcData = [];
var streamTitle = "";
var streamSubtitle = "";
var riData = [];
var unData = [];
var forcedGame = [];
var gwItems = [];
var interruptReason = "";
var interruptData = [];
var numAnim;
var numReady = false;
websocket = new WebSocket("ws://localhost:9020/");
var options = {
	useEasing: true, 
	useGrouping: true, 
	separator: ',', 
	decimal: '.'
};
window.onload = function () {
	numAnim = new CountUp("total", 0, 0, 2, 2.5, options);
	if (!numAnim.error) {
		numAnim.start();
		numReady = true;
	} else {
		console.error(numAnim.error);
	}
	var intElemClientWidth = document.getElementById("container").clientWidth;
	var intElemClientHeight = document.getElementById("container").clientHeight;
	if(intElemClientHeight != 1080 || intElemClientWidth != 1920) {
		document.getElementById("warning").classList.remove("hidden");
	}
	canvas = document.getElementById("canvasMain");
	ctx = setupCanvas(canvas);
	console.log(intElemClientWidth+"x"+intElemClientHeight)
}
function setupCanvas(canvas) {
	console.log("a")
	  // Get the device pixel ratio, falling back to 1.
	  var dpr = window.devicePixelRatio || 1;
	  // Get the size of the canvas in CSS pixels.
	  var rect = canvas.getBoundingClientRect();
	  // Give the canvas pixel dimensions of their CSS
	  // size * the device pixel ratio.
	  canvas.width = rect.width * dpr;
	  canvas.height = rect.height * dpr;
	  var ctx = canvas.getContext('2d');
	  // Scale all drawing operations by the dpr, so you
	  // don't have to worry about the difference.
	  ctx.scale(dpr, dpr);
	  return ctx;
}
function setText(txt) {
	ctx.clearRect(0, 0, 99999, 99999);
	ctx.font= "4.4vh sans-serif";
	ctx.fillStyle = "#FFFFFF";
	console.log(txt + canvas.height);
	ctx.shadowColor = "black"
	ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
	ctx.shadowBlur = 4;
	ctx.fillText(txt, 0, canvas.height/2.5, canvas.width); //
}
websocket.onopen = function() {
		websocket.send("oo");
		next();
		//statusBar.innerHTML = "Connected"
}
websocket.onclose = function(){
	document.getElementById("barText").innerHTML = "wifi_off"
	document.getElementById("barIcon").classList.remove("fadeOut")
	document.getElementById("barIcon").classList.add("fadeIn")
	document.getElementById("mainText").classList.remove("slideOutDown")
	document.getElementById("mainText").classList.add("fadeInUp")
	setText("CONNECTION LOST (6)")
	var time = 5;
	setInterval(function() {
		setText("CONNECTION LOST ("+time+")");
		time--;
		if(time < 1) {
			location.reload();
		}
	},1000);
}
websocket.onmessage = function(ev) {
	if(ev.data.indexOf("ob") == 0) {
		var signal = ev.data.substring(3,5);
		switch(signal) {
			case "tt":
				streamTitle = ev.data.substring(5);
				break;
			case "st":
				streamSubtitle = ev.data.substring(5);
				break;
			case "mt":
				var dataD = ev.data.substring(7);
				upTime(dataD);
				break;
			case "ap":
				var dataD = ev.data.substring(5);
				var apArr = dataD.split(" | ");
				apArr.splice(0,1);
				apData = apArr;
				updateTotal(apData[0]);
				break;
			case "ri":
				var dataD = ev.data.substring(5);
				var riArr = dataD.split(" || ");
				riArr.splice(0,1);
				riData = riArr;
				break;
			case "un":
				var dataD = ev.data.substring(5);
				var unArr = dataD.split(" || ");
				unArr.splice(0,1);
				if(unArr[0] != "NONE") {
					unData = unArr;
				} else {
					console.log("No upcoming game");
				}
				break;
			case "dg":
				var dataD = ev.data.substring(5);
				var dgArr = dataD.split(" || ");
				dgArr.splice(0,1);
				dgData = dgArr;
				break;
			case "pz":
				var dataD = ev.data.substring(5);
				var pzArr = dataD.split(" || ");
				pzArr.splice(0,1);
				pzData = pzArr;
				console.log(pzArr);
				break;
			case "mc":
				var dataD = ev.data.substring(5);
				var mcArr = dataD.split(" || ");
				mcArr.splice(0,1);
				mcData = mcArr;
				console.log(mcArr);
				break;
			case "bw":
				var dataD = ev.data.substring(5);
				var bwArr = dataD.split(" || ");
				bwArr.splice(0,1);
				bwData = bwArr;
				break;
			case "gw":
				var dataD = ev.data.substring(5);
				var bwArr = dataD.split(" | ");
				bwArr.splice(0,1);
				interrupt("spin",bwArr)
				break;
			case "bc":
				var dataD = ev.data.substring(5);
				var bwArr = dataD.split(" | ");
				bwArr.splice(0,1);
				var bcString = bwArr[0];
				interrupt("broadcast",bcString)
				break;
		}
	}
}
function updateTotal(amnt) {
	if(!isNaN(amnt) && numReady) {
		console.log("i try" + amnt)
		numAnim.update(amnt);
	}
}
function next() {
		console.log(state)
	switch(state) {
		case 0:

			document.getElementById("mainText").classList.remove("fadeInUp")
			document.getElementById("mainText").classList.add("slideOutDown")
			document.getElementById("barIcon").classList.add("fadeOut")
			if(streamTitle != "") {
				setTimeout(function(){
					setText(streamTitle);
					document.getElementById("barText").innerHTML = "data_usage"
					document.getElementById("mainText").classList.remove("slideOutDown")
					document.getElementById("mainText").classList.add("fadeInUp")
				},1000);
				setTimeout(function(){
					state++;
					next();
				},8000);
			} else {
				state++;
				next();
			}
			break;
		case 1:

			document.getElementById("mainText").classList.remove("fadeInUp")
			document.getElementById("mainText").classList.add("fadeOut")
			document.getElementById("barIcon").classList.add("fadeOut")
			if(streamSubtitle != "") {
				setTimeout(function(){
					setText(streamSubtitle);
					document.getElementById("barText").innerHTML = "data_usage"
					document.getElementById("mainText").classList.remove("fadeOut")
					document.getElementById("mainText").classList.add("fadeIn")
				},1000);
				setTimeout(function(){
					state++;
					next();
				},8000);
			} else {
				state++;
				next();
			}
			break;
		case 2:
			document.getElementById("mainText").classList.remove("fadeInUp")
			document.getElementById("mainText").classList.add("slideOutDown")
			document.getElementById("barIcon").classList.add("fadeOut")
			setTimeout(function(){
				var end = bwData.length;
				var count = 0; 
				if(end > 0 && end != undefined) {
					document.getElementById("barText").innerHTML = "equalizer"
					document.getElementById("barIcon").classList.remove("fadeOut")
					document.getElementById("barIcon").classList.add("fadeIn")
					document.getElementById("mainText").classList.remove("slideOutDown")
					document.getElementById("mainText").classList.add("fadeInUp")
					processArray(bwData);
					async function processArray(array) {
						for (const item of array) {
							await displayStuff(item);
						}
						state++;
						next();
					}
					async function displayStuff(element) {
						document.getElementById("mainText").classList.remove("fadeOut")
						document.getElementById("mainText").classList.add("fadeIn")
						var eData = JSON.parse(element);
						setText(eData.name+" - "+eData.option1+" ($"+eData.total1+") vs "+eData.option2+" ($"+eData.total2+")")
						await delay(3000);
						document.getElementById("mainText").classList.remove("fadeIn")
						document.getElementById("mainText").classList.remove("fadeInUp")
						count++;
						if(count != end) {
							document.getElementById("mainText").classList.add("fadeOut")
						}
						await delay(2000);
					}
				} else {
					state++;
					next();
				}
			},1000)
			break;
		case 3:
			document.getElementById("mainText").classList.remove("fadeInUp")
			document.getElementById("mainText").classList.add("slideOutDown")
			document.getElementById("barIcon").classList.add("fadeOut")
			setTimeout(function(){
				var end = dgData.length;
				var count = 0; 
				if(end > 0 && end != undefined) {
					document.getElementById("barText").innerHTML = "data_usage"
					document.getElementById("barIcon").classList.remove("fadeOut")
					document.getElementById("barIcon").classList.add("fadeIn")
					document.getElementById("mainText").classList.remove("slideOutDown")
					document.getElementById("mainText").classList.add("fadeInUp")
					processArray(dgData);
					async function processArray(array) {
						for (const item of array) {
							await displayStuff(item);
						}
						state++;
						next();
					}
					async function displayStuff(element) {
						document.getElementById("mainText").classList.remove("fadeOut")
						document.getElementById("mainText").classList.add("fadeIn")
						var eData = JSON.parse(element);
						setText("Donation Goal - "+eData.name+" @ $"+eData.amountNeeded);
						await delay(3000);
						document.getElementById("mainText").classList.remove("fadeIn")
						document.getElementById("mainText").classList.remove("fadeInUp")
						count++;
						if(count != end) {
							document.getElementById("mainText").classList.add("fadeOut")
						}
						await delay(2000);
					}
				} else {
					state++;
					next();
				}
			},1000)
			break;
		case 4:
			document.getElementById("mainText").classList.remove("fadeInUp")
			document.getElementById("mainText").classList.add("slideOutDown")
			document.getElementById("barIcon").classList.add("fadeOut")
			setTimeout(function(){
				var end = pzData.length;
				var count = 0; 
				if(end > 0 && end != undefined) {
					document.getElementById("barText").innerHTML = "card_giftcard"
					document.getElementById("barIcon").classList.remove("fadeOut")
					document.getElementById("barIcon").classList.add("fadeIn")
					document.getElementById("mainText").classList.remove("slideOutDown")
					document.getElementById("mainText").classList.add("fadeInUp")
					processArray(pzData);
					async function processArray(array) {
						for (const item of array) {
							await displayStuff(item);
						}
						state++;
						next();
					}
					async function displayStuff(element) {
						document.getElementById("mainText").classList.remove("fadeOut")
						document.getElementById("mainText").classList.add("fadeIn")
						console.log(element);
						var eData = JSON.parse(element);
						setText("Prize - "+eData.name+" ($"+eData.amountNeeded+" min.)");
						await delay(3000);
						document.getElementById("mainText").classList.remove("fadeIn")
						document.getElementById("mainText").classList.remove("fadeInUp")
						count++;
						if(count != end) {
							document.getElementById("mainText").classList.add("fadeOut")
						}
						await delay(2000);
					}
				} else {
					state++;
					next();
				}
			},1000)
			break;
		case 5:
			document.getElementById("mainText").classList.remove("fadeInUp")
			document.getElementById("mainText").classList.add("slideOutDown")
			document.getElementById("barIcon").classList.add("fadeOut")
			setTimeout(function(){
				if(riData.length > 0) {
					var rData = JSON.parse(riData[0])
					if(rData.game != "") {
						document.getElementById("barText").innerHTML = "play_arrow"
						document.getElementById("barIcon").classList.remove("fadeOut")
						document.getElementById("barIcon").classList.add("fadeIn")
						document.getElementById("mainText").classList.remove("slideOutDown")
						document.getElementById("mainText").classList.add("fadeInUp")
						if(rData.runner != "") {
							setText("Current: "+rData.game+" with "+rData.runner);
						} else {
							setText("Current: "+rData.game);
						}
						setTimeout(function(){
							document.getElementById("mainText").classList.remove("fadeIn")
							document.getElementById("mainText").classList.remove("fadeInUp")
							state++;
							next();
						},8000);
					}
				} else {
					state++;
					next();
				}
			},1000);
			break;
		case 6:
			document.getElementById("mainText").classList.remove("fadeInUp")
			document.getElementById("mainText").classList.add("slideOutDown")
			document.getElementById("barIcon").classList.add("fadeOut")
			setTimeout(function(){
				if(unData.length > 0) {
					var uData = JSON.parse(unData[0])
					if(uData.game != "") {
						document.getElementById("barText").innerHTML = "fast_forward"
						document.getElementById("barIcon").classList.remove("fadeOut")
						document.getElementById("barIcon").classList.add("fadeIn")
						document.getElementById("mainText").classList.remove("slideOutDown")
						document.getElementById("mainText").classList.add("fadeInUp")
						if(uData.runner != "") {
							setText("Next: "+uData.game+" with "+uData.runner);
						} else {
							setText("Next: "+uData.game);
						}
						setTimeout(function(){
							document.getElementById("mainText").classList.remove("fadeIn")
							document.getElementById("mainText").classList.remove("fadeInUp")
							state++;
							next();
						},8000);
					}
				} else {
					state++;
					next();
				}
			},1000);
			break;
		case 7:
			document.getElementById("mainText").classList.remove("fadeInUp")
			document.getElementById("mainText").classList.add("slideOutDown")
			document.getElementById("barIcon").classList.add("fadeOut")
			setTimeout(function(){
				var end = mcData.length;
				var count = 0; 
				if(end > 0 && end != undefined) {
					document.getElementById("barText").innerHTML = "verified_user"
					document.getElementById("barIcon").classList.remove("fadeOut")
					document.getElementById("barIcon").classList.add("fadeIn")
					document.getElementById("mainText").classList.remove("slideOutDown")
					document.getElementById("mainText").classList.add("fadeInUp")
					processArray(mcData);
					async function processArray(array) {
						for (const item of array) {
							await displayStuff(item);
						}
						state++;
						next();
					}
					async function displayStuff(element) {
						document.getElementById("mainText").classList.remove("fadeOut")
						document.getElementById("mainText").classList.add("fadeIn")
						console.log(element);
						var eData = JSON.parse(element);
						setText(eData.name);
						await delay(3000);
						document.getElementById("mainText").classList.remove("fadeIn")
						document.getElementById("mainText").classList.remove("fadeInUp")
						count++;
						if(count != end) {
							document.getElementById("mainText").classList.add("fadeOut")
						}
						await delay(2000);
					}
				} else {
					state++;
					next();
				}
			},1000)
			break;
		case 10000:
		case 10001:
			document.getElementById("mainText").classList.remove("fadeInUp")
			document.getElementById("mainText").classList.add("slideOutDown")
			document.getElementById("barIcon").classList.add("fadeOut")
			setTimeout(function(){
				switch(interruptReason) {
					case 'broadcast':
						setText(interruptData);
						document.getElementById("barText").innerHTML = "comment"
						document.getElementById("barIcon").classList.remove("fadeOut")
						document.getElementById("mainText").classList.remove("slideOutDown")
						document.getElementById("barIcon").classList.add("fadeIn")
						document.getElementById("mainText").classList.add("fadeInUp")
						setTimeout(function(){
							if(tempstate >= 10000) {
								state = 0;
							} else {
								state = tempstate;
							}
							next();
						},10000);
						break;
					case 'spin':
						var selection = interruptData[Math.floor(Math.random() * interruptData.length)];
						document.getElementById("barText").innerHTML = "replay"
						document.getElementById("barIcon").classList.remove("fadeOut")
						document.getElementById("mainText").classList.remove("slideOutDown")
						document.getElementById("barIcon").classList.add("fadeIn")
						document.getElementById("mainText").classList.add("fadeInUp")
						setText("Wheel Spin");
						setTimeout(function() {
							click.play();
							click.volume = (.2);
							setText("Wheel Spin: "+interruptData[Math.floor(Math.random() * interruptData.length)]);
						},1025)
						setTimeout(function() {
							setText("Wheel Spin: "+interruptData[Math.floor(Math.random() * interruptData.length)]);
						},1075)
						setTimeout(function() {
							setText("Wheel Spin: "+interruptData[Math.floor(Math.random() * interruptData.length)]);
						},1125)
						setTimeout(function() {
							setText("Wheel Spin: "+interruptData[Math.floor(Math.random() * interruptData.length)]);
						},1160)
						setTimeout(function() {
							setText("Wheel Spin: "+interruptData[Math.floor(Math.random() * interruptData.length)]);
						},1225)
						setTimeout(function() {
							setText("Wheel Spin: "+interruptData[Math.floor(Math.random() * interruptData.length)]);
						},1270)
						setTimeout(function() {
							setText("Wheel Spin: "+interruptData[Math.floor(Math.random() * interruptData.length)]);
						},1320)
						setTimeout(function() {
							setText("Wheel Spin: "+interruptData[Math.floor(Math.random() * interruptData.length)]);
						},1370)
						setTimeout(function() {
							setText("Wheel Spin: "+interruptData[Math.floor(Math.random() * interruptData.length)]);
						},1440)
						setTimeout(function() {
							setText("Wheel Spin: "+interruptData[Math.floor(Math.random() * interruptData.length)]);
						},1480)
						setTimeout(function() {
							setText("Wheel Spin: "+interruptData[Math.floor(Math.random() * interruptData.length)]);
						},1550)
						setTimeout(function() {
							setText("Wheel Spin: "+interruptData[Math.floor(Math.random() * interruptData.length)]);
						},1600)
						setTimeout(function() {
							setText("Wheel Spin: "+interruptData[Math.floor(Math.random() * interruptData.length)]);
						},1660)
						setTimeout(function() {
							setText("Wheel Spin: "+interruptData[Math.floor(Math.random() * interruptData.length)]);
						},1710)
						setTimeout(function() {
							setText("Wheel Spin: "+interruptData[Math.floor(Math.random() * interruptData.length)]);
						},1770)
						setTimeout(function() {
							setText("Wheel Spin: "+interruptData[Math.floor(Math.random() * interruptData.length)]);
						},1830)
						setTimeout(function() {
							setText("Wheel Spin: "+interruptData[Math.floor(Math.random() * interruptData.length)]);
						},1950)
						setTimeout(function() {
							setText("Wheel Spin: "+interruptData[Math.floor(Math.random() * interruptData.length)]);
						},2020)
						setTimeout(function() {
							setText("Wheel Spin: "+interruptData[Math.floor(Math.random() * interruptData.length)]);
						},2100)
						setTimeout(function() {
							setText("Wheel Spin: "+interruptData[Math.floor(Math.random() * interruptData.length)]);
						},2150)
						setTimeout(function() {
							setText("Wheel Spin: "+interruptData[Math.floor(Math.random() * interruptData.length)]);
						},2250)
						setTimeout(function() {
							setText("Wheel Spin: "+interruptData[Math.floor(Math.random() * interruptData.length)]);
						},2300)
						setTimeout(function() {
							setText("Wheel Spin: "+interruptData[Math.floor(Math.random() * interruptData.length)]);
						},2370)
						setTimeout(function() {
							setText("Wheel Spin: "+interruptData[Math.floor(Math.random() * interruptData.length)]);
						},2450)
						setTimeout(function() {
							setText("Wheel Spin: "+interruptData[Math.floor(Math.random() * interruptData.length)]);
						},2535)
						setTimeout(function() {
							setText("Wheel Spin: "+interruptData[Math.floor(Math.random() * interruptData.length)]);
						},2600)
						setTimeout(function() {
							setText("Wheel Spin: "+interruptData[Math.floor(Math.random() * interruptData.length)]);
						},2690)
						setTimeout(function() {
							setText("Wheel Spin: "+interruptData[Math.floor(Math.random() * interruptData.length)]);
						},2780)
						setTimeout(function() {
							setText("Wheel Spin: "+interruptData[Math.floor(Math.random() * interruptData.length)]);
						},2870)
						setTimeout(function() {
							setText("Wheel Spin: "+interruptData[Math.floor(Math.random() * interruptData.length)]);
						},2960)
						setTimeout(function() {
							setText("Wheel Spin: "+interruptData[Math.floor(Math.random() * interruptData.length)]);
						},3070)
						setTimeout(function() {
							setText("Wheel Spin: "+interruptData[Math.floor(Math.random() * interruptData.length)]);
						},3160)
						setTimeout(function() {
							setText("Wheel Spin: "+interruptData[Math.floor(Math.random() * interruptData.length)]);
						},3280)
						setTimeout(function() {
							setText("Wheel Spin: "+interruptData[Math.floor(Math.random() * interruptData.length)]);
						},3400)
						setTimeout(function() {
							setText("Wheel Spin: "+interruptData[Math.floor(Math.random() * interruptData.length)]);
						},3535)
						setTimeout(function() {
							setText("Wheel Spin: "+interruptData[Math.floor(Math.random() * interruptData.length)]);
						},3660)
						setTimeout(function() {
							setText("Wheel Spin: "+interruptData[Math.floor(Math.random() * interruptData.length)]);
						},3810)
						setTimeout(function() {
							setText("Wheel Spin: "+interruptData[Math.floor(Math.random() * interruptData.length)]);
						},4000)
						setTimeout(function() {
							setText("Wheel Spin: "+selection);
							websocket.send("out gw e "+selection);
						},4200);
						setTimeout(function(){
							if(tempstate >= 10000) {
								state = 0;
							} else {
								state = tempstate;
							}
							next();
						},7500);
				}
			},1000)
			break;
		default:
			websocket.send("oo");
			state = 0;
			next();
			break;
	}
}
//async setTimeout function
function delay(time) {
	return new Promise(resolve => setTimeout(resolve,time));
}
//run interrupt protocol
function interrupt(reason,data) {
	tempstate = state;
	interruptReason = reason;
	interruptData = data;
	state = 10000;
}


function upTime(countTo) {
	  var addLeadingZeros = function(number){
		return (number < 10) ? "0"+number : number;
	  }

	  now = new Date();
	  countTo = new Date(countTo);
	  difference = (now-countTo);
	  days=Math.floor(difference/(60*60*1000*24)*1);
	  hours=Math.floor(((difference%(60*60*1000*24))/(60*60*1000)*1)+(days *24));
	  mins=addLeadingZeros(Math.floor(((difference%(60*60*1000*24))%(60*60*1000))/(60*1000)*1));
	  secs=addLeadingZeros(Math.floor((((difference%(60*60*1000*24))%(60*60*1000))%(60*1000))/1000*1))
	  document.getElementById('timer').innerHTML = hours+":"+mins+":"+secs;
	  clearTimeout(upTime.to);
	  upTime.to=setTimeout(function(){ upTime(countTo); },1000);
}
