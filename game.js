let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let count;
let loop;
let seg;
let gameOver = 0;
let audio = new Audio("jump_09.wav");
let sound = new Audio("button.wav");
let pick=new Audio("pickup.mp3")
let song;
let blast;
let x1;
let y1;
let x2;
let y2;
let unitVector;
let dotProd;
let dashX;
let dashY;
let collDis;
let bestScore = document.getElementById('show');
let s = 0;
let max = -1;
let color = ["#F5FF25", "#B625FF", "#FF2560", "#FF8125"];
let truth = [false, true];
let curr;
let pause = document.getElementById("pause");
let resume;
let restart;
let overlay = document.getElementById('overlay');
let parts;
let particles;
let ball;
let obs;
let click;
let sprites;
let endsongs = ["dilwale.mp3", "eeee.mp3", "Astronomia.mp3"];
window.onopen = function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    clearInterval(blast);
    clearInterval(loop);//to stop setting multiple setIntervals on resize
    setup();
}
window.onresize = function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    clearInterval(blast);
    clearInterval(loop);//to stop setting multiple setIntervals on resize
    setup();
}
window.onload = function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    clearInterval(blast);
    clearInterval(loop);
    setup();
}
function distance(x1, y1, x2, y2) {
    let dx = x1 - x2;
    let dy = y1 - y2;
    return (Math.sqrt((dx * dx) + (dy * dy)))
}
function norm(x1, y1, x2, y2){
    let n={
        x:(x2-x1)/distance(x1, y1, x2, y2),
        y:(y2-y1)/distance(x1, y1, x2, y2)
    }
    return n;
}
function rand(min, max) {
    return (Math.random() * (max - min + 1) + min);
};
function explode() {
    song = new Audio(`${endsongs[Math.floor(rand(0, 3))]}`);
    song.play();
    clearInterval(loop);
    //for the particles
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    particles = new Array();
    for (let i = 0; i < 20; i++) {
        var r = rand(3, 5);
        var x = ball.x;
        var y = ball.y;
        var dx = rand(-15, 15);
        var dy = rand(-15, 15);
        var colors = color[Math.floor(rand(0, 4))];
        particles.push(new Particle(x, y, dx, dy, r, colors));
    }
    blast = setInterval(function () {
        ctx.clearRect(0, 0, innerWidth, innerHeight);
     //   for (let i = 0; i < obs.length; i++) {
       //     obs[i].draw();
        //}
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
        }
        score();
        best();
    }, 16);
    gameOver = 1;
    restartButton();

}

class Ball {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.radius = radius;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, true);
        ctx.fillStyle = this.color;
        ctx.fill();
    };
    update() {
        this.y -= this.vy;
        curr = this.y;
        this.vy -= 0.25;
        //checks if the ball has crashed on the floor
        if (this.y >= canvas.height - this.radius) {

            clearInterval(loop);
            explode();
        }
        this.draw();
    };
}
class Particle extends Ball {
    constructor(x, y, vx, vy, radius, color) {
        super(x, y, radius, color);//inherits params from Ball class
        this.vx = vx;
        this.vy = vy;
    }
    update() {
        if (this.x + this.radius > innerWidth || this.x - this.radius < 0) {
            this.vx = -this.vx;
        }
        if (this.y + this.radius > innerHeight || this.y - this.radius < 0) {
            this.vy = -this.vy;
        }
        this.x += this.vx;
        this.y += this.vy;
        this.draw();
    };
}
//stores info about each arc
class Part {
    constructor(start, end, color) {
        this.start = start;
        this.end = end;
        this.color = color;
    }

}

class Obstacle {
    constructor(x, y, radius, startAngle, endAngle, segments) {
        this.x = x;
        this.y = y;
        this.vy = 1.5;
        this.radius = radius;
        this.startAngle = startAngle;
        this.endAngle = endAngle;
        this.segments = segments;
        this.angVel = (Math.PI) / 150;
        this.dir = Math.floor(rand(0, 1));
        this.truth;
        this.parts;
        let k;
        if (this.dir === 0) {
            k = 1;
            this.truth = false;
        }
        else {
            k = -1;
            this.endAngle *= k;
            this.truth = true;
        }
    }

