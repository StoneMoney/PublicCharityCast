
console.log("CharityCast v1[BETA] is now running on localhost:8000")
const http = require('http'),https = require('https'),
	WebSocket = require('ws'),
	path = require("path"),
	fs = require('fs-extra'),
	opn = require("open")
	
const wss = new WebSocket.Server({ port: 9020 });

const baseFolder = process.env.APPDATA+'\\CharityCast';
const dataFolder = process.env.APPDATA+'\\CharityCast\\data';
process.on('uncaughtException', function (err) { 
	console.log("!!CRITICAL ERROR!! Logged to "+baseFolder+"\\log.txt"+err)
	fs.writeFileSync(baseFolder+'log.txt', err); 
});
//paths for required files
var index = path.join(__dirname, '/dashboard.html')
var config = path.join(__dirname, '/config.html')
var omnibar = path.join(__dirname, '/omnibar.html')
var cssAnimate = path.join(__dirname, '/animate.css')
var jsCountUp = path.join(__dirname, '/countUp.js')
var jsOmnibar = path.join(__dirname, '/omnibar.js')
var jsSortable = path.join(__dirname, '/jquery.sortable.min.js')
var spinSound = path.join(__dirname, '/spinningsound.ogg')
var background2 = path.join(__dirname, '/background2.png')
var charityLogo = path.join(__dirname, '/charity-logo.png')
var brandLogo = path.join(__dirname, '/brand-logo.png')
var configF = path.join(__dirname, '/config.data')
var blankArray = path.join(__dirname, '/array.array')
var apiF = path.join(__dirname, '/api.data')
var scheduleF = path.join(__dirname, '/schedule.data')
//create folders for workspace, if they don't exist already
if (!fs.existsSync(baseFolder)){
    fs.mkdirSync(baseFolder);
}
if (!fs.existsSync(dataFolder)){
    fs.mkdirSync(dataFolder);
}
//then do the same for data
if(!fs.existsSync(dataFolder+"/goal-wheel.array")) {
	fs.copySync(blankArray,dataFolder+'/goal-wheel.array');
	console.log("No goal wheel array file located! Creating a new one.")
}
if(!fs.existsSync(dataFolder+"/donation-goals.array")) {
	fs.copySync(blankArray,dataFolder+'/donation-goals.array');
	console.log("No donation goal array file located! Creating a new one.")
}
if(!fs.existsSync(dataFolder+"/prizes.array")) {
	fs.copySync(blankArray,dataFolder+'/prizes.array');
	console.log("No prize array file located! Creating a new one.")
}
if(!fs.existsSync(dataFolder+"/misc-text.array")) {
	fs.copySync(blankArray,dataFolder+'/misc-text.array');
	console.log("No misc text array file located! Creating a new one.")
}
if(!fs.existsSync(dataFolder+"/bid-wars.array")) {
	fs.copySync(blankArray,dataFolder+'/bid-wars.array');
	console.log("No bid war array file located! Creating a new one.")
}
if(!fs.existsSync(dataFolder+"/schedule.data")) {
	fs.copySync(scheduleF,dataFolder+'/schedule.data');
	console.log("No schedule data file located! Creating a new one.")
}
if(!fs.existsSync(dataFolder+"/api.data")) {
	fs.copySync(apiF,dataFolder+'/api.data');
	console.log("No api data file located! Creating a new one.")
}
if(!fs.existsSync(dataFolder+"/config.data")) {
	fs.copySync(configF,dataFolder+'/config.data');
	console.log("No config data file located! Creating a new one.")
}
if(!fs.existsSync(baseFolder+"/charity-logo.png")) {
	fs.copySync(charityLogo,baseFolder+'/charity-logo.png');
	console.log("Generating template logo")
}
if(!fs.existsSync(baseFolder+"/spinningsound.ogg")) {
	fs.copySync(spinSound,baseFolder+'/spinningsound.ogg');
	console.log("Generating spin sound")
}
if(!fs.existsSync(baseFolder+"/background2.png")) {
	fs.copySync(background2,baseFolder+'/background2.png');
	console.log("Generating background")
}
if(!fs.existsSync(baseFolder+"/brand-logo.png")) {
	fs.copySync(brandLogo,baseFolder+'/brand-logo.png');
	console.log("Generating brand")
}
//send copies
fs.copySync(omnibar,baseFolder+'/omnibar.html');
fs.copySync(jsCountUp,baseFolder+'/countUp.js');
fs.copySync(jsOmnibar,baseFolder+'/omnibar.js');
fs.copySync(cssAnimate,baseFolder+'/animate.css');
var participantID = 0;
var apiBranch = "";
var apiCache = {};
fs.readFile(dataFolder+"/api.data", function (err, arrayFile) {
	if(!err) {
		arrayFile = JSON.parse(arrayFile);
		participantID = arrayFile.participantID;
		apiBranch = arrayFile.apiBranch;
		apiCache = arrayFile.cachedData;
		updateAPIdata();
	}
});
var tempGameData = "";
var apiCallInterval = setInterval(updateAPIdata, 60000);
var apiSaveInterval = setInterval(updateAPICache, 180000);

