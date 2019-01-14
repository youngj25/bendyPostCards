# bendyPostCards

## Which application you choose to develop and why?
The purpose of this web application will be to develop a Postcard Creator that will allow users to upload/take pictures and add text, then afterwards emailing the postcard to a specificed person.

Quality is important. It would be better to select an simpler project and develop a high quality product, than to choose a more challenging project and sumbit it with normal/average functionality.

Within the first 1-2 days I was able to successfully send out Postcards from the web application through my Gmail. Which allowed me to send the remainder of the two weeks styling the page with Bootstrap, developing new tools, restructuring the web application to make the UI/UX nice and easy flow. 

## How to use/test the provided application
The application can be used/tested by downloading the repository, unzipping the folder. If you already have Node.js installed on your computer, you can simply go to the "Node.js command prompt" or search for it in your start menu. After Node.js is downloaded, simply maneuver to where you downloaded the repository by using 'cd' and then the folder name. Once you reach the folder destination, go into and then type the following text into the Node.js command prompt, "node server_Postal". This will start the application. After which, go onto any of web browsers at your dispoal and type "localhost:9000" into the web browsers address bar. This web application was built to useable with any browser in mind.

## What Operating System (+ service pack) and libraries are required
This application requires Node.js/Express.js, Socket.io, Three.js, Bootstrap.js and jscolor.


## Any design decisions or behavioral clarifications that illustrate how you program functions and why

#### Server - Client Communication
The initial plans were for the user to enter an email address and password, then for the server to validate/send a test email to the specificed email address prior to letting the user access the Post Card creator. However, after developing the web application, it became apparent that this idea was flawed and it would be best to leave the web application itself easily acessible, then when the user wants to send the postcard have them input the following information. However, the user will still have to provide a working email address and password to get access to an email postcard history. herefore Client will only communicate with the Server in two scenarios... When the Client wants to send the postcard or when the user tries to view their history.

### Text Insertion
Additionally, a text box input was decided for the text inclusion such that mobile/tablet users would be able to utalize the web application as well. If text was inserted by simply clicking a stop then typing, it would be difficult for mobile users to access this feature without a keyboard. 

### Future Development
In the future development, it would be nice to incorporate features like drag and drop insertions for pictures and eventually produce gifs. More importantly, a great deal of focus would be spent to ensure that the scaling and proportion of the web application is appropriate regardless of the device screen.

Additionally a problem that is still persisting, if a users enters an email like mines for example ,"youngj25@southernct.edu", it is difficult to identify which email service this email address truly belongs to. There are numerous other email address that probably refer to school/work that is really apart of a different services. By default, the web server is set to 'Outlook365' if it can not determine the users web services, but there should be a better way to go about this.


## What frameworks/tools/libraries(and versions) are necessary to use and test your application:
  - Node.js/Express.js
  	- Version: 10.15.0
	- Purpose: It is more convenient working with mainly one language, Javascript, on both the Server and Client side
	- License: 
	- Websites: https://nodejs.org/en/

  - Bootstrap
	 - Version: 4.0.0
	 - Purpose: Web Page Styling
	 - License: MIT license
	 - Websites: https://getbootstrap.com/
  
  
  - jsColor
	 - Version: 2.0.5
	 - Purpose: Canvas/Text Color Selection
	 - License: GNU GPL license v3
	 - Websites: http://jscolor.com/  
  
  - Socket.io
	 - Version: 2.1.1
	 - Purpose: Fast/Light Weight Communication between client and server
	 - License: MIT License
	 - Websites: https://socket.io/
  
  - Three.js
	 - Version: r83
	 - Purpose: Canvas Toolbar
	 - License: MIT License
	 - Websites: http://threejs.org/  
 
 - Nodemailer
 	- Version: 
	- Purpose: Convenient way to send emails with Node.js server
	- License: MIT License
	- Website: https://nodemailer.com/about/
 
 
  
## If you use any external libraries or code-snippets, you must provide the following information for each (credit must be given to others):

### Server
  - Email Firewall Prevented Nodemailer
    - Purpose: To notify the user that there email settings prevented the server from sending the postcard.
    - Website: https://stackoverflow.com/questions/14654736/nodemailer-econnrefused
  - List of Available Email Services from Nodemailer website
    - Purpose: To find the correct service for the users email address
    - Website: https://nodemailer.com/smtp/well-known/
### Index (HTML)
  - Title Image "Bendy Postcards" Source - Flaming Text 
    - Purpose: To give the Web Application a nice title style
    - Website: https://flamingtext.com/logo/Design-Crafts?_variations=true
    
    
    
    
    
    

