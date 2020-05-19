class Player {
    constructor(number, control) {
        this.number = number;
        this.control = control;
        this.canvas = document.getElementById(`canvas${this.number}`);
        this.ctx = this.canvas.getContext("2d");
        this.count;
        this.seg;
        this.gameOver = 0;
        this.audio = new Audio("jump_09.wav");
        this.sound = new Audio("button.wav");
        this.pick = new Audio("pickup.mp3")
        this.song;
        this.x1;
        this.y1;
        this.x2;
        this.y2;
        this.unitVector;
        this.resumeL=0;
        this.restartL=0;
        this.dotProd;
        this.dashX;
        this.dashY;
        this.collDis;
        this.bestScore = document.getElementById(`show${this.number}`);
        this.s = 0;
        this.max = -1;
        this.color = ["#F5FF25", "#B625FF", "#FF2560", "#FF8125"];
        this.truth = [false, true];
        this.curr;
        this.pause = document.getElementById(`pause${this.number}`);
        this.pause.addEventListener('click',()=>{
            this.pauseGame();
        });
        this.resume;
        this.restart;
        this.overlay = document.getElementById(`overlay${this.number}`);
        this.parts;
        this.particles;
        this.ball;
        this.obs;
        this.click;
        this.up = false;
        this.sprites;
        this.endsongs = ["dilwale.mp3", "eeee.mp3", "Astronomia.mp3"];
    }
    explode() {
        this.song = new Audio(`${this.endsongs[Math.floor(rand(0, 3))]}`);
        this.song.play();
        clearInterval(this.loop);
        //for the particles
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.particles = new Array();
        for (let i = 0; i < 20; i++) {
            var r = rand(3, 5);
            var x = this.ball.x;
            var y = this.ball.y;
            var dx = rand(-15, 15);
            var dy = rand(-15, 15);
            var colors = this.color[Math.floor(rand(0, 4))];
            this.particles.push(new Particle(x, y, dx, dy, r, colors,this.number));
        }
    
        this.blast = setInterval(()=> {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            for (let i = 0; i < this.particles.length; i++) {
                this.particles[i].update();
            }
            this.score();
            this.best();
        }, 16);
        this.gameOver = 1;
        this.restartButton();

    }
    pauseGame() {
        this.sound.play();
        this.overlay.style.display = "block";
        //resume
        const res = document.createElement('img');
        document.body.appendChild(res);
        res.setAttribute("id", `resume${this.number}`);
        this.resume = document.getElementById(`resume${this.number}`);
        this.resume.src = "play.svg";
        console.log(this.resumeL)
        this.resume.addEventListener('click', (e) => {
            e.stopPropagation();
            this.resumeGame();

        });
        //restart
        this.restartButton();
        clearInterval(this.loop);
    }
    resumeGame() {
        this.sound.play();
        this.overlay.style.display = "none";
        this.resume.parentNode.removeChild(this.resume);
        this.restart.parentNode.removeChild(this.restart);
        clearInterval(this.loop);
        this.play()
    }
    restartGame() {
        if (this.gameOver) {
            this.song.pause();
        }
        else
            this.resume.parentNode.removeChild(this.resume);
        this.overlay.style.display = "none";
        this.bestScore.style.display = "none";
        this.restart.parentNode.removeChild(this.restart);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        clearInterval(this.blast);
        clearInterval(this.loop);
        this.setup();
    }
    //displays the score and stores it in local storage
    score() {
        let fontSize = Math.min(this.canvas.width * 0.1, this.canvas.height * 0.1);
        this.ctx.font = `${fontSize}px Arial`;
        this.ctx.fillStyle = 'white';
        if (localStorage.getItem(`high${this.number}`) === null)
            localStorage.setItem(`high${this.number}`, JSON.stringify(this.s));
        else if (this.s > JSON.parse(localStorage.getItem(`high${this.number}`)))
            localStorage.setItem(`high${this.number}`, JSON.stringify(this.s));

        this.ctx.fillText(this.s, this.canvas.width / 10, Math.min(this.canvas.height * 0.1, 500));
    }
    restartButton() {
        this.overlay.style.display = "block";
        const rest = document.createElement('img');
        document.body.appendChild(rest);
        rest.setAttribute("id", `restart${this.number}`);
        this.restart = document.getElementById(`restart${this.number}`);
        this.restart.src = "restart.svg";
        this.restart.addEventListener('click', (e) => {
            e.stopPropagation();
            this.sound.play();
            this.restartGame();
            console.log("called")
              
            });
    }
    setup() {
            this.ball = new Ball(this.canvas.width / 2, (this.canvas.height / 2 + this.canvas.height * 0.3), this.canvas.height * 0.015, "#F5FF25",this.number);
            this.s = 0;
            this.max = -1;
            this.gameOver = 0;
            if (typeof (this.restart) != 'undefined' && this.restart != null&&typeof (this.resume) === 'undefined' && this.resume === null) {
                this.song.pause();
                this.bestScore.style.display = "none";
                this.overlay.style.display = "none";
                this.restart.remove();
            }
            if (typeof (this.resume) != 'undefined' && this.resume != null) {
                this.resume.remove();
            }
            this.curr = (this.canvas.height / 2 + this.canvas.height * 0.3);
            this.count = -1;
            this.click = 0;
          
       
            this.obs = new Array();
            this.sprites = new Array();
            this.sprites.push(new Sprite((-this.canvas.height / 10),this.number));
            this.createObs((this.canvas.width / 2), (this.canvas.height / 5), this.canvas.height * 0.15);
            this.score();
          
   
          
        
        this.play();
    }
    
    //the most important fucntion which renders the whole game at almost 60 fps
    play(){
        this.loop = setInterval( ()=> {
          
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.render();
                this.score();
        
           
        }, 16);
    }
    //sets ball velocity based on the number of clicks. Provides a headstart if the game is started else sets a lower velocity for further clicks
    setBallVel() {
        this.audio.play();
        if (this.click === 0) {
            this.ball.vy = Math.min(this.canvas.height * 0.015, 9);
            this.click++;
        }
        else
            this.ball.vy = Math.min(this.canvas.height * 0.01, 4.25);
    }
    best() {
        if (localStorage.getItem(`high${this.number}`) === null)
            localStorage.setItem(`high${this.number}`, JSON.stringify(this.s));
        else if (this.s > JSON.parse(localStorage.getItem(`high`)))
            localStorage.setItem(`high${this.number}`, JSON.stringify(this.s));
        this.bestScore.innerHTML = `Score: ${this.s}<br>Best Score: ${JSON.parse(localStorage.getItem(`high${this.number}`))}`;
        this.bestScore.style.display = "block";
    }
    render() {
        this.gameUpdate();

    }
    createObs(x, y, r) {
        let decide = Math.floor(rand(0, 1));
        if (decide === 0) {
            this.seg = Math.floor(rand(2, 4));
            this.obs.push(new Obstacle(x, y, r, 0, (2 * Math.PI / this.seg), this.seg,this.number));
        }
        else {
            this.seg = Math.floor(rand(3, 4));
            this.obs.push(new Polygon(x, y, r, 0, (2 * Math.PI / this.seg), this.seg,this.number));
        }
        this.count++;
        this.obs[this.count].draw();
    }
    gameUpdate() {
        if (this.click !== 0)
            this.ball.update();
        else
            this.ball.draw();
        for (let i = 0; i < this.obs.length; i++) {
            this.obs[i].update();
            this.sprites[i].update(i);
            this.obs[i].collide();
            if (this.ball.y <= this.obs[i].y && this.ball.y >= this.obs[i].y - this.obs[i].radius && (i + 1) > this.max) {
                this.s = i + 1;
                this.max = this.s;
                this.sprites.push(new Sprite(this.obs[i].y - (3 * this.canvas.height / 10),this.number))
                this.createObs((this.canvas.width / 2), this.obs[i].y - (3 * this.canvas.height / 5), this.canvas.height * 0.15);
                this.obs[i + 1].angVel += (Math.PI) / 1000;
            }
        }
    }
}
// Functions for mathematical utility
function distance(x1, y1, x2, y2) {
    let dx = x1 - x2;
    let dy = y1 - y2;
    return (Math.sqrt((dx * dx) + (dy * dy)))
}
function norm(x1, y1, x2, y2) {
    let n = {
        x: (x2 - x1) / distance(x1, y1, x2, y2),
        y: (y2 - y1) / distance(x1, y1, x2, y2)
    }
    return n;
}
function rand(min, max) {
    return (Math.random() * (max - min + 1) + min);
};
//--------------------x----------------------//

