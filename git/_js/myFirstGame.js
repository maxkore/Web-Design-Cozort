//lovingly stolen from http://www.lostdecadegames.com/how-to-make-a-simple-html5-canvas-game/
//...and modified heavily

// Create the canvas
// declares variable to hold the canvas object/API

/* Goals
	- Defeat waves of monsters
	- Must hit the monster, can't go off screen, cannot fly 
	- Score
	- Can move from side to side
*/

//################ SETUP CANVAS ##################
//create the canvas element
var canvas = document.createElement("canvas");
//takes canvas gets its context and puts that value in the ctx variable
var ctx = canvas.getContext("2d");
// set canvas width height
canvas.width = 512;
canvas.height = 480;
//appends the canvas to the document object
document.body.appendChild(canvas);

//################ Global variables ##################
var playing = true;
var monstersCaught = 0;
//for timing
var now;
var delta;
//for arrays
var allMonsters = [];
var allProjectiles = [];
var wave = 10;
var explodeX;
var explodeY;
var shot = false;
// for animations
var timer;
var timerThen = Math.floor(Date.now()/1000);
var timeToDie = 30;
var timerNow;
var currentTimer;
var countDown;

//sprites
const scale = 2;
const width = 32;
const height = 32;


//################ Setting up images ##################
// animated sprites learned from: https://dev.to/martyhimmel/animating-sprite-sheets-with-javascript-ag3 

var imgReady = false;
var img = new Image();
img.onload = function() {
	imgReady = true;
};
img.src = "_images/PrinceAdamSprites.png";


// Background image
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
	bgReady = true;
	console.log("background loaded successfully");
};
bgImage.src = "_images/background.png";

// Hero image
var heroReady = false;
var heroImage = new Image();
heroImage.onload = function () {
	heroReady = true;
};
heroImage.src = "_images/hero.png";

// Monster image
var monsterReady = false;
var monsterImage = new Image();
monsterImage.onload = function () {
	monsterReady = true;
};
monsterImage.src = "_images/monster.png";

// projectile image
var projectileReady = false;
var projectileImage = new Image();
projectileImage.onload = function () {
	projectileReady = true;
};
projectileImage.src = "_images/fireball.png";

// explode image
var explodeReady = false;
var explodeImage = new Image();
explodeImage.onload = function () {
	explodeReady = true;
};
explodeImage.src = "_images/explode.png";

//################ Game Objects ##################
var hero = {
	name: "Zoltar",
	health: 200,
	direction: 1,
	gravity: 9.8,
	speed: 256, // movement in pixels per second
	messages: ["Hello there!", "Hi", "Whassup!"],
	speak: function () {
		console.log(this.messages[randNum(3)]);
	},
	grounded: true,
	jump: function () {
		this.y -= 65;
	}
};

function Monster() {
	this.gravity = 100;
	this.x = Math.random()*canvas.width;
	this.y = 0;
	this.jump = function() {
		this.y = 0;
	};
	allMonsters.push(this);
}
function Projectile() {
	this.speed = 25;
	this.x = canvas.width/2;
	this.y = canvas.height/2;
	this.fired = false;
	allProjectiles.push(this);
}

var projectile = new Projectile(); 
console.log(projectile.fired);



//################ Setup Keyboard controls ##################

var keysDown = {};

addEventListener("keydown", function (e) {
	keysDown[e.key] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.key];
}, false);

//################ Functions ##################
var reset = function () {
	// hero.x = canvas.width / 2;
	// hero.y = canvas.height / 2;
	hero.x = canvas.width - 64;
	hero.y = canvas.height - 64;

	// Throw the monster somewhere on the screen randomly
	// Monster.x = 32 + (Math.random() * (canvas.width - 64));
	// Monster.y = 32 + (Math.random() * (canvas.height - 64));
	monsterWave(wave);
	projectile.x = hero.x;
	projectile.y = hero.y;
};
// generate random number
var randNum = function (x) {
	return Math.floor(Math.random() * x);
};
//speedup hero
var speedUp = function (x) {
	hero.speed += x;
};

