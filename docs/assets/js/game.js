const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 300;

let mouse = { x: 0, y: 0 };
let playerBullets = [];
let particles = [];
let bossBullets = [];
let powerUps = [];
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let mouseInside = false;
let currentLevel = 1;
let gameState = "start";

const playerImage = loadImage("assets/img/game/player.png");

const playerBulletImages = [
    loadImage("assets/img/game/bullet1.png"),
    loadImage("assets/img/game/bullet2.png")
];

const bossBulletImages = [
    loadImage("assets/img/game/bossBullet1.png"),
    loadImage("assets/img/game/bossBullet2.png"),
    loadImage("assets/img/game/bossBullet3.png")
];

const bossSprites = [
    loadImage("assets/img/game/boss1.png"),
    loadImage("assets/img/game/boss2.png"),
    loadImage("assets/img/game/boss3.png"),
    loadImage("assets/img/game/boss4.png")
];

function loadImage(src) {
    const img = new Image();
    img.src = src;
    return img;
}

canvas.addEventListener("contextmenu", e => e.preventDefault());
canvas.addEventListener("mousemove", e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
});

canvas.addEventListener("click", () => {
    if (gameState === "start") {
        gameState = "playing";
    }
});

canvas.addEventListener("mouseenter", () => {
    mouseInside = true;
});

canvas.addEventListener("mouseleave", () => {
    mouseInside = false;
});

class Player {
    constructor() {
        this.x = 50;
        this.y = 250;
        this.width = 40;
        this.height = 40;
        this.speed = 0.1;
        this.hp = 100;
        this.image = playerImage;
        this.invulnerableUntil = 0;
    }

    update() {
        this.x += (mouse.x - this.x - this.width / 2) * this.speed;
        this.y += (mouse.y - this.y - this.height / 2) * this.speed;
    }

    draw() {
        if (this.image.complete) {
            if (Date.now() < this.invulnerableUntil) {
                ctx.globalAlpha = 0.5;
            }
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
            ctx.globalAlpha = 1;
        } else {
            ctx.fillStyle = "blue";
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
        // HP bar
        ctx.fillStyle = "red";
        ctx.fillRect(this.x, this.y - 10, this.width, 5);
        ctx.fillStyle = "lime";
        ctx.fillRect(this.x, this.y - 10, this.width * (this.hp / 100), 5);
    }
}

class PlayerBullet {
    constructor(x, y, image, speed = 10) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.width = 20;
        this.height = 20;
        this.image = image;
        this.vx = speed;
        this.vy = (Math.random() - 0.5) * 2;
        this.noisePhase = Math.random() * Math.PI * 2;
    }

    update() {
        this.noisePhase += 0.1;
        this.y += Math.sin(this.noisePhase) * 1.5;
        this.x += this.vx;
        this.y += this.vy;
    }