class Ball {
    constructor(x, y, radius, color,number) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.radius = radius;
        this.number=number;
    }

    draw() {
        players[this.number].ctx.beginPath();
        players[this.number].ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, true);
        players[this.number].ctx.fillStyle = this.color;
        players[this.number].ctx.fill();
    };
    update() {
        this.y -= this.vy;
        players[this.number].curr = this.y;
        this.vy -= 0.25;
        //checks if the ball has crashed on the floor
        if (this.y >= players[this.number].canvas.height - this.radius) {

            clearInterval(players[this.number].loop);
            players[this.number].explode();
        }
        this.draw();
    };
}
class Particle extends Ball {
    constructor(x, y, vx, vy, radius, color,number) {
        super(x, y, radius, color);//inherits params from Ball class
        this.vx = vx;
        this.vy = vy;
        this.number=number;
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
    constructor(start, end, color,number) {
        this.start = start;
        this.end = end;
        this.color = color;
        this.number=number;
    }

}

class Obstacle {
    constructor(x, y, radius, startAngle, endAngle, segments,number) {
        this.x = x;
        this.y = y;
        this.vy = 2.25;
        this.radius = radius;
        this.startAngle = startAngle;
        this.endAngle = endAngle;
        this.segments = segments;
        this.angVel = (Math.PI) / 150;
        this.dir = Math.floor(rand(0, 1));
        this.truth;
        this.parts;
        this.number=number;
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

            players[this.number].ctx.beginPath();
            players[this.number].ctx.strokeStyle = players[this.number].color[i];
            players[this.number].ctx.lineCap = "butt";
            this.parts.push(new Part(this.startAngle + df, this.endAngle + df, players[this.number].color[i],this.number));
            players[this.number].ctx.arc(this.x, this.y, this.radius, df + this.startAngle, df + this.endAngle, this.truth);
            players[this.number].ctx.lineWidth = players[this.number].canvas.height / 40;
            players[this.number].ctx.stroke();
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

        if ((players[this.number].canvas.height / 2) - players[this.number].curr > 1.2) {
            this.y += this.vy;
        }
        this.draw();
    };
    collide() {
        var dist = (players[this.number].ball.y - this.y);
        //bottom half
        if (dist <= (players[this.number].ball.radius + this.radius + players[this.number].canvas.height / 80) && dist >= (this.radius - players[this.number].ball.radius - players[this.number].canvas.height / 80)) {
            if (this.dir === 0)
                this.endgame((Math.PI / 2), ((Math.PI / 2) + (2 * Math.PI / this.segments)), 0, 0); //clockwise
            else
                this.endgame(((2 * Math.PI / this.segments) - (3 * Math.PI / 2)), (-3 * Math.PI / 2), 1, 0); //anti-clockwise
        }
        dist = (this.y - players[this.number].ball.y);
        //top half
        if (dist <= (players[this.number].ball.radius + this.radius + players[this.number].canvas.height / 80) && dist >= (this.radius - players[this.number].ball.radius - players[this.number].canvas.height / 80)) {
            if (this.dir === 0)
                this.endgame(((3 * Math.PI / 2) - (2 * Math.PI / this.segments)), (3 * Math.PI / 2), 0, 1); //clockwise
            else
                this.endgame((-Math.PI / 2), ((-Math.PI / 2) - (2 * Math.PI / this.segments)), 1, 1); //anti-clockwise
        }
    };
    endgame(start, end, portion, dir) {
        if (portion === 0 && dir === 0 || portion === 1 && dir === 1) {
            for (let j = 0; j < this.parts.length; j++) {

                if (this.parts[j].color !== players[this.number].ball.color) {
                    if ((Math.abs(this.parts[j].end % (Math.PI * 2)) > Math.abs(start) && Math.abs(this.parts[j].end % (Math.PI * 2)) < Math.abs(end))) {

                        players[this.number].explode();
                    }
                }
            }
        }
        else if (portion === 0 && dir === 1 || portion === 1 && dir === 0) {
            for (let j = 0; j < this.parts.length; j++) {

                if (this.parts[j].color !== players[this.number].ball.color) {
                    if ((Math.abs(this.parts[j].start % (Math.PI * 2)) > Math.abs(start) && Math.abs(this.parts[j].start % (Math.PI * 2)) < Math.abs(end))) {

                        players[this.number].explode();
                    }
                }
            }
        }
    };
}
//polygon class inherits from obstacle and then use the angles to draw the lines of the polygon 
class Polygon extends Obstacle {
    constructor(x, y, radius, startAngle, endAngle, segments,number) {
        super(x, y, radius, startAngle, endAngle, segments);
        this.parts;
        this.number=number;

    }
    draw() {
        var df = 0;
        this.parts = new Array();

        for (let i = 0; i < this.segments; i++) {

            players[this.number].ctx.beginPath();
            players[this.number].ctx.strokeStyle = players[this.number].color[i];
            this.parts.push(new Part(this.startAngle + df, this.endAngle + df, players[this.number].color[i],this.number));
            players[this.number].ctx.lineCap = "round";
            players[this.number].ctx.moveTo(this.x + this.radius * Math.cos(this.startAngle + df), this.y + this.radius * Math.sin(this.startAngle + df));
            players[this.number].ctx.lineTo(this.x + this.radius * Math.cos(this.endAngle + df), this.y + this.radius * Math.sin(this.endAngle + df))
            players[this.number].ctx.lineWidth = players[this.number].canvas.height / 40;
            players[this.number].ctx.stroke();
            if (this.dir === 0) {
                df += (2 * Math.PI / this.segments);
            }
            else {
                df -= (2 * Math.PI / this.segments);
            }

        }
    }
    collide() {

        for (let i = 0; i < this.parts.length; i++) {
            players[this.number].x1 = this.x + this.radius * Math.cos(this.parts[i].start);
            players[this.number].y1 = this.y + this.radius * Math.sin(this.parts[i].start);
            players[this.number].x2 = this.x + this.radius * Math.cos(this.parts[i].end);
            players[this.number].y2 = this.y + this.radius * Math.sin(this.parts[i].end);
            let d = distance(players[this.number].x1, players[this.number].y1, players[this.number].x2, players[this.number].y2);
            players[this.number].unitVector = norm(players[this.number].x1,players[this.number].y1, players[this.number].x2, players[this.number].y2);
            //dot product between the unitvector along the line and the vector joining centre of ball and one end
            //this gives the projection of the vector joining centre of ball and one end on the line itself
            players[this.number].dotProd = ((players[this.number].ball.x - players[this.number].x1) * players[this.number].unitVector.x + (players[this.number].ball.y - players[this.number].y1) * players[this.number].unitVector.y);
            //dashX and dashY are the coordinates of the shadow of the ball on the line or the porjection of the ball on the line
            players[this.number].dashX = players[this.number].x1 + (players[this.number].dotProd * (players[this.number].x2 - players[this.number].x1) / d);
            players[this.number].dashY = players[this.number].y1 + (players[this.number].dotProd * (players[this.number].y2 - players[this.number].y1) / d);
            players[this.number].collDis = distance(players[this.number].dashX, players[this.number].dashY, players[this.number].ball.x, players[this.number].ball.y);
            if (players[this.number].collDis <= players[this.number].ball.radius + players[this.number].canvas.height / 80 && (distance(players[this.number].dashX, players[this.number].dashY, players[this.number].x1, players[this.number].y1) + distance(players[this.number].dashX, players[this.number].dashY, players[this.number].x2, players[this.number].y2) <= d) && players[this.number].ball.color !== this.parts[i].color) {
                players[this.number].explode()
            }
        }

    };
}
//sprite class creates new sprite animations when constructed 
class Sprite {
    constructor(y,number) {
        this.cols = 4;
        this.rows = 2;
        this.maxF = this.cols * this.rows - 1;
        this.currF = 0;
        this.image = new Image();
        this.image.src = "balls.png";
        this.frameWidth = this.image.width / this.cols;
        this.frameHeight = this.image.height / this.rows;
        this.y = y;
        this.colorchange = 0;
        this.number=number;
    }
    draw() {
        let column = this.currF % this.cols; //cycles back to the start
        let row = Math.floor(this.currF / this.cols); // row 1 : 0.....row 2: 1
        players[this.number].ctx.drawImage(this.image, column * this.frameWidth, row * this.frameHeight, this.frameWidth, this.frameHeight, players[this.number].canvas.width / 2 - (players[this.number].canvas.height * 0.02), this.y - (players[this.number].canvas.height * 0.02), players[this.number].canvas.height * 0.045, players[this.number].canvas.height * 0.045);
    }
    update(i) {
        this.currF++;
        //reset and start from the first sprite
        if (this.currF > this.maxF) {
            this.currF = 0;
        }
        this.y = players[this.number].obs[i].y - (3 * players[this.number].canvas.height / 10);
        this.draw();
        if (players[this.number].ball.y >= this.y - (players[this.number].canvas.height * 0.025) && players[this.number].ball.y <= (this.y + (players[this.number].canvas.height * 0.025))) {
            //changes color only once on picking the power up
            if (this.colorchange === 0) {
                players[this.number].pick.play();
                let j = Math.floor(rand(0, players[this.number].obs[i + 1].parts.length - 1));
                players[this.number].ball.color = players[this.number].obs[i + 1].parts[j].color;
                this.image.src = "";
                this.colorchange++;
            }


        }
    }
}
window.onopen =window.onresize = window.onload = function () {
    init();
    for(let i=0;i<2;i++)
    {
        players[i].canvas.width = window.innerWidth / 2;
        players[i].canvas.height = window.innerHeight;
        clearInterval(players[i].blast);
        clearInterval(players[i].loop);//to stop setting multiple setIntervals on resize
        players[i].setup();
        document.addEventListener('keydown', function (e) {
            if (e.key === players[i].control && players[i].up === true) {
                players[i].setBallVel();
                players[i].up = false;
            }
    
        });
        document.addEventListener('keyup', function (e) {
            if (e.key === players[i].control) {
                players[i].up = true;
            }
    
        });
      
    }

}

let players;
function init(){
    players=new Array();
    players.push(new Player(0,"w"));
    players.push(new Player(1,"i"));
   
}


