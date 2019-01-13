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
		 For this function to run properly, it needs to be
		 run asynchronous. So this function will be using
		 async, await and promises to determine the emails
		 service type.
	 **/
	 socket.on('Send Email Please', async function(data){
		 
		 doesThisUserAlreadyExist(data.sender);
		 //console.log(new Date());
		 //console.log(usersAccounts[usersAccounts.length-1]);
		 //console.log("Number of users:"+usersAccounts.length+" history size:"+usersAccounts[0].history.length);
		  
		 try{
			 var transporter, recognizeEmail=true;
			 
			 /**
				 Additionally to allocate enough time to determine the
				 service type. Await and Async will be used.
			 **/
			 var service = await findEmailService(data.sender);
			 console.log("service: "+service); // 10			 
			 
			 transporter = nodemailer.createTransport({
				  service: service,
				  auth: {
					user: data.sender,
					pass: data.passW
				  }
			 });		
			 
			 
			 // }
			 // If the Account type is unrecognizable
			 //else{	
				 recognizeEmail = false;
			 // }

			 
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
				 var serviceProviders = null;
				 var usernameANDpassword = null;
				 
				 // If an error Occured... Handle it!!!
				 if (error) {
					 // No receipt defined
					 if((""+error).indexOf('No recipients defined')>=0){
						 message = "Double-Check to make sure the receipt's email address is correct.";
						 receipt = true;
					 }
					 // Email Firewall Prevented Nodemailer
					 else if(error.code == 'ECONNECTION' && error.errno == 'ECONNREFUSED'){
						 message = "Your Email's firewall prevented us from sending the PostCard.";
						 firewall = true;			
						 // https://stackoverflow.com/questions/14654736/nodemailer-econnrefused
					 }
					 // Both the username and password error
					 else if((""+error).indexOf('Username and Password not accepted')>=0){					 
						 message = "Your Email Address and Password appears to be incorrect.";
						 usernameANDpassword = true;
					 }
					 // 
					 else if((""+error).indexOf('Invalid login: 535 Error: authentication failed')>=0){
						 message = "Error: Sorry, we weren't able to authentication that email address.";
					 }
					 // Missing Credentials from the User
					 else if((""+error).indexOf('Missing credentials for "PLAIN')>=0){
						 message = "Error: It appears that some of your credentials are missing";
						 usernameANDpassword = null;
					 }
					 // Lol Most Likely..... our guess for the Service provider was wrong
					 else if((""+error).indexOf('Invalid login: 535 5.7.3 Authentication unsuccessful')>=0){
						 message = "Error: We weren't able to locate your email's service providers... can you type the name of your providers? (gmail? yahoo? hotmail?)";
						 usernameANDpassword = null;
					 }
					 
					 // Else.... shoot lol IDK
					 else{
						 // FULL REPORT
						 // console.log(error);
						 
						 // Top of the Report lol Print the First 100 characters....
						 console.log((">"+error).substring(0,100));
						 
						 
						 message = "Your Post Card was not sent."
					 }
				 
					 accountErrorRemoval(data.sender);
					 var statusData = {
						 message : message,
						 firewall: firewall,
						 receipt : receipt,
						 serviceProviders : serviceProviders,						 
						 usernameANDpassword : usernameANDpassword
					 }
					 
					 Postal.emit('Error', statusData);	
				 }
				 else {
					 console.log('Email sent: ' + info.response);
					 Postal.emit('Sent', data={ message : message});	
					 addPictureToHistory(data.sender,data.picture,data.receipt);					 
				 }
			 });
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
	 
	 /** Find The Email Service Or Return OutLook365
		 Find Email Service or return OutLook365
		 Searches to find a suitable email address,
		 if one is not found then it'll automatically
		 assume that the service belongs to OutLook365
		 based on personal experiences.. some colleges
		 can use that instead there own name but the
		 service is under OutLook365. 
	 **/
	 function findEmailService(emailAddress){
		 var AtSignLocation = emailAddress.indexOf("@");
		 var addressAfterTheAtSign=emailAddress.substring(AtSignLocation);
		 
		 /** Let the chain of if statesments begin.
			 The source for the list of Supported Services
			 https://nodemailer.com/smtp/well-known/
		 **/
		 return new Promise(resolve => {
			 setTimeout(() => {
			     var service = 'Outlook365';	
				 
			     // 126
				 if(addressAfterTheAtSign.indexOf('126')>=0){
					 service = '126'			 
				 }
				 // 163
				 else if(addressAfterTheAtSign.indexOf('163')>=0){
					 service = '163'			 
				 }
				 // 1und1
				 else if(addressAfterTheAtSign.indexOf('1und1')>=0){
					 service = '1und1'			 
				 }
				 // AOL
				 else if(addressAfterTheAtSign.indexOf('AOL')>=0){
					 service = 'AOL'			 
				 }
				 // DebugMail
				 else if(addressAfterTheAtSign.indexOf('DebugMail')>=0){
					 service = 'DebugMail'			 
				 }
				 // DynectEmail
				 else if(addressAfterTheAtSign.indexOf('DynectEmail')>=0){
					 service = 'DynectEmail'			 
				 }
				 // FastMail
				 else if(addressAfterTheAtSign.indexOf('FastMail')>=0){
					 service = 'FastMail'			 
				 }
				 // GandiMail
				 else if(addressAfterTheAtSign.indexOf('GandiMail')>=0){
					 service = 'GandiMail'			 
				 }
				 // Gmail
				 else if(addressAfterTheAtSign.indexOf('gmail')>=0){
					 service = 'gmail'			 
				 }
				 // Godaddy
				 else if(addressAfterTheAtSign.indexOf('Godaddy')>=0){
					 service = 'Godaddy'			 
				 }
				 // GodaddyAsia
				 else if(addressAfterTheAtSign.indexOf('GodaddyAsia')>=0){
					 service = 'GodaddyAsia'			 
				 }
				 // GodaddyEurope
				 else if(addressAfterTheAtSign.indexOf('GodaddyEurope')>=0){
					 service = 'GodaddyEurope'			 
				 }
				 // "hot.ee"
				 else if(addressAfterTheAtSign.indexOf('hot.ee')>=0){
					 service = 'hot.ee'			 
				 }
				 // "Hotmail"
				 else if(addressAfterTheAtSign.indexOf('Hotmail')>=0){
					 service = 'Hotmail'			 
				 }
				 // iCloud
				 else if(addressAfterTheAtSign.indexOf('iCloud')>=0){
					 service = 'iCloud'			 
				 }
				 // mail.ee
				 else if(addressAfterTheAtSign.indexOf('mail.ee')>=0){
					 service = 'mail.ee'			 
				 }
				 // Mail.ru
				 else if(addressAfterTheAtSign.indexOf('Mail.ru')>=0){
					 service = 'Mail.ru'			 
				 }
				 // Maildev
				 else if(addressAfterTheAtSign.indexOf('Maildev')>=0){
					 service = 'Maildev'			 
				 }
				 // Mailgun
				 else if(addressAfterTheAtSign.indexOf('Mailgun')>=0){
					 service = 'Mailgun'			 
				 }
				 // Mailjet
				 else if(addressAfterTheAtSign.indexOf('Mailjet')>=0){
					 service = 'Mailjet'			 
				 }
				 // Mailosaur
				 else if(addressAfterTheAtSign.indexOf('Mailosaur')>=0){
					 service = 'Mailosaur'			 
				 }
				 // Mandrill
				 else if(addressAfterTheAtSign.indexOf('Mandrill')>=0){
					 service = 'Mandrill'			 
				 }
				 // Naver
				 else if(addressAfterTheAtSign.indexOf('Naver')>=0){
					 service = 'Naver'			 
				 }
				 // OpenMailBox
				 else if(addressAfterTheAtSign.indexOf('OpenMailBox')>=0){
					 service = 'OpenMailBox'			 
				 }
				 // Outlook365
				 else if(addressAfterTheAtSign.indexOf('Outlook365')>=0){
					 service = 'Outlook365'			 
				 }
				 // Postmark
				 else if(addressAfterTheAtSign.indexOf('Postmark')>=0){
					 service = 'Postmark'			 
				 }
				 // QQ
				 else if(addressAfterTheAtSign.indexOf('QQ')>=0){
					 service = 'QQ'			 
				 }
				 // QQex
				 else if(addressAfterTheAtSign.indexOf('QQex')>=0){
					 service = 'QQex'			 
				 }
				 // SendCloud
				 else if(addressAfterTheAtSign.indexOf('SendCloud')>=0){
					 service = 'SendCloud'			 
				 }
				 // SendGrid
				 else if(addressAfterTheAtSign.indexOf('SendGrid')>=0){
					 service = 'SendGrid'			 
				 }
				 // SendinBlue
				 else if(addressAfterTheAtSign.indexOf('SendinBlue')>=0){
					 service = 'SendinBlue'			 
				 }
				 // SendPulse
				 else if(addressAfterTheAtSign.indexOf('SendPulse')>=0){
					 service = 'SendPulse'			 
				 }
				 // SES
				 else if(addressAfterTheAtSign.indexOf('SES')>=0){
					 service = 'SES'			 
				 }
				 // SES-US-EAST-1
				 else if(addressAfterTheAtSign.indexOf('SES-US-EAST-1')>=0){
					 service = 'SES-US-EAST-1'			 
				 }
				 // SES-EU-WEST-1
				 else if(addressAfterTheAtSign.indexOf('SES-EU-WEST-1')>=0){
					 service = 'SES-EU-WEST-1'			 
				 }
				 // SES-US-WEST-2
				 else if(addressAfterTheAtSign.indexOf('SES-US-WEST-2')>=0){
					 service = 'SES-US-WEST-2'			 
				 }
				 // Sparkpost
				 else if(addressAfterTheAtSign.indexOf('Sparkpost')>=0){
					 service = 'Sparkpost'			 
				 }
				 // Yahoo
				 else if(addressAfterTheAtSign.indexOf('Yahoo')>=0){
					 service = 'Yahoo'			 
				 }
				 // Yandex
				 else if(addressAfterTheAtSign.indexOf('Yandex')>=0){
					 service = 'Yandex'			 
				 }
				 // Zoho
				 else if(addressAfterTheAtSign.indexOf('Zoho')>=0){
					 service = 'Zoho'			 
				 }
				 // qiye.aliyun
				 else if(addressAfterTheAtSign.indexOf('qiye.aliyun')>=0){
					 service = 'qiye.aliyun'			 
				 }
				 
			     resolve(service);
			 }, 3000);
	     });
		 
		 
		 
		 
	 }
	 
	 
	 //Disconnecting player
	 socket.on('disconnect', function() {			
		 console.log("Disconnected");	
		 console.log();
	 });
 
});



