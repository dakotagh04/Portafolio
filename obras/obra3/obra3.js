/**
 * Ball Attack — versión museo
 * Paleta coherente con el portafolio
 */

/* Paleta del portafolio */
const PALETTE = {
  bg: "#f5f4ee",
  panel: "#edeadf",
  text: "#2e2e2e",
  blue: "#4a7fa7",
  blueDark: "#355f7c",
  gold: "#c9b26d",
  white: "#ffffff"
};

/* Colores de juego */
const COLOR_CONFIG = [
  { name: "BAJO", fill: PALETTE.gold, threshold: 0.2 },
  { name: "MEDIO", fill: PALETTE.blue, threshold: 0.4 },
  { name: "ALTO", fill: PALETTE.blueDark, threshold: 0.6 }
];

// Juego
let balls = [];
let score = 0;
let canvas;
let gameState = "START";
let ballRadius = 20;
let ballSpacing = ballRadius * 2;
let pathProgress = 0;
let pathSpeed = 0.5;

const SPEED_FAST = 1.4;
const SPEED_SLOW = 0.25;
const SPEED_CURVE = 1.6;

// Micrófono
let mic;
let currentVolume = 0;
let smoothedVolume = 0;
let isMicActive = false;
let lastShotTime = 0;
let shotCooldown = 300;

// UI mic
let volumeHistory = [];
let maxHistoryLength = 50;
let currentColorZone = -1;

// Botón
let restartButton;

function setup() {
  const s = min(windowWidth, windowHeight) * 0.9;
  canvas = createCanvas(s, s);

  centerCanvas();
  textFont("monospace");

  initMicrophone();
  createRestartButton();
  showStartScreen();
}

function centerCanvas() {
  const x = (windowWidth - width) / 2;
  const y = (windowHeight - height) / 2;
  canvas.position(x, y);
}

function windowResized() {
  const s = min(windowWidth, windowHeight) * 0.9;
  resizeCanvas(s, s);
  centerCanvas();
  positionRestartButton();
}

function initMicrophone() {
  mic = new p5.AudioIn();
  mic.start(
    () => (isMicActive = true),
    () => (isMicActive = false)
  );
}

function showStartScreen() {
  gameState = "START";
  restartButton.html("INICIAR JUEGO");
  restartButton.show();
  positionRestartButton();
}

function startGame() {
  gameState = "PLAYING";
  score = 0;
  balls = [];
  pathProgress = ballSpacing * 6;
  restartButton.html("REINICIAR");
  restartButton.hide();

  const screenLength = height + 200;
  const numBalls = ceil(screenLength / ballSpacing);

  for (let i = 0; i < numBalls; i++) {
    balls.push({
      colorIndex: floor(random(COLOR_CONFIG.length)),
      distanceFromFront: i * ballSpacing
    });
  }
}

function draw() {
  background(PALETTE.bg);

  if (gameState === "START") {
    drawStartScreen();
    return;
  }

  if (gameState === "GAMEOVER") {
    drawGameOver();
    restartButton.show();
    positionRestartButton();
    return;
  }

  updateMicrophone();
  drawHud();
  drawMicrophoneUI();

  if (balls.length > 0) {
    const frontY = pathProgress - balls[0].distanceFromFront;
    if (frontY >= height - ballRadius * 1.2) {
      gameState = "GAMEOVER";
      return;
    }
    pathSpeed = computePathSpeed(frontY);
  }

  pathProgress += pathSpeed;
  updateAndDrawBalls();
  detectVolumeShot();
}

function computePathSpeed(frontY) {
  let p = constrain(frontY / height, 0, 1);
  p = pow(p, SPEED_CURVE);
  return lerp(SPEED_FAST, SPEED_SLOW, p);
}

function getPathPosition(distance) {
  const t = distance / 100;
  const amplitude = width * 0.06;
  return {
    x: width / 2 + sin(t * 2) * amplitude,
    y: distance
  };
}

