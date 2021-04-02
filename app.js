var main = document.getElementById("canv");
var context = main.getContext('2d');
var data = document.getElementsByClassName("cont")
main.height = 800;
main.width = 800;
var GAMEOVER = false;
var LEVEL = 1;
var LIFE = 3;
var MAX_LEVEL = 3;
var HRS = 0;
var MINUTES = 0;
var SECS = 0;
var SCORE_UNIT = 10;
var SCORE = 0;
var STOP =  false;
var START = false;
var storage = window.localStorage; 

const brick = {
    row: 1,
    column: 5,
    width: 135,
    height: 20,
    offSetLeft: 20,
    offSetTop: 20,
    marginTop: 40,
    fillColor: "#00A4E9",
    strokeColor: "#FFF"
}

let bricks = [];

var paddle = {
    x: (main.width - 50) / 2,
    y: main.height - 20,
    w: 100,
    h: 20,
    moveLeft: false,
    moveRight: false,
    speed: 10
};

var ball = {
    x: main.width / 2,
    y: main.width / 2,
    radius: 10,
    speed: 4,
    dx: 3 * (Math.random() * 2 - 1),
    dy: -10,
    speed: 10
}
createBricks();
displayStart();

function gameover() {
    if(LIFE == 0){
        GAMEOVER = true;
        STOP=true;
        swal({
            icon:"error",
            title:"you lost",
            buttons:{
                save:"save",
                retry:"retry",
            },
        }).then((value)=>{
            if("retry" === value){
                location.reload();
            }else if(value === "save"){
                swal({
                    content:{
                        element:"input",
                        attributes:{
                            placeholder:"name your run",
                            type:"text"
                        }
                    }
                }).then((value)=>{
                    storage.setItem(value,SCORE);
                    swal({
                        text:"your run has been saved",
                        icon:"success"
                    }).then(()=>{
                        location.reload();
                    })
                })
            }else if(value === null){
                location.reload();
            }
        })
    }
}
function displayStart(){
    swal({
        title:"The Bricks",
        text:"You move the paddle using a and d keys, \n the goal is to destroy as many bricks as possible \nwitouth the ball hitting the floor.",
        icon:"info",
        buttons:{
            highscores:"highscores",
            start:"start",
        },
    }).then( value =>{
        if(value === "start"){
            timer();
            loop();
        }else if(value === "highscores"){
            swal({
                title:"highscores",
                text:allStorage().toString(),
                buttons:{
                    reset:"reset",
                    ok:"ok"
                }
            }).then((val)=>{
                if(val === "reset"){
                    storage.clear();
                    swal({
                        text:"storage has been cleared",
                        icon:"success"
                    }).then(()=>{
                        loop();
                    })
                }else{
                    loop();
                }
                timer();
            });
        }else if(value === null){
            loop();
        }
    })
}


function drawPaddle() {
    context.beginPath();
    context.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);
}
function drawBall() {
    context.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
    context.fill();
    context.stroke();
}
function draw() {
    context.clearRect(0, 0, main.width, main.height);
    drawPaddle();
    drawBall();
}

function drawBricks() {
    for (let r = 0; r < brick.row; r++) {
        for (let c = 0; c < brick.column; c++) {
            let b = bricks[r][c];
            // if the brick isn't broken
            if (b.status) {
                context.fillStyle = brick.fillColor;
                context.fillRect(b.x, b.y, brick.width, brick.height);

                context.strokeStyle = brick.strokeColor;
                context.strokeRect(b.x, b.y, brick.width, brick.height);
            }
        }
    }
}

function loop() {
    draw();
    drawBricks();
    ballBrickCollision();
    moveBall();
    checkPaddle()
    movePaddle();
    gameover();
    updateDisplay();
    levelUp();
    if (!GAMEOVER) {
        requestAnimationFrame(loop)
    }
}

function updateDisplay() {
    data[0].innerHTML="lifes:"+LIFE;
    data[2].innerHTML="Score:"+SCORE;
}

function checkBall() {

    if (ball.x <= ball.radius) {
        ball.dx = -ball.dx;
    }
    if (ball.x >= main.width - ball.radius) {
        ball.dx = -ball.dx;
    }
    if (ball.y <= ball.radius) {
        ball.dy = -ball.dy;
    }
    if (ball.y >= main.height - ball.radius) {
        LIFE--;
        resetBall();
    }
}