//this function populates an array using a range of values
function range(start, end) {
	var arr = [];
	for (let i = start; i <= end; i++) {
		arr.push(i);
	}
	return arr;
}
// //this function creates new monsters based on a range using the range function
// // testing this block
function monsterWave(max) {
	for (monster in range(1, max)) {
		monster = new Monster();
	}
}
// function monsterWave(max) {
// 	for (monster in ["a",true,3,4]) {
// 		monster = new Monster();
// 	}
// }

// animated sprites learned from: https://dev.to/martyhimmel/animating-sprite-sheets-with-javascript-ag3 


function drawFrame(frameX, frameY, canvasX, canvasY) {
	ctx.drawImage(img, frameX * width, frameY * height, width, height, canvasX, canvasY, width, height);
}

const cycleLoop = [0,1];
let currentLoopIndex = 0;
let frameCount = 0;

function step(delay) {
	frameCount+=1;
	drawFrame(cycleLoop[currentLoopIndex], 1, hero.x, hero.y);
	if (frameCount > delay) {
		// console.log(frameCount);
		frameCount = 0;
		drawFrame(cycleLoop[currentLoopIndex], 1, hero.x, hero.y);
		currentLoopIndex++;
		// console.log(currentLoopIndex);
		if (currentLoopIndex >= cycleLoop.length) {
			currentLoopIndex = 0;
	}
	}
}

// #################### get user input #########################

var input = function (modifier) {
	// checks for user input
	if ("w" in keysDown && hero.grounded == true) { // Player holding up
		// hero.y -= hero.speed * modifier;\
		console.log("trying to jump...")
		hero.jump();
		hero.grounded = false;
		hero.direction = 0;
		console.log(hero.direction);
	}
	if ("s" in keysDown) { // Player holding down
		hero.y += hero.speed * modifier;
		hero.direction = 1;
	}
	if ("a" in keysDown) { // Player holding left
		hero.x -= hero.speed * modifier;
	}
	if ("d" in keysDown) { // Player holding right
		hero.x += hero.speed * modifier;
	}
	if (" " in keysDown) { // Player holding right
		projectile.fired = true;
		console.log("fire!");
	}
};



