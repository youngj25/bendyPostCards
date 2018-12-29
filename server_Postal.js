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

Postal.on('connection', function (socket) {
	 var usersAccounts = [];
	 
	 // A user is Logs into the account
	 socket.on('Account Login', function(data){
		 console.log("A user with the email '"+data.user+"' is trying to log in");
		 isTheEmailUsable(socket.id, data.user, data.pass);
	 });
	 
	 // User sends us text and image to email
	 socket.on('Mail', function(data){
		 
		 console.log("MAILING....");
		 
		 // Creates the package for the email
		 var mailOptions = {
		     from: usersAccounts[0].user,
			 to: 'youngj25@southernct.edu',
			 subject: data.subject,
			 //text: 'That was easy!'
			 html: data.text
		 };
		 
		 // Sends out the Email
		 usersAccounts[0].transporter.sendMail(mailOptions, function(error, info){
			 var message = "Your Post Card has been sent."
			 if (error) {
				 console.log(error);
				 message = "Your Post Card was not sent."
				 Postal.emit('Error', data={ message : message});		
			 } else {
				 console.log('Email sent: ' + info.response);
				 Postal.emit('Error', data={ message : message});		
			 }
		 });
		 
	 });
	 
	 // Verifies the Email Address and Finds out if the user already has an account
	 function isTheEmailUsable(socketID, user, pass){
		 var transporter, recognizeEmail = true;
		 console.log("Received....");
		 try{
			 // If it's an Gmail Account
			 if(user.indexOf("@gmail.com")){
				 transporter = nodemailer.createTransport({
					  service: 'gmail',
					  auth: {
						user: user,
						pass: pass
					  }
				 });		
			 }
			 
			 // If the Account type is unrecognizable
			 else{			 				 
				 recognizeEmail = false;
				 // Force an Error
				 var x = 3/0;
			 } 

			 // Just to be on the safe side
			 if(recognizeEmail){
				 var account = {
					 user: user,
					 pass: pass, // I'll reset this once the User disconnects
					 history:[],
					 socket: socketID,
					 transporter : transporter
				 };
				 
				 usersAccounts.push(account);
			 }
			 console.log("Finish Adding the user.");
			 Postal.emit('Account Logged In');
		 }
		 catch(e){
			 if(recognizeEmail)
				 console.log("Email/Password is no good...");
			 else 
				 console.log("Do not recognize this Email");
		 }
	 }
 
	 //Disconnecting player
	 socket.on('disconnect', function() {			
		 console.log("Disconnected");	
		 console.log();
	 });
 
});



