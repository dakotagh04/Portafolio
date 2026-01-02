let grid;
let cols;
let rows;
let resolution = 10;
let isPlaying = false;
let generation = 0;
let population = 0;
let frameRateValue = 10;

// Colores museo griego
const COLOR_BLUE = { r: 74, g: 127, b: 167 };
const COLOR_GOLD = { r: 201, g: 178, b: 109 };
const COLOR_WHITE = { r: 255, g: 255, b: 255 };

function setup() {
  let canvas = createCanvas(800, 600);
  canvas.parent("canvas-container");

  cols = floor(width / resolution);
  rows = floor(height / resolution);
  grid = createGrid(cols, rows);

  document.getElementById("start").onclick = togglePlay;
  document.getElementById("reset").onclick = resetGrid;
  document.getElementById("random").onclick = randomizeGrid;
  document.getElementById("clear").onclick = clearGrid;
  document.getElementById("speed").oninput = updateSpeed;
  document.getElementById("density").oninput = updateDensity;

  updateSpeed();
  updateDensity();
}

function draw() {
  frameRate(frameRateValue);
  background(245, 244, 238);

  if (isPlaying) {
    grid = calculateNextGeneration(grid);
    generation++;
    updateInfo();
  }

  drawGrid();
}

function createGrid(cols, rows) {
  let arr = [];
  for (let i = 0; i < cols; i++) {
    arr[i] = [];
    for (let j = 0; j < rows; j++) {
      arr[i][j] = { state: 0, life: 0 };
    }
  }
  return arr;
}

function drawGrid() {
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let x = i * resolution;
      let y = j * resolution;

      if (grid[i][j].state === 1) {
        let c = getColorByLife(grid[i][j].life);
        fill(c.r, c.g, c.b);
        noStroke();
        rect(x, y, resolution, resolution);
      } else {
        fill(230, 227, 215);
        stroke(210, 205, 185);
        rect(x, y, resolution, resolution);
        noStroke();
      }
    }
  }
}

function getColorByLife(life) {
  if (life > 0.5) {
    let t = map(life, 0.5, 1, 0, 1);
    return {
      r: lerp(COLOR_GOLD.r, COLOR_BLUE.r, t),
      g: lerp(COLOR_GOLD.g, COLOR_BLUE.g, t),
      b: lerp(COLOR_GOLD.b, COLOR_BLUE.b, t)
    };
  } else {
    let t = map(life, 0, 0.5, 0, 1);
    return {
      r: lerp(COLOR_WHITE.r, COLOR_GOLD.r, t),
      g: lerp(COLOR_WHITE.g, COLOR_GOLD.g, t),
      b: lerp(COLOR_WHITE.b, COLOR_GOLD.b, t)
    };
  }
}

function calculateNextGeneration(grid) {
  let next = createGrid(cols, rows);
  population = 0;

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let n = countNeighbors(grid, i, j);
      let c = grid[i][j];

      if (c.state === 0 && n === 3) {
        next[i][j].state = 1;
        next[i][j].life = 1;
        population++;
      } else if (c.state === 1 && (n === 2 || n === 3)) {
        next[i][j].state = 1;
        next[i][j].life = max(c.life - 0.03, 0);
        if (next[i][j].life > 0) population++;
      }
    }
  }
  return next;
}

function countNeighbors(grid, x, y) {
  let sum = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      let col = (x + i + cols) % cols;
      let row = (y + j + rows) % rows;
      sum += grid[col][row].state;
    }
  }
  return sum - grid[x][y].state;
}

function mousePressed() {
  paintCell();
}

function mouseDragged() {
  paintCell();
}

function paintCell() {
  if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) return;
  let i = floor(mouseX / resolution);
  let j = floor(mouseY / resolution);
  grid[i][j].state = 1;
  grid[i][j].life = 1;
  updateInfo();
}

function togglePlay() {
  isPlaying = !isPlaying;
  document.getElementById("start").textContent = isPlaying ? "Pausar" : "Iniciar";
}

function resetGrid() {
  grid = createGrid(cols, rows);
  generation = population = 0;
  updateInfo();
}

function randomizeGrid() {
  let density = document.getElementById("density").value / 100;
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if (random() < density) {
        grid[i][j].state = 1;
        grid[i][j].life = random();
      } else {
        grid[i][j].state = 0;
        grid[i][j].life = 0;
      }
    }
  }
  generation = 0;
  updateInfo();
}

function clearGrid() {
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j].state = 0;
      grid[i][j].life = 0;
    }
  }
  generation = population = 0;
  updateInfo();
}

function updateSpeed() {
  frameRateValue = parseInt(document.getElementById("speed").value);
  document.getElementById("speed-value").textContent = frameRateValue + " fps";
}

function updateDensity() {
  document.getElementById("density-value").textContent =
    document.getElementById("density").value + "%";
}

function updateInfo() {
  document.getElementById("generation").textContent =
    "Generación: " + generation;
  document.getElementById("population").textContent =
    "Población: " + population;
}
