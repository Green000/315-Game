

function startGame2(){  //Called afterwards to ensure game is fully loaded

game2 = new Phaser.Game(648, 648, Phaser.CANVAS, 'phaser-example2', { preload: preload, create: create, update: update, render: render });


/*----variables----*/
var userId = 2;
var player;
var cursors;

var bullet;
var bullets;
var bulletTime = 0;

var stars;
var score = 0;
var scoreText;
var winText;

var count = 0;

function preload() {
    //all image files are in 'assets' folder
    game2.load.image('universe', 'assets/universe.png');
    game2.load.image('bullet', 'assets/bullets.png');
    game2.load.image('ship', 'assets/ship.png');
    game2.load.image('star', 'assets/star.png');

}


function create() {     //called when object is created

    socket.on('onconnected', function(msg){ //get user's unique id
        console.log('user id = '+ msg.id);
        userId = msg.id;
    });
	userId = Math.random();
	console.log('testerino' + startGame.userId);

    //  This will run in Canvas mode, so let's gain a little speed and display
    game2.renderer.clearBeforeRender = false;
    game2.renderer.roundPixels = true;

    //  We need arcade physics
    game2.physics.startSystem(Phaser.Physics.ARCADE);

    game2.desiredFPS = 1;

    //  A spacey background
    game2.add.tileSprite(-100,-100,900,700,'universe');

    //  Our ships bullets
    bullets = game2.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;

    //  All 40 of them
    bullets.createMultiple(40, 'bullet');
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 0.5);

    //  Our player ship
    player = game2.add.sprite(game2.world.centerX, game2.world.centerY + 200, 'ship');
    player.anchor.set(0.5);

    //  and its physics settings
    game2.physics.enable(player, Phaser.Physics.ARCADE);

    player.body.drag.set(500);
    player.body.maxVelocity.set(1000);

    //  Game input
    cursors = game2.input.keyboard.createCursorKeys();
    game2.input.keyboard.addKeyCapture([ Phaser.Keyboard.Z ]);

    stars = game2.add.group();
    stars.enableBody = true;
    stars.physicsBodyType = Phaser.Physics.ARCADE;

    createStars();  //create temp stars for collision testing
    
    scoreText = game2.add.text(0,550,'Score:',{font: '32px Arial',fill: '#fff'});
    winText = game2.add.text(game2.world.centerX-50, game2.world.centerY, 'You Win!', {font: '32px Arial',fill: '#fff'});
    winText.visible = false;  

}

function update() { //TODO: listen for server commands and do these same things for player 2 rather than from client commands
    game2.physics.arcade.overlap(bullets,stars,collisionHandler,null,this);
    
    socket.on('chat', function(msg) {  //Updates p2 from server
        //console.log(msg.id);
        if (msg.id != userId){
            player.x = msg.x;
            player.y = msg.y;
            player.rotation = msg.rotation;
            if (msg.fire){
                fireBullet();
            }
        }
    });

    screenWrap(player);

    bullets.forEachExists(screenWrap, this);

     scoreText.text = 'Stars:' + score;

    if(score == 0) {     //TODO: instead of points have it display number stars
        winText.visible = true;
        scoreText.visible = false;
    }

}

function fireBullet () {    //TODO: same as above, make another function that does this except for using server commands to update screen 2

    if (game2.time.now > bulletTime)
    {
        bullet = bullets.getFirstExists(false);

        if (bullet)
        {
            bullet.reset(player.body.x + 16, player.body.y + 16);
            bullet.lifespan = 2000;
            bullet.rotation = player.rotation;
            game2.physics.arcade.velocityFromRotation(player.rotation, 400, bullet.body.velocity);
            bulletTime = game2.time.now + 50;
        }
    }

}

function screenWrap (player) {  

    if (player.x < 0)
    {
        player.x = game2.width;
    }
    else if (player.x > game2.width)
    {
        player.x = 0;
    }

    if (player.y < 0)
    {
        player.y = game2.height;
    }
    else if (player.y > game2.height)
    {
        player.y = 0;
    }

}

//TODO: screen wrap for player 2

function render() {
}

function createStars(){     //TODO: make stars move randomly, starting with 1
    //for (var y = 0; y < 4; y++){
        //for (var x = 0; x < 10; x++){
            var star = stars.create(48, 50, 'star');
            star.anchor.setTo (0.5,0.5);
            score++;
        //}
    //}

    stars.x = 100;
    stars.y = 50;

    var tween = game2.add.tween(stars).to({x:200},2000,Phaser.Easing.Linear.None,true,0,1000,true);

    tween.onLoop.add(descend,this);
}

function descend(){
    stars.y ==10;
}

function collisionHandler(bullet, star){    //TODO: make destroying stars increase powerup count, also make score display # of stars
    bullet.kill();
    star.kill();

    score--;
}
}
startGame2();