//host dashboard on localhost
fs.readFile(index, function (err, html) {
    if (err) {
        throw err; 
    }       
    http.createServer(function(request, response) {  
        response.writeHeader(200, {"Content-Type": "text/html"});  
        response.write(html);  
        response.end();  
    }).listen(8000);
});
fs.readFile(config, function (err, html) {
    if (err) {
        throw err; 
    }       
    http.createServer(function(request, response) {  
        response.writeHeader(200, {"Content-Type": "text/html"});  
        response.write(html);  
        response.end();  
    }).listen(8001);
});
fs.readFile(jsSortable, function (err, html) {
    if (err) {
        throw err; 
    }       
    http.createServer(function(request, response) {  
        response.writeHeader(200, {"Content-Type": "text/javascript"});  
        response.write(html);  
        response.end();  
    }).listen(8002);
});
//open localhost:8000 in default browser
opn('http://localhost:8000');
wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
	if(message.indexOf("out") == 0) {
		var signal = message.substring(4,6);
		switch(signal) {
				case 'st': //SUBTITLE
					var dataD = message.substring(7);
					if (dataD.indexOf('s') == 0) { //SETTING
						var subtitle = dataD.substring(2);
						fs.readFile(dataFolder+"/config.data", function (err, arrayFile) {
							if(!err) {
								arrayFile = JSON.parse(arrayFile);
								arrayFile.subtitle = subtitle;
								fs.writeFile(dataFolder+"/config.data", JSON.stringify(arrayFile), function (err) {
									if (err)  console.log('Error: ', err);
								});
							} else {
								console.log(err);
							}
						});
					} else if (dataD.indexOf('c') == 0) {
						fs.readFile(dataFolder+"/config.data", function (err, arrayFile) {
							if(!err) {
								arrayFile = JSON.parse(arrayFile);
								arrayFile.subtitle = "";
								fs.writeFile(dataFolder+"/config.data", JSON.stringify(arrayFile), function (err) {
									if (err)  console.log('Error: ', err);
								});
							} else {
								console.log(err);
							}
						});
					} else if (dataD.indexOf('r') == 0) {
						fs.readFile(dataFolder+"/config.data", function (err, arrayFile) {
							if(!err) {
								arrayFile = JSON.parse(arrayFile);
								if(arrayFile.hasOwnProperty('subtitle')) {
									if(arrayFile.subtitle != "") {
										sendMessage("d st r "+arrayFile.subtitle)								
									}
								}
							} else {
								console.log(err);
							}
						});
					}
					break;
				case 'tt': //TITLE
					var dataD = message.substring(7);
					if (dataD.indexOf('s') == 0) { //SETTING
						var title = dataD.substring(2);
						fs.readFile(dataFolder+"/config.data", function (err, arrayFile) {
							if(!err) {
								arrayFile = JSON.parse(arrayFile);
								arrayFile.title = title;
								fs.writeFile(dataFolder+"/config.data", JSON.stringify(arrayFile), function (err) {
									if (err)  console.log('Error: ', err);
								});
							} else {
								console.log(err);
							}
						});
					} else if (dataD.indexOf('c') == 0) {
						fs.readFile(dataFolder+"/config.data", function (err, arrayFile) {
							if(!err) {
								arrayFile = JSON.parse(arrayFile);
								arrayFile.title = "";
								fs.writeFile(dataFolder+"/config.data", JSON.stringify(arrayFile), function (err) {
									if (err)  console.log('Error: ', err);
								});
							} else {
								console.log(err);
							}
						});
					} else if (dataD.indexOf('r') == 0) {
						fs.readFile(dataFolder+"/config.data", function (err, arrayFile) {
							if(!err) {
								arrayFile = JSON.parse(arrayFile);
								if(arrayFile.hasOwnProperty('title')) {
									if(arrayFile.title != "") {
										sendMessage("d tt r "+arrayFile.title)								
									}
								}
							} else {
								console.log(err);
							}
						});
					}
					break;
				case 'mt': //MARATHON TIMER
					var dataD = message.substring(7);
					if (dataD.indexOf('s') == 0) { //SETTING
						var startTime = dataD.substring(2);
						fs.readFile(dataFolder+"/config.data", function (err, arrayFile) {
							if(!err) {
								arrayFile = JSON.parse(arrayFile);
								arrayFile.startTime = startTime;
								fs.writeFile(dataFolder+"/config.data", JSON.stringify(arrayFile), function (err) {
									if (err)  console.log('Error: ', err);
								});
							} else {
								console.log(err);
							}
						});
					} else if (dataD.indexOf('c') == 0) {
						fs.readFile(dataFolder+"/config.data", function (err, arrayFile) {
							if(!err) {
								arrayFile = JSON.parse(arrayFile);
								arrayFile.startTime = "";
								fs.writeFile(dataFolder+"/config.data", JSON.stringify(arrayFile), function (err) {
									if (err)  console.log('Error: ', err);
								});
							} else {
								console.log(err);
							}
						});
					} else if (dataD.indexOf('r') == 0) {
						fs.readFile(dataFolder+"/config.data", function (err, arrayFile) {
							if(!err) {
								arrayFile = JSON.parse(arrayFile);
								sendMessage("d mt r "+arrayFile.startTime)								
							} else {
								console.log(err);
							}
						});
					}
					break;
				case 'op': //open folder
					var dataD = message.substring(7);
					if(dataD.indexOf('f') == 0) {
						opn(baseFolder);
					} else if(dataD.indexOf('o') == 0) {
						sendMessage("d op o | "+baseFolder+"/omnibar.html")
					}
					break;
				case 'ap': // API
					var dataD = message.substring(7);
					if (dataD.indexOf('s') == 0) { //SETTING
						var dataS = dataD.split(" | ")
						dataS.splice(0,1)
						var apiData = {};
						fs.readFile(dataFolder+"/api.data", function (err, arrayFile) {
							if(!err) {
								arrayFile = JSON.parse(arrayFile);
								arrayFile.apiBranch = dataS[0];
								apiBranch = dataS[0]
								arrayFile.participantID = dataS[1];
								participantID = dataS[1];
								arrayFile.cachedData = updateAPIdata();
								fs.writeFile(dataFolder+"/api.data", JSON.stringify(arrayFile), function (err) {
									if (err)  console.log('Error: ', err);
								});
							} else {
								console.log(err);
							}
						});
					} else if (dataD.indexOf('r') == 0) { //REQUESTING
						//console.log("d ap | "+apiBranch+" | "+JSON.stringify(apiCache));
						sendMessage("d ap | "+apiBranch+" | "+JSON.stringify(apiCache));
					}
					break;
				case 'gw': //GoalWheel
					var dataD = message.substring(7);

					if(dataD == "s") { //SPINNING
						var returnString = "ob gw ";
						fs.readFile(dataFolder+"/goal-wheel.array", function (err, arrayFile) {
							if(!err) {
								arrayFile = JSON.parse(arrayFile);
								arrayFile.forEach(function(element) {
									returnString += " | " + element
								})
								sendMessage(returnString);
							}
						});
					} else if (dataD.indexOf('a') == 0) { //ADDING
						var textToAdd = dataD.substring(2);
						fs.readFile(dataFolder+"/goal-wheel.array", function (err, arrayFile) {
							if(!err) {
								arrayFile = JSON.parse(arrayFile);
								arrayFile.push(textToAdd);
								fs.writeFile(dataFolder+"/goal-wheel.array", JSON.stringify(arrayFile), function (err) {
									if (err)  console.log('Error: ', err);
								});
							} else {
								console.log(err);
							}
						});
					} else if (dataD.indexOf('r') == 0) { //REMOVING
						var textToRemove = dataD.substring(2);
						fs.readFile(dataFolder+"/goal-wheel.array", function (err, arrayFile) {
							if(!err) {
								arrayFile = JSON.parse(arrayFile);
								var spliceIndex = arrayFile.indexOf(textToRemove);
								if(spliceIndex != -1) {
									arrayFile.splice(spliceIndex, 1);
									fs.writeFile(dataFolder+"/goal-wheel.array", JSON.stringify(arrayFile), function (err) {
										if (err)  console.log('Error: ', err);
									});
								}
							}
						});
					} else if (dataD.indexOf('l') == 0) {
						var returnString = "d gw l ";
						fs.readFile(dataFolder+"/goal-wheel.array", function (err, arrayFile) {
							if(!err) {
								arrayFile = JSON.parse(arrayFile);
								arrayFile.forEach(function(element) {
									returnString += " | " + element
								})
								sendMessage(returnString);
							}
						});
					} else if (dataD.indexOf('e') == 0) {
						var selection = dataD.substring(2);
						sendMessage("d gw e "+selection);
					}
					break;
				case 'bw': // bid war
					var dataD = message.substring(7);
					if (dataD.indexOf('a') == 0) { //ADDING
						var dataS = dataD.substring(2);
						var bwArr = dataS.split(" | ");
						fs.readFile(dataFolder+"/bid-wars.array", function (err, arrayFile) {
							if(!err) {
								var spliceIndex = 0;
								arrayFile = JSON.parse(arrayFile);
								var fileData = JSON.parse('{"name":"'+bwArr[0]+'","option1":"'+bwArr[1]+'","total1":'+bwArr[2]+',"option2":"'+bwArr[3]+'","total2":'+bwArr[4]+'}');
								arrayFile.forEach(function(element) {
									if(element.name == bwArr[0]) {
										arrayFile.splice(spliceIndex, 1);
										arrayFile.push(fileData);
										fs.writeFile(dataFolder+"/bid-wars.array", JSON.stringify(arrayFile), function (err) {
											if (err)  console.log('Error: ', err);
										});
										spliceIndex = -10000;
									} else {
										spliceIndex++;
									}
								});
								if(arrayFile.length <= spliceIndex) {
									arrayFile.push(fileData);
									fs.writeFile(dataFolder+"/bid-wars.array", JSON.stringify(arrayFile), function (err) {
										if (err)  console.log('Error: ', err);
									});
								}
							} else {
								console.log(err);
							}
						});
					} else if (dataD.indexOf('r') == 0) { //REMOVING
						var textToRemove = dataD.substring(2);
						fs.readFile(dataFolder+"/bid-wars.array", function (err, arrayFile) {
							if(!err) {
								arrayFile = JSON.parse(arrayFile);
								var spliceIndex = 0;
								arrayFile.forEach(function(element) {
									if(element.name == textToRemove) {
										arrayFile.splice(spliceIndex, 1);
										fs.writeFile(dataFolder+"/bid-wars.array", JSON.stringify(arrayFile), function (err) {
											if (err)  console.log('Error: ', err);
										});
									}
									spliceIndex++;
								});
							}
						});
					} else if (dataD.indexOf('l') == 0) {
						var returnString = "d bw l ";
						fs.readFile(dataFolder+"/bid-wars.array", function (err, arrayFile) {
							if(!err) {
								arrayFile = JSON.parse(arrayFile);
								arrayFile.forEach(function(element) {
								returnString += " || " + element.name + " | " + element.option1 + " | " + element.total1 + " | " + element.option2 + " | " + element.total2;
								})
								sendMessage(returnString);
							}
						});
					} else if (dataD.indexOf('g') == 0) {
						var textToFind = dataD.substring(2);
						var returnString = "d bw g ";
						fs.readFile(dataFolder+"/bid-wars.array", function (err, arrayFile) {
							if(!err) {
								arrayFile = JSON.parse(arrayFile);
								arrayFile.forEach(function(element) {
									if(element.name == textToFind) {
										returnString += " | " + element.name + " | " + element.option1 + " | " + element.total1 + " | " + element.option2 + " | " + element.total2;
									}
								})
								sendMessage(returnString);
							}
						});
					}
					break;
				case 'bc': // broad cast
					var dataD = message.substring(7); 
					// save not required
					sendMessage("ob bc | "+dataD);
					break;
				case 'dg': // donation goal
					var dataD = message.substring(7);
					if (dataD.indexOf('a') == 0) { //ADDING
						var dataS = dataD.substring(2);
						var dgArr = dataS.split(" | ");
						fs.readFile(dataFolder+"/donation-goals.array", function (err, arrayFile) {
							if(!err) {
								var spliceIndex = 0;
								arrayFile = JSON.parse(arrayFile);
								var fileData = {}
								fileData.name = dgArr[0];
								fileData.amountNeeded = dgArr[1];
								fileData.accomplished = false;
								arrayFile.forEach(function(element) {
									if(element.name == dgArr[0]) {
										arrayFile.splice(spliceIndex, 1);
										arrayFile.push(fileData);
										fs.writeFile(dataFolder+"/donation-goals.array", JSON.stringify(arrayFile), function (err) {
											if (err)  console.log('Error: ', err);
										});
										spliceIndex = -10000;
									} else {
										spliceIndex++;
									}
								});
								if(arrayFile.length <= spliceIndex) {
									arrayFile.push(fileData);
									fs.writeFile(dataFolder+"/donation-goals.array", JSON.stringify(arrayFile), function (err) {
										if (err)  console.log('Error: ', err);
									});
								}
							} else {
								console.log(err);
							}
						});
					} else if (dataD.indexOf('r') == 0) { //REMOVING
						var textToRemove = dataD.substring(2);
						fs.readFile(dataFolder+"/donation-goals.array", function (err, arrayFile) {
							if(!err) {
								arrayFile = JSON.parse(arrayFile);
								var spliceIndex = 0;
								arrayFile.forEach(function(element) {
									if(element.name == textToRemove) {
										arrayFile.splice(spliceIndex, 1);
										fs.writeFile(dataFolder+"/donation-goals.array", JSON.stringify(arrayFile), function (err) {
											if (err)  console.log('Error: ', err);
										});
									}
									spliceIndex++;
								});
							}
						});
					} else if (dataD.indexOf('l') == 0) {
						var returnString = "d dg l ";
						fs.readFile(dataFolder+"/donation-goals.array", function (err, arrayFile) {
							if(!err) {
								arrayFile = JSON.parse(arrayFile);
								arrayFile.forEach(function(element) {
									returnString += " || " + element.name + " | " + element.amountNeeded
								})
								sendMessage(returnString);
							}
						});
					}
					break;
				case 'pz': // prizes
					var dataD = message.substring(7);
					if (dataD.indexOf('a') == 0) { //ADDING
						var dataS = dataD.substring(2);
						var dgArr = dataS.split(" | ");
						fs.readFile(dataFolder+"/prizes.array", function (err, arrayFile) {
							if(!err) {
								var spliceIndex = 0;
								arrayFile = JSON.parse(arrayFile);
								var fileData = {}
								fileData.name = dgArr[0];
								fileData.amountNeeded = dgArr[1];
								arrayFile.forEach(function(element) {
									if(element.name == dgArr[0]) {
										arrayFile.splice(spliceIndex, 1);
										arrayFile.push(fileData);
										fs.writeFile(dataFolder+"/prizes.array", JSON.stringify(arrayFile), function (err) {
											if (err)  console.log('Error: ', err);
										});
										spliceIndex = -10000;
									} else {
										spliceIndex++;
									}
								});
								if(arrayFile.length <= spliceIndex) {
									arrayFile.push(fileData);
									fs.writeFile(dataFolder+"/prizes.array", JSON.stringify(arrayFile), function (err) {
										if (err)  console.log('Error: ', err);
									});
								}
							} else {
								console.log(err);
							}
						});
					} else if (dataD.indexOf('r') == 0) { //REMOVING
						var textToRemove = dataD.substring(2);
						fs.readFile(dataFolder+"/prizes.array", function (err, arrayFile) {
							if(!err) {
								arrayFile = JSON.parse(arrayFile);
								var spliceIndex = 0;
								arrayFile.forEach(function(element) {
									if(element.name == textToRemove) {
										arrayFile.splice(spliceIndex, 1);
										fs.writeFile(dataFolder+"/prizes.array", JSON.stringify(arrayFile), function (err) {
											if (err)  console.log('Error: ', err);
										});
									}
									spliceIndex++;
								});
							}
						});
					} else if (dataD.indexOf('l') == 0) {
						var returnString = "d pz l ";
						fs.readFile(dataFolder+"/prizes.array", function (err, arrayFile) {
							if(!err) {
								arrayFile = JSON.parse(arrayFile);
								arrayFile.forEach(function(element) {
									returnString += " || " + element.name + " | " + element.amountNeeded
								})
								sendMessage(returnString);
							}
						});
					}
					break;
				case 'mc': //misc text
					var dataD = message.substring(7);
					if (dataD.indexOf('a') == 0) { //ADDING
						var dataS = dataD.substring(2);
						var dgArr = dataS.split(" | ");
						fs.readFile(dataFolder+"/misc-text.array", function (err, arrayFile) {
							if(!err) {
								var spliceIndex = 0;
								arrayFile = JSON.parse(arrayFile);
								var fileData = {}
								fileData.name = dgArr[0];
								arrayFile.forEach(function(element) {
									if(element.name == dgArr[0]) {
										arrayFile.splice(spliceIndex, 1);
										arrayFile.push(fileData);
										fs.writeFile(dataFolder+"/misc-text.array", JSON.stringify(arrayFile), function (err) {
											if (err)  console.log('Error: ', err);
										});
										spliceIndex = -10000;
									} else {
										spliceIndex++;
									}
								});
								if(arrayFile.length <= spliceIndex) {
									arrayFile.push(fileData);
									fs.writeFile(dataFolder+"/misc-text.array", JSON.stringify(arrayFile), function (err) {
										if (err)  console.log('Error: ', err);
									});
								}
							} else {
								console.log(err);
							}
						});
					} else if (dataD.indexOf('r') == 0) { //REMOVING
						var textToRemove = dataD.substring(2);
						fs.readFile(dataFolder+"/misc-text.array", function (err, arrayFile) {
							if(!err) {
								arrayFile = JSON.parse(arrayFile);
								var spliceIndex = 0;
								arrayFile.forEach(function(element) {
									if(element.name == textToRemove) {
										arrayFile.splice(spliceIndex, 1);
										fs.writeFile(dataFolder+"/misc-text.array", JSON.stringify(arrayFile), function (err) {
											if (err)  console.log('Error: ', err);
										});
									}
									spliceIndex++;
								});
							}
						});
					} else if (dataD.indexOf('l') == 0) {
						var returnString = "d mc l ";
						fs.readFile(dataFolder+"/misc-text.array", function (err, arrayFile) {
							if(!err) {
								arrayFile = JSON.parse(arrayFile);
								arrayFile.forEach(function(element) {
									returnString += " || " + element.name
								})
								sendMessage(returnString);
							}
						});
					}
					break;
				case "sh": //schedule
					var dataD = message.substring(7);
					if(dataD.indexOf('u') == 0) { //update
						fs.readFile(dataFolder+"/schedule.data", function (err, arrayFile) {
							if(!err) {
								arrayFile = JSON.parse(arrayFile);
								var dataS = dataD.substring(2);
								var shArr = dataS.split(" || ");
								shArr.splice(0,1);
								var shSt = [];
								shArr.forEach(function(element) {
									var dataE = element.split(" | ");
									var obj = new Object();
									obj.game = dataE[0];
									obj.runner = dataE[1];
									shSt.push(obj);
								});
								arrayFile.scheduleItems = shSt;
								if(arrayFile.activePosition >= shSt.length) {
									arrayFile.activePosition = 0;
								}
								fs.writeFile(dataFolder+"/schedule.data", JSON.stringify(arrayFile), function (err) {
									if (err)  console.log('Error: ', err);
								});
							}
						});
					} else if (dataD.indexOf('l') == 0) { //list
						var returnString = "d sh l ";
						fs.readFile(dataFolder+"/schedule.data", function (err, arrayFile) {
							if(!err) {
								arrayFile = JSON.parse(arrayFile);
								arrayFile.scheduleItems.forEach(function(element) {
									returnString += " || " + element.game + " | " + element.runner
								})
								sendMessage(returnString);
							}
						});
					} else if (dataD.indexOf('r') == 0) { //active position request
						var returnString = "d sh r ";
						fs.readFile(dataFolder+"/schedule.data", function (err, arrayFile) {
							if(!err) {
								arrayFile = JSON.parse(arrayFile);
								sendMessage(returnString+" | "+arrayFile.activePosition+" | "+arrayFile.scheduleItems.length);
								if(arrayFile.scheduleItems.length > 0) {
									sendMessage("d sh i | "+arrayFile.scheduleItems[arrayFile.activePosition].game+" | "+arrayFile.scheduleItems[arrayFile.activePosition].runner);
								}
							}
						});
					} else if (dataD.indexOf('p') == 0) { //active position update
						fs.readFile(dataFolder+"/schedule.data", function (err, arrayFile) {
							if(!err) {
								arrayFile = JSON.parse(arrayFile);
								var dataS = dataD.substring(2);
								arrayFile.activePosition = parseInt(dataS);
								if(arrayFile.activePosition >= arrayFile.scheduleItems.length) {
									arrayFile.activePosition = 0;
								} else {
									if(arrayFile.scheduleItems.length > 0) {
										sendMessage("d sh i | "+arrayFile.scheduleItems[arrayFile.activePosition].game+" | "+arrayFile.scheduleItems[arrayFile.activePosition].runner);
									}
								}
								fs.writeFile(dataFolder+"/schedule.data", JSON.stringify(arrayFile), function (err) {
									if (err)  console.log('Error: ', err);
								});
							}
						});
					}
					break;
				case "TL":
					var dataD = message.substring(7);
					if(dataD.indexOf('u') == 0) { //user
						var participantID = dataD.substring(2)
						var options = {
							host: 'tiltify.com',
							port: 443,
							path: "/api/v3/users/"+escape(participantID),
							headers: {
								"Authorization":"Bearer XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
							},
							method:'GET'
						}
						https.get(options, (resp) => {
						let data = '';

						// A chunk of data has been recieved.
						resp.on('data', (chunk) => {
							data += chunk;
						});

						// The whole response has been received. Print out the result.
						resp.on('end', () => {
							if(JSON.parse(data).meta.status != 404) {
								var sendData = JSON.parse(data)
								sendMessage("d ap Tiltify | UsernameVerify | "+sendData.data.id+" | "+sendData.data.slug+" | "+sendData.data.thumbnail.src)
							} else {
								sendMessage("d ap Tiltify | InvalidUsername")
							}
						});

						}).on("error", (err) => {
						console.log("Error: " + err.message);
						});
					}
					break;
		}
	} else if (message == "oo") {
		fs.readFile(dataFolder+"/schedule.data", function (err, arrayFile) {
			if(!err) {
				arrayFile = JSON.parse(arrayFile);
				if((parseInt(arrayFile.activePosition)+1) < arrayFile.scheduleItems.length && arrayFile.scheduleItems.length > 0) {
					sendMessage("ob un || "+JSON.stringify(arrayFile.scheduleItems[parseInt(arrayFile.activePosition)+1]))
				} else {
					sendMessage("ob un || NONE")
				}
				if(arrayFile.scheduleItems.length > 0) {
					sendMessage("ob ri || "+ JSON.stringify(arrayFile.scheduleItems[parseInt(arrayFile.activePosition)]))
				}
			}
		})
		fs.readFile(dataFolder+"/donation-goals.array", function (err, arrayFile) {
			if(!err) {
				var returnString = "ob dg";
				arrayFile = JSON.parse(arrayFile);
				arrayFile.forEach(function(element) {
					returnString += " || " + JSON.stringify(element);
				})
				sendMessage(returnString);
			}
		})
		fs.readFile(dataFolder+"/prizes.array", function (err, arrayFile) {
			if(!err) {
				var returnString = "ob pz";
				arrayFile = JSON.parse(arrayFile);
				arrayFile.forEach(function(element) {
					returnString += " || " + JSON.stringify(element);
				})
				sendMessage(returnString);
			}
		})
		fs.readFile(dataFolder+"/misc-text.array", function (err, arrayFile) {
			if(!err) {
				var returnString = "ob mc";
				arrayFile = JSON.parse(arrayFile);
				arrayFile.forEach(function(element) {
					returnString += " || " + JSON.stringify(element);
				})
				sendMessage(returnString);
			}
		})
		fs.readFile(dataFolder+"/bid-wars.array", function (err, arrayFile) {
			if(!err) {
				var returnString = "ob bw";
				arrayFile = JSON.parse(arrayFile);
				arrayFile.forEach(function(element) {
				returnString += " || " + JSON.stringify(element);
				})
				sendMessage(returnString);
			}
		});
		fs.readFile(dataFolder+"/config.data", function (err, arrayFile) {
			if(!err) {
				arrayFile = JSON.parse(arrayFile);
				if(arrayFile.startTime != "") {
					sendMessage("ob mt "+arrayFile.startTime);
				}
				if(arrayFile.hasOwnProperty('title')) {
					if(arrayFile.title != "") {
						sendMessage("ob tt "+arrayFile.title)								
					}
				}
				if(arrayFile.hasOwnProperty('subtitle')) {
					if(arrayFile.subtitle != "") {
						sendMessage("ob st "+arrayFile.subtitle)								
					}
				}
			}
		});
		if(apiBranch == "ExtraLife") {
			sendMessage("ob ap | "+apiCache.sumDonations);
		}
		if(apiBranch == "tiltify") {
			sendMessage("ob ap | "+apiCache.data.amountRaised);
		}
		if(apiBranch == "zeldathon") {
			sendMessage("ob ap | "+apiCache);
		}
	}
  })
})
//call api and recieve new data
function updateAPIdata() {
	if(participantID > 0 && apiBranch == "ExtraLife") {
		https.get('https://www.extra-life.org/api/participants/'+participantID, (resp) => {
		  let data = '';

		  // A chunk of data has been recieved.
		  resp.on('data', (chunk) => {
			data += chunk;
		  });

		  // The whole response has been received. Print out the result.
		  resp.on('end', () => {
			apiCache = JSON.parse(data);
			
			return JSON.parse(data);
		  });

		}).on("error", (err) => {
		  console.log("Error: " + err.message);
		});
	} else if(participantID > 0 && apiBranch.toLowerCase() == "tiltify") {
		var options = {
			host: 'tiltify.com',
			port: 443,
			path: "/api/v3/campaigns/"+participantID,
			headers: {
				"Authorization":"Bearer XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
			},
			method:'GET'
		}
		https.get(options, (resp) => {
		let data = '';

		// A chunk of data has been recieved.
		resp.on('data', (chunk) => {
			data += chunk;
		});

		// The whole response has been received. Print out the result.
		resp.on('end', () => {
			if(JSON.parse(data).meta.status != 404) {
				apiCache = JSON.parse(data);
				return JSON.parse(data);
			}
		});

		}).on("error", (err) => {
			console.log("Error: " + err.message);
		});
	} else if(apiBranch.toLowerCase() == "zeldathon") {
		https.get('https://donate.zeldathon.net/total?unformatted=true', (resp) => {
		  let data = '';

		  // A chunk of data has been recieved.
		  resp.on('data', (chunk) => {
			data += chunk;
		  });

		  // The whole response has been received. Print out the result.
		  resp.on('end', () => {
			apiCache = JSON.parse(data);
			
			return JSON.parse(data);
		  });

		}).on("error", (err) => {
		  console.log("Error: " + err.message);
		});
	}
}
//save api data to disk
function updateAPICache() {
	fs.readFile(dataFolder+"/api.data", function (err, arrayFile) {
		if(!err) {
			var data = JSON.parse(arrayFile);
			data.cachedData = apiCache;
			fs.writeFile(dataFolder+"/api.data", JSON.stringify(data), function (err) {
				if (err)  console.log('Error: ', err);
			});
		} else {
			console.log(err)
		}
	})
}

function sendMessage(message) {
	wss.clients.forEach(function each(client) {
		client.send(message);
	});
}