    draw() {
        var df = 0;
        this.parts = new Array();

        for (let i = 0; i < this.segments; i++) {

            ctx.beginPath();
            ctx.strokeStyle = color[i];
            ctx.lineCap="butt";
            this.parts.push(new Part(this.startAngle + df, this.endAngle + df, color[i]));
            ctx.arc(this.x, this.y, this.radius, df + this.startAngle, df + this.endAngle, this.truth);
            ctx.lineWidth = canvas.height / 40;
            ctx.stroke();
            if (this.dir === 0) {
                df += (2 * Math.PI / this.segments);
            }
            else {
                df -= (2 * Math.PI / this.segments);
            }

        }
    };
    update() {
        //for clockwise rotation
        if (this.dir === 0) {
            this.startAngle += this.angVel;
            this.endAngle += this.angVel;
        }
        //for anti-clockwise rotation
        else {
            this.startAngle -= this.angVel;
            this.endAngle -= this.angVel;
        }
        this.draw();

        if ((canvas.height / 2) - curr > 1.2) {
            this.y += this.vy;
        }
        this.draw();
    };
    collide() {
        var dist = (ball.y - this.y);
        //bottom half
        if (dist <= (ball.radius + this.radius + canvas.height / 80) && dist >= (this.radius - ball.radius - canvas.height / 80)) {
            if (this.dir === 0)
                this.endgame((Math.PI / 2), ((Math.PI / 2) + (2 * Math.PI / this.segments)), 0, 0); //clockwise
            else
                this.endgame(((2 * Math.PI / this.segments) - (3 * Math.PI / 2)), (-3 * Math.PI / 2), 1, 0); //anti-clockwise
        }
        dist = (this.y - ball.y);
        //top half
        if (dist <= (ball.radius + this.radius + canvas.height / 80) && dist >= (this.radius - ball.radius - canvas.height / 80)) {
            if (this.dir === 0)
                this.endgame(((3 * Math.PI / 2) - (2 * Math.PI / this.segments)), (3 * Math.PI / 2), 0, 1); //clockwise
            else
                this.endgame((-Math.PI / 2), ((-Math.PI / 2) - (2 * Math.PI / this.segments)), 1, 1); //anti-clockwise
        }
    };
    endgame(start, end, portion, dir) {
        if (portion === 0 && dir === 0 || portion === 1 && dir === 1) {
            for (let j = 0; j < this.parts.length; j++) {

                if (this.parts[j].color !== ball.color) {
                    if ((Math.abs(this.parts[j].end % (Math.PI * 2)) > Math.abs(start) && Math.abs(this.parts[j].end % (Math.PI * 2)) < Math.abs(end))) {
                  
                        explode();
                    }
                }
            }
        }
        else if (portion === 0 && dir === 1 || portion === 1 && dir === 0) {
            for (let j = 0; j < this.parts.length; j++) {

                if (this.parts[j].color !== ball.color) {
                    if ((Math.abs(this.parts[j].start % (Math.PI * 2)) > Math.abs(start) && Math.abs(this.parts[j].start % (Math.PI * 2)) < Math.abs(end))) {

                        explode();
                    }
                }
            }
        }
    };
}
//polygon class inherits from obstacle and then use the angles to draw the lines of the polygon 
class Polygon extends Obstacle{
    constructor(x, y, radius, startAngle, endAngle, segments){
        super(x,y,radius, startAngle, endAngle, segments);
        this.parts;
       
    }
    draw(){
        var df = 0;
        this.parts = new Array();

        for (let i = 0; i < this.segments; i++) {

            ctx.beginPath();
            ctx.strokeStyle = color[i];
            this.parts.push(new Part(this.startAngle + df, this.endAngle + df, color[i]));
            ctx.lineCap="round";
            ctx.moveTo(this.x+this.radius*Math.cos(this.startAngle+df),this.y+this.radius*Math.sin(this.startAngle+df));
            ctx.lineTo(this.x+this.radius*Math.cos(this.endAngle+df),this.y+this.radius*Math.sin(this.endAngle+df))
            ctx.lineWidth = canvas.height / 40;
            ctx.stroke();
            if (this.dir === 0) {
                df += (2 * Math.PI / this.segments);
            }
            else {
                df -= (2 * Math.PI / this.segments);
            }

        }
    }
    collide(){
         
        for(let i=0;i<this.parts.length;i++){
            x1=this.x+this.radius*Math.cos(this.parts[i].start);
            y1=this.y+this.radius*Math.sin(this.parts[i].start);
            x2=this.x+this.radius*Math.cos(this.parts[i].end);
            y2=this.y+this.radius*Math.sin(this.parts[i].end);
            let d=distance(x1,y1,x2,y2);
            unitVector=norm(x1,y1,x2,y2);
            //dot product between the unitvector along the line and the vector joining centre of ball and one end
            //this gives the projection of the vector joining centre of ball and one end on the line itself
            dotProd=((ball.x-x1)*unitVector.x+(ball.y-y1)*unitVector.y);
            //dashX and dashY are the coordinates of the shadow of the ball on the line or the porjection of the ball on the line
            dashX=x1+(dotProd*(x2-x1)/d);
            dashY=y1+(dotProd*(y2-y1)/d);
            collDis=distance(dashX,dashY,ball.x,ball.y);
            if(collDis<=ball.radius+canvas.height/80&&(distance(dashX,dashY,x1,y1)+distance(dashX,dashY,x2,y2)<=d)&&ball.color!==this.parts[i].color)
            {   
               explode()
            }
        }    
    
    };
}
//sprite class creates new sprite animations when constructed 
class Sprite{
    constructor(y){
        this.cols = 4;
        this.rows= 2;
        this.maxF = this.cols * this.rows - 1;
        this.currF = 0;
        this.image = new Image();
        this.image.src="balls.png";
        this.frameWidth = this.image.width / this.cols;
        this.frameHeight = this.image.height / this.rows;
        this.y=y;
        this.colorchange=0;
    }
    draw(){
        let column = this.currF % this.cols; //cycles back to the start
        let row = Math.floor(this.currF / this.cols); // row 1 : 0.....row 2: 1
        ctx.drawImage(this.image, column * this.frameWidth, row * this.frameHeight, this.frameWidth, this.frameHeight, canvas.width/2-(canvas.height*0.02),this.y-(canvas.height*0.02) , canvas.height*0.045,  canvas.height*0.045);
    }
    update(i){
        this.currF++;
        //reset and start from the first sprite
        if (this.currF > this.maxF){
            this.currF = 0;
        }
       this.y=obs[i].y-(3*canvas.height/10);
        this.draw();
        if(ball.y>=this.y-(canvas.height*0.025)&&ball.y<=(this.y+(canvas.height*0.025)))
        {
            //changes color only once on picking the power up
            if(this.colorchange===0)
            {
                pick.play();
                let j=Math.floor(rand(0,obs[i+1].parts.length-1));
                ball.color=obs[i+1].parts[j].color;
                this.image.src="";
               this.colorchange++;
            }
           
          
        }
    }
}