function resetBall() {
    ball.x = (main.width - 50) / 2;
    ball.y = 250;
    ball.dx = 3 * (Math.random() * 2 - 1);
    ball.dy = -10;
}

function moveBall() {
    checkBall();
    ball.x += ball.dx;
    ball.y += ball.dy
}

function checkPaddle() {
    if (ball.x > paddle.x && ball.x < paddle.x + paddle.w && ball.y == paddle.y) {
        let collidePoint = ball.x - (paddle.x + paddle.w / 2);

        // NORMALIZE THE VALUES
        collidePoint = collidePoint / (paddle.w / 2);

        // CALCULATE THE ANGLE OF THE BALL
        let angle = collidePoint * Math.PI / 3;


        ball.dx = ball.speed * Math.sin(angle);
        ball.dy = - ball.speed * Math.cos(angle);
    }
}

function movePaddle() {
    if (paddle.moveRight) {
        if (paddle.x < main.width - paddle.w) {
            paddle.x += paddle.speed;
        }
    }
    if (paddle.moveLeft) {
        if (paddle.x > 0) {
            paddle.x -= paddle.speed;
        }
    }
}

function ballBrickCollision() {
    for (let r = 0; r < brick.row; r++) {
        for (let c = 0; c < brick.column; c++) {
            let b = bricks[r][c];
            // if the brick isn't broken
            if (b.status) {
                if (ball.x + ball.radius > b.x && ball.x - ball.radius < b.x + brick.width && ball.y + ball.radius > b.y && ball.y - ball.radius < b.y + brick.height) {

                    ball.dy = - ball.dy;
                    b.status = false; // the brick is broken
                    SCORE += SCORE_UNIT;
                }
            }
        }
    }
}

function createBricks() {
    for (let r = 0; r < brick.row; r++) {
        bricks[r] = [];
        for (let c = 0; c < brick.column; c++) {
            bricks[r][c] = {
                x: c * (brick.offSetLeft + brick.width) + brick.offSetLeft,
                y: r * (brick.offSetTop + brick.height) + brick.offSetTop + brick.marginTop,
                status: true
            }
        }
    }
}

function levelUp() {
    let isLevelDone = true;

    // check if all the bricks are broken
    for (let r = 0; r < brick.row; r++) {
        for (let c = 0; c < brick.column; c++) {
            isLevelDone = isLevelDone && !bricks[r][c].status;
        }
    }

    if (isLevelDone) {

        if (LEVEL >= MAX_LEVEL) {
            GAMEOVER = true;
            swal({
                title: "PLAY AGAIN?",
                icon:"info"
            }).then(() => {
                location.reload();
            });
            return;
        }
        brick.row++;
        createBricks();
        resetBall();
        ball.speed += 0.5;
        LEVEL++;
    }
}

document.addEventListener("keydown", (event) => {
    switch (event.key) {
        case "a":
            paddle.moveLeft = true;
            break;
        case "d":
            paddle.moveRight = true;
            break;
        case "A":
            paddle.moveLeft = true;
            break;
        case "D":
            paddle.moveRight = true;
        default:
            break;
    }
})
document.addEventListener("keyup", (event) => {
    switch (event.key) {
        case "a":
            paddle.moveLeft = false;
            break;
        case "d":
            paddle.moveRight = false;
            break;
        case "A":
            paddle.moveLeft = false;
            break;
        case "D":
            paddle.moveRight = false;
            break;
        default:
    }
})

function allStorage() {

    var values = [],
        keys = Object.keys(localStorage),
        i = keys.length;
        console.log(keys)
    while ( i-- ) {
        values.push( keys[i]+" "+localStorage.getItem(keys[i]).toString()+"\n" );
    }
    return values;
}
function timer() {
    var secs = 0;
        var id = setInterval(function(){ 
            SECS++;
            if(SECS == 60){
                MINUTES++;
                SECS=0;
            }
            if(MINUTES == 60){
                HRS++;
                MINUTES=0;
            }
            if(STOP){
                return;
            }
            data[1].innerHTML=+HRS+"h:"+MINUTES+"m:"+SECS+"s";
        }, 1000);
};