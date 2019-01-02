var socket, Postal = io('/postal', {forceNew:true});
var canvasHistory = [];

function init() {
	 // SOCKETS - Incoming
	 // socket = io.connect('http://localhost:9000');
	 socket = io.connect('http://ec2-34-205-146-82.compute-1.amazonaws.com:9000');
      
	 //The user has successfully logged in
	 Postal.on('Account Logged In', function(data) {
		 document.getElementById("results").innerHTML = "You have successfully logged in";
		 document.getElementById("results").style.color = "green";
		 document.getElementById("yourEmailInfo").style.display = "none";
		 document.getElementById("postCardCreator").style.display = "inline";
	 });
	 
	 // An error has occured with the sending the Post Card
	 Postal.on('Error', function(data) {
		 document.getElementById("results").innerHTML = data.message;
		 document.getElementById("results").style.color = "red";
		 document.getElementById("yourEmailInfo").style.display = "inline";
	 });
	  
	 // The PostCard has been sent
	 Postal.on('Sent', function(data) {
		 document.getElementById("results").innerHTML = data.message;
		 document.getElementById("results").style.color = "blue";
	 });
	  
	  
	 //----------------------------------------------------------------------------
	 
	 
	 
	 var c = document.getElementById("postCardCanvas");
	 var ctx = c.getContext("2d");
	 //canvasHistory.push(c.toDataURL());
	 canvasHistory.push(document.getElementById('postCardCanvas').toDataURL());
	 // console.log(ctx);
	 ctx.font = "20px Georgia";
	 ctx.fillText("Hello World!", 10, 50);
	 ctx.save();
	 canvasHistory.push(ctx);
	 
	 ctx.font = "30px Verdana";	 
	 // Create gradient
	 var gradient = ctx.createLinearGradient(0, 0, c.width, 0);
	 gradient.addColorStop("0", "Blue");
	 gradient.addColorStop("0.5", "#850085");
	 gradient.addColorStop("1", "Red");
	 // Fill with gradient
	 ctx.fillStyle = gradient;
	 ctx.fillText("Goongala!!", c.width*0.2, c.height*0.65);
	 //canvasHistory.push(ctx);
	 
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
		 // ctx.restore();
		 
		 ctx.clearRect(0, 0, c.width, c.height);
		 
		 //for(var history = 0; history <canvasHistory.length; history++)
			 //canvasHistory[history].
		 
		 
		 var canvasPic = new Image();
         canvasPic.src = canvasHistory[0];
         canvasPic.onload = function () { 
			 ctx.drawImage(canvasPic, 0, 0);
			 console.log("--");
		 }
		 
		 
		 console.log("erased");
		 // https://www.codicode.com/art/undo_and_redo_to_the_html5_canvas.aspx
	 }; 
	 document.addEventListener('keydown', onKeyDown, false);
	 
	 // On Click Functions
	 function onButtonClick(){
		 console.log("clicked");
	 }
	 c.addEventListener('click',onButtonClick, false);
	 //https://stackoverflow.com/questions/9880279/how-do-i-add-a-simple-onclick-event-handler-to-a-canvas-element#
	 
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