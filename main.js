const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth - 20;
canvas.height = window.innerHeight - 20;

const scores = document.getElementById("score");
const startGame = document.getElementById("startBox");
const totalScore = document.getElementById("totalScore");
class Player {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }
  draw() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
  }
}

class Enemy {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }
  draw() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
  }
  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}

const frition = 0.99; // Độ bắn của vụ nổ nhỏ
class Particle {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1;
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.restore();
  }
  update() {
    this.draw();
    this.velocity.x *= frition;
    this.velocity.y *= frition;
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
    this.alpha -= 0.01; // thời gian tồn tại cảu vụ nổ nhỏ
  }
}

const x = canvas.width / 2;
const y = canvas.height / 2;
let player = new Player(x, y, 25, "#fff");
let projectiles = [];
let enemies = [];
let particles = [];
function init() {
  player = new Player(x, y, 25, "#fff");
  projectiles = [];
  enemies = [];
  particles = [];
  score = 0;
  totalScore.innerHTML = score;
  scores.innerHTML = score;
}
let multilEnemy;
function spawEnemies() {
  multilEnemy = setInterval(() => {
    const radius = Math.random() * 20 + 12; // tạo bán kính cho enemy
    let x, y;
    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
      y = Math.random() * canvas.height;
    } else {
      x = Math.random() * canvas.width;
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
    }

    const color = `hsl(${Math.random() * 360}, 60%, 60%)`;
    const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);
    // console.log(angle);
    const velocityAngle = Math.random() * 2.5 + 1;
    const velocity = {
      x: Math.cos(angle) * velocityAngle,
      y: Math.sin(angle) * velocityAngle,
    };

    enemies.push(new Enemy(x, y, radius, color, velocity));
  }, 1000); //tần suất xuất hiện của enemy
}
let animationId;
let score = 0;



function animate() {
  animationId = requestAnimationFrame(animate);
  ctx.fillStyle = " rgba(0,0,0,0.1)"; // lam mo bong
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  player.draw();

  particles.forEach((particle, index) => {
    if (particle.alpha <= 0) {
      particles.splice(index, 1);
    }
    particle.update();
  });

  projectiles.forEach((projectile, index) => {
    projectile.update();
    //renove from edges of dcreen
    if (
      projectile.x + projectile.radius < 0 ||
      projectile.x - projectile.radius > canvas.width ||
      projectile.y + projectile.radius < 0 ||
      projectile.y - projectile.radius > canvas.height
    ) {
      setTimeout(() => {
        projectiles.splice(index, 1);
      }, 0);
    }
  });

  enemies.forEach((enemy, index) => {
    enemy.update();
    // end game
    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
    if (dist - enemy.radius - player.radius < 0) {
      cancelAnimationFrame(animationId);
      clearInterval(multilEnemy);
      totalScore.innerHTML = score;
      startGame.style.display = "block";
    }

    projectiles.forEach((projectile, projectileIndex) => {
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);

      // when projectile touch enemy
      if (dist - enemy.radius - enemy.radius < 0) {
        // creat explosions
        for (let i = 0; i < enemy.radius; i++) {
          particles.push(
            new Particle(
              projectile.x,
              projectile.y,
              Math.random() * 4,
              enemy.color,
              {
                x: (Math.random() - 0.5) * 3, //
                y: (Math.random() - 0.5) * 3,
              }
            )
          );
        }
        if (enemy.radius > 25) {
          //increase score
          score += 100;
          scores.innerHTML = score;
          gsap.to(enemy, {
            radius: enemy.radius - 10,
          });
          setTimeout(() => {
            // enemies.splice(index, 1);
            projectiles.splice(projectileIndex, 1);
          }, 0);
        } else {
          //remove from scene altogether
          score += 150;
          scores.innerHTML = score;
          setTimeout(() => {
            enemies.splice(index, 1);
            projectiles.splice(projectileIndex, 1);
          }, 0);
        }
      }
    });
  });
}

window.addEventListener("click", (event) => {
  const angle = Math.atan2(
    event.clientY - canvas.height / 2,
    event.clientX - canvas.width / 2
  );
  // console.log(angle);
  const velocity = {
    x: Math.cos(angle) * 2, // *2 là chỉ tốc độ của bóng
    y: Math.sin(angle) * 2,
  };
  projectiles.push(
    new Enemy(canvas.width / 2, canvas.height / 2, 8, "#fff", velocity)
  );
});
function startFunction() {
  init();
  startGame.style.display = "none";
  animate();
  spawEnemies();
}
