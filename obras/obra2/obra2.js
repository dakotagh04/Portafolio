let agents = [];
const NUM_PER_TYPE = 50;
const SIZE = 22;
const R = SIZE / 2;

let winner = null;
let sound;
let mode = null;

/* UI */
let fullscreenButton;
let fullscreenActivated = false;

/* ===================== */
/* PRELOAD               */
/* ===================== */
function preload() {
  sound = loadSound('SonidoMecheroMinecraft.mp3');
}

/* ===================== */
/* SETUP                 */
/* ===================== */
function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  textSize(26);
  
  createFullscreenButton(); // Pantalla completa antes de jugar
}

/* ===================== */
/* DRAW                  */
/* ===================== */
function draw() {
  background('#f5f5f0');

  if (!fullscreenActivated) return;

  if (!mode) {
  fill(0); // negro
  textSize(36);
  text("Selecciona un modo", width / 2, height / 2 - 150); // más arriba
  return;
}

  for (let a of agents) a.move();

  let changed;
  do {
    changed = false;
    for (let i = agents.length - 1; i >= 0; i--) {
      for (let j = i - 1; j >= 0; j--) {
        if (agents[i] && agents[j]) {
          if (agents[i].interact(agents[j])) changed = true;
        }
      }
    }
  } while (changed);

  for (let a of agents) a.display();
  drawCounters();

  let types = new Set(agents.map(a => a.type));
  if (types.size === 1 && winner === null && agents.length > 0) {
    winner = agents[0].type;
  }

  if (winner) {
    fill(255);
    textSize(48);
    text(`¡Ganan las ${winner.toUpperCase()}!`, width / 2, height / 2);
    noLoop();
  }
}

/* ===================== */
/* FULLSCREEN BUTTON     */
/* ===================== */
function createFullscreenButton() {
  fullscreenButton = createButton('Pantalla completa');
  fullscreenButton.size(220, 60);
  fullscreenButton.position(width / 2 - 110, height / 2 - 30);
  fullscreenButton.style('font-size', '18px');
  fullscreenButton.mousePressed(enterFullscreen);
}

function enterFullscreen() {
  fullscreen(true);
  fullscreenActivated = true;
  fullscreenButton.remove();
  createModeButtons();
}

/* ===================== */
/* WINDOW RESIZE         */
/* ===================== */
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

/* ===================== */
/* MODE BUTTONS          */
/* ===================== */
function createModeButtons() {
  let b1 = createButton('Destrucción');
  b1.size(160, 50);
  b1.position(width / 2 - 180, height / 2);
  b1.class('modeBtn'); // Clase para identificarlo
  b1.mousePressed(() => startGame('destruction'));

  let b2 = createButton('Conversión');
  b2.size(160, 50);
  b2.position(width / 2 + 20, height / 2);
  b2.class('modeBtn'); // Clase para identificarlo
  b2.mousePressed(() => startGame('conversion'));
}

function startGame(selectedMode) {
  mode = selectedMode;
  agents = [];
  winner = null;

  for (let i = 0; i < NUM_PER_TYPE; i++) {
    agents.push(new Agent('rock', '🪨'));
    agents.push(new Agent('paper', '📜'));
    agents.push(new Agent('scissors', '✂️'));
  }

  // Elimina solo los botones de modo
  selectAll('.modeBtn').forEach(btn => btn.remove());
}

/* ===================== */
/* AGENT CLASS           */
/* ===================== */
class Agent {
  constructor(type, emoji) {
    this.type = type;
    this.emoji = emoji;
    this.pos = createVector(random(width), random(height));
    this.vel = p5.Vector.random2D().mult(random(1, 2));
    this.r = R;
    this.flash = 0;
    this.flashColor = color(255);
  }

  move() {
    this.pos.add(this.vel);
    if (this.pos.x < this.r || this.pos.x > width - this.r) this.vel.x *= -1;
    if (this.pos.y < this.r || this.pos.y > height - this.r) this.vel.y *= -1;
    this.pos.x = constrain(this.pos.x, this.r, width - this.r);
    this.pos.y = constrain(this.pos.y, this.r, height - this.r);
  }

  display() {
    if (this.flash > 0) {
      push();
      noFill();
      stroke(this.flashColor);
      strokeWeight(3);
      ellipse(this.pos.x, this.pos.y, this.r * 2.6);
      pop();
      this.flash--;
    }
    textSize(26);
    text(this.emoji, this.pos.x, this.pos.y);
  }

  interact(other) {
    let d = p5.Vector.dist(this.pos, other.pos);
    if (d >= this.r + other.r || d === 0) return false;

    let dir = p5.Vector.sub(other.pos, this.pos).normalize();
    let overlap = (this.r + other.r - d) / 2;
    this.pos.sub(p5.Vector.mult(dir, overlap));
    other.pos.add(p5.Vector.mult(dir, overlap));

    let temp = this.vel.copy();
    this.vel = other.vel.copy();
    other.vel = temp;

    if (this.type !== other.type && sound.isLoaded()) sound.play();

    let winnerType = this.getWinner(this.type, other.type);
    if (!winnerType) return false;

    this.flashColor = this.colorFor(winnerType);
    other.flashColor = this.flashColor;
    this.flash = other.flash = 8;

    if (mode === 'conversion') {
      this.become(winnerType);
      other.become(winnerType);
    } else if (mode === 'destruction') {
      if (this.type !== winnerType) agents.splice(agents.indexOf(this), 1);
      if (other.type !== winnerType) agents.splice(agents.indexOf(other), 1);
    }

    return true;
  }

  getWinner(a, b) {
    if (a === b) return null;
    if (
      (a === 'rock' && b === 'scissors') ||
      (a === 'scissors' && b === 'paper') ||
      (a === 'paper' && b === 'rock')
    ) return a;
    return b;
  }

  become(type) {
    this.type = type;
    this.emoji = this.emojiFor(type);
  }

  emojiFor(type) {
    if (type === 'rock') return '🪨';
    if (type === 'paper') return '📜';
    if (type === 'scissors') return '✂️';
  }

  colorFor(type) {
    if (type === 'rock') return color(150);
    if (type === 'paper') return color(245, 245, 200);
    return color(255, 50, 50);
  }
}

/* ===================== */
/* COUNTERS              */
/* ===================== */
function drawCounters() {
  const counts = { rock: 0, paper: 0, scissors: 0 };
  for (let a of agents) counts[a.type]++;

  fill(80, 200);
  noStroke();
  rect(width / 2 - 200, 10, 400, 40, 10);

  fill(255);
  textSize(20);
  text(`🪨 ${counts.rock}   📜 ${counts.paper}   ✂️ ${counts.scissors}`, width / 2, 30);
}
