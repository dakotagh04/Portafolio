// Variables globales
let grid;
let cols;
let rows;
let resolution = 10;
let isPlaying = false;
let generation = 0;
let population = 0;
let frameRateValue = 10;

// Colores para la variación creativa
let colors = [
    { r: 76, g: 201, b: 240 },  // Azul claro
    { r: 67, g: 97, b: 238 },   // Azul
    { r: 156, g: 39, b: 176 },  // Púrpura
    { r: 233, g: 30, b: 99 },   // Rosa
    { r: 255, g: 152, b: 0 },   // Naranja
    { r: 76, g: 175, b: 80 }    // Verde
];

function setup() {
    let canvasContainer = document.getElementById('canvas-container');
    let canvas = createCanvas(800, 600);
    canvas.parent('canvas-container');
    
    cols = Math.floor(width / resolution);
    rows = Math.floor(height / resolution);
    grid = createGrid(cols, rows);
    
    document.getElementById('start').addEventListener('click', togglePlay);
    document.getElementById('reset').addEventListener('click', resetGrid);
    document.getElementById('random').addEventListener('click', randomizeGrid);
    document.getElementById('clear').addEventListener('click', clearGrid);
    
    document.getElementById('speed').addEventListener('input', updateSpeed);
    document.getElementById('density').addEventListener('input', updateDensity);
    
    updateSpeed();
    updateDensity();
    
    drawGrid();
}

function draw() {
    if (isPlaying) {
        grid = calculateNextGeneration(grid);
        generation++;
        updateInfo();
    }
    drawGrid();
}

function createGrid(cols, rows) {
    let arr = new Array(cols);
    for (let i = 0; i < arr.length; i++) {
        arr[i] = new Array(rows);
        for (let j = 0; j < arr[i].length; j++) {
            arr[i][j] = {
                state: 0,
                age: 0,
                color: colors[Math.floor(Math.random() * colors.length)]
            };
        }
    }
    return arr;
}

function drawGrid() {
    background(26, 26, 46);
    
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            let x = i * resolution;
            let y = j * resolution;
            
            if (grid[i][j].state === 1) {
                let cellColor = grid[i][j].color;
                let ageFactor = Math.min(grid[i][j].age / 10, 1);
                
                let r = cellColor.r + (255 - cellColor.r) * ageFactor;
                let g = cellColor.g + (255 - cellColor.g) * ageFactor;
                let b = cellColor.b + (255 - cellColor.b) * ageFactor;
                
                fill(r, g, b);
                
                let sizeFactor = 0.8 + (0.2 * ageFactor);
                let cellSize = resolution * sizeFactor;
                
                let offset = (resolution - cellSize) / 2;
                rect(x + offset, y + offset, cellSize, cellSize, 2);
            } else {
                fill(40, 40, 60);
                stroke(60, 60, 80);
                strokeWeight(0.5);
                rect(x, y, resolution, resolution);
                noStroke();
            }
        }
    }
}

function calculateNextGeneration(grid) {
    let next = createGrid(cols, rows);
    population = 0;
    
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            let state = grid[i][j].state;
            let neighbors = countNeighbors(grid, i, j);
            
            if (state === 0 && neighbors === 3) {
                next[i][j].state = 1;
                next[i][j].color = colors[Math.floor(Math.random() * colors.length)];
                population++;
            } else if (state === 1 && (neighbors === 2 || neighbors === 3)) {
                next[i][j].state = 1;
                next[i][j].age = grid[i][j].age + 1;
                next[i][j].color = grid[i][j].color;
                population++;
            } else {
                next[i][j].state = 0;
                next[i][j].age = 0;
            }
        }
    }
    
    return next;
}

function countNeighbors(grid, x, y) {
    let sum = 0;
    for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {
            let col = (x + i + cols) % cols;
            let row = (y + j + rows) % rows;
            sum += grid[col][row].state;
        }
    }
    sum -= grid[x][y].state;
    return sum;
}

function mousePressed() {
    if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
        let i = Math.floor(mouseX / resolution);
        let j = Math.floor(mouseY / resolution);
        grid[i][j].state = grid[i][j].state === 0 ? 1 : 0;
        if (grid[i][j].state === 1) {
            grid[i][j].color = colors[Math.floor(Math.random() * colors.length)];
            grid[i][j].age = 0;
        }
        updateInfo();
    }
}

function mouseDragged() {
    if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
        let i = Math.floor(mouseX / resolution);
        let j = Math.floor(mouseY / resolution);
        grid[i][j].state = 1;
        grid[i][j].color = colors[Math.floor(Math.random() * colors.length)];
        grid[i][j].age = 0;
        updateInfo();
    }
}

function togglePlay() {
    isPlaying = !isPlaying;
    document.getElementById('start').textContent = isPlaying ? 'Pausar' : 'Iniciar';
}

function resetGrid() {
    grid = createGrid(cols, rows);
    generation = 0;
    population = 0;
    updateInfo();
}

function randomizeGrid() {
    let density = parseInt(document.getElementById('density').value) / 100;
    
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            grid[i][j].state = Math.random() < density ? 1 : 0;
            if (grid[i][j].state === 1) {
                grid[i][j].color = colors[Math.floor(Math.random() * colors.length)];
                grid[i][j].age = 0;
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
            grid[i][j].age = 0;
        }
    }
    
    generation = 0;
    population = 0;
    updateInfo();
}

function updateSpeed() {
    frameRateValue = parseInt(document.getElementById('speed').value);
    frameRate(frameRateValue);
    document.getElementById('speed-value').textContent = frameRateValue + ' fps';
}

function updateDensity() {
    let densityValue = parseInt(document.getElementById('density').value);
    document.getElementById('density-value').textContent = densityValue + '%';
}

function updateInfo() {
    document.getElementById('generation').textContent = 'Generación: ' + generation;
    document.getElementById('population').textContent = 'Población: ' + population;
}
