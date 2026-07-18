let player;
let platforms = [];
let stars = [];
let score = 0;
let highScore = 0;
let gameState = "playing"; // playing, gameover

function setup() {
  let canvas = createCanvas(800, 500);
  canvas.parent('game-canvas');
  
  // Load high score from local storage
  if (localStorage.getItem('platformerHighScore')) {
    highScore = parseInt(localStorage.getItem('platformerHighScore'));
    document.getElementById('highScore').innerText = highScore;
  }
  
  resetGame();
}

function resetGame() {
  player = {
    x: 50,
    y: 300,
    w: 30,
    h: 30,
    vx: 0,
    vy: 0,
    speed: 5,
    jumpPower: -12,
    gravity: 0.6,
    grounded: false
  };
  
  platforms = [];
  stars = [];
  score = 0;
  document.getElementById('starCount').innerText = score;
  
  // Floor
  platforms.push({ x: 0, y: height - 40, w: width, h: 40 });
  
  // Generate random platforms
  for (let i = 0; i < 6; i++) {
    let px = random(100, width - 100);
    let py = random(100, height - 100);
    platforms.push({ x: px, y: py, w: 100, h: 20 });
    
    // 50% chance to place a star on the platform
    if (random() > 0.5) {
      stars.push({ x: px + 40, y: py - 30, size: 20, collected: false });
    }
  }
  
  gameState = "playing";
}

function draw() {
  background('#87CEEB'); // Sky blue
  
  if (gameState === "playing") {
    updatePlayer();
    checkCollisions();
    checkStars();
  }
  
  drawPlatforms();
  drawStars();
  drawPlayer();
  
  if (gameState === "gameover") {
    fill(0, 150);
    rect(0, 0, width, height);
    fill(255);
    textSize(48);
    textAlign(CENTER, CENTER);
    text("GAME OVER", width/2, height/2 - 20);
    textSize(24);
    text("Press 'R' to Restart", width/2, height/2 + 30);
  }
}

function updatePlayer() {
  // Horizontal movement
  if (keyIsDown(LEFT_ARROW)) {
    player.vx = -player.speed;
  } else if (keyIsDown(RIGHT_ARROW)) {
    player.vx = player.speed;
  } else {
    player.vx = 0;
  }
  
  // Apply gravity
  player.vy += player.gravity;
  
  // Move player
  player.x += player.vx;
  player.y += player.vy;
  
  // Screen wrap
  if (player.x > width) player.x = -player.w;
  if (player.x < -player.w) player.x = width;
  
  // Fall off bottom
  if (player.y > height) {
    gameOver();
  }
}

function checkCollisions() {
  player.grounded = false;
  
  for (let p of platforms) {
    // Check if player is falling onto the platform
    if (player.vy > 0 && 
        player.x + player.w > p.x && 
        player.x < p.x + p.w && 
        player.y + player.h > p.y && 
        player.y + player.h < p.y + player.vy + 1) { // +1 for epsilon
      player.y = p.y - player.h;
      player.vy = 0;
      player.grounded = true;
    }
  }
}

function checkStars() {
  for (let s of stars) {
    if (!s.collected) {
      // Simple AABB collision for star
      let sLeft = s.x;
      let sRight = s.x + s.size;
      let sTop = s.y;
      let sBottom = s.y + s.size;
      
      let pLeft = player.x;
      let pRight = player.x + player.w;
      let pTop = player.y;
      let pBottom = player.y + player.h;
      
      if (pRight > sLeft && pLeft < sRight && pBottom > sTop && pTop < sBottom) {
        s.collected = true;
        score += 10;
        document.getElementById('starCount').innerText = score;
      }
    }
  }
  
  // If all stars collected, respawn stars
  let allCollected = true;
  for (let s of stars) if (!s.collected) allCollected = false;
  
  if (allCollected && stars.length > 0) {
    for (let p of platforms) {
      if (p.y < height - 50 && random() > 0.3) {
        stars.push({ x: p.x + p.w/2 - 10, y: p.y - 30, size: 20, collected: false });
      }
    }
  }
}

function drawPlayer() {
  fill('#FF5722'); // Orange
  noStroke();
  rect(player.x, player.y, player.w, player.h, 5);
  
  // Eyes
  fill(255);
  rect(player.x + 5, player.y + 5, 8, 8);
  rect(player.x + 17, player.y + 5, 8, 8);
  fill(0);
  rect(player.x + 8 + (player.vx>0?2:player.vx<0?-2:0), player.y + 8, 4, 4);
  rect(player.x + 20 + (player.vx>0?2:player.vx<0?-2:0), player.y + 8, 4, 4);
}

function drawPlatforms() {
  fill('#4CAF50'); // Green
  stroke('#388E3C');
  strokeWeight(2);
  for (let p of platforms) {
    rect(p.x, p.y, p.w, p.h, 3);
  }
}

function drawStars() {
  fill('#FFD700'); // Gold
  noStroke();
  for (let s of stars) {
    if (!s.collected) {
      // Draw a simple star shape
      push();
      translate(s.x + s.size/2, s.y + s.size/2);
      rotate(frameCount * 0.05);
      beginShape();
      for (let i = 0; i < 5; i++) {
        let angle = TWO_PI / 5 * i - HALF_PI;
        let sx = cos(angle) * s.size/2;
        let sy = sin(angle) * s.size/2;
        vertex(sx, sy);
        angle += TWO_PI / 10;
        sx = cos(angle) * s.size/4;
        sy = sin(angle) * s.size/4;
        vertex(sx, sy);
      }
      endShape(CLOSE);
      pop();
    }
  }
}

function gameOver() {
  gameState = "gameover";
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('platformerHighScore', highScore);
    document.getElementById('highScore').innerText = highScore;
  }
}

function keyPressed() {
  if (keyCode === 32 && player.grounded && gameState === "playing") { // Spacebar
    player.vy = player.jumpPower;
  }
  if ((key === 'r' || key === 'R') && gameState === "gameover") {
    resetGame();
  }
}
