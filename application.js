var socket, Postal = io('/postal', {forceNew:true});
var cardsTable = [], libraryOfImages = [], imagesOnDisplay = [], totalImages = 0;
var animalImages = [], animeImages = [], cartoonImages = [], gameImages = [], additionalImages = [];
var spriteRatioWidthtoHeight =1, spriteRatioHeighttoWidth=1;
var Width, Height, Game_State = "Start";
var startGame, about, categories=[], steps = 0, objects = [];
var credits, seriesTitle, characterName, imageSource , creditsCard = null, creditsImage = null, creditsScrollCircle= null, creditsScrollSection = null;
var cardSheet, boardDisplay, listDisplay, cardBoard = [];
var leftScores = 0, rightScores = 0, ScoreBoard = [], saveLeftScoreTexture = null, saveRightScoreTexture = null;
var saveCardWhiteTexture = null, saveCardBlackTexture = null;
var team1 = null, team2 = null, timer = null, timerSetting = "Off", timesUp;
var sectionTitle, cardText, returnToStartScreen;

function init() {
	 // create a scene, that will hold all our elements such as objects, cameras and lights.
	 var scene = new THREE.Scene();				
	
	 // create a camera, which defines where we're looking at.
	 camera = new THREE.PerspectiveCamera(50, 500/ 500, 0.1, 1000);
	 camera.position.set(0,0,53);
	 scene.add(camera);
	 //scene.background = new THREE.Color( 0x1a0a3a );
	 scene.background = new THREE.Color( 0x000000 );
	 // create a render and set the size
	 var renderer = new THREE.WebGLRenderer({ antialias: true} );
	 //var renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true } ); < -- image saving trial
	 renderer.setClearColor(new THREE.Color(0x000000, 0.0));
	 Width = window.innerWidth*0.95;
	 Height = window.innerHeight*1.025;
 	 renderer.setSize(Width, Height);
	 //camera.aspect = window.innerWidth/window.innerHeight;
	 camera.aspect = Width/Height;
	 
	 //socket = io.connect('http://localhost:9000');
	 socket = io.connect('http://ec2-34-205-146-82.compute-1.amazonaws.com:9000');
      
	 var tempData = {
		 user: "jay357young@gmail.com",
		 pass: "357young"
	 }
	 Postal.emit('Account Login',tempData);
	  
	  
	 //add the output of the renderer to the html element
	 
	 
	 
	 document.getElementById("WebGL-output").appendChild(renderer.domElement);
	 
	 
	 
	 //----------------------------------------------------------------------------
	 
	 
	 
	 var c = document.getElementById("WebGL-output");
		var ctx = c.getContext("2d");

		ctx.font = "20px Georgia";
		ctx.fillText("Hello World!", 10, 50);

		ctx.font = "30px Verdana";
		// Create gradient
		var gradient = ctx.createLinearGradient(0, 0, c.width, 0);
		gradient.addColorStop("0", "magenta");
		gradient.addColorStop("0.5", "blue");
		gradient.addColorStop("1.0", "red");
		// Fill with gradient
		ctx.fillStyle = gradient;
		ctx.fillText("Big smile!", 10, 90);
	 
	 
	 
	 
		 var downloadingImage = "https://cdn.technologyreview.com/i/images/google-dragonfly.png?sw=1122";
		 
	 
	 
	 
	 //----------------------------------------------------------------------------
	 
	 //Keyboard Functions
	 function onKeyDown(event) {
		 if(event.keyCode == 32){
			 
			 var dataURL = c.toDataURL();
			 console.log(dataURL);
			 var data = {
				 subject: "Bendy Postal From Jason",
				 //text : '<h1>Greetings,</h1><p>Wishing you a seasonal greetings.</p> <img src='+downloadingImage+' alt="postCard">',
				 text : '<h1>Greetings,</h1><p>Wishing you a seasonal greetings.</p> <img src='+dataURL+' alt="postCard">',
				 img: downloadingImage
			 }
			 
			 
			 Postal.emit('Mail',data);
			 console.log("mail");
			 ctx.clearRect(0, 0, c.width, c.height);
		 }
	 }; 
	 document.addEventListener('keydown', onKeyDown, false);
	 
	 //add spotlight for the shadows
	 var spotLight = new THREE.SpotLight(0xffffff);
	 spotLight.position.set(0, 0, 25);
	 spotLight.castShadow = false;
	 spotLight.intensity =2;
	 scene.add(spotLight);			
	
	 renderScene();
	 drag_objects();	 
	 load_Text_and_Buttons(); 
	
	 //Render the Scenes
	 function renderScene(){
		 try{
			 steps++;
			 //Render steps
			 //render using requestAnimationFrame
			 requestAnimationFrame(renderScene);
			 renderer.render(scene, camera);
			 scene.traverse(function (e) {});
		 }catch(e){}
	 }
	 
	 //Make Objects Draggable - Additionally used as buttons
	 function drag_objects(){
		 var dragControls  = new THREE.DragControls( objects, camera, renderer.domElement );
				
			 dragControls.addEventListener( 'dragstart', function(event) {
				 //console.log("lol start of drag: ");
			 });
			 
			 dragControls.addEventListener( 'drag', function(event)   {});
			 
			 dragControls.addEventListener( 'dragend', function(event)  {});
		 
		 //console.log(dragControls);
		 //https://www.learnthreejs.com/drag-drop-dragcontrols-mouse/
	 }
	 
	 // Load Text
	 function load_Text_and_Buttons(){
		 // Start Game
		 startGame = text_creation( "Start Game", 0, 3, 0.8);
		 startGame.parameters.font= "135px Arial";
		 startGame.parameters.fillStyle= "White";
		 startGame.posX = 0;
		 startGame.posY =  -10;
		 startGame.posZ = -1.9;
		 startGame.position.set( startGame.posX, startGame.posY, startGame.posZ);
		 startGame.scale.set(23,5,1);
		 startGame.name = "Start Game";
		 startGame.update();
		 console.log("loaded...")
		 scene.add(startGame);
	 }
	 
	  
	 //Text Creation Function
	 //Since this is used more than 10 times throughout the code
	 //I created this function to cut down on the length and effort
	 function text_creation(textValue, heightPower, widthPower, lineHeight ){		 
		 var texts = new THREEx.DynamicText2DObject();
		 texts.parameters.text = textValue;
		 
		 //HeightPower
		 //The HeightPower works in the power of two and starts with 2^7 = 128
		 //The height for the canvas works like this  = 2^(7+heightPower); 
		 texts.dynamicTexture.canvas.height = Math.pow(2, 7+heightPower);	
		  
		 //WidthPower
		 //The WidthPower works in the power of two and starts with 2^7 = 128
		 //The width for the canvas works like this  = 2^(7+widthPower); 
		 texts.dynamicTexture.canvas.width = Math.pow(2, 7+widthPower);	
		 
		 /** Powers of 2
				 2^(7) = 128
				 2^(8) = 256
				 2^(9) = 512
				 2^(10) = 1024
				 2^(11) = 2048
				 2^(12) = 4096
		 **/
		 
		 //Line Height
		 //The higher the value the higher gap
		 texts.parameters.lineHeight= lineHeight;
		 
		 texts.parameters.align = "center";
		 
		 texts.update();
		 return texts;
	 }
}
window.onload = init;