function updateMicrophone() {
  if (!isMicActive) return;

  currentVolume = mic.getLevel();
  smoothedVolume = lerp(smoothedVolume, currentVolume, 0.3);

  volumeHistory.push(smoothedVolume);
  if (volumeHistory.length > maxHistoryLength) volumeHistory.shift();

  if (smoothedVolume < COLOR_CONFIG[0].threshold) currentColorZone = 0;
  else if (smoothedVolume < COLOR_CONFIG[1].threshold) currentColorZone = 1;
  else currentColorZone = 2;
}

function detectVolumeShot() {
  if (!isMicActive || gameState !== "PLAYING") return;
  if (millis() - lastShotTime < shotCooldown) return;

  if (smoothedVolume > 0.15) {
    shootWithColor(currentColorZone);
    lastShotTime = millis();
  }
}

function drawStartScreen() {
  textAlign(CENTER, CENTER);

  fill(PALETTE.blueDark);
  textSize(48);
  text("BALL ATTACK", width / 2, height / 2 - 140);

  fill(PALETTE.blue);
  textSize(22);
  text("Controlado por micrófono", width / 2, height / 2 - 90);

  fill(PALETTE.text);
  textSize(16);
  text("Habla o haz ruido para disparar", width / 2, height / 2 - 30);
}

function drawHud() {
  fill(PALETTE.text);
  textSize(18);
  textAlign(LEFT, TOP);
  text(`Puntuación: ${score}`, 20, 20);
}

function drawMicrophoneUI() {
  const w = width * 0.8;
  const h = 110;
  const x = width / 2 - w / 2;
  const y = height - h - 20;

  noStroke();
  fill(PALETTE.panel);
  rect(x, y, w, h, 12);

  const barW = w * 0.9;
  const barX = x + w * 0.05;
  const barY = y + 40;

  fill(220);
  rect(barX, barY, barW, 18, 5);

  const volW = constrain(map(smoothedVolume, 0, 1, 0, barW), 0, barW);
  fill(COLOR_CONFIG[currentColorZone]?.fill || PALETTE.gold);
  rect(barX, barY, volW, 18, 5);
}

function drawGameOver() {
  textAlign(CENTER, CENTER);
  fill(PALETTE.blueDark);
  textSize(48);
  text("FIN", width / 2, height / 2 - 40);

  fill(PALETTE.text);
  textSize(22);
  text(`Puntuación: ${score}`, width / 2, height / 2 + 10);
}

function updateAndDrawBalls() {
  for (let i = balls.length - 1; i >= 0; i--) {
    const ball = balls[i];
    const d = pathProgress - ball.distanceFromFront;
    const pos = getPathPosition(d);
    const r = i === 0 ? ballRadius * 1.5 : ballRadius;

    noStroke();
    fill(COLOR_CONFIG[ball.colorIndex].fill);
    circle(pos.x, pos.y, r * 2);
  }
}

function shootWithColor(colorIndex) {
  if (!balls.length) return;

  if (balls[0].colorIndex === colorIndex) {
    balls.shift();
    score += 5;
  } else {
    score = max(0, score - 1);
  }
}

function createRestartButton() {
  restartButton = createButton("INICIAR JUEGO");
  restartButton.size(200, 50);
  restartButton.style("background", PALETTE.blue);
  restartButton.style("color", PALETTE.white);
  restartButton.style("border", "none");
  restartButton.style("border-radius", "10px");
  restartButton.style("font-size", "18px");
  restartButton.style("cursor", "pointer");

  restartButton.mousePressed(() => {
    gameState === "PLAYING" ? showStartScreen() : startGame();
  });
}

function positionRestartButton() {
  const canvasX = (windowWidth - width) / 2;
  const canvasY = (windowHeight - height) / 2;

  restartButton.position(
    canvasX + width / 2 - 100,
    canvasY + height / 2 + 40
  );
}
