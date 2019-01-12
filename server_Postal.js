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
	 
	 
	 /** Send Email Please
		 
	 **/
	 socket.on('Send Email Please', function(data){
		 //console.log(data);
		 
		 doesThisUserAlreadyExist(data.sender);
		 console.log(usersAccounts[usersAccounts.length-1]);
		 console.log("Number of users:"+usersAccounts.length);
		 
		 
		 
		 try{
			 var transporter, recognizeEmail=true;
			 
			 // For Gmail
			 if(data.sender.indexOf("@gmail.com")){
				 transporter = nodemailer.createTransport({
					  service: 'gmail',
					  auth: {
						user: data.sender,
						pass: data.passW
					  }
				 });		
			 }
			 // If the Account type is unrecognizable
			 else{	
				 recognizeEmail = false;
			 }

			 
		 }
		 catch(e){
			 
		 }
		 
		 accountErrorRemoval(data.sender);
		 
		 /**
		 var transporter, recognizeEmail = true;
		 try{
			 // If the Account type is unrecognizable
			 else{			 				 
				 
				 // Force an Error
				 var x = 3/0;
			 } 

			 // Just to be on the safe side
			 if(recognizeEmail){
				 var account = {
					 emailAddress: data.user,
					 history:[],
					 socket: socketID
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
	 
	 
		 
		 **/
	 });
	 
	 /** Does This User Already Exist
		 Checks to see whether this user is already in
		 our list of users. If not then add the user to 
		 the list.
	 **/
	 function doesThisUserAlreadyExist(emailAddress){
		 
		 var found= false;
		 
		 // Searching to see if this emailAddress is already loaded
		 for(var x = 0; x < usersAccounts.length && !found; x++)
			 if(emailAddress == usersAccounts[x].emailAddress){
				 found= true;				 
			 }
		 
		 /** If the email was found then we don't need to do anymore
		     work otherwise we need to add the emailAddress to or list
			 of users
		 **/
		 if(!found){
			 var user = {
				 emailAddress : emailAddress,
				 history : [],
				 socketID : null				 
			 }			 
			 
			 usersAccounts.push(user);
		 }
	 }
	 
	 /** Set Temporary Socket ID
		 When the user has verified that themselves by sending
		 an email successfully, we'll save their socketID and give
		 them access to see their PostCard History. This function
		 will find the user in the usersAccounts and set their 
		 socketID to their current session. At then end of their
		 session their ID will be erased from usersAccounts.
	 **/
	 function setTempSocketID(emailAddress, socketID){
		 var found = false;
		 
		 for(var x = 0; x < usersAccounts.length && !found; x++)
			 if(emailAddress == usersAccounts[x].emailAddress){
				 // Setting the Temporary Socket ID
				 usersAccounts[x].socketID = socketID;
				 found = true;
			 }
	 }
	 
	 /** Account Error Removal
		 If the account had an error with sending. Then
		 we'll check whether the account is worth keeping
		 or not. If the account has previous PostCard History
		 then the account will be left alone. However, if
		 the account doesn't have any History, then it
		 will be removed.
	 **/
	 function accountErrorRemoval(emailAddress){
		 var found = false;
		 
		 for(var x = 0; x < usersAccounts.length && !found; x++)
			 if(emailAddress == usersAccounts[x].emailAddress){
				 // Found!!!
				 found = true;
				 
				 // If the user doesn't have any PostCard History
				 if(usersAccounts[x].history.length == 0){
					 
					 console.log("Delete this user!!!!");
					 usersAccounts.splice(x,1);
				 }
			 }
		 
	 }
	 
	 
	 
	 // --- old
	 // A user is Logs into the account
	 socket.on('Account Login', function(data){
		 console.log("A user with the email '"+data.user+"' is trying to log in");
		 isTheEmailUsable(socket.id, data.user, data.pass);
	 });
	 
	 // User sends us text and image to email
	 socket.on('Mail', function(data){
		 
		 console.log(data);
		 console.log("MAILING....");
		 
		 // Creates the package for the email
		 var mailOptions = {
		     //from: usersAccounts[0].user,
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



