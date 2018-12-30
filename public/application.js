var socket, Postal = io('/postal', {forceNew:true});


function init() {
	 // SOCKETS - Incoming
	 // socket = io.connect('http://localhost:9000');
	 socket = io.connect('http://ec2-34-205-146-82.compute-1.amazonaws.com:9000');
      
	 //The user has successfully logged in
	 Postal.on('Account Logged In', function(data) {
		 document.getElementById("results").innerHTML = "You have successfully logged in";
		 document.getElementById("results").style.color = "green";
	 });
	 
	 // An error has occured with the sending the Post Card
	 Postal.on('Error', function(data) {
		 document.getElementById("results").innerHTML = data.message;
		 document.getElementById("results").style.color = "red";
	 });
	  
	 // An error has occured with the sending the Post Card
	 Postal.on('Sent', function(data) {
		 document.getElementById("results").innerHTML = data.message;
		 document.getElementById("results").style.color = "blue";
	 });
	  
	  
	 //----------------------------------------------------------------------------
	 
	 
	 
	 var c = document.getElementById("WebGL-output");
	 var ctx = c.getContext("2d");

	 ctx.font = "20px Georgia";
	 ctx.fillText("Hello World!", 10, 50);

	 ctx.font = "30px Verdana";
	 // Create gradient
	 var gradient = ctx.createLinearGradient(0, 0, c.width, 0);
	 gradient.addColorStop("0", "#850085");
	 gradient.addColorStop("0.25", "Orange");
	 gradient.addColorStop("0.5", "Blue");
	 gradient.addColorStop("0.75", "Red");
	 // Fill with gradient
	 ctx.fillStyle = gradient;
	 ctx.fillText("Goongala!!!!", 10, 90);
	 
	 
	 //----------------------------------------------------------------------------
	 
	 //Keyboard Functions
	 function onKeyDown(event) {
		 /**
		 if(event.keyCode == 32){
			 var data = {
				 subject: "Bendy Postal From Jason",
				 //text : '<h1>Greetings,</h1><p>Wishing you a seasonal greetings.</p> <img src='+downloadingImage+' alt="postCard">',
				 text : '<h1>Greetings,</h1><p>Wishing you a seasonal greetings.</p> <img src='+c.toDataURL()+' alt="postCard">',
			 }
			 
			 
			 Postal.emit('Mail',data);
			 console.log("mail");
			 //ctx.clearRect(0, 0, c.width, c.height);
		 }
		 **/
	 }; 
	 document.addEventListener('keydown', onKeyDown, false);
	 // ----------------------------------------------------------------------------
	 
	 // ... the starter code you pasted ...
	 
	 
	 var emailAddress= "";
	 
	 // Retrieve the Information and Send it to the server for verification
	 document.getElementById("Login").addEventListener("click", function(){
		 emailAddress = document.getElementById("yourEmailAddress").value;
		 var pass = document.getElementById("yourEmailAddressPassword").value;
		 
		 var tempData = {
			 user: emailAddress,
			 pass: pass
		 }
		 
		 Postal.emit('Account Login',tempData);
		 document.getElementById("yourEmailAddressPassword").innerHTML = null;
		 //document.getElementById("yourEmailAddressPassword").innerHTML = "Hello World";
		 console.log("sent")
	 });
	 
	 // Send the Postcard to the server to be sent out
	 document.getElementById("Send").addEventListener("click", function(){
		 var data = {
			 receipt: document.getElementById("theirEmailAddress").value,
			 subject: "Bendy Postal From Jason",
			 //text : '<h1>Greetings,</h1><p>Wishing you a seasonal greetings.</p> <img src='+downloadingImage+' alt="postCard">',
			 text : '<h1>Greetings,</h1><p>Wishing you a seasonal greetings.</p> <img src='+c.toDataURL()+' alt="postCard">',
		 }			 
		
		 Postal.emit('Mail',data);
		 console.log("mail");
	 });
}
window.onload = init;