function setup() {
    ball = new Ball(canvas.width / 2, (canvas.height / 2 + canvas.height * 0.3), canvas.height * 0.015, "#F5FF25");
    s = 0;
    max = -1;
    gameOver = 0;
    if (typeof (restart) != 'undefined' && restart != null) {
        song.pause();
        bestScore.style.display = "none";
        overlay.style.display = "none";
        restart.remove();
    }
    if (typeof (resume) != 'undefined' && resume != null) {
        resume.remove();
    }
    curr = (canvas.height / 2 + canvas.height * 0.3);
    count = -1;
    click = 0;
    pause.addEventListener('click', pauseGame);
    obs = new Array();
    sprites=new Array();
    sprites.push(new Sprite((-canvas.height / 10)));
    createObs((canvas.width / 2), (canvas.height / 5), canvas.height * 0.15);
    score();
    play();
    canvas.addEventListener('click', setBallVel);
}
function pauseGame() {
    sound.play();
    overlay.style.display = "block";
    //resume
    const res = document.createElement('img');
    document.body.appendChild(res);
    res.setAttribute("id", "resume");
    resume = document.getElementById("resume");
    resume.src = "play.svg";
    resume.addEventListener('click', function (e) {
        e.stopPropagation();
        resumeGame();
    });
    pause.removeEventListener('click', pauseGame);
    //restart
    restartButton();
    clearInterval(loop);
}
function resumeGame() {
    sound.play();
    overlay.style.display = "none";
    resume.parentNode.removeChild(resume);
    restart.parentNode.removeChild(restart);
    pause.addEventListener('click', pauseGame);
    clearInterval(loop);
    play();
}
function restartGame() {
    if (gameOver) {
        song.pause();
    }
    else
        resume.parentNode.removeChild(resume);
    overlay.style.display = "none";
    bestScore.style.display = "none";
    restart.parentNode.removeChild(restart);
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    clearInterval(blast);
    clearInterval(loop);
    setup();
}
//displays the score and stores it in local storage
function score() {
    let fontSize = Math.min(canvas.width * 0.1, canvas.height * 0.1);
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = 'white';
    if (localStorage.getItem('high') === null)
        localStorage.setItem(`high`, JSON.stringify(s));
    else if (s > JSON.parse(localStorage.getItem(`high`)))
        localStorage.setItem(`high`, JSON.stringify(s));

    ctx.fillText(s, canvas.width / 10, Math.min(canvas.height * 0.1, 500));
}
//the most important fucntion which renders the whole game at almost 60 fps
function play() {
    loop = setInterval(function () {
        render();
        score();
    }, 16);
}
//sets ball velocity based on the number of clicks. Provides a headstart if the game is started else sets a lower velocity for further clicks
function setBallVel() {
   audio.play();
    if (click === 0) {
        ball.vy = Math.min(canvas.height * 0.015, 9);
        click++;
    }
    else
        ball.vy = Math.min(canvas.height * 0.01, 4.25);
}
function best() {
    if (localStorage.getItem('high') === null)
        localStorage.setItem(`high`, JSON.stringify(s));
    else if (s > JSON.parse(localStorage.getItem(`high`)))
        localStorage.setItem(`high`, JSON.stringify(s));
    bestScore.innerHTML = `Score: ${s}<br>Best Score: ${JSON.parse(localStorage.getItem(`high`))}`;
    bestScore.style.display = "block";
}
function render() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    gameUpdate();

}
function restartButton() {
    overlay.style.display = "block";
    const rest = document.createElement('img');
    document.body.appendChild(rest);
    rest.setAttribute("id", "restart");
    restart = document.getElementById("restart");
    restart.src = "restart.svg";
    restart.addEventListener('click', function (e) {
        e.stopPropagation();
        sound.play();
        restartGame();
    });
}
function createObs(x, y, r) {
    let decide= Math.floor(rand(0, 1));
   if(decide===0)
    {
        seg = Math.floor(rand(2, 4));
        obs.push(new Obstacle(x, y, r, 0, (2 * Math.PI / seg), seg));
    }
    else{
        seg = Math.floor(rand(3, 4));
        obs.push(new Polygon(x, y, r, 0, (2 * Math.PI / seg), seg));
    }
    count++;
    obs[count].draw();
}
function gameUpdate() {
    if (click !== 0)
        ball.update();
    else
        ball.draw();
    for (let i = 0; i < obs.length; i++) {
        obs[i].update();
        sprites[i].update(i);
        obs[i].collide();
        if (ball.y <= obs[i].y && ball.y >= obs[i].y - obs[i].radius && (i + 1) > max) {
            s = i + 1;
            max = s;
            sprites.push(new Sprite(obs[i].y - (3 * canvas.height / 10)))
            createObs((canvas.width / 2), obs[i].y - (3 * canvas.height / 5), canvas.height * 0.15);
            obs[i + 1].angVel += (Math.PI) / 1000;
        }
    }
}
