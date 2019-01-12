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
		 console.log(new Date());
		 console.log(usersAccounts[usersAccounts.length-1]);
		 console.log("Number of users:"+usersAccounts.length+" history size:"+usersAccounts[0].history.length);
		 
		 
		 var AtLocation = data.sender.indexOf("@");
		 var ComLocation = data.sender.lastIndexOf(".");
		 console.log("service:");
		 console.log(data.sender.substring(AtLocation+1,ComLocation));
		 
		 
		 
		 try{
			 var transporter, recognizeEmail=true;
			 
			 var service = 'gmail';
			 service = findEmailServiceOrReturnError(data.sender);
			 
			 
			 
			 transporter = nodemailer.createTransport({
				  service: service,
				  auth: {
					user: data.sender,
					pass: data.passW
				  }
			 });		
			 
			 
			 //}
			 // If the Account type is unrecognizable
			 //else{	
				 recognizeEmail = false;
			 //}

			 
			 
			 if(recognizeEmail || 5 >2){
				 // Creates the package for the email
				 var mailOptions = {
					 from: data.sender,
					 to: data.receipt,
					 subject: data.subject,
					 html: data.picture
				 };
				 
				 // Sends out the Email
				 transporter.sendMail(mailOptions, function(error, info){
					 var message = "Your Post Card has been sent.";
					 var receipt = null;
					 var firewall = null;
					 var usernameANDpassword = null;
					 
					 if (error) {
						 
						 
						 
						 
						 // No receipt defined
						 if((""+error).indexOf('No recipients defined')>=0){
							 message = "Double-Check to make sure the receipt's email address is correct."
							 receipt = true;
						 }
						 // Email Firewall Prevented Nodemailer
						 else if(error.code == 'ECONNECTION' && error.errno == 'ECONNREFUSED'){
							 message = "Your Email's firewall prevented us from sending the PostCard."
							 firewall = true;
							 
							 
							 // https://stackoverflow.com/questions/14654736/nodemailer-econnrefused
						 }
						 // Both the username and password error
						 else if((""+error).indexOf('Username and Password not accepted')>=0){
						 
							 message = "Your Email Address and Password appears to be incorrect."
							 usernameANDpassword = true;
						 }
						 // 
						 else if((""+error).indexOf('Invalid login: 535 Error: authentication failed')>=0){
						 
							 message = "Error: authentication failed... idk"
							 // FULL REPORT
							 console.log(error);
							 // usernameANDpassword = true;
						 }
						 
						 // Else.... shoot lol IDK
						 else{
							 // FULL REPORT
							 // console.log(error);
							 
							 // Top of the Report lol First 75 words....
							 console.log((">"+error).substring(0,76));
							 
							 
							 message = "Your Post Card was not sent."
						 }
					 
						 accountErrorRemoval(data.sender);
						 var statusData = {
							 message : message,
							 firewall: firewall,
							 receipt : receipt,							 
							 usernameANDpassword : usernameANDpassword
						 }
						 
						 Postal.emit('Error', statusData);	
					 }
					 else {
						 console.log('Email sent: ' + info.response);
						 Postal.emit('Error', data={ message : message});	
						 addPictureToHistory(data.sender,data.picture,data.receipt);					 
					 }
				 });
			 }
		 }
		 catch(e){
			 
		 }
		 
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
	 
	 /** Add Picture To History
		 Add the Picture and the additional information to the
		 PostCard History
	 **/
	 function addPictureToHistory(emailAddress,picture,receipt){
		 // Get the Date and Time
		 var d =new Date();
		 
		 // Create the Picture File
		 var postcard = {
			 date : d.toDateString(),
			 picture : picture,
			 receipt : receipt,
			 time : d.toLocaleTimeString()
		 }
		 console.log(postcard.date + " @ " +postcard.time);
		 
		 for(var x = 0; x < usersAccounts.length && !found; x++)
			 if(emailAddress == usersAccounts[x].emailAddress){
				 // Found!!!
				 found = true;
				 usersAccounts[x].history.push(postcard);
			 }
	 }
	 
	 /**
		 Find Email Service or return OutLook365
		 Searches to find a suitable email address,
		 if one is not found then it'll automatically
		 assume that the service belongs to OutLook365
		 based on personal experiences.. some colleges
		 can use that instead there own name but the
		 service is under OutLook365. 
	 **/
	 function findEmailServiceOrReturnError(emailAddress){
		 var AtSignLocation = emailAddress.indexOf("@");
		 var addressAfterTheAtSign=emailAddress.substring(AtSignLocation);
		 
		 /** Let the chain of if statesments begin.
			 The source for the list of Supported Services
			 https://nodemailer.com/smtp/well-known/
		 **/
		 
		 // 126
		 if(addressAfterTheAtSign.indexOf('126')){
			 return '126'			 
		 }
		 // 163
		 else if(addressAfterTheAtSign.indexOf('163')){
			 return '163'			 
		 }
		 // 1und1
		 else if(addressAfterTheAtSign.indexOf('1und1')){
			 return '1und1'			 
		 }
		 // AOL
		 else if(addressAfterTheAtSign.indexOf('AOL')){
			 return 'AOL'			 
		 }
		 // DebugMail
		 else if(addressAfterTheAtSign.indexOf('DebugMail')){
			 return 'DebugMail'			 
		 }
		 // DynectEmail
		 else if(addressAfterTheAtSign.indexOf('AOL')){
			 return 'DynectEmail'			 
		 }
		 // FastMail
		 else if(addressAfterTheAtSign.indexOf('FastMail')){
			 return 'FastMail'			 
		 }
		 // GandiMail
		 else if(addressAfterTheAtSign.indexOf('GandiMail')){
			 return 'GandiMail'			 
		 }
		 // Gmail
		 else if(addressAfterTheAtSign.indexOf('Gmail')){
			 return 'Gmail'			 
		 }
		 // Godaddy
		 else if(addressAfterTheAtSign.indexOf('Godaddy')){
			 return 'Godaddy'			 
		 }
		 // GodaddyAsia
		 else if(addressAfterTheAtSign.indexOf('GodaddyAsia')){
			 return 'GodaddyAsia'			 
		 }
		 // GodaddyEurope
		 else if(addressAfterTheAtSign.indexOf('GodaddyEurope')){
			 return 'GodaddyEurope'			 
		 }
		 // "hot.ee"
		 else if(addressAfterTheAtSign.indexOf('hot.ee')){
			 return 'hot.ee'			 
		 }
		 // "Hotmail"
		 else if(addressAfterTheAtSign.indexOf('Hotmail')){
			 return 'Hotmail'			 
		 }
		 // iCloud
		 else if(addressAfterTheAtSign.indexOf('iCloud')){
			 return 'iCloud'			 
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



