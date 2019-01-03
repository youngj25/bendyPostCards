var socket, Postal = io('/postal', {forceNew:true});

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
	 
	 /** Image History Array
		 The canvasHistory stores the previous History
		 of the Canvas. This will be used for the Undo
		 and the Redo buttons for this web application.
		 To keep track of where the user currently is,
		 when they undo several changes, the variable
		 'canvasHistoryPointer' will always point at
		 the Canvas they are currently at within the 
		 canvasHistory, and if they go back and make a
		 change in a previous canvas, then it will
		 splice all of the canvases prior to that canvas.
		 This method of implementation was based off of
		 'https://www.codicode.com/art/undo_and_redo_to_the_html5_canvas.aspx'
		 but was able to implement the method that this
		 developer used.		 
	 **/
	 var canvasHistory = [], canvasHistoryPointer=-1;
	 save_Canvas_Changes();
	 
	  
	  
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
	 
	 postCardCanvasContext.font = "20px Georgia";
	 postCardCanvasContext.fillText("Hello World!", 10, 50);
	 postCardCanvasContext.save();
	 save_Canvas_Changes();
	 
	 
	 postCardCanvasContext.font = "30px Verdana";	 
	 // Create gradient
	 var gradient = postCardCanvasContext.createLinearGradient(0, 0, postCardCanvas.width, 0);
	 gradient.addColorStop("0", "Blue");
	 gradient.addColorStop("0.5", "#850085");
	 gradient.addColorStop("1", "Red");
	 // Fill with gradient
	 postCardCanvasContext.fillStyle = gradient;
	 postCardCanvasContext.fillText("Goongala!!", postCardCanvas.width*0.2, postCardCanvas.height*0.65);
	 save_Canvas_Changes();
	 
	 
	 
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
		 
		 //postCardCanvasContext.clearRect(0, 0, postCardCanvas.width, postCardCanvas.height);
		 
		 //for(var history = 0; history <canvasHistory.length; history++)
			 //canvasHistory[history].
		 
		 /**
		 var canvasPic = new Image();
         canvasPic.src = canvasHistory[0];
         canvasPic.onload = function () { 
			 postCardCanvasContext.drawImage(canvasPic, 0, 0);
			 console.log("--");
		 }
		 **/
		 
		 //UNDO
		 // /** 
			 undo_Canvas_Change();
		 
			 //console.log("undo");
		 // **/
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
	 
	 /** save Canvas Changes
		 Saves the current state of the canvasHistory
		 and increase the canvasHistoryPointer by one.
		 In cases where the canvasHistoryPointer is
		 less than the current canvasHistory.length, 
		 then erase/splice everything greater than the
		 canvasHistoryPointer and place the new state 
		 at the end of the array and then increase the
		 pointer.
	 **/
	 function save_Canvas_Changes(){
		 canvasHistory.push(postCardCanvasContext.getImageData(0, 0, postCardCanvas.width, postCardCanvas.height));
		 canvasHistoryPointer++;
		 
		 
		 
	 }
	 
	 /** undo Canvas Changes
		 This function will undo all of the changes
		 made to the canvas and decrease the variable
		 canvasHistoryPointer by one so that it will
		 point at the current canvas state		 
	 **/
	 function undo_Canvas_Change(){
		 if(canvasHistoryPointer >= 1){
			 canvasHistoryPointer--;
			 
			 postCardCanvasContext.putImageData(canvasHistory[canvasHistoryPointer], 0, 0);
		 
			 console.log("undo");
		 }
	 }
	 
	 /** redo Canvas Changes
		 This function will redo all of the changes
		 made to the canvas and increase the variable
		 canvasHistoryPointer by one so that it will
		 point at the current canvas state		 
	 **/
	 function redo_Canvas_Change(){
		 
		 
		 
		 
	 }
	 
	 
	 
	 
	 
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