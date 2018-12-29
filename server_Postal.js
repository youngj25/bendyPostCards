// Using express: http://expressjs.com/
var express = require('express');

// Create the app
var app = express();
// Set up the server
// process.env.PORT is related to deploying on heroku
var server = app.listen(process.env.PORT || 9000, listen);
console.log(new Date().toLocaleTimeString());

//For the emails
var nodemailer = require('nodemailer');

//Experiment with CPU
const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;
console.log("Number of CPU = " + numCPUs);

// This call back just tells us that the server has started
function listen() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://' + host + ':' + port);
}

app.use(express.static('public'));

// WebSocket Portion
// WebSockets work with the HTTP server
var io = require('socket.io')(server);
// Postal
var Postal = io.of('/postal');

var transporter = nodemailer.createTransport({
	  service: 'gmail',
	  auth: {
		user: 'jay357young@gmail.com',
		pass: '357young'
	  }
});

console.log(transporter);


Postal.on('connection', function (socket) {
	 var gameSettings= [], gameState = "Idle";
	 
	 /**
	 var transporter = nodemailer.createTransport({
	  service: 'gmail',
	  auth: {
		user: 'youremail@gmail.com',
		pass: 'yourpassword'
	  }
	 });
	 **/
	 
	 // Start Timer
	 socket.on('Mail', function(data){
		 
		 console.log("MAILING....");
		 console.log(data);
		 
		 var mailOptions = {
		     from: 'jay357young@gmail.com',
			 to: 'youngj25@southernct.edu',
			 subject: data.subject,
			 //text: 'That was easy!'
			 html: data.text
		 };

		 transporter.sendMail(mailOptions, function(error, info){
			 if (error) {
				 console.log(error);
			 } else {
				 console.log('Email sent: ' + info.response);
			 }
		 });
		 
		 
		 
		 
	 });
	 
	 function countDown(){
		 CountDown --;
		 
		 Codename.emit('CountDown', data={ Count : CountDown});			 
		 
		 //Reset the CountDown for the next turn
		 if(CountDown == 0 ){
			 // The Extra +5 is for players to have time to start the next round/turn
			 // A Transition period
			 CountDown = 60 + 10;			 
		 }
		 
		 
	 }
 
	 //Disconnecting player
	 socket.on('disconnect', function() {			
		 console.log("Disconnected");	
		 console.log();
	 });
 
});



