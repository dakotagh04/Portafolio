function openArtwork(url) {
  window.location.href = url;
}

/* -------- PREVIEW 1 (Estilo Griego) -------- */
new p5(p => {
  let seed;
  let pg;
  const palette = [
    [210, 60, 55], // azul
    [50, 90, 80],  // dorado
    [0, 0, 100]    // blanco
  ];

  p.setup = () => {
    const c = p.createCanvas(
      document.getElementById('preview1').offsetWidth,
      document.getElementById('preview1').offsetHeight
    );
    c.parent('preview1');
    p.noStroke();

    seed = Math.floor(Math.random() * 1000000);
    p.randomSeed(seed);
    p.noiseSeed(seed);

    pg = p.createGraphics(p.width, p.height);
    pg.colorMode(p.HSL, 360, 100, 100, 100);
    pg.background(210, 60, 55); // azul clásico griego
    generateMiniGreekArt(pg);
  };

  p.draw = () => {
    p.image(pg, 0, 0);
  };

  function generateMiniGreekArt(pg) {
    // Fondos de círculos concéntricos
    let numCircles = p.int(p.random(2, 5));
    for (let i = 0; i < numCircles; i++) {
      let x = pg.width / 2;
      let y = pg.height / 2;
      let r = pg.width * (i + 1) / (numCircles * 2);
      let [hue, sat, bri] = p.random(palette);
      pg.noFill();
      pg.stroke(hue, sat, bri, 40);
      pg.strokeWeight(1);
      pg.ellipse(x, y, r * 2);
    }

    // Líneas y curvas sutiles
    let numLines = p.int(p.random(10, 20));
    for (let i = 0; i < numLines; i++) {
      let [hue, sat, bri] = p.random(palette);
      pg.stroke(hue, sat, bri, 30);
      pg.strokeWeight(p.random(0.5, 1.5));
      pg.noFill();
      pg.beginShape();
      let px = p.random(pg.width);
      let py = p.random(pg.height);
      for (let j = 0; j < p.int(p.random(2, 5)); j++) {
        px += p.random(-20, 20);
        py += p.random(-20, 20);
        pg.curveVertex(px, py);
      }
      pg.endShape();
    }

    // Pequeñas formas geométricas
    let numShapes = p.int(p.random(5, 12));
    for (let i = 0; i < numShapes; i++) {
      let x = p.random(pg.width * 0.1, pg.width * 0.9);
      let y = p.random(pg.height * 0.1, pg.height * 0.9);
      let size = p.random(10, 25);
      let sides = p.int(p.random(3, 6));
      let [hue, sat, bri] = p.random(palette);
      pg.fill(hue, sat, bri, 30);
      pg.noStroke();
      pg.beginShape();
      for (let a = 0; a < p.TWO_PI; a += p.TWO_PI / sides) {
        let vx = x + p.cos(a) * size;
        let vy = y + p.sin(a) * size;
        pg.vertex(vx, vy);
      }
      pg.endShape(p.CLOSE);
    }
  }
});

/* -------- PREVIEW 2 -------- */
new p5(p => {
  let agents = [];
  const NUM = 10;
  const R = 10;

  p.setup = () => {
    const c = p.createCanvas(
      document.getElementById('preview2').offsetWidth,
      document.getElementById('preview2').offsetHeight
    );
    c.parent('preview2');
    p.textAlign(p.CENTER, p.CENTER);

    for (let i = 0; i < NUM; i++) {
      agents.push(new Agent('rock', '🪨'));
      agents.push(new Agent('paper', '📜'));
      agents.push(new Agent('scissors', '✂️'));
    }
  };

  p.draw = () => {
    p.background(240);

    for (let a of agents) {
      a.move();
      a.display();
    }

    for (let i = 0; i < agents.length; i++) {
      for (let j = i + 1; j < agents.length; j++) {
        agents[i].interact(agents[j]);
      }
    }
  };

  class Agent {
    constructor(type, emoji) {
      this.type = type;
      this.emoji = emoji;
      this.pos = p.createVector(p.random(p.width), p.random(p.height));
      this.vel = p5.Vector.random2D().mult(1.2);
      this.r = R;
    }

    move() {
      this.pos.add(this.vel);
      if (this.pos.x < this.r || this.pos.x > p.width - this.r) this.vel.x *= -1;
      if (this.pos.y < this.r || this.pos.y > p.height - this.r) this.vel.y *= -1;
    }

    display() {
      p.textSize(18);
      p.text(this.emoji, this.pos.x, this.pos.y);
    }

    interact(other) {
      if (p.dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y) < this.r * 2) {
        let temp = this.vel;
        this.vel = other.vel;
        other.vel = temp;
      }
    }
  }
});

/* -------- PREVIEW 3 -------- */
new p5(p => {
  p.setup = () => {
    const c = p.createCanvas(
      document.getElementById('preview3').offsetWidth,
      document.getElementById('preview3').offsetHeight
    );
    c.parent('preview3');
  };

  p.draw = () => {
    p.background(235);
    p.translate(p.width / 2, p.height / 2);
    p.noFill();
    p.stroke(0);
    for (let i = 0; i < 15; i++) {
      p.rotate(0.015);
      p.rect(-i * 6, -i * 6, i * 12, i * 12);
    }
  };
});

/* -------- PREVIEW 4 -------- */
new p5(p => {
  p.setup = () => {
    const c = p.createCanvas(
      document.getElementById('preview4').offsetWidth,
      document.getElementById('preview4').offsetHeight
    );
    c.parent('preview4');
  };

  p.draw = () => {
    p.background(250);
    p.stroke(0);
    p.point(p.random(p.width), p.random(p.height));
  };
});