    draw() {
        if (this.image.complete) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = "yellow";
            ctx.beginPath();
            ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

class BossBullet {
    constructor(x, y, targetX, targetY, image, speed = 6) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.image = image;

        const dx = targetX - x;
        const dy = targetY - y;
        const angle = Math.atan2(dy, dx);
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
    }

    draw() {
        if (this.image.complete) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = "purple";
            ctx.beginPath();
            ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

class Boss {
    constructor(level) {
        this.x = canvas.width - 200;
        this.y = canvas.height / 2 - 50;
        this.width = 100;
        this.height = 100;
        this.maxHp = 100 + (level - 1) * 50;
        this.hp = this.maxHp;
        this.speed = 2 + level * 0.5;
        this.direction = 1;
        this.image = bossSprites[(level - 1) % bossSprites.length];
        this.shootCooldown = 30; // initial delay
        this.level = level;
    }

    update(player) {
        this.y += this.speed * this.direction;
        if (this.y < 0) this.direction = 1;
        if (this.y + this.height > canvas.height) this.direction = -1;
        this.x += Math.sin(Date.now() / 500) * 0.5;

        this.shootCooldown--;
        if (this.shootCooldown <= 0) {
            const bullets = this.shootPattern(player);
            this.shootCooldown = Math.max(30 - this.level * 2, 10);
            return bullets;
        }
        return [];
    }

    shootPattern(player) {
        const bullets = [];
        if (this.level === 1) {
            bullets.push(new BossBullet(
                this.x,
                this.y + this.height / 2,
                player.x,
                player.y,
                bossBulletImages[0],
                6
            ));
        } else if (this.level === 2) {
            const baseAngle = Math.atan2(player.y - this.y, player.x - this.x);
            for (let i = -1; i <= 1; i++) {
                const offset = baseAngle + i * 0.3;
                bullets.push(new BossBullet(
                    this.x,
                    this.y + this.height / 2,
                    this.x + Math.cos(offset) * 100,
                    this.y + Math.sin(offset) * 100,
                    bossBulletImages[(i + 1) % bossBulletImages.length],
                    5
                ));
            }
        } else {
            const bulletsCount = 4 + Math.min(this.level, 6);
            for (let i = 0; i < bulletsCount; i++) {
                const angle = (i * (2 * Math.PI / bulletsCount)) + (Date.now() / 1000);
                const targetX = this.x + Math.cos(angle) * 100;
                const targetY = this.y + Math.sin(angle) * 100;
                bullets.push(new BossBullet(
                    this.x,
                    this.y + this.height / 2,
                    targetX,
                    targetY,
                    bossBulletImages[i % bossBulletImages.length],
                    4
                ));
            }
        }
        return bullets;
    }

    draw() {
        if (this.image.complete) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = "red";
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
        ctx.fillStyle = "black";
        ctx.fillRect(this.x, this.y - 10, this.width, 5);
        ctx.fillStyle = "lime";
        ctx.fillRect(this.x, this.y - 10, this.width * (this.hp / this.maxHp), 5);
    }
}

class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type; // "health", "rapidFire", etc.
        this.width = 20;
        this.height = 20;
        this.image = loadImage("assets/img/game/heart.png"); // create this image
        this.speed = 2;
    }

    update() {
        this.x -= this.speed;
    }

    draw() {
        if (this.image.complete) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = "pink";
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    apply(player) {
        if (this.type === "health" && player.hp < 100) {
            player.hp = Math.min(100, player.hp + 30);
        }
    }
}


const player = new Player();
let boss = new Boss(currentLevel);

let lastShotTime = 0;
const fireCooldown = 200;

canvas.addEventListener("mousedown", e => {
    if (e.button === 0 && Date.now() - lastShotTime > fireCooldown) {
        const img = playerBulletImages[Math.floor(Math.random() * playerBulletImages.length)];
        // Spawn bullet in front of player
        playerBullets.push(new PlayerBullet(
            player.x + player.width,
            player.y + player.height / 2 - 10,
            img
        ));
        lastShotTime = Date.now();
    }
});

document.addEventListener("keydown", e => {
    if (e.key === "p") gamePaused = !gamePaused;
});

let gamePaused = false;

function bulletHitsEntity(b, entity) {
    const bx = b.x + b.width / 2;
    const by = b.y + b.height / 2;
    return bx > entity.x && bx < entity.x + entity.width && by > entity.y && by < entity.y + entity.height;
}

function createExplosion(x, y) {
    for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 1;
        const size = Math.random() * 4 + 2;
        const life = Math.random() * 30 + 30;
        particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, size, life });
    }
}

function update() {
    if (gamePaused || !mouseInside || gameState !== "playing") return;

    player.update();
    powerUps = powerUps.filter(p => {
        p.update();
        if (bulletHitsEntity(p, player)) {
            p.apply(player);
            return false;
        }
        return p.x + p.width > 0; // remove if off screen
    });

    particles = particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        return p.life > 0;
    });

    // Get new boss bullets from update
    const newBossBullets = boss.update(player);
    bossBullets.push(...newBossBullets);

    playerBullets = playerBullets.filter(b => {
        b.update();
        if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) return false;
        if (bulletHitsEntity(b, boss)) {
            boss.hp -= 10;
            score += 10;
            return false;
        }
        return true;
    });

    bossBullets = bossBullets.filter(b => {
        b.update();
        if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) return false;
        if (bulletHitsEntity(b, player) && Date.now() > player.invulnerableUntil) {
            player.hp -= 10;
            player.invulnerableUntil = Date.now() + 1000;
            if (player.hp <= 0) {
                highScore = Math.max(score, highScore);
                localStorage.setItem("highScore", highScore);
                alert("You lost! Final Score: " + score);
                document.location.reload();
            }
            return false;
        }
        return true;
    });

    if (boss.hp <= 0) {
        // Drop a heart at boss position
        powerUps.push(new PowerUp(boss.x, boss.y, "health"));
        createExplosion(boss.x + boss.width / 2, boss.y + boss.height / 2);

        currentLevel++;
        score += 100 * currentLevel;
        boss = new Boss(currentLevel);
        bossBullets = [];
        playerBullets = [];
    }
}

function draw() {
    ctx.fillStyle = "#efdbcb";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (gameState === "start") {
        ctx.fillStyle = "black";
        ctx.font = "30px Arial";
        ctx.fillText("Click to Start", canvas.width / 2 - 100, canvas.height / 2);
        return;
    }

    if (!mouseInside) {
        ctx.fillStyle = "purple";
        ctx.font = "20px Arial";
        ctx.fillText("[MOVE MOUSE INTO GAME TO START]", canvas.width / 2 - 140, 60);
    }

    player.draw();
    boss.draw();

    particles.forEach(p => {
        ctx.fillStyle = "orange";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
    powerUps.forEach(p => p.draw());
    playerBullets.forEach(b => b.draw());
    bossBullets.forEach(b => b.draw());

    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 20, 30);
    ctx.fillText("Level: " + currentLevel, 20, 60);
    ctx.fillText("High Score: " + highScore, 20, 90);

    if (gamePaused) ctx.fillText("[PAUSED] Press 'P' to resume", canvas.width / 2 - 100, 30);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();