var socket, Postal = io('/postal', {forceNew:true});
var canvasHistory = [];

function init() {
	 // SOCKETS - Incoming
	 // socket = io.connect('http://localhost:9000');
	 socket = io.connect('http://ec2-34-205-146-82.compute-1.amazonaws.com:9000');
      
	 // Post Card Canvas
	 var postCardCanvas = document.getElementById("postCardCanvas");
	 var postCardCanvasContext = postCardCanvas.getContext("2d");
	 // Post Card Tool Canvas
	 var postCardToolsCanvas = document.getElementById("postCardToolsCanvas");
	 var postCardToolsCanvasContext = postCardToolsCanvas.getContext("2d");
	 
	  
	  
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
	 
	 //canvasHistory.push(postCardCanvas.toDataURL());
	 canvasHistory.push(document.getElementById('postCardCanvas').toDataURL());
	 // console.log(postCardCanvasContext);
	 postCardCanvasContext.font = "20px Georgia";
	 postCardCanvasContext.fillText("Hello World!", 10, 50);
	 postCardCanvasContext.save();
	 canvasHistory.push(postCardCanvasContext);
	 
	 postCardCanvasContext.font = "30px Verdana";	 
	 // Create gradient
	 var gradient = postCardCanvasContext.createLinearGradient(0, 0, postCardCanvas.width, 0);
	 gradient.addColorStop("0", "Blue");
	 gradient.addColorStop("0.5", "#850085");
	 gradient.addColorStop("1", "Red");
	 // Fill with gradient
	 postCardCanvasContext.fillStyle = gradient;
	 postCardCanvasContext.fillText("Goongala!!", postCardCanvas.width*0.2, postCardCanvas.height*0.65);
	 //canvasHistory.push(postCardCanvasContext);
	 
	 
	 
	 
	 for (var toolCount = 0; toolCount < 8; toolCount++){
		 postCardToolsCanvasContext.fillStyle = "white";
		 postCardToolsCanvasContext.lineWidth = 3;
		 postCardToolsCanvasContext.fillRect(12+35*toolCount, 10, 30, 130);		 
	 }
	 
	 var toolImg = new Image;
	 //toolImg.src = "sendButton.png"
	 toolImg.onload = function() {
		postCardToolsCanvasContext.drawImage(toolImg, 257, 10, 30, 120);
		
		//alert('the image is drawn');
	 }
	 //toolImg.src = URL.createObjectURL(e.target.files[0]); 
		toolImg.src = "sendButton.png"	 
		 //https://stackoverflow.com/questions/6775767/how-can-i-draw-an-image-from-the-html5-file-api-on-canvas
		 
		
	 
	 
	 //----------------------------------------------------------------------------
	 
	 //Keyboard Functions
	 function onKeyDown(event) {
		 /**
		 if(event.keyCode == 32){
			 var data = {
				 subject: "Bendy Postal From Jason",
				 //text : '<h1>Greetings,</h1><p>Wishing you a seasonal greetings.</p> <img src='+downloadingImage+' alt="postCard">',
				 text : '<h1>Greetings,</h1><p>Wishing you a seasonal greetings.</p> <img src='+postCardCanvas.toDataURL()+' alt="postCard">',
			 }
			 
			 
			 Postal.emit('Mail',data);
			 console.log("mail");
			 //postCardCanvasContext.clearRect(0, 0, postCardCanvas.width, postCardCanvas.height);
		 }
		 **/
		 // postCardCanvasContext.restore();
		 
		 postCardCanvasContext.clearRect(0, 0, postCardCanvas.width, postCardCanvas.height);
		 
		 //for(var history = 0; history <canvasHistory.length; history++)
			 //canvasHistory[history].
		 
		 
		 var canvasPic = new Image();
         canvasPic.src = canvasHistory[0];
         canvasPic.onload = function () { 
			 postCardCanvasContext.drawImage(canvasPic, 0, 0);
			 console.log("--");
		 }
		 
		 
		 console.log("erased");
		 // https://www.codicode.com/art/undo_and_redo_to_the_html5_canvas.aspx
	 }; 
	 document.addEventListener('keydown', onKeyDown, false);
	 
	 // On Click Functions for the PostCard Canvas
	 function onCanvasButtonClick(){
		 console.log("clicked");
	 }
	 postCardCanvas.addEventListener('click',onCanvasButtonClick, false);
	 //https://stackoverflow.com/questions/9880279/how-do-i-add-a-simple-onclick-event-handler-to-a-canvas-element#
	 
	 
	 // On Click Functions for the PostCard Tools Canvas
	 function onToolButtonClick(event){
		 console.log(event);
	 }
	 postCardToolsCanvas.addEventListener('click',onToolButtonClick, false);
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
			 text : '<h1>Greetings,</h1><p>Wishing you a seasonal greetings.</p> <img src='+postCardCanvas.toDataURL()+' alt="postCard">',
		 }			 
		
		 Postal.emit('Mail',data);
		 console.log("mail");
	 });

}
window.onload = init;