// ##################### Update #####################
var update = function (modifier) {

	//here's all the timer stuff
	timerNow = Math.floor(Date.now()/1000);
	currentTimer = timerNow - timerThen;
	countDown = timeToDie - currentTimer;

	if (countDown < 0) {
		alert("times up!");
	}

	if (hero.health < 0) {
		// console.log("he's dead!!!");
		playing = false;

	}

	if (allMonsters.length == 0) {
		console.log("next wave is ready!");
		wave+=10;
		monsterWave(wave);
	}

	if (projectile.fired == true) {
		projectile.y -= projectile.speed;
		console.log("fired!")
	}
	if (projectile.y < 0) {
		projectile.fired = false;
	}
	if (projectile.fired == false) {
		projectile.x = hero.x;
		projectile.y = hero.y;
	}

	// these are the updates!!!!
	// these are the jump conditions
	if (hero.y > canvas.height) {
		// console.log("he fell of the screen...")
		hero.y = 448;
		hero.gravity = 0;
		hero.grounded = true;
	}
	if (hero.y < canvas.height - 32) {
		// console.log("he's in the air!...")
		hero.gravity+=9.8*modifier;
	}

	if (hero.x >= canvas.width - 32) {
		hero.x = canvas.width - 32;
		console.log("he's off the screen...");
		console.log(hero.x);
	}

	if (hero.x <= 0) {
		hero.x = 0;
		console.log("he's off the screen...");
		console.log(hero.x);
	}
	if (hero.y <= 0) {
		hero.y = 0;
		console.log("he's off the top of the screen...");
		console.log(hero.y);
	}
// this is where the monsters get updated
	for (monster in allMonsters) {
		if (allMonsters[monster].y <= canvas.height) {
			allMonsters[monster].y += allMonsters[monster].gravity * modifier;
		}
		if (allMonsters[monster].y > canvas.height) {
			allMonsters[monster].jump();
			allMonsters[monster].x = randNum(canvas.width);
		}
			// console.log(allMonsters[monster].y);
	}
	

	// this is where the gravity is applied to the hero
	hero.y += hero.gravity;

	// ##### Collision detection ######
	
	// if (
	// 	hero.x <= (monster.x + 32)
	// 	&& monster.x <= (hero.x + 32)
	// 	&& hero.y <= (monster.y + 32)
	// 	&& monster.y <= (hero.y + 32)
	// ) {
	// 	++monstersCaught;
	// 	reset();
	// }
	// collision detection checking for collisions if hero touches any of the monsters in the 
	// hip hip array...

	for (monster in allMonsters) {
		if (
			hero.x <= (allMonsters[monster].x + 32) &&
			allMonsters[monster].x <= (hero.x + 32) &&
			hero.y <= (allMonsters[monster].y + 32) &&
			allMonsters[monster].y <= (hero.y + 32)
		) {
			--monstersCaught;
			hero.health-=10;
			console.log(monster);
			allMonsters.splice(monster, 1);
			console.log(allMonsters);
		}
	}
	for (monster in allMonsters) {
		if (
			projectile.x <= (allMonsters[monster].x + 32) &&
			allMonsters[monster].x <= (projectile.x + 32) &&
			projectile.y <= (allMonsters[monster].y + 32) &&
			allMonsters[monster].y <= (projectile.y + 32)
		) {
			shot = true;
			++monstersCaught;
			timeToDie+=5;
			explodeX = allMonsters[monster].x;
			explodeY = allMonsters[monster].y;
			console.log(monster);
			console.log("shot monster");
			allMonsters.splice(monster, 1);
			console.log(allMonsters);
		}
	}
	
};//end of update function


// ################# Render/Draw section ######################
var render = function (modifier) {
	if (bgReady) {
		ctx.drawImage(bgImage, 0, 0);
		// console.log("background drawn successfully")
	}

	// if (heroReady) {
	// 	ctx.drawImage(heroImage, hero.x, hero.y);
	// }
	if (imgReady) {
		step(10);
	}
	if (projectileReady) {
		ctx.drawImage(projectileImage, projectile.x, projectile.y);
		// console.log("it works");
	}
	if (explodeReady && shot == true) {
		while (timer<50) {
			ctx.drawImage(explodeImage, explodeX, explodeY);
			timer++;
		}
		timer = 0;
		shot = false;
		// console.log("it works");
	}

	// if (monsterReady) {
	// 	ctx.drawImage(monsterImage, monster.x, monster.y);
	// }
		//render monsters
	if (monsterReady) {
		for (monster in allMonsters) {
			ctx.drawImage(monsterImage, allMonsters[monster].x, allMonsters[monster].y);
		}
	}
	// for (monster in allMonsters) {
	// 	ctx.fillStyle = "#FF0000";
	// 	ctx.fillRect(allMonsters[monster].x, allMonsters[monster].y, allMonsters[monster].hitpoints * 5, 50);
	// }
	
	
	
	// Score
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Goblins caught: " + monstersCaught, 32, 32);
	// frames
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Delta: " + countDown, 256, 32);

	// Create gradient
	// Create gradient
var grd = ctx.createLinearGradient(0, 0, 200, 0);
grd.addColorStop(0, "red");
grd.addColorStop(1, "white");

// Fill with gradient
ctx.fillStyle = grd;
ctx.fillRect(10, 10, hero.health, 20)
};	

// ### ################## Main loop function ################
var main = function () {
	if (playing == false) {
		gameOver();
	}
	now = Date.now();
	delta = now - then;

	input(delta / 1000);
	update(delta / 1000);
	render(delta / 1000);
	then = now;
	// Request to do this again ASAP
	requestAnimationFrame(main);
};

// Cross-browser support for requestAnimationFrame
// var w = window;
// requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

// Let's play this game!
var then = Date.now();
reset();
main();