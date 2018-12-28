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
      
	 //add the output of the renderer to the html element
	 document.getElementById("WebGL-output").appendChild(renderer.domElement);
	 
	 //Keyboard Functions
	 function onKeyDown(event) {
		 if(event.keyCode == 32){
			 var data = {
				 subject: "Bendy Postal From Jason",
				 text : '<h1>Greetings,</h1><p>Wishing you a seasonal greetings.</p>',
				 img: null
				 
				 
			 }
			 
			 Postal.emit('Mail',data);
			 console.log("mail");
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
			 scene.traverse(function (e) {
				 if(e.name == "leftSiding" && steps % 25 == 0 && Game_State != "Start"){
					 if(e.style == 1){
						 e.material.color  = new THREE.Color("rgb(50,165,250)");
						 e.style = 2;
					 }
					 else if(e.style == 2){
						 e.material.color  = new THREE.Color("rgb(23,155,220)");
						 e.style = 1;
					 }
				 }
				 else if(e.name == "rightSiding" && steps % 25 == 0 && Game_State != "Start"){
					 if(e.style == 1){
						 e.material.color  = new THREE.Color("rgb(250,93,93)");
						 e.style = 2;
					 }
					 else if(e.style == 2){
						 e.material.color  = new THREE.Color("rgb(220,53,53)");
						 e.style = 1;
					 }
				 }
			 });
		 }catch(e){}
	 }
	 
	 //Make Objects Draggable - Additionally used as buttons
	 function drag_objects(){
		 var dragControls  = new THREE.DragControls( objects, camera, renderer.domElement );
				
			 dragControls.addEventListener( 'dragstart', function(event) {
				 // Card Holders
				 if (event.object.name == "cardHolder" && event.object.revealed == false){
					 
					 // Civilian
					 if(cardsTable[event.object.cardNumber].type == null){ // Yellow
						 event.object.material.color  = new THREE.Color("rgb(255,255,0)");
					 }
					 // Team 1
					 else if(cardsTable[event.object.cardNumber].type == "Team 1"){ // Blue
						 event.object.material.color  = new THREE.Color("rgb(23,155,220)");						 
						 ScoreBoard[leftScores].material.color  = new THREE.Color("rgb(23,155,220)");
						 leftScores ++;						
					 }
					 // Team 2
					 else if(cardsTable[event.object.cardNumber].type == "Team 2"){ // Red
						 event.object.material.color  = new THREE.Color("rgb(220,53,53)");
						 ScoreBoard[ScoreBoard.length + rightScores - 8].material.color  = new THREE.Color("rgb(220,53,53)");
						 rightScores ++;					
					 }
					 // Assassin
					 else if(cardsTable[event.object.cardNumber].type == "Assassin"){ // Black
						 event.object.material.color  = new THREE.Color("rgb(23,23,23)");
					 }
					 
					 event.object.revealed = true;
					 /**
					 if(Math.floor(Math.random()*2)==0 && leftScores < 8){ // Blue
						 event.object.material.color  = new THREE.Color("rgb(23,155,220)");
						 
						 ScoreBoard[leftScores].material.color  = new THREE.Color("rgb(23,155,220)");
						 leftScores ++;						
					 }
					 else if( rightScores < 8){ // Red
						 event.object.material.color  = new THREE.Color("rgb(220,53,53)");
						 
						 ScoreBoard[ScoreBoard.length + rightScores - 8].material.color  = new THREE.Color("rgb(220,53,53)");
						 rightScores ++;
					 }
					 **/
				 }
				 // Timer button
				 else if (event.object.name == "timer"){
					 if(timerSetting == "Off"){
						 timerSetting = "On";
						 // console.log(timerSetting)
						 timer.parameters.text = " 60 ";
						 Codename.emit('Timer On');
					 }
					 else if(timerSetting == "On"){
						 timerSetting = "Off";
						 // console.log(timerSetting);
						 timer.parameters.text = "Timer";
						 Codename.emit('Timer Off');						 
					 }
					 timer.update();		
				 }
				 // Credits button
				 else if (event.object.name == "Credits"){
					 //Clear the clickable/draggable objects
					 while(objects.length >=1){
						 objects.shift();
					 }
					 
					 go_to_Credit_Screen();
				 }
				 // About button
				 else if(event.object.name == "About"){
					 //Clear the clickable/draggable objects
					 while(objects.length >=1){
						 objects.shift();
					 }
					 
					 go_to_About_Screen();					 
				 }
				 // cardSheet button
				 else if(event.object.name == "cardSheet"){
					 //Clear the clickable/draggable objects
					 while(objects.length >=1){
						 objects.shift();
					 }
					 
					 go_to_Card_Screen();					 
				 }
				 
				 
				 // Start Game button
				 else if (event.object.name == "Start Game"){
					 //Clear the clickable/draggable objects
					 while(objects.length >=1){
						 objects.shift();
					 }
					 
					 go_to_Game_Board();
				 }
				 // Return
				 else if (event.object.name == "Return"){
					 scene.remove(sectionTitle);
					 scene.remove(cardText);
					
					 
					 //Clear the clickable/draggable objects
					 while(objects.length >=1){
						 objects.shift();
					 }
					 
					 // Correct categories
					 if(Game_State == "Credits"){				
						 scene.remove(seriesTitle);
						 scene.remove(characterName);
						 scene.remove(imageSource);
						 scene.remove(creditsImage);
						 scene.remove(creditsCard);
						 
						 scene.remove(creditsScrollCircle);
					 
					 
						 //Clear the selections objects
						 for(var x= 0; x< creditsScrollSection.length; x++){
							 scene.remove(creditsScrollSection[x]);
						 }
					 

						 categories[0].parameters.font= "135px Arial";
						 categories[0].position.y = categories[0].position.y+8;
						 categories[0].position.x = categories[0].position.x +16.5;
						 categories[0].update();
					 
						 for(var x = 1; x < categories.length; x++){
							 categories[x].credits = false;
							 categories[x].posY =  categories[x].posY +7;
							 categories[x].position.y = categories[x].posY;
							 categories[x].parameters.font= "135px Arial";
							 categories[x].update();
						 }
					 }
					 else if(Game_State == "Board"){
						 
						 scene.remove(boardDisplay);
						 scene.remove(listDisplay);
						 
						 for(var x= 0; x< cardBoard.length; x++){
							 scene.remove(cardBoard[x]);
						 }
					 }
					 // Return to Start Screen
					 scene.remove(returnToStartScreen);
					 load_Start_Screen();
				 }
				 // Go to Image Source
				 else if (event.object.name == "imageSource"){
					 //Opens the Url to the Source
					 window.open(event.object.url, '_blank');
				 }
				 // Animes Categories
				 else if(event.object.name == "anime"){
					 // Game Settings
					 if(Game_State == "Start"){
						 // Change the Text Color
						 if(anime.includeCards == true)
							 anime.parameters.fillStyle= "#552020";
						 else
							 anime.parameters.fillStyle= "Crimson";
						 
						 anime.includeCards = !anime.includeCards;
						 
					 }
					 // Credits
					 else if(Game_State == "Credits"){
						 // Change the Text Color
						 if(anime.credits != true){
							 anime.parameters.fillStyle= "Crimson";
							 anime.credits = true;
							 cartoon.credits =  false;
							 game.credits = false;
							 // Change the Text Color for the now chosen Options
							 cartoon.parameters.fillStyle= "#533200";
							 game.parameters.fillStyle= "#003300";
							 cartoon.update();
							 game.update();
							 
							 // Update Scene
							 // Change Selection Background color 
							 creditsScrollSection[0].material.color.setHex(0xfa3a3a);
							 
							 // Image - Check to see if the first image is already loaded
							 if(animeImages[0].sprite == null){						 
								 animeImages[0].sprite = loadImagesfromText(animeImages[0].filename,"Anime",animeImages[0].backgroundColor);
								 animeImages[0].sprite.characterName = animeImages[0].name;
								 animeImages[0].sprite.backgroundColor = animeImages[0].backgroundColor;
							 }		 
							 creditsImage.material = animeImages[0].sprite;							 
							 
							 // Update Card
							 if(animeImages[0].sprite.backgroundColor.trim() == "Black")				 
								 creditsCard.material = create_Black_Card();
							 //Make the Card Background White
							 else if(animeImages[0].sprite.backgroundColor.trim()  == "White") 
								 creditsCard.material = create_White_Card();	
							 
							 //Setting the Series and Character Name in the Credits
							 characterName.parameters.text = animeImages[0].name;
							 characterName.update();
							 seriesTitle.parameters.text = "Series: "+animeImages[0].series;
							 seriesTitle.update();
							 
							 // Update Selections
							 for(var x= 1; x<creditsScrollSection.length; x++){
								 scene.add(creditsScrollSection[x])
								 objects.push(creditsScrollSection[x])
								 creditsScrollSection[x].arrayNumber = x-1;
								 creditsScrollSection[x].parameters.text = animeImages[x-1].series;			 
								 creditsScrollSection[x].update();			 
							 }							 
							 
							 //Update Link
							 imageSource.url =  animeImages[0].source;
							 
							 // Reset Scroll Bar
							 creditsScrollCircle.position.y = 5; 							 
						 }
					 }
					 
					 anime.update();
				 }
				 // Cartoons Categories
				 else if(event.object.name == "cartoon"){
					 if(Game_State == "Start"){
						 // Change the Text Color
						 if(cartoon.includeCards == true)
							 cartoon.parameters.fillStyle= "#533200";
						 else
							 cartoon.parameters.fillStyle= "orangered";
						 
						 cartoon.includeCards = !cartoon.includeCards;
					 }
					 // Credits
					 else if(Game_State == "Credits"){
						 // Change the Text Color
						 if(cartoon.credits != true){
							 cartoon.parameters.fillStyle= "orangered";
							 cartoon.credits = true;
							 anime.credits =  false;
							 game.credits = false;
							 // Change the Text Color for the now chosen Options
							 anime.parameters.fillStyle= "#552020";
							 game.parameters.fillStyle= "#003300";
							 anime.update();
							 game.update();
							 
							 // Update Scene
							 // Change Selection Background color 
							 creditsScrollSection[0].material.color.setHex(0xfa7a3a);
							 
							 // Image - Check to see if the first image is already loaded
							 if(cartoonImages[0].sprite == null){						 
								 cartoonImages[0].sprite = loadImagesfromText(cartoonImages[0].filename,"Cartoon",cartoonImages[0].backgroundColor);
								 cartoonImages[0].sprite.characterName = cartoonImages[0].name;
								 cartoonImages[0].sprite.backgroundColor = cartoonImages[0].backgroundColor;
							 }		 
							 creditsImage.material = cartoonImages[0].sprite;							 
							 
							 // Update Card
							 if(cartoonImages[0].sprite.backgroundColor.trim() == "Black")				 
								 creditsCard.material = create_Black_Card();
							 //Make the Card Background White
							 else if(cartoonImages[0].sprite.backgroundColor.trim()  == "White") 
								 creditsCard.material = create_White_Card();	
							 
							 //Setting the Series and Character Name in the Credits
							 characterName.parameters.text = cartoonImages[0].name;
							 characterName.update();
							 seriesTitle.parameters.text = "Series: "+cartoonImages[0].series;
							 seriesTitle.update();
							 
							 // Update Selections
							 for(var x= 1; x<creditsScrollSection.length; x++){
								 scene.add(creditsScrollSection[x])
								 objects.push(creditsScrollSection[x])
								 creditsScrollSection[x].arrayNumber = x-1;
								 creditsScrollSection[x].parameters.text = cartoonImages[x-1].series;			 
								 creditsScrollSection[x].update();			 
							 }							 
							 
							 //Update Link
							 imageSource.url =  cartoonImages[0].source;
							 
							 // Reset Scroll Bar
							 creditsScrollCircle.position.y = 5; 		
						 }
					 }
					 cartoon.update();
				 }
				 // Games Categories
				 else if(event.object.name == "game"){
					 if(Game_State == "Start"){
						 // Change the Text Color
						 if(game.includeCards == true)
							 game.parameters.fillStyle= "#003300";
						 else
							 game.parameters.fillStyle= "Lime";
						 
						 game.includeCards = !game.includeCards;
					 }
					 // Credits
					 else if(Game_State == "Credits"){
						 // Change the Text Color
						 if(game.credits != true){
							 game.parameters.fillStyle= "Lime";
							 game.credits = true;
							 anime.credits =  false;
							 cartoon.credits = false;
							 // Change the Text Color for the now chosen Options
							 anime.parameters.fillStyle= "#552020";
							 cartoon.parameters.fillStyle= "#533200";
							 anime.update();
							 cartoon.update();
							 
							 // Update Scene
							 // Change Selection Background color 
							 creditsScrollSection[0].material.color.setHex(0x3a7a3a);
							 
							 // Image - Check to see if the first image is already loaded
							 if(gameImages[0].sprite == null){						 
								 gameImages[0].sprite = loadImagesfromText(gameImages[0].filename,"Game",gameImages[0].backgroundColor);
								 gameImages[0].sprite.characterName = gameImages[0].name;
								 gameImages[0].sprite.backgroundColor = gameImages[0].backgroundColor;
							 }		 
							 creditsImage.material = gameImages[0].sprite;							 
							 
							 // Update Card
							 if(gameImages[0].sprite.backgroundColor.trim() == "Black")				 
								 creditsCard.material = create_Black_Card();
							 //Make the Card Background White
							 else if(gameImages[0].sprite.backgroundColor.trim()  == "White") 
								 creditsCard.material = create_White_Card();	
							 
							 //Setting the Series and Character Name in the Credits
							 characterName.parameters.text = gameImages[0].name;
							 characterName.update();
							 seriesTitle.parameters.text = "Series: "+gameImages[0].series;
							 seriesTitle.update();
							 
							 // Update Selections
							 for(var x= 1; x<creditsScrollSection.length; x++){
								 scene.add(creditsScrollSection[x])
								 objects.push(creditsScrollSection[x])
								 creditsScrollSection[x].arrayNumber = x-1;
								 creditsScrollSection[x].parameters.text = gameImages[x-1].series;			 
								 creditsScrollSection[x].update();			 
							 }							 
							 
							 //Update Link
							 imageSource.url =  gameImages[0].source;
							 
							 // Reset Scroll Bar
							 creditsScrollCircle.position.y = 5;
						 }
					 }
					 
					 game.update();
				 }
				 // Credits Selection
				 else if(event.object.name == "Selection"){
					 // Anime
					 if(categories[1].credits == true){
						 if(animeImages[event.object.arrayNumber].sprite == null){
							 animeImages[event.object.arrayNumber].sprite = loadImagesfromText(animeImages[event.object.arrayNumber].filename,"Anime",animeImages[event.object.arrayNumber].backgroundColor);
							 animeImages[event.object.arrayNumber].sprite.characterName = animeImages[event.object.arrayNumber].name;
							 animeImages[event.object.arrayNumber].sprite.backgroundColor = animeImages[event.object.arrayNumber].backgroundColor;
						 }		 
						 
						 
						 creditsImage.material = animeImages[event.object.arrayNumber].sprite;
						 // Update Text
						 characterName.parameters.text = animeImages[event.object.arrayNumber].name;
						 seriesTitle.parameters.text = "Series: "+animeImages[event.object.arrayNumber].series;
						 characterName.update();
						 seriesTitle.update();
						 
						 // Update Card
						 // Make the Card Background Black
						 if(animeImages[event.object.arrayNumber].sprite.backgroundColor.trim() == "Black")				 
							 creditsCard.material = create_Black_Card();
						 //Make the Card Background White
						 else if(animeImages[event.object.arrayNumber].sprite.backgroundColor.trim()  == "White") 
							 creditsCard.material = create_White_Card();	 						 
						 
						 //Update Link
						 imageSource.url = animeImages[event.object.arrayNumber].source;
					 }
					 // Cartoon
					 else if(categories[2].credits == true){
						 if(cartoonImages[event.object.arrayNumber].sprite == null){
							 cartoonImages[event.object.arrayNumber].sprite = loadImagesfromText(cartoonImages[event.object.arrayNumber].filename,"Cartoon",cartoonImages[event.object.arrayNumber].backgroundColor);
							 cartoonImages[event.object.arrayNumber].sprite.characterName = cartoonImages[event.object.arrayNumber].name;
							 cartoonImages[event.object.arrayNumber].sprite.backgroundColor = cartoonImages[event.object.arrayNumber].backgroundColor;
						 }		 
						 
						 
						 creditsImage.material = cartoonImages[event.object.arrayNumber].sprite;
						 // Update Text
						 characterName.parameters.text = cartoonImages[event.object.arrayNumber].name;
						 seriesTitle.parameters.text = "Series: "+cartoonImages[event.object.arrayNumber].series;
						 characterName.update();
						 seriesTitle.update();
						 
						 // Update Card
						 // Make the Card Background Black
						 if(cartoonImages[event.object.arrayNumber].sprite.backgroundColor.trim() == "Black")				 
							 creditsCard.material = create_Black_Card();
						 //Make the Card Background White
						 else if(cartoonImages[event.object.arrayNumber].sprite.backgroundColor.trim()  == "White") 
							 creditsCard.material = create_White_Card();	 						 
						 
						 //Update Link
						 imageSource.url = cartoonImages[event.object.arrayNumber].source;
					 }
					 // Games
					 else if(categories[3].credits == true){
						 if(gameImages[event.object.arrayNumber].sprite == null){
							 gameImages[event.object.arrayNumber].sprite = loadImagesfromText(gameImages[event.object.arrayNumber].filename,"Game",gameImages[event.object.arrayNumber].backgroundColor);
							 gameImages[event.object.arrayNumber].sprite.characterName = gameImages[event.object.arrayNumber].name;
							 gameImages[event.object.arrayNumber].sprite.backgroundColor = gameImages[event.object.arrayNumber].backgroundColor;
						 }		 
						 
						 
						 creditsImage.material = gameImages[event.object.arrayNumber].sprite;
						 // Update Text
						 characterName.parameters.text = gameImages[event.object.arrayNumber].name;
						 seriesTitle.parameters.text = "Series: "+gameImages[event.object.arrayNumber].series;
						 characterName.update();
						 seriesTitle.update();
						 
						 // Update Card
						 // Make the Card Background Black
						 if(gameImages[event.object.arrayNumber].sprite.backgroundColor.trim() == "Black")				 
							 creditsCard.material = create_Black_Card();
						 //Make the Card Background White
						 else if(gameImages[event.object.arrayNumber].sprite.backgroundColor.trim()  == "White") 
							 creditsCard.material = create_White_Card();	 						 
						 
						 //Update Link
						 imageSource.url = gameImages[event.object.arrayNumber].source;
					 }
				 
				 
				 }
				 
				 
				 //console.log("lol start of drag: ");
			 });
			 
			 dragControls.addEventListener( 'drag', function(event)   {
				 if(event.object.name != "creditsScrollCircle")
					 event.object.position.set(event.object.posX, event.object.posY, event.object.posZ);
				 else{
					 // Keeps the Scroll bar in the same X position
					 event.object.position.x = event.object.posX;	
					 
					 // Limits the Height of the Scroll Bar
					 if(event.object.position.y > 5)
						 event.object.position.y = 5; 
					 else if(event.object.position.y < -16)
						 event.object.position.y = -16; 
					 
					 // Make this a negative because it's easier to work with
					 var percentage = event.object.position.y - 5;
					 
					 if(categories[1].credits == true)
						 percentage = Math.floor(-percentage/21 * (animeImages.length - 9));
					 else  if(categories[2].credits == true)
						 percentage = Math.floor(-percentage/21 * (cartoonImages.length - 9));
					  else  if(categories[3].credits == true)
						 percentage = Math.floor(-percentage/21 * (gameImages.length - 9));
					 
					 
					 for(var x= 1; x<creditsScrollSection.length; x++){
						 //scene.add(creditsScrollSection[x])
						 //objects.push(creditsScrollSection[x])
						 creditsScrollSection[x].arrayNumber = x-1+percentage;
						 
						 if(categories[1].credits == true)
							 creditsScrollSection[x].parameters.text = animeImages[x-1+percentage].series;			
						 else  if(categories[2].credits == true)
							 creditsScrollSection[x].parameters.text = cartoonImages[x-1+percentage].series;	
						 else  if(categories[3].credits == true)
							 creditsScrollSection[x].parameters.text = gameImages[x-1+percentage].series;	
						 
						 creditsScrollSection[x].update();			 
					 }
					 
					 
				 }
					 
			 });
			 
			 dragControls.addEventListener( 'dragend', function(event)  {
				 /**
				 if (event.object.name == "creditsScrollCircle"){
					 //event.object.position.y = event.object.posY; 
				 }
				 **/
			 });
		 
		 //console.log(dragControls);
		 //https://www.learnthreejs.com/drag-drop-dragcontrols-mouse/
	 }
	  
	 //Load and a preset the images for use
	 function loadImages(pictureName, characterName, type, cardBackgroundColor, source){
		 //Sprites
		 var loader = new THREE.TextureLoader();
		 loader.crossOrigin = true;
		 var Texture = loader.load( 'Images/'+type+'/'+pictureName);
		 Texture.minFilter = THREE.LinearFilter;
		 var Imagecover =  new THREE.SpriteMaterial( { map: Texture, color: 0xffffff } );
		 Imagecover.mediaType = type;
		 Imagecover.source = source;
		 Imagecover.revealed = false;
		 Imagecover.team = null;		 
		 Imagecover.characterName = characterName;		 
		 console.log(Imagecover.characterName );
		 Imagecover.cardBackgroundColor = cardBackgroundColor;		 
		 Imagecover.x = 0;
		 Imagecover.y = 0;
		 return Imagecover;
	 }
	 
	 //Load and a preset the images for use
	 function loadImagesfromText(pictureName, type, cardBackgroundColor){
		 //Sprites
		 var loader = new THREE.TextureLoader();
		 loader.crossOrigin = true;
		 var Texture = loader.load( 'Images/'+type+'/'+pictureName);
		 Texture.minFilter = THREE.LinearFilter;
		 var Imagecover =  new THREE.SpriteMaterial( { map: Texture, color: 0xffffff } );
		 Imagecover.revealed = false;
		 Imagecover.team = null;
		 Imagecover.cardBackgroundColor = cardBackgroundColor;		 
		 Imagecover.x = 0;
		 Imagecover.y = 0;
		 return Imagecover;
	 }
	 
	 // Fills the Library of Cards for the Chosen Categories
	 function fillLibraryOfImages(){
		 // I have an additional section size here because at times a player may not want a section...
		 // in other words, setting it to zero
		 var dataArray = [];
		 
		 // Animals		 
		 animalSize = 0;
		 if(animals.includeCards)
			 animalSize = animalImages.length;	 
		 
		 // Animes		 
		 animeSize = 0;
		 if(anime.includeCards)
			 animeSize = animeImages.length;
		 
		 // Cartoons
		 cartoonSize = 0;
		 if(cartoon.includeCards)
			 cartoonSize = cartoonImages.length;
		 
		 // Games
		 gameSize = 0;
		 if(game.includeCards)
			 gameSize = gameImages.length;
		 
		 // First get a tally of all applicable Images
		 var totalImages = animalSize + animeSize + cartoonSize + gameSize;
		 
		 var listOfRandomImages = [];
		 
		 if(totalImages >= 24){
			 if(totalImages > 24){
				 //Randomly Select Characters
				 while(listOfRandomImages.length <= 23){
					 var arrayNumber = Math.floor(Math.random()*totalImages);
					 
					 var uniqueNumber = true;
					 
					 for(var x=0; x<listOfRandomImages.length && uniqueNumber != false; x++){
						 if( listOfRandomImages[x] == arrayNumber)
							 uniqueNumber = false;
					 }
					 //console.log("Results: "+uniqueNumber+" arrayNumber = "+arrayNumber);
					 if(uniqueNumber == true){
						 //console.log("Results: "+uniqueNumber+" arrayNumber = "+arrayNumber);
						 listOfRandomImages.push(arrayNumber);
					 }
				 }				 
				 //Load the Images from various sections
				 while(listOfRandomImages.length >= 1){
					 // First Checks if its under the animals sections  and if it is... add the animal
					 if(listOfRandomImages[0]  < animalSize){
						 var x = listOfRandomImages[0];
						 
						 if(animalImages[x].sprite == null){						 
							 animalImages[x].sprite = loadImagesfromText(animalImages[x].filename,"Animals",animalImages[x].backgroundColor);
							 animalImages[x].sprite.characterName = animalImages[x].name;
							 animalImages[x].sprite.series = animalImages[x].series;
							 animalImages[x].sprite.backgroundColor = animalImages[x].backgroundColor;
						 }
						 var a = {
							 name: animalImages[x].name,
							 series: animalImages[x].series,
							 type: null
						 }
						 dataArray.push(a)
						 libraryOfImages.push(animalImages[x].sprite);			
						 listOfRandomImages.shift();
					 }					 
					 //Secondly Check if it under anime and if it is add the anime
					 else if((listOfRandomImages[0]-animalSize)  < animeSize){
						 var x = listOfRandomImages[0]-animalSize;
						 
						 if(animeImages[x].sprite == null){						 
							 animeImages[x].sprite = loadImagesfromText(animeImages[x].filename,"Anime",animeImages[x].backgroundColor);
							 animeImages[x].sprite.characterName = animeImages[x].name;
							 animeImages[x].sprite.series = animeImages[x].series;
							 animeImages[x].sprite.backgroundColor = animeImages[x].backgroundColor;
						 }
						 var a = {
							 name: animeImages[x].name,
							 series: animeImages[x].series,
							 type: null
						 }
						 dataArray.push(a)
						 libraryOfImages.push(animeImages[x].sprite);			
						 listOfRandomImages.shift();
					 }
					 // Thirdly Check if it under Cartoon and if it is add the Cartoon
					 else if((listOfRandomImages[0]-animalSize-animeSize)  < cartoonSize){
						 var x = listOfRandomImages[0]-animalSize-animeSize;
						 if(cartoonImages[x].sprite == null){			
							 cartoonImages[x].sprite = loadImagesfromText(cartoonImages[x].filename,"Cartoon",cartoonImages[x].backgroundColor);
							 cartoonImages[x].sprite.characterName = cartoonImages[x].name;
							 cartoonImages[x].sprite.backgroundColor = cartoonImages[x].backgroundColor;
						 }
						 var c = {
							 name: cartoonImages[x].name,
							 series: cartoonImages[x].series,
							 type: null
						 }
						 dataArray.push(c)
						 libraryOfImages.push(cartoonImages[x].sprite);		
						 listOfRandomImages.shift();						 
					 }
					 // Lastly Check if it under game and if it is add the game
					 else if((listOfRandomImages[0]-animalSize-animeSize-cartoonSize)  < gameSize){
						 var x = listOfRandomImages[0]-animalSize-animeSize-cartoonSize;
						 if(gameImages[x].sprite == null){			
							 gameImages[x].sprite = loadImagesfromText(gameImages[x].filename,"Game",gameImages[x].backgroundColor);
							 gameImages[x].sprite.characterName = gameImages[x].name;
							 gameImages[x].sprite.backgroundColor = gameImages[x].backgroundColor;
						 }
						 var g = {
							 name: gameImages[x].name,
							 series: gameImages[x].series,
							 type: null
						 }
						 dataArray.push(g)
						 libraryOfImages.push(gameImages[x].sprite);		
						 listOfRandomImages.shift();						 
					 }
				 }
			 }
			 else{
				 //Upload everything
			 }
			 
			 displayPlaceHolders();
			 //var data = {cards: libraryOfImages};
			 var data = {cards: dataArray};
			 console.log(data);
			 Codename.emit('Start Game', data);
		 }
		 else{			 
			 console.log("Not enough images.... sorry");
		 }
		
		
	 }
	  
	 //Displays the Cards on the Table from the Library
	 function displayPlaceHolders(){
		 var initialHeight = 11.75;
		 for(var x = 0; x<libraryOfImages.length && x < 24; x++){
			 
			 //Set the Image
			 var tempScene = new THREE.Sprite();	
			 tempScene.material = libraryOfImages[x];
			 tempScene.position.set((x%6)*8-20,-10*Math.floor(x/6)+initialHeight,-2); //xyz
			 tempScene.scale.set(6,8,1);
			 imagesOnDisplay.push(tempScene);
			 scene.add(imagesOnDisplay[imagesOnDisplay.length-1]);
			 cardsTable[x].image = imagesOnDisplay[imagesOnDisplay.length-1];
			 
			 //Add the Card
			 var cardHolder = new THREE.Sprite();				 
			 //Set the Card Background Color
			 //Make the Card Background Black
			 if(tempScene.material.backgroundColor.trim() == "Black")				 
				 cardHolder.material = create_Black_Card();
			 //Make the Card Background White
			 else if(tempScene.material.backgroundColor.trim()  == "White") 
				 cardHolder.material = create_White_Card();
			 cardHolder.posX =(x%6)*8-20;	 
			 cardHolder.posY = -10*Math.floor(x/6)+initialHeight-1;	 
			 cardHolder.posZ = -2.1;	 
			 cardHolder.position.set(cardHolder.posX, cardHolder.posY, cardHolder.posZ); //xyz
			 cardHolder.scale.set(7,9,1);
			 cardHolder.name = "cardHolder";
			 cardHolder.revealed = false;
			 cardHolder.cardNumber = x;
			 imagesOnDisplay.push(cardHolder);
			 scene.add(imagesOnDisplay[imagesOnDisplay.length-1]);
			 objects.push(imagesOnDisplay[imagesOnDisplay.length-1]);
			 cardsTable[x].card = imagesOnDisplay[imagesOnDisplay.length-1];
			 
			 //Add the Character's Name
			 //console.log(libraryOfImages[x].characterName);
			 var text = text_creation(libraryOfImages[x].characterName,0,2,0.75);
			 
			 var fontSize = (text.parameters.text.length-8);
			 //console.log(text.parameters.text+ " - "+fontSize);
			 if(fontSize <= 0)
				 text.parameters.font= "115px Arial";
			 else{
				 text.parameters.lineHeight=0.75 - fontSize*0.025;
				 fontSize = 115 - (fontSize*4);
				 text.parameters.font= fontSize+"px Arial";				 
			 }			 
			 
			 //text.parameters.font= "70px Arial";
			 text.parameters.fillStyle= "Yellow";
			 text.position.set((x%6)*8-20,-9.97*Math.floor(x/6)+initialHeight-4.58, -1.9);
			 text.scale.set(6,1.25,1);
			 text.update();
			 imagesOnDisplay.push(text);
			 scene.add(imagesOnDisplay[imagesOnDisplay.length-1]);
			 cardsTable[x].text = imagesOnDisplay[imagesOnDisplay.length-1];
		 }
		 
		 //Left Siding
		 var leftSiding = new THREE.Sprite();				 
		 leftSiding.material = additionalImages[0];
		 leftSiding.material.color  = new THREE.Color("rgb(23,155,220)");
		 leftSiding.position.set(-16.25,-16.5,-2.5); //xyz
		 leftSiding.scale.set(20,20,1);
		 leftSiding.name = "leftSiding";
		 leftSiding.style = 1;		 
		 imagesOnDisplay.push(leftSiding);
		 scene.add(imagesOnDisplay[imagesOnDisplay.length-1]);
		 
		 //Right Siding
		 var rightSiding = new THREE.Sprite();				 
		 rightSiding.material = additionalImages[1];
		 rightSiding.material.color  = new THREE.Color("rgb(220,53,53)");
		 rightSiding.position.set(16.25,-16.5,-2.5); //xyz
		 rightSiding.scale.set(20,20,1);
		 rightSiding.name = "rightSiding";
		 rightSiding.style = 1;		 
		 imagesOnDisplay.push(rightSiding);
		 scene.add(imagesOnDisplay[imagesOnDisplay.length-1]);
		 
		 //Left Sides Scoring
		 //for(var x = 0; x < 8; x++){ Gonna make it always the Left side for now
		 for(var x = 0; x < 9; x++){
			 var score = new THREE.Sprite();
			 score.material = create_Left_Score();
			 score.material.color  = new THREE.Color("rgb(255,255,255)");
			 // score.position.set(-22.5+x*2.75, initialHeight + 6.5,-2); // For the temp fix Ima make it start a little earlier
			 score.position.set(-23.5+x*2.5, initialHeight + 6.5,-2); 
			 score.scale.set(1.75, 3.5,1);
			 score.name = "Left Score "+x;
			 ScoreBoard.push(score);
			 scene.add(ScoreBoard[ScoreBoard.length-1]);			 
		 }
		 
		 //Right Sides Scoring
		 for(var x = 0; x < 8; x++){
			 var score = new THREE.Sprite();
			 score.material = create_Right_Score();
			 score.material.color  = new THREE.Color("rgb(255,255,255)");
			 score.position.set(22.5-x*2.75, initialHeight + 6.5,-2); //xyz
			 score.scale.set(1.75, 3.5,1);
			 score.name = "Right Score "+(7-x);
			 score.style = 1;		 
			 ScoreBoard.push(score);
			 scene.add(ScoreBoard[ScoreBoard.length-1]);			 
		 }
		 
		 // Team 1 Name
		 if(team1 == null){
			 team1 = text_creation("Team Aqua",1,3,0.75);			 
			 team1.parameters.font= "125px Arial";
			 team1.parameters.fillStyle= "#179ADC"; // rgb(23,155,220)
			 team1.position.set(-19, 24, -2.2);
			 team1.scale.set(15, 7,1);
			 team1.update();
		} 
		 imagesOnDisplay.push(team1);
		 scene.add(imagesOnDisplay[imagesOnDisplay.length-1]);	
		 
		 // Team 2 Name
		 if(team2 == null){
			 team2 = text_creation("Team Magma",1,3,0.75);			 
			 team2.parameters.font= "125px Arial";
			 team2.parameters.fillStyle= "#DC3535"; // rgb(220,53,53)
			 team2.position.set(17, 24, -2.2);
			 team2.scale.set(15, 7,1);
			 team2.update();
		 }
		 imagesOnDisplay.push(team2);
		 scene.add(imagesOnDisplay[imagesOnDisplay.length-1]);	
		
		 // Timer
		 if(timer == null){
			 timer = text_creation("Timer",0,2,0.75);			 
			 timer.parameters.font= "135px Arial";
			 timer.name = "timer";
			 timer.parameters.fillStyle= "#ffffff"; // rgb(220,53,53)
			 timer.posX = 0;	 
			 timer.posY = initialHeight + 6.75;	 
			 timer.posZ = -2.2;	 
			 timer.position.set( timer.posX, timer.posY, timer.posZ);
			 timer.scale.set(5, 3,1);
			 timer.update();
		 }
		 imagesOnDisplay.push(timer);
		 scene.add(imagesOnDisplay[imagesOnDisplay.length-1]);	
		 objects.push(imagesOnDisplay[imagesOnDisplay.length-1]);
		 //Start the steps
		 steps = 0;
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
		 scene.add(startGame);
		 
		 // Credits ----------------------
		 credits = text_creation( "Credits", 0, 3, 0.8);
		 credits.parameters.font= "135px Arial";
		 credits.parameters.fillStyle= "Gold";
		 credits.posX = 19;
		 credits.posY =  -22;
		 credits.posZ=  -2;
		 credits.position.set( credits.posX, credits.posY, credits.posZ);
		 credits.scale.set(14,3,1);
		 credits.name = "Credits";
		 credits.update();		 
		 //Series Title
		 seriesTitle = text_creation( "Series: abcdefghijklmnopqrstuvwxyz", 0, 4, 0.68);
		 seriesTitle.parameters.font= "105px Arial";
		 seriesTitle.parameters.fillStyle= "White";
		 seriesTitle.parameters.align= "left";		 
		 seriesTitle.posX = 5;
		 seriesTitle.posY =  -16;
		 seriesTitle.posZ=  -2;
		 seriesTitle.position.set( seriesTitle.posX, seriesTitle.posY, seriesTitle.posZ);
		 seriesTitle.scale.set(24,3.5,1);
		 seriesTitle.name = "seriesTitle";
		 seriesTitle.update();		 
		 //Character Name
		 characterName = text_creation( "abcdefghijklmnopqrstuvwxyz", 0, 4, 0.68);
		 characterName.parameters.font= "120px Arial";
		 characterName.parameters.fillStyle= "White";
		 characterName.posX = 3;
		 characterName.posY =  -12;
		 characterName.posZ=  -2;
		 characterName.position.set( characterName.posX, characterName.posY, characterName.posZ);
		 characterName.scale.set(24,3.5,1);
		 characterName.name = "characterName";
		 characterName.update();
		 //Image Source
		 imageSource = text_creation( "Link to Image Source", 0, 4, 0.68);
		 imageSource.parameters.font= "100px Arial";
		 imageSource.parameters.fillStyle= "palegoldenrod";
		 imageSource.posX = 19;
		 imageSource.posY =  -22;
		 imageSource.posZ=  -2;
		 imageSource.position.set( imageSource.posX, imageSource.posY, imageSource.posZ);
		 imageSource.scale.set(24,3.5,1);
		 imageSource.name = "imageSource";
		 imageSource.url = null;
		 imageSource.update();		 		 
		 
		 // About
		 about = text_creation( "About", 0, 3, 0.8);
		 about.parameters.font= "135px Arial";
		 about.parameters.fillStyle= "#4169E1";
		 about.posX = -19;
		 about.posY =  -22;
		 about.posZ=  -2;
		 about.position.set( about.posX, about.posY, about.posZ);
		 about.scale.set(14,3,1);
		 about.name = "About";
		 about.update();		 
		 
		 // Section Title
		 sectionTitle = text_creation( "Credits:", 0, 3, 0.8);
		 sectionTitle.parameters.font= "135px Arial";
		 sectionTitle.parameters.fillStyle= "Gold";
		 sectionTitle.position.set(-19.5, 22, -1.9);
		 sectionTitle.scale.set(23,5,1);
		 sectionTitle.name = "sectionTitle";
		 sectionTitle.update();		
		 
		 // Card
		 
		 
		 // Card Text
		 cardText = text_creation( "...", 0, 3, 0.8);
		 cardText.parameters.font= "135px Arial";
		 cardText.parameters.fillStyle= "White";
		 cardText.position.set(0, -10, -1.9);
		 cardText.scale.set(23,5,1);
		 cardText.name = "Card Text";
		 cardText.update();				 
		 
		 // Return to Start Screen
		 returnToStartScreen = text_creation( "Return to Start Screen", 0, 3, 0.8);
		 returnToStartScreen.parameters.font= "115px Arial";
		 returnToStartScreen.parameters.fillStyle= "White";
		 returnToStartScreen.posX = -19;
		 returnToStartScreen.posY =  -22;
		 returnToStartScreen.posZ=  -2;
		 returnToStartScreen.position.set( returnToStartScreen.posX, returnToStartScreen.posY, returnToStartScreen.posZ);
		 returnToStartScreen.scale.set(14,3,1);
		 returnToStartScreen.name = "Return";
		 returnToStartScreen.update();		 
		 
		 
		 //Fills categories
		 categories = [];
		 // Categories Title
		 Categories = text_creation( "Categories:", 0, 3, 0.67);
		 Categories.parameters.font= "135px Arial";
		 Categories.parameters.fillStyle= "White";
		 Categories.position.set( 0, 22, -2);
		 Categories.scale.set(23,5,1);
		 Categories.name = "Categories";
		 Categories.update();
		 categories.push(Categories);
		 
		 // Animals
		 animals = text_creation( "Animals", 0, 3, 0.7);
		 animals.parameters.font= "135px Arial";
		 animals.parameters.fillStyle= "#A070F0";
		 animals.posX = -9;
		 animals.posY =  13;
		 animals.posZ = -2;
		 animals.position.set( animals.posX, animals.posY, animals.posZ);
		 animals.scale.set(14,3,1);
		 animals.name = "animals";
		 animals.includeCards = true;
		 animals.credits = true;
		 animals.update();
		 categories.push(animals);
		 
		 // Anime
		 anime = text_creation( "Animes", 0, 3, 0.7);
		 anime.parameters.font= "135px Arial";
		 anime.parameters.fillStyle= "Crimson";
		 anime.posX = -18;
		 anime.posY =  17;
		 anime.posZ = -2;
		 anime.position.set( anime.posX, anime.posY, anime.posZ);
		 anime.scale.set(14,3,1);
		 anime.name = "anime";
		 anime.includeCards = true;
		 anime.credits = true;
		 anime.update();
		 categories.push(anime);
		 
		 // Cartoon
		 cartoon = text_creation( "Cartoons", 0, 3, 0.7);
		 cartoon.parameters.font= "135px Arial";
		 cartoon.parameters.fillStyle= "orangered";
		 cartoon.posX = 0;
		 cartoon.posY =  17;
		 cartoon.posZ = -2;
		 cartoon.position.set( cartoon.posX, cartoon.posY, cartoon.posZ);
		 cartoon.scale.set(14,3,1);
		 cartoon.name = "cartoon";
		 cartoon.includeCards = true;
		 cartoon.credits = true;
		 cartoon.update();
		 categories.push(cartoon);
		 
		 // Games
		 game = text_creation( "Games", 0, 3, 0.7);
		 game.parameters.font= "135px Arial";
		 game.parameters.fillStyle= "Lime";
		 game.posX = 18;
		 game.posY =  17;
		 game.posZ = -2;
		 game.position.set( game.posX, game.posY, game.posZ);
		 game.scale.set(14,3,1);
		 game.name = "game";
		 game.includeCards = true;
		 game.credits = true;
		 game.update();
		 categories.push(game);
		 
		 // cardSheet
		 cardSheet = text_creation( "Card Sheet", 0, 3, 0.8);
		 cardSheet.parameters.font= "135px Arial";
		 cardSheet.parameters.fillStyle= "#3f3f3f";
		 cardSheet.posX = 0;
		 cardSheet.posY =  -22;
		 cardSheet.posZ=  -2;
		 cardSheet.position.set( cardSheet.posX, cardSheet.posY, cardSheet.posZ);
		 cardSheet.scale.set(14,3,1);
		 cardSheet.name = "cardSheet";
		 cardSheet.update();		 
		 
		 // Board Display
		 boardDisplay = text_creation( "Board Display", 0, 3, 0.8);
		 boardDisplay.parameters.font= "135px Arial";
		 boardDisplay.parameters.fillStyle= "#3f3f3f";
		 boardDisplay.posX = -17;
		 boardDisplay.posY =  15;
		 boardDisplay.posZ=  -2;
		 boardDisplay.position.set( boardDisplay.posX, boardDisplay.posY, boardDisplay.posZ);
		 boardDisplay.scale.set(14,3,1);
		 boardDisplay.name = "boardDisplay";
		 boardDisplay.update();		
		 
		 // List Display
		 listDisplay = text_creation( "List Display", 0, 3, 0.8);
		 listDisplay.parameters.font= "135px Arial";
		 listDisplay.parameters.fillStyle= "#3f3f3f";
		 listDisplay.posX = -2;
		 listDisplay.posY =  15;
		 listDisplay.posZ=  -2;
		 listDisplay.position.set( listDisplay.posX, listDisplay.posY, listDisplay.posZ);
		 listDisplay.scale.set(14,3,1);
		 listDisplay.name = "listDisplay";
		 listDisplay.update();		
		 
	 }
	 
	 // Setting the cards 
	 function divide_cards_into_teams(){
		 //Help from http://www.color-blindness.com/coblis-color-blindness-simulator/
		 // "Blue" - Team Aqua
		 // "Red" - Team Magma
		 // "Dark Grey" - Civilian 
		 // "Assassin" - 
		 var cardsArray= ["Blue","Red","Dark Grey","Assassin" ];
		 console.log("Cards Array Lengt : "+cardsArray.length);
		 //cardsArray.push
		 
	 }
	 
	 // Generate Unique card with a White Background
	 function create_White_Card(){
		 //card;
		 if(saveCardWhiteTexture == null){
			 var loader = new THREE.TextureLoader();
			 loader.crossOrigin = true;
			 saveCardWhiteTexture = loader.load( 'Images/Additional Images/whiteBackground.png' );
			 saveCardWhiteTexture.minFilter = THREE.LinearFilter;
		 }
		 var Cards = new THREE.SpriteMaterial( { map: saveCardWhiteTexture, color: 0xffffff } );
		 return Cards;
	 }
	 
	 // Generate Unique card with a Black Background
	 function create_Black_Card(){
		 //card;
		 if(saveCardBlackTexture == null){
			 var loader = new THREE.TextureLoader();
			 loader.crossOrigin = true;
			 saveCardBlackTexture = loader.load( 'Images/Additional Images/blackBackground.png' );
			 saveCardBlackTexture.minFilter = THREE.LinearFilter;
		 }
		 var Cards = new THREE.SpriteMaterial( { map: saveCardBlackTexture, color: 0xffffff } );
		 return Cards;
	 }
	  
	 // Left Score Creation
	 function create_Left_Score(){
		 //Score
		 if(saveLeftScoreTexture == null){
			 var loader = new THREE.TextureLoader();
			 loader.crossOrigin = true;
			 saveLeftScoreTexture = loader.load( 'Images/Additional Images/leftScores.png' );
			 saveLeftScoreTexture.minFilter = THREE.LinearFilter;
		 }
		 var Score = new THREE.SpriteMaterial( { map: saveLeftScoreTexture, color: 0xffffff } );
		 return Score;
	 }
	 
	 // Right Score Creation
	 function create_Right_Score(){
		 //Score
		 if(saveRightScoreTexture == null){
			 var loader = new THREE.TextureLoader();
			 loader.crossOrigin = true;
			 saveRightScoreTexture = loader.load( 'Images/Additional Images/rightScores.png' );
			 saveRightScoreTexture.minFilter = THREE.LinearFilter;
		 }
		 var Score = new THREE.SpriteMaterial( { map: saveRightScoreTexture, color: 0xffffff } );
		 return Score;
	 }
	  
	 //
	 function create_Square(){
		 var geometry = new THREE.PlaneBufferGeometry (7, 6,0);
		 var material = new THREE.MeshBasicMaterial( { color: 0xfafafa } );
		 var cards = new THREE.Mesh( geometry, material );
		 //cards.material.transparent = true;
		 //cards.material.opacity = 0.3; 
		 cards.name = "cards"; 
		 return cards;
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
	 
	 // Selection Creation for the Credits Selection
	 // SelectionNumber is the number order of the Selections starting from 0 - > 9
	 function credits_Selection_Creation( selectionNumber){
		 var selection = text_creation( "selection", 0, 3, 0.8);
		 selection.parameters.font= "95px Arial";
		 selection.parameters.fillStyle= "Black";
		 selection.posX = -16.5;
		 selection.posY =  selectionNumber*-2.5 + 5;
		 selection.posZ = -2.9;
		 selection.position.set( selection.posX, selection.posY, selection.posZ);
		 selection.scale.set(14,3,1);
		 selection.arrayNumber = 0;
		 selection.name = "Selection";
		 selection.parameters.align = "left"
		 selection.update();
		 return selection;
	 }
	 
}
window.onload = init;