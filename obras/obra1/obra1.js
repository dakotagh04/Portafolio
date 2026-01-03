let s;
let seed;
let artLayer;
let botonGuardar;

function setup() {
  s = min(windowWidth, windowHeight) * 0.9;
  let canvas = createCanvas(s, s);
  canvas.parent(document.body); // canvas centrado en la página
  colorMode(HSL, 360, 100, 100, 100);
  noStroke();

  // Semilla
  const urlParams = new URLSearchParams(window.location.search);
  const idParam = urlParams.get("id");
  if (idParam && !isNaN(idParam)) {
    seed = parseInt(idParam);
  } else {
    seed = int(Math.random() * 1000000);
    urlParams.set("id", seed);
    window.history.replaceState({}, "", `${location.pathname}?${urlParams}`);
  }

  randomSeed(seed);
  noiseSeed(seed);

  artLayer = createGraphics(s, s);
  artLayer.colorMode(HSL, 360, 100, 100, 100);
  generateGreekArt(artLayer, seed);

  // --- Nuevo botón guardar centrado debajo del canvas ---
  botonGuardar = createButton('Guardar imagen');
  botonGuardar.id('saveBtn');               // id para estilizar con CSS
  botonGuardar.parent(document.body);       // se añade al body
  botonGuardar.mousePressed(guardarArte);
  botonGuardar.style('display', 'block');
  botonGuardar.style('margin', '20px auto 0 auto'); // centrado y separación del canvas
  botonGuardar.style('font-size', '16px');
  botonGuardar.style('padding', '10px 20px');
  botonGuardar.style('border-radius', '10px');
  botonGuardar.style('background', '#4a7fa7');
  botonGuardar.style('color', '#f5f4ee');
  botonGuardar.style('border', 'none');
  botonGuardar.style('cursor', 'pointer');
  botonGuardar.style('transition', 'all 0.25s ease');

  // Hover usando JS
  botonGuardar.mouseOver(() => botonGuardar.style('background', '#355f7c'));
  botonGuardar.mouseOut(() => botonGuardar.style('background', '#4a7fa7'));
}

function draw() {
  background(210, 50, 50); // azul clásico griego
  image(artLayer, 0, 0);
  fill(0);
  textSize(16);
  textAlign(LEFT, TOP);
  text("ID / Seed: " + seed, 10, 10);
}

// Generación de arte elegante estilo griego
function generateGreekArt(pg, seed) {
  randomSeed(seed);
  noiseSeed(seed);

  const palette = [
    [210, 60, 55], // azul
    [50, 90, 80],  // dorado
    [0, 0, 100]    // blanco
  ];

  // Círculos concéntricos dispersos (no todos centrados)
  let numCircles = int(random(5, 15));
  for (let i = 0; i < numCircles; i++) {
    let x = random(pg.width * 0.2, pg.width * 0.8);
    let y = random(pg.height * 0.2, pg.height * 0.8);
    let r = random(pg.width * 0.05, pg.width * 0.25);
    let [hue, sat, bri] = random(palette);
    pg.noFill();
    pg.stroke(hue, sat, bri, 30 + random(10)); 
    pg.strokeWeight(1 + random(2));
    pg.ellipse(x, y, r * 2);
  }

  // Líneas curvas y diagonales aleatorias
  let numLines = int(random(25, 50));
  for (let i = 0; i < numLines; i++) {
    let [hue, sat, bri] = random(palette);
    pg.stroke(hue, sat, bri, 20 + random(15));
    pg.strokeWeight(random(0.5, 2));
    pg.noFill();
    pg.beginShape();
    let px = random(pg.width);
    let py = random(pg.height);
    let segments = int(random(3, 6));
    for (let j = 0; j < segments; j++) {
      px += random(-70, 70);
      py += random(-70, 70);
      pg.curveVertex(px, py);
    }
    pg.endShape();
  }

  // Formas geométricas dispersas (triángulos, cuadrados, hexágonos)
  let numShapes = int(random(20, 40));
  for (let i = 0; i < numShapes; i++) {
    let x = random(pg.width * 0.05, pg.width * 0.95);
    let y = random(pg.height * 0.05, pg.height * 0.95);
    let size = random(15, 50);
    let sides = int(random(3, 6));
    let [hue, sat, bri] = random(palette);
    pg.fill(hue, sat, bri, 25 + random(20));
    pg.noStroke();
    pg.beginShape();
    for (let a = 0; a < TWO_PI; a += TWO_PI / sides) {
      let vx = x + cos(a) * size;
      let vy = y + sin(a) * size;
      pg.vertex(vx, vy);
    }
    pg.endShape(CLOSE);
  }
}

function guardarArte() {
  saveCanvas('Obra1_ID_' + seed, 'png');
}
