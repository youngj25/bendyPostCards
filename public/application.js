var socket, Postal = io('/postal', {forceNew:true});

function init() {
	 /** Web Application State
		 There will be five States for this web Application.
		 Buttons will perform different functions depending
		 on the state of the application.
		 
		 State 1 - 'PostCard Canvas'
			 This is the default and base state of the Web
			 Application. All other states are accessible from
			 this state. In this state the PostCard Toolbar,
			 Color Selection Canvas and the PostCard Canvas are
			 the only thing present.
			 
		 State 2 - 'WebCam Canvas'
			 This is the state where the video canvas is
			 presented and the PostCard Canvas is hidden from
			 the user. The user will be able to take pictures
			 in this state and then set it as the PostCard 
			 Background Image.
			 
		 State 3 - 'PostCard History'
			 Still in development
			 
		 State 4 - 'Send PostCard'
			 In this state, 
			 
		 State 5 - 'Text Addition'
			 In this state, the user can add text to the Canvas
			 by typing on a keyboard.
		 
		 State 6 - 'Awaiting Response'
			 In this state, the user has sent a request to send the
			 Post card and we are awaiting the response from the 
			 server.
	 **/
	 var webApplicationState = "PostCard Canvas";
	 
	 // Webcam Stream Initial
	 document.querySelector('#vidDisplay').srcObject = null;
	
	 // Sockets -------------------------------------------
	 socket = io.connect('http://localhost:9000');
	 //socket = io.connect('http://ec2-34-205-146-82.compute-1.amazonaws.com:9000');
     
	 // Incoming Sockets -------------------------------------------
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
		 document.getElementById("results").style.display = "block";
		 document.getElementById("results").style.color = "red";
		 //document.getElementById("yourEmailInfo").style.display = "inline";
		 webApplicationState = "Send PostCard";
	 });
	  
	 // The PostCard has been sent
	 Postal.on('Sent', function(data) {
		 document.getElementById("results").innerHTML = data.message;
		 document.getElementById("results").style.color = "blue";
		 document.getElementById("results").style.display = "block";
		 webApplicationState = "Send PostCard";
	 });
	  
	 // Outgoing Sockets -------------------------------------------
	 var emailAddress= "";
	 
	 /** Login Button ---> To be change to Image History
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
	 **/
	 
	 // Send the Postcard to the server to be sent out
	 document.getElementById("Send").addEventListener("click", function(){
		 var data = {
			 sender:  document.getElementById("yourEmailAddress").value,
			 passW:   document.getElementById("yourEmailAddressPassword").value,
			 receipt: document.getElementById("theirEmailAddress").value,
			 subject: "Bendy Postal From Jason",
			 picture: '<h1>Greetings,</h1><p>Wishing you a seasonal greetings.</p> <img src='+postCardCanvas.toDataURL()+' alt="postCard">',
		 }			 
		
		 Postal.emit('Send Email Please',data);
		 console.log("mail");
		 webApplicationState = "Awaiting Response";
		 dots=-1;
	 });
	  
	 // postCardCanvasContext - HTML5 Canvas --------------------------------------
	 // Post Card Canvas - HTML5 Canvas
	 var postCardCanvas = document.getElementById("postCardCanvas");
	 var postCardCanvasContext = postCardCanvas.getContext("2d");
	 
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
		 After seeing this the putImageData() function from
		 https://www.w3schools.com/tags/canvas_putimagedata.asp
		 then I realized I could make my own remake of the
		 method the previous used.
	 **/
	 var canvasHistory = [], canvasHistoryPointer=-1;
	 // Save the initial state
	 var history = {
		 type:"Image",
		 image:postCardCanvasContext.getImageData(0, 0, postCardCanvas.width, postCardCanvas.height)
	 }
	 canvasHistory.push(history);
	 canvasHistoryPointer++;
	 
	 
	 // Post Card Tools Canvas - Three.js -------------------------------------------
	 var postCardToolsCanvas = document.getElementById("postCardToolsCanvas");
	 // create a scene, that will hold all our elements such as objects, cameras and lights.
	 var scene = new THREE.Scene();
	 // create a camera, which defines where we're looking at.
	 var camera = new THREE.PerspectiveCamera(45, 1, 1, 1000);
	 camera.position.set(0,0,25);
	 camera.lookAt(scene.position);
	 // camera.lookAt(new THREE.Vector3(0,-8,0));
	 scene.background = new THREE.Color( 0x23233F );
	 scene.add(camera);	
	 // renderer.setSize(Width, Height);
	 camera.aspect = window.innerWidth/window.innerHeight;
	 
	 var renderer = new THREE.WebGLRenderer({ antialias: true} );
	 // create a render and set the size	 
	 renderer.setClearColor(new THREE.Color(0x000000, 0.0));
	 // set the size - Hard size for now to stop warping sprites
	 //renderer.setSize( window.innerWidth*.7, 50);	 
	 renderer.setSize( 375, 50);	 
	 renderer.render(scene, camera);
	 
	 document.getElementById("postCardToolsCanvas").appendChild(renderer.domElement);
	 var steps = 0, dots=-1;
	 var buttons = [];
	 var objects = [];
	 renderScene();
	 drag_objects();
	 load_buttons(); 
	 
	 
	 // Rendering
	 function renderScene(){
		 try{
			 if(webApplicationState == "Awaiting Response")
				 steps++;
			 
			 //Render steps
			 //render using requestAnimationFrame
			 requestAnimationFrame(renderScene);
			 renderer.render(scene, camera);
			 scene.traverse(function (e) {
				 if(webApplicationState == "Awaiting Response" && steps%30 == 0){
					 dots =(dots+1)%7;
					 var message= ".";
					 
					 for(var x=0; x<dots;x++)
						 message+=".."
					 
					 document.getElementById("results").style.color = "white";
					 document.getElementById("results").innerHTML = message;
					 document.getElementById("results").style.display = "block";					 
				 }
				 
				 
			 });
		 }catch(e){}
	 }
	
	 // Make Objects Draggable - Additionally used as buttons
	 function drag_objects(){
		 var dragControls  = new THREE.DragControls( objects, camera, renderer.domElement );
				
			 dragControls.addEventListener( 'dragstart', function(event) {
				 if (event.object.name == "undo")
					 undo_Canvas_Change();
				 else if (event.object.name == "redo")
					 redo_Canvas_Change();
				 else if (event.object.name == "background" && webApplicationState == "PostCard Canvas"){
					 create_Fill_Image('#'+document.getElementById("colorCanvas").jscolor.valueElement.value);
				 }
				 else if (event.object.name == "cam" && webApplicationState == "PostCard Canvas"){
					 console.log("CAM!!!");
					 
					 // Attempting the Set the Video Height
					 document.getElementById("vidCanvas").style.height = postCardCanvasContext.canvas.height;
					 document.getElementById("vidCanvas").style.maxHeight = postCardCanvasContext.canvas.height;
					 document.getElementById("vidCanvas").style.overflow = "hidden";
					 
					 document.getElementById("vidCanvas").style.display = "block";
					 document.getElementById("go_Back_Button").style.display = "block";
					 document.getElementById("postCardCanvas").style.display = "none";
					 document.getElementById("postCardToolsCanvas").style.display = "none";
					 document.getElementById("colorCanvas").style.display = "none";
					 webApplicationState = "WebCam Canvas";
					 
					 
					 // Video Setup using navigator.mediaDevices.getUserMedia
					 // Source: https://www.youtube.com/watch?v=Hc7GE3ENz7k
					 const video = document.getElementById("vidDisplay");
					 navigator.mediaDevices.getUserMedia({
						 audio:false,
						 video:true
					 }). then (stream =>{
						 video.srcObject = stream;
					 }).catch(useNavigatorGetUserMedia()); // In case this fails... call navigator.getUserMedia
					 
					 // navigator.getUserMedia Source
					 // https://www.youtube.com/watch?v=d1SuDVpz6Pk&index=2&list=PL3dbqzwPYj6ttTNmdlZKQ2KV3p6jh9atX
					 function useNavigatorGetUserMedia(){
						 navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia ||
											  navigator.msGetUserMedia || navigator.oGetUserMedia;
						 
						 if(navigator.getUserMedia){
							 navigator.getUserMedia({video:true},handleVideo, videoError);
						 }
					 }
					 
					 
					 function handleVideo(stream){
						 document.querySelector('#vidDisplay').srcObject = stream;
					 }
					 
					 function videoError(e){
						 alert("There has been some problem");
						 console.error;
					 }	
				 }
				 else if (event.object.name == "text"){
					 // If the web application is already in 'Text Addition' mode
					 if(event.object.ON && webApplicationState == "Text Addition"){
						 document.getElementById("textToolsCanvas").style.display = "none";
						 
						 // Correcting the Buttons not including the undo/redo buttons
						 for(var x = 2; x< buttons.length; x++)
							 buttons[x].material.color.setHex(0xffffff);
						 
						 webApplicationState = "PostCard Canvas";
						 event.object.ON = false;
					 }
					 // If the web application is not already in 'Text Addition' mode
					 else if(webApplicationState == "PostCard Canvas"){
						 // Reducing the color of all the buttons colors except the undo/redo button
						 for(var x = 2; x< buttons.length; x++)
							 buttons[x].material.color.setHex(0x575757);
						 
						 buttons[4].material.color.setHex(0xffffff);						 
						 
						 webApplicationState = "Text Addition";
						 event.object.ON = true;
						 
						 document.getElementById("textToolsCanvas").style.display = "block";
					 }
				 }
				 else if (event.object.name == "send" && webApplicationState == "PostCard Canvas"){
					 document.getElementById("receiptEmail").style.display = "block";
					 document.getElementById("go_Back_Button").style.display = "inline";
					 document.getElementById("colorCanvas").style.display = "none";
					 document.getElementById("postCardToolsCanvas").style.display = "none";
					 webApplicationState = "Send PostCard";
				 }
				 //console.log(event);
			 });
																		 
			 dragControls.addEventListener( 'drag', function(event)   {
				 if (event.object.type == "button")
					 event.object.position.set(event.object.posX, event.object.posY, event.object.posZ);
				 });
																		
			 dragControls.addEventListener( 'dragend', function(event)   { });
	 }
	 	
	 /** Load Buttons
		 Load all the buttons for the Three.js Toolbar
	 **/
	 function load_buttons(){
		 //Load Title
		 var loader = new THREE.TextureLoader();
		 loader.crossOrigin = true;
		 
		 // 0 - Undo Button
		 var T = loader.load( 'Images/undoButton.png' );
		 T.minFilter = THREE.LinearFilter;
		 var T1 =  new THREE.SpriteMaterial( { map: T, color: 0xffffff } );
		 var undoButton = new THREE.Sprite(T1);			
		 scene.add(undoButton);
		 undoButton.posX = -9;
		 undoButton.posY =  6.5;
		 undoButton.posZ = 0;
		 undoButton.position.set(undoButton.posX, undoButton.posY, undoButton.posZ);
		 undoButton.scale.set(2.5 - 287/(window.innerWidth*.7), 7, 1);
		 undoButton.name = "undo";	
		 undoButton.type = "button";	
		 buttons.push(undoButton);
		 objects.push(undoButton);
		 
		 // 1 - Redo Button
		 T = loader.load( 'Images/redoButton.png' );
		 T.minFilter = THREE.LinearFilter;
		 T1 =  new THREE.SpriteMaterial( { map: T, color: 0x575757 } );
		 var redoButton = new THREE.Sprite(T1);				 
		 redoButton.posX = -6.5;
		 redoButton.posY =  6.5;
		 redoButton.posZ = 0;
		 redoButton.position.set(redoButton.posX, redoButton.posY, redoButton.posZ);
		 redoButton.scale.set(2.5 - 287/(window.innerWidth*.7), 7, 1);
		 redoButton.name = "redo";	
		 redoButton.type = "button";	
		 scene.add(redoButton);
		 buttons.push(redoButton);
		 objects.push(redoButton);
		 
		 // 2 - Background Button
		 T = loader.load( 'Images/backgroundButton.png' );
		 T.minFilter = THREE.LinearFilter;
		 T1 =  new THREE.SpriteMaterial( { map: T, color: 0xffffff } );
		 var backgroundButton = new THREE.Sprite(T1);				 
		 backgroundButton.posX = -4;
		 backgroundButton.posY =  6.5;
		 backgroundButton.posZ = 0;
		 backgroundButton.position.set(backgroundButton.posX, backgroundButton.posY, backgroundButton.posZ);
		 backgroundButton.scale.set(2.5 - 287/(window.innerWidth*.7), 7, 1);
		 backgroundButton.name = "background";	
		 backgroundButton.type = "button";	
		 scene.add(backgroundButton);
		 buttons.push(backgroundButton);
		 objects.push(backgroundButton);
		 
		 // 3 - WebCam Button
		 T = loader.load( 'Images/camButton.png' );
		 T.minFilter = THREE.LinearFilter;
		 T1 =  new THREE.SpriteMaterial( { map: T, color: 0xffffff } );
		 var camButton = new THREE.Sprite(T1);				 
		 camButton.posX = -1.5;
		 camButton.posY =  6.5;
		 camButton.posZ = 0;
		 camButton.position.set(camButton.posX, camButton.posY, camButton.posZ);
		 camButton.scale.set(2.5 - 287/(window.innerWidth*.7), 7, 1);
		 camButton.name = "cam";	
		 camButton.type = "button";	
		 scene.add(camButton);
		 buttons.push(camButton);
		 objects.push(camButton);
		 
		 // 4 - Text Button
		 T = loader.load( 'Images/textButton.png' );
		 T.minFilter = THREE.LinearFilter;
		 T1 =  new THREE.SpriteMaterial( { map: T, color: 0xffffff } );
		 var textButton = new THREE.Sprite(T1);				 
		 textButton.posX = 1;
		 textButton.posY =  6.5;
		 textButton.posZ = 0;
		 textButton.position.set(textButton.posX, textButton.posY, textButton.posZ);
		 textButton.scale.set(2.5 - 287/(window.innerWidth*.7), 7, 1);
		 textButton.name = "text";	
		 textButton.type = "button";	
		 textButton.On = false;	
		 scene.add(textButton);
		 buttons.push(textButton);
		 objects.push(textButton);

		 
		 // Send Button
		 T = loader.load( 'Images/sendButton.png' );
		 T.minFilter = THREE.LinearFilter;
		 T1 =  new THREE.SpriteMaterial( { map: T, color: 0xffffff } );
		 var sendButton = new THREE.Sprite(T1);				 
		 sendButton.posX = 7;
		 sendButton.posY =  6.5;
		 sendButton.posZ = 0;
		 sendButton.position.set(sendButton.posX, sendButton.posY, sendButton.posZ);
		 sendButton.scale.set(2.5+ 1 - 287/(window.innerWidth*.7), 7, 1);
		 sendButton.name = "send";	
		 sendButton.type = "button";	
		 scene.add(sendButton);
		 buttons.push(sendButton);
		 objects.push(sendButton);
		 
		 console.log("buttons loaded.");
	 }
		
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

		 Source for the idea of this method:
		 https://www.codicode.com/art/undo_and_redo_to_the_html5_canvas.aspx
	 **/
	 function undo_Canvas_Change(){
		 // Checks to see whether the we can go back one step
		 if(canvasHistoryPointer >= 1){
			 canvasHistoryPointer--;
			 postCardCanvasContext.putImageData(canvasHistory[canvasHistoryPointer].image, 0, 0);
		 }
		 
		 // If we can't go back any further then change the color of the undo button
		 if(canvasHistoryPointer <= 0){
			 // Button 0 - the Undo Button
			 buttons[0].material.color.setHex(0x575757);
			 buttons[1].material.color.setHex(0xffffff);
		 }
		 // Otherwise this means that we can can assume that now we have a space to go
		 // forward. For this reason, new we'll set the button 1 (The redo button)
		 // color back to normal
		 else{
			 buttons[0].material.color.setHex(0xffffff);
			 buttons[1].material.color.setHex(0xffffff);
		 }
	 }
	 
	 /** redo Canvas Changes
		 This function will redo all of the changes
		 made to the canvas and increase the variable
		 canvasHistoryPointer by one so that it will
		 point at the current canvas state

		 Source for the idea of this method:
		 https://www.codicode.com/art/undo_and_redo_to_the_html5_canvas.aspx
	 **/
	 function redo_Canvas_Change(){
		 // Checks to see whether the we can go forward one step
		 if(canvasHistoryPointer+1 < canvasHistory.length){
			 canvasHistoryPointer++;
			 postCardCanvasContext.putImageData(canvasHistory[canvasHistoryPointer].image, 0, 0);
		 }
		 
		 // If we can't go forward any further then change the color of the redo button
		 if(canvasHistoryPointer+1 >= canvasHistory.length){
			 // Button 1 - the Redo Button
			 buttons[0].material.color.setHex(0xffffff);
			 buttons[1].material.color.setHex(0x575757);
		 }
		 // Otherwise this means that we can can assume that now we have a space to go
		 // backwards. For this reason, new we'll set the button 0 (The Undo Button)
		 // color back to normal
		 else{
			 buttons[0].material.color.setHex(0xffffff);
			 buttons[1].material.color.setHex(0xffffff);
		 }
	 }
	 
	 /** create Text
		 Since text implementation is a tricky area
		 I will be saving the text image and the actual
		 text data into the history. 
	 **/
	 function create_Text(text,font, fillStyle, xCord, yCord){
	 
		 /** Future Development Ideas
			 // Create gradient
			 var gradient = postCardCanvasContext.createLinearGradient(0, 0, postCardCanvas.width, 0);
			 gradient.addColorStop("0", "Blue");
			 gradient.addColorStop("0.5", "#850085");
			 gradient.addColorStop("1", "Red");
			 // Fill with gradient
			 create_Text("Mwahahahaha!!","30px Verdana", gradient, postCardCanvas.width*0.2, postCardCanvas.height*0.65);
		 **/
	 
		 // Add Text to Canvas
		 postCardCanvasContext.fillStyle = fillStyle;
		 postCardCanvasContext.font = font;	 
		 postCardCanvasContext.fillText(text, xCord, yCord);		 
		 postCardCanvasContext.save();
		 
		 // Just in case Splice the canvasHistory to make sure we are creating a new history
		 canvasHistory.splice(canvasHistoryPointer+1);
		 // Reset the Buttons
		 buttons[0].material.color.setHex(0xffffff);
		 buttons[1].material.color.setHex(0x575757);	
		 
		 // Add data into History
		 var history = {
			 type: "Text",
			 text: text,
			 font: font,
			 fillStyle: fillStyle,
			 xCord: xCord,
			 yCord: yCord,
			 image: postCardCanvasContext.getImageData(0, 0, postCardCanvas.width, postCardCanvas.height)
		 }		 		 
		 
		 canvasHistory.push(history);
		 canvasHistoryPointer++;		
	 }
	 
	 /** create Fill Image
		 Since images suchs as the canvas color and/or
		 the Canvas can be changed at anytime. I need a
		 way to make it dynamic/flexible.
	 **/
	 function create_Fill_Image(fillStyle){
		 // First we must go back to the inital state and change the background Color		 
		 postCardCanvasContext.putImageData(canvasHistory[0].image, 0, 0);
		 // console.log(fillStyle);
		 // Now we will set the new background color
		 postCardCanvasContext.fillStyle = fillStyle;
		 postCardCanvasContext.fillRect(0, 0, postCardCanvas.width, postCardCanvas.height);
		 
		 // Now we'll proceed to follow the changes until the current one
		 for(var x = 1; x< canvasHistoryPointer+1; x++)
			 if(canvasHistory[x].type = "text"){
				 // Now recreate the text
				 // postCardCanvasContext.putImageData(canvasHistory[0].image, 0, 0);
				 // console.log(canvasHistory[x].text);
				 postCardCanvasContext.fillStyle = canvasHistory[x].fillStyle;
				 postCardCanvasContext.font = canvasHistory[x].font;	 
				 postCardCanvasContext.fillText(canvasHistory[x].text, canvasHistory[x].xCord, canvasHistory[x].yCord);	
			 }
		 
		 // Splice the canvasHistory
		 canvasHistory.splice(canvasHistoryPointer+1);
		 // Reset the Buttons
		 buttons[0].material.color.setHex(0xffffff);
		 buttons[1].material.color.setHex(0x575757);
		 
		 
		 var history = {
			 type:"Image",
			 image:postCardCanvasContext.getImageData(0, 0, postCardCanvas.width, postCardCanvas.height)
		 }
		 canvasHistory.push(history);
		 canvasHistoryPointer++;		 
	 }
	
	 /** create Picture Image
		 In order to make the Webcam Image the Background,
		 the text will be re-rendered after the new 
		 Background is set. Then afterwards the new image
		 will be added to the canvasHistory
	 **/
	 function create_Picture_Image(){
		 // Source:
		 // https://stackoverflow.com/questions/23745988/get-an-image-from-the-video
		 // postCardCanvasContext.drawImage(document.getElementById("vidDisplay"), 0, 0, postCardCanvas.width, postCardCanvas.height);
		 
		 // Now we'll proceed to follow the changes until the current one
		 for(var x = 1; x< canvasHistoryPointer+1; x++)
			 if(canvasHistory[x].type = "text"){
				 // Now recreate the text
				 postCardCanvasContext.fillStyle = canvasHistory[x].fillStyle;
				 postCardCanvasContext.font = canvasHistory[x].font;	 
				 postCardCanvasContext.fillText(canvasHistory[x].text, canvasHistory[x].xCord, canvasHistory[x].yCord);	
			 }
		 
		 // Splice the canvasHistory
		 canvasHistory.splice(canvasHistoryPointer+1);
		 // Reset the Buttons
		 buttons[0].material.color.setHex(0xffffff);
		 buttons[1].material.color.setHex(0x575757);		 
		 
		 var history = {
			 type:"Image",
			 image:postCardCanvasContext.getImageData(0, 0, postCardCanvas.width, postCardCanvas.height)
		 }
		 canvasHistory.push(history);
		 canvasHistoryPointer++;		 
	 }
	
	 /** Stops the Webcam
		 Source for stopping Media:
		 https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack/stop
	 **/
	 function stop_Webcam(){
		 let stream = document.querySelector('#vidDisplay').srcObject;
		 let tracks = stream.getTracks();

		 tracks.forEach(function(track) {
			 track.stop();
		 });
	 }
	
	 // Event Section -------------------------------------------
	 
	 /** On Click Functions for the PostCard Canvas
		 If the web application status is currently "Text Addition"
		 allow for the user to added text to the canvas wherever they
		 click...
	 **/
	 function onCanvasButtonClick(event){
		 if(webApplicationState == "Text Addition"){
			 //https://stackoverflow.com/questions/2368784/draw-on-html5-canvas-using-a-mouse
			 
			 // Getting the Correct X coordinate of the click event
			 var xPos = event.clientX - postCardCanvasContext.canvas.offsetLeft;
			 xPos = xPos/postCardCanvasContext.canvas.offsetWidth;
			 xPos = xPos*postCardCanvasContext.canvas.width;
			 
			 // Getting the Correct Y coordinate of the click event
			 var yPos = event.clientY - postCardCanvasContext.canvas.offsetTop;
			 yPos = yPos/postCardCanvasContext.canvas.offsetHeight;
			 yPos = yPos*postCardCanvasContext.canvas.height;
			 
			 // console.log(xPos);
			 // console.log(yPos);
			 
			 // Checks to see whether the inserted text meet the restrictions
			 var text = ""+document.getElementById("textTool").value;
			 var fontSize = document.getElementById("Font Size Selection").value;
			 var fontStyle = document.getElementById("Font Size Selection").value+"px "+document.getElementById("Font Selection").value;
			 var color = '#'+document.getElementById("colorCanvas").jscolor.valueElement.value;
			 
			 if(text.trim().length!=0){
				 // If somebody tryna pull pranks with Spaces.... stop it 
				 if(text.trim().length==1) text = text.trim();
				 
				 //console.log(text);
				 // Go Create the Text
				 create_Text(text, fontStyle, color, xPos-fontSize*text.length/4, yPos-fontSize/8);
			 }
			 else console.log("Failed text Restrictions");
		 }
		 //https://stackoverflow.com/questions/9880279/how-do-i-add-a-simple-onclick-event-handler-to-a-canvas-element#
	 }
	 postCardCanvas.addEventListener('click',onCanvasButtonClick, false);
	   
	 // Window Resize Event
	 function onWindowResize(){
		 //renderer.setSize(window.innerWidth*.7, 50);
		 //for ( var x = 0; x<buttons.length; x++){
			 //buttons[x].position.set(buttons[x].posX, buttons[x].posY, buttons[x].posZ);
		 // }
	 }
	 window.addEventListener('resize', onWindowResize, false);
	 
	 // Video was clicked so take a picture
	 document.getElementById("vidDisplay").addEventListener("click", function(){
		 var x = document.querySelector('#vidDisplay').srcObject;
		 //console.log(x);
		 if(x != null){
			 document.getElementById("vidCanvas").style.display = "none";
			 postCardCanvasContext.drawImage(document.getElementById("vidDisplay"), 0, 0, postCardCanvas.width, postCardCanvas.height);
			 document.getElementById("webCamPictureOption").style.display = "block";		
			 document.getElementById("postCardCanvas").style.display = "block";	
		 }
	 });
	 
	 // Go Back Button Clicked
	 document.getElementById("go_Back_Button").addEventListener("click", function(){
		 
		 if(webApplicationState == "WebCam Canvas"){
			 stop_Webcam();
			 // Go back to the last Canvas History Pointer setting
			 postCardCanvasContext.putImageData(canvasHistory[canvasHistoryPointer].image, 0, 0);
			 
			 document.querySelector('#vidDisplay').srcObject = null;
			 document.getElementById("vidCanvas").style.display = "none";
			 document.getElementById("postCardCanvas").style.display = "block";		 
			 document.getElementById("webCamPictureOption").style.display = "none";		
		 }
		 else if(webApplicationState == "Send PostCard"){
			 document.getElementById("receiptEmail").style.display = "none";
			 document.getElementById("results").style.display = "none";
			 document.getElementById("postCardToolsCanvas").style.display = "block";
			 document.getElementById("results").innerHTML = "";
		 }
		 
		 document.getElementById("go_Back_Button").style.display = "none";
		 document.getElementById("colorCanvas").style.display = "block";
		 
		 webApplicationState = "PostCard Canvas";
	 });
	 
	 // Take Picture Button Clicked
	 document.getElementById("take_Picture").addEventListener("click", function(){		 
		 document.getElementById("vidCanvas").style.display = "none";
		 postCardCanvasContext.drawImage(document.getElementById("vidDisplay"), 0, 0, postCardCanvas.width, postCardCanvas.height);
		 document.getElementById("webCamPictureOption").style.display = "block";		
		 document.getElementById("postCardCanvas").style.display = "block";			 
	 });
	 
	 // Retake Picture Button Clicked
	 document.getElementById("retake_Picture").addEventListener("click", function(){
		 document.getElementById("vidCanvas").style.display = "block";		 
		 document.getElementById("webCamPictureOption").style.display = "none";		
		 document.getElementById("postCardCanvas").style.display = "none";		
	 });
	 
	 // Keep Picture Button Clicked
	 document.getElementById("keep_Picture").addEventListener("click", function(){
		 stop_Webcam();
		 document.getElementById("postCardToolsCanvas").style.display = "block";
		 document.getElementById("colorCanvas").style.display = "block";
		 document.getElementById("webCamPictureOption").style.display = "none";		 
		 document.getElementById("go_Back_Button").style.display = "none";		 
		 webApplicationState = "PostCard Canvas";
		 create_Picture_Image();
	 });
	
	 
	 

}
window.onload = init;