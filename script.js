const WANDERER_MOVE_MULTIPLIER = 8;
const WANDERER_ROTATE_SPEED = 0.03; // very sensitive

const PATH_WIDTH = 5;
const PATH_HIGHLIGHT_WIDTH = 4;

const LIGHT_GRAPHICS_WIDTH_HEIGHT = 60;

const MAX_BULBS = 300;
const BULB_COLORS = [
  '#00d9ff',
  '#ff0d0d',
  '#59ff9d',
  '#b959ff'
];
const BULB_LAST_INDEX = BULB_COLORS.length - 1;
const BULB_FREQUENCY = 200;

let node;
let pathGraphics;
let bulbGraphics = [];

let bulbs = [];
let bulbTick = 0;
let bulbFlip = false;
let bulbColorIndex = 0;
let bulbInterval = null;
let done = false;

function setup()  {
  createCanvas(600, 600);
  background(20);
  
  node = new Wanderer();
  
  pathGraphics = createGraphics(width, height);
  pathGraphics.noFill();
  pathGraphics.strokeCap(PROJECT);
  
  BULB_COLORS.forEach((color) => {
    bulbGraphics.push(getBulbGraphics(color));
  });
  
  bulbInterval = setInterval(() => {
    if(bulbs.length < MAX_BULBS) {
       addBulb();
    } else {
      clearInterval(bulbInterval);
      done = true;
    }
  }, BULB_FREQUENCY)
}

function draw() {
  background(20);
  
  if(!done) {
    node.render();
  }
  
  image(pathGraphics, 0, 0);
  bulbs.forEach((bulb) => bulb.render());
}

function addBulb() {
  const pos = node.getPosition();
  const direction = node.getDirection();
  bulbs.push(new Bulb(pos.x, pos.y, direction - (bulbFlip ? PI : 0), bulbGraphics[bulbColorIndex]));
  bulbFlip = !bulbFlip;
  bulbColorIndex += 1;
  
  if(bulbColorIndex > BULB_LAST_INDEX) {
    bulbColorIndex = 0;
  }
}

function drawBulb(graphics, color) {
  graphics.fill(color);
  graphics.noStroke();
  
  graphics.beginShape();
  graphics.vertex(-4, 0);
  graphics.vertex(-6, -5);
  graphics.vertex(-7, -10);
  graphics.vertex(-8, -15);
  graphics.vertex(0 - 7, -20);
  graphics.vertex(-4, -25);
  graphics.vertex(0, -27);
  graphics.vertex(0, 0);
  graphics.endShape();
  graphics.beginShape();
  graphics.vertex(4, 0);
  graphics.vertex(6, -5);
  graphics.vertex(7, -10);
  graphics.vertex(8, -15);
  graphics.vertex(7, -20);
  graphics.vertex(4, -25);
  graphics.vertex(0, -27);
  graphics.vertex(0, 0);
  graphics.endShape();
  
  graphics.fill('#378a2e');
  graphics.rect(0, 0, 10, 5);
}

function getBulbGraphics(color) {
  const graphics = createGraphics(LIGHT_GRAPHICS_WIDTH_HEIGHT, LIGHT_GRAPHICS_WIDTH_HEIGHT);
  graphics.rectMode(CENTER);
  
  const startX = graphics.width * 0.5;
  const startY = graphics.height - 10;
  
  graphics.translate(startX, startY - 45);
  graphics.rotate(PI);
  graphics.scale(1.2);
  
  // draw the bulb once
  drawBulb(graphics, color);
  
  // blur the bulb
  graphics.filter(BLUR, 8);
  graphics.scale(0.8);
  
  // draw the bulb again to give a glow effect
  drawBulb(graphics, color);
  return graphics;
}

class Wanderer {
  constructor() {
    this.pos = { x: random(width), y: random(height) };
    this.lastPos = { ...this.pos }
    this.direction = random(TWO_PI);
    this.noiseValue = 0;
  }
  getPosition() {
    return { x: this.pos.x, y: this.pos.y };
  }
  getDirection() {
    return this.direction;
  }
  render() {
    this.lastPos = { ...this.pos }
    
    const xx = cos(this.direction) * WANDERER_MOVE_MULTIPLIER;
    const yy = sin(this.direction) * WANDERER_MOVE_MULTIPLIER;
    
    this.pos.x += xx;
    this.pos.y += yy;
    this.direction = noise(this.noiseValue += WANDERER_ROTATE_SPEED) * TWO_PI;
    
    let pathBroken = false;
    if(this.pos.y > height) {
      pathBroken = true;
      this.pos.y = 0;
    } else if(this.pos.y < 0) {
      pathBroken = true;
      this.pos.y = height;
    }
    
    if(this.pos.x > width) {
      pathBroken = true;
      this.pos.x = 0;
    } else if(this.pos.x < 0) {
      pathBroken = true;
      this.pos.x = width;
    }
    
    if(pathBroken) {
      this.lastPos = { ...this.pos }
    }
    
    pathGraphics.strokeWeight(PATH_WIDTH);
    pathGraphics.stroke('#378a2e');
    pathGraphics.line(this.pos.x, this.pos.y, this.lastPos.x, this.lastPos.y);
    pathGraphics.strokeWeight(PATH_HIGHLIGHT_WIDTH);
    pathGraphics.stroke('#42c134');
    pathGraphics.line(this.pos.x + 1, this.pos.y - 2, this.lastPos.x + 1, this.lastPos.y - 2);
  }
}

class Bulb {
  constructor(x, y, direction, bulbImage) {
    this.bulbImage = bulbImage;
    this.pos = { x, y };
    this.direction = direction;
    this.halfImageWidth = this.bulbImage.width * 0.5;
  }
  render() {
    push();
    translate(this.pos.x, this.pos.y);
    
    // const dir = atan2(this.pos.y - mouseY, this.pos.x - mouseX);
    rotate(this.direction);
    image(this.bulbImage, -this.halfImageWidth, 0);
    pop();
  }
}