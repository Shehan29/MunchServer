const NutritionFacts = require('nutrition-facts');

const Clarifai = require('clarifai');

const clarifaiApp = new Clarifai.App({
	apiKey: 'fd87ab258b3349538f837a7cb36886bb'
});

const http = require('http'),
	fs = require('fs');

const NF = new NutritionFacts.default("MVC7zkXutJjLnZnjXSnd2W6XE3nzjU0tWAzVDvii");


fs.readFile('./index.html', function (err, html) {
	if (err) {
		throw err;
	}
	server = http.createServer(function (request, response) {
		response.setHeader('Access-Control-Allow-Origin', '*');
		response.setHeader('Access-Control-Request-Method', '*');
		response.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
		response.setHeader("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
		
		if (request.url == '/index') {
			response.write(html);
			response.end();
		}
		
		if (request.method == 'POST') {
			var body = '';
			
			request.on('data', function (p_data) {
				body += p_data;
			});
			request.on('end', function () {
				
				if (request.url == '/recognize') {
					console.log("Sending image to API ...");
					
					clarifaiApp.models.predict(Clarifai.FOOD_MODEL, {base64: decodeURIComponent(JSON.parse(body).img)}, {
						minValue: 0.8,
						maxConcepts: 5
					}).then(
						function (imgResponse) {
							const matchedList = {
								"images": imgResponse.outputs[0].data.concepts.map(function (item) {
									return item['name'];
								})
							}
							console.log(matchedList);
							response.end(JSON.stringify(matchedList));
						},
						function (e) {
							console.log("Error: " + e.message);
						}
					);
				}
				else if (request.url == '/data') {
					NF.searchFoods({
						q: body,
						ds: 'Standard Reference',
						max: 1
					}).then(function (results) {
						var foodItem = results.list.item[0];
						
						foodItem.getNutrition().then(function (nutritionReport) {
							console.log(nutritionReport);
							response.end(JSON.stringify(nutritionReport.nutrients));
						}).catch(function (err) {
							console.log(err)
						})
					}).catch(function (err) {
						console.log(err)
					});
				}
				else {
					console.log("Endpoint unavailable")
				}
			});
		}
		else {
			response.end();
		}
	});
	
	port = 3000;
	//host = '172.25.150.65';
	//host = '192.168.11.119';
	//host = '192.168.137.9';
	host = '192.168.137.70';
	server.listen(port, host);
	console.log('Listening at http://' + host + ':' + port);
});




/*
 var express = require('express');
 var app = express();
 var bodyParser = require('body-parser');
 var cors = require('cors')
 const Clarifai = require('clarifai');
 
 app.use(bodyParser.json({limit: '50mb'}));
 app.use(cors());
 
 const clarifaiApp = new Clarifai.App({
 apiKey: 'fd87ab258b3349538f837a7cb36886bb'
 });
 
 
 
 app.post('/', function(req,res){
 console.log(">>>> "+req.body.img);
 
 res.send("Got IT!")
 
 /*
 clarifaiApp.models.predict(Clarifai.FOOD_MODEL, {base64: decodeURIComponent(req.body('img'))}).then( //, {minValue: 0.8, maxConcepts: 5}
 function(response) {
 console.log("---------");
 console.log(response);
 const matchedList = {
 "list": response.outputs[0].data.concepts.map(function(item) { return item['name']; })
 }
 console.log("---------");
 console.log(matchedList);
 console.log("---------");
 res.send(matchedList)
 },
 function(err) {
 console.log(err.message);
 res.send({"list": "An error occurred"});
 }
 );
 
 });
 
 app.listen(3000, '192.168.11.119', function(){
 console.log('Server running at 192.168.11.119:3000/');
 });
 */