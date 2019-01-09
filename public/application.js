var socket, Postal = io('/postal', {forceNew:true});

function init() {
	
	 // Sockets -------------------------------------------
	 // socket = io.connect('http://localhost:9000');
	 socket = io.connect('http://ec2-34-205-146-82.compute-1.amazonaws.com:9000');
     
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
		 document.getElementById("results").style.color = "red";
		 document.getElementById("yourEmailInfo").style.display = "inline";
	 });
	  
	 // The PostCard has been sent
	 Postal.on('Sent', function(data) {
		 document.getElementById("results").innerHTML = data.message;
		 document.getElementById("results").style.color = "blue";
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
			 receipt: document.getElementById("theirEmailAddress").value,
			 subject: "Bendy Postal From Jason",
			 //text : '<h1>Greetings,</h1><p>Wishing you a seasonal greetings.</p> <img src='+downloadingImage+' alt="postCard">',
			 text : '<h1>Greetings,</h1><p>Wishing you a seasonal greetings.</p> <img src='+postCardCanvas.toDataURL()+' alt="postCard">',
		 }			 
		
		 Postal.emit('Mail',data);
		 console.log("mail");
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
 
	 // Hello World
	 create_Text("Hello World!","20px Georgia", "Black", 10, 50);
	 
	 // Create gradient
	 var gradient = postCardCanvasContext.createLinearGradient(0, 0, postCardCanvas.width, 0);
	 gradient.addColorStop("0", "Blue");
	 gradient.addColorStop("0.5", "#850085");
	 gradient.addColorStop("1", "Red");
	 // Fill with gradient
	 create_Text("Mwahahahaha!!","30px Verdana", gradient, postCardCanvas.width*0.2, postCardCanvas.height*0.65);
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
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
	 // set the size
	 renderer.setSize( window.innerWidth*.7, 50);	 
	 renderer.render(scene, camera);
	 
	 document.getElementById("postCardToolsCanvas").appendChild(renderer.domElement);
	  
	 var buttons = [];
	 var objects = [];
	 renderScene();
	 drag_objects();
	 load_buttons(); 
	 
	 
	 // Rendering
	 function renderScene(){
		 try{
			 //Render steps
			 //render using requestAnimationFrame
			 requestAnimationFrame(renderScene);
			 renderer.render(scene, camera);
			 //scene.traverse(function (e) {});
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
																			 else if (event.object.name == "background"){
																				 create_Fill_Image('#'+document.getElementById("colorCanvas").jscolor.valueElement.value);
																			 }
																			 else if (event.object.name == "send"){
																				 document.getElementById("receiptEmail").style.display = "block";
																				 document.getElementById("go_Back_Button").style.display = "inline";
																				 document.getElementById("colorCanvas").style.display = "none";
																				 document.getElementById("postCardToolsCanvas").style.display = "none";
																			 }
																			 //console.log(event);
																		 });
																		 
			 dragControls.addEventListener( 'drag', function(event)   {
																			 if (event.object.type == "button")
																				 event.object.position.set(event.object.posX, event.object.posY, event.object.posZ);
																			 });
																		
			 dragControls.addEventListener( 'dragend', function(event)   { });
																		 
			 //console.log(dragControls);
			 //https://www.learnthreejs.com/drag-drop-dragcontrols-mouse/
	 }
	 	
	 /** Load Buttons
	
	 **/
	 function load_buttons(){
		 //Load Title
		 var loader = new THREE.TextureLoader();
		 loader.crossOrigin = true;
		 
		 // Undo Button
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
		 
		 // Redo Button
		 T = loader.load( 'Images/redoButton.png' );
		 T.minFilter = THREE.LinearFilter;
		 T1 =  new THREE.SpriteMaterial( { map: T, color: 0xffffff } );
		 var redoButton = new THREE.Sprite(T1);				 
		 redoButton.posX = -7;
		 redoButton.posY =  6.5;
		 redoButton.posZ = 0;
		 redoButton.position.set(redoButton.posX, redoButton.posY, redoButton.posZ);
		 redoButton.scale.set(2.5 - 287/(window.innerWidth*.7), 7, 1);
		 redoButton.name = "redo";	
		 redoButton.type = "button";	
		 scene.add(redoButton);
		 buttons.push(redoButton);
		 objects.push(redoButton);
		 
		 // Background Button
		 T = loader.load( 'Images/backgroundButton.png' );
		 T.minFilter = THREE.LinearFilter;
		 T1 =  new THREE.SpriteMaterial( { map: T, color: 0xffffff } );
		 var backgroundButton = new THREE.Sprite(T1);				 
		 backgroundButton.posX = -5;
		 backgroundButton.posY =  6.5;
		 backgroundButton.posZ = 0;
		 backgroundButton.position.set(backgroundButton.posX, backgroundButton.posY, backgroundButton.posZ);
		 backgroundButton.scale.set(2.5 - 287/(window.innerWidth*.7), 7, 1);
		 backgroundButton.name = "background";	
		 backgroundButton.type = "button";	
		 scene.add(backgroundButton);
		 buttons.push(backgroundButton);
		 objects.push(backgroundButton);
		 
		 // Send Button
		 T = loader.load( 'Images/sendButton.png' );
		 T.minFilter = THREE.LinearFilter;
		 T1 =  new THREE.SpriteMaterial( { map: T, color: 0xffffff } );
		 var sendButton = new THREE.Sprite(T1);				 
		 sendButton.posX = 9;
		 sendButton.posY =  6.5;
		 sendButton.posZ = 0;
		 sendButton.position.set(sendButton.posX, sendButton.posY, sendButton.posZ);
		 sendButton.scale.set(2.5+ 1 - 287/(window.innerWidth*.7), 7, 1);
		 sendButton.name = "send";	
		 sendButton.type = "button";	
		 scene.add(sendButton);
		 buttons.push(sendButton);
		 objects.push(sendButton);
		 
		 
		 //var planeGeometry = new THREE.PlaneBufferGeometry (105, 240,0);
		 //var planeMaterial = new THREE.MeshBasicMaterial({color: 0x000000}); //RGB
		 //var Board = new THREE.Mesh(planeGeometry, planeMaterial);
		 //Board.position.set(0,0,-152.4); //xyz
		 //scene.add(Board);
		 
		 
		 
		 
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
	 **/
	 function undo_Canvas_Change(){
		 if(canvasHistoryPointer >= 1){
			 canvasHistoryPointer--;
			 
			 postCardCanvasContext.putImageData(canvasHistory[canvasHistoryPointer].image, 0, 0);
		 
			 //console.log("undo");
		 }
	 }
	 
	 /** redo Canvas Changes
		 This function will redo all of the changes
		 made to the canvas and increase the variable
		 canvasHistoryPointer by one so that it will
		 point at the current canvas state		 
	 **/
	 function redo_Canvas_Change(){
		 if(canvasHistoryPointer+1 < canvasHistory.length){
			 canvasHistoryPointer++;
			 
			 postCardCanvasContext.putImageData(canvasHistory[canvasHistoryPointer].image, 0, 0);
		 
			 //console.log("redo");
		 }
	 }
	 
	 /** create Text
		 Since text implementation is a tricky area
		 I will be saving the text image and the actual
		 text data into the history. 
	 **/
	 function create_Text(text,font, fillStyle, xCord, yCord){		 
		 // Add Text to Canvas
		 postCardCanvasContext.fillStyle = fillStyle;
		 postCardCanvasContext.font = font;	 
		 postCardCanvasContext.fillText(text, xCord, yCord);		 
		 postCardCanvasContext.save();
		 
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
		 console.log(fillStyle);
		 // Now we will set the right background color
		 postCardCanvasContext.fillStyle = fillStyle;
		 postCardCanvasContext.fillRect(0, 0, postCardCanvas.width, postCardCanvas.height);
		 
		 // Now we'll proceed to follow the changes until the current one
		 for(var x = 1; x< canvasHistoryPointer+1; x++)
			 if(canvasHistory[x].type = "text"){
				 // Now recreate the text
				 //postCardCanvasContext.putImageData(canvasHistory[0].image, 0, 0);
				 console.log(canvasHistory[x].text);
				 postCardCanvasContext.fillStyle = canvasHistory[x].fillStyle;
				 postCardCanvasContext.font = canvasHistory[x].font;	 
				 postCardCanvasContext.fillText(canvasHistory[x].text, canvasHistory[x].xCord, canvasHistory[x].yCord);	
			 }
		 
		 // Splice the canvasHistory
		 canvasHistory.splice(canvasHistoryPointer+1);
		 
		 
		 var history = {
			 type:"Image",
			 image:postCardCanvasContext.getImageData(0, 0, postCardCanvas.width, postCardCanvas.height)
		 }
		 canvasHistory.push(history);
		 canvasHistoryPointer++;		 
	 }
	
	
	
	
	 // Event Section -------------------------------------------
	 
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
		 //
		 // postCardCanvasContext.restore();
		 
		 //postCardCanvasContext.clearRect(0, 0, postCardCanvas.width, postCardCanvas.height);
		 
		 //for(var history = 0; history <canvasHistory.length; history++)
			 //canvasHistory[history].
		 
		 // 
		 var canvasPic = new Image();
         canvasPic.src = canvasHistory[0];
         canvasPic.onload = function () { 
			 postCardCanvasContext.drawImage(canvasPic, 0, 0);
			 console.log("--");
		 }
		 **/
		 
		 if(event.keyCode == 38){
			 //undo_Canvas_Change();
			 create_Fill_Image("#FF0000");
			 console.log("Up arrow- turn blue");
		 }
		 else if(event.keyCode == 40){
			 //redo_Canvas_Change();				 
			 // console.log(event.keyCode);
		 }
		 // Are you there
		 else if(event.keyCode == 32){
			 
			 console.log("ideal width: "+(window.innerWidth*.7));
		 }
		 // https://www.codicode.com/art/undo_and_redo_to_the_html5_canvas.aspx
	 }; 
	 document.addEventListener('keydown', onKeyDown, false);
	 
	 // On Click Functions for the PostCard Canvas
	 function onCanvasButtonClick(){
		 console.log("clicked");
	 }
	 postCardCanvas.addEventListener('click',onCanvasButtonClick, false);
	 //https://stackoverflow.com/questions/9880279/how-do-i-add-a-simple-onclick-event-handler-to-a-canvas-element#
	  
	 // Window Resize Event
	 function onWindowResize(){
		 renderer.setSize(window.innerWidth*.7, 50);
		 //for ( var x = 0; x<buttons.length; x++){
			 //buttons[x].position.set(buttons[x].posX, buttons[x].posY, buttons[x].posZ);
		 // }
	 }
	 window.addEventListener('resize', onWindowResize, false);
	 
	 
	 // Go Back Button Click
	 document.getElementById("go_Back_Button").addEventListener("click", function(){
		 document.getElementById("receiptEmail").style.display = "none";
		 document.getElementById("go_Back_Button").style.display = "none";
		 document.getElementById("colorCanvas").style.display = "block";
		 document.getElementById("postCardToolsCanvas").style.display = "block";		 
	 });
	 
}
window.onload = init;