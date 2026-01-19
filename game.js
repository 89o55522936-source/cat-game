// game.js — Версия v6.0 (Магазин, Скины и Настройки)
const config = {
    type: Phaser.AUTO,
    width: 360,
    height: 640,
    parent: 'game-container',
    transparent: false,
    backgroundColor: '#000000',
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false }
    },
    scene: { preload: preload, create: create, update: update }
};

const game = new Phaser.Game(config);

let score = 0, lives = 3, fishCount = 0, valerianStock = 0, currentLevel = 1;
let gameStarted = false, gameRunning = true, isPaused = false, lastMemeScore = 0;
let seenMemes = new Set();
let pauseLabel = null;
let isSoundOn = true;

// Переменные магазина
let currentSkin = 'cat'; 
let currentBgKey = 'bg_game';
let ownedCats = ['cat'];
let ownedBgs = ['bg_game'];

let cat, scoreText, livesText, fishText, valStockText, levelText, startBtn, memeCountText;
let gameDifficulty = 1.0; 
let lastSpawnTime = 0, tomatoesGroup;

// Новые переменные
let isMemeOpen = false; // Флаг для бага с мемами
let lastDaily = 0; // Timestamp последнего daily
let referralCount = 0; // Счётчик рефералов
let topScores = [0, 0, 0]; // Топ-3 личных счётов

const memes = [
    "Я не толстый, я томато-резистентный!",
    "Помидоры падают, а я лежу. Жизнь кота — сплошной релакс!",
    "Валерьянка — мой щит от овощного апокалипсиса.",
    "Кот vs Томаты: Я выигрываю, даже во сне.",
    "Собрал 500? Ты герой! А я просто кот, который ненавидит салаты.",
    "Помидоры: 0, Кот: 1! Продолжай, или я усну от скуки.",
    "Помидоры падают, кот лежит. This is fine... with fish.",
    "Собрал все мемы → кот: Теперь я легенда… в своей кровати.",
    "Помидоры падают чаще, чем мои планы на вечер.",
    "Я кот, а не помидорный сок! Разбей их все!",
    "Томат в лицо? Нет, спасибо, я на рыбной диете.",
    "Я не ленивый, я стратег: жду, пока помидоры сами упадут.",
    "Помидоры: Мы летим! Кот: А я ем рыбку и смотрю.",
    "Мяу-ха-ха! Томаты боятся моих когтей!",
    "Валерьянка: один глоток — и томаты дрожат от страха.",
    "Рыбка: +1 валюта. Томат: -1 нервы. Идеальная экономика!",
    "Помидоры: Мы — армия! → Кот: А я — выходной.",
    "Я сплю, ты кликаешь. Идеальный тандем против овощей!",
    "Помидоры атакуют? Я просто моргну — и они в сок!",
    "Рыбка в лапы — помидор в морду! Котий рай."
];

function saveData() {
    const data = { 
        fish: fishCount, 
        valerian: valerianStock, 
        memes: Array.from(seenMemes),
        skin: currentSkin,
        bg: currentBgKey,
        ownedCats: ownedCats,
        ownedBgs: ownedBgs,
        sound: isSoundOn,
        lastDaily: lastDaily,
        referralCount: referralCount,
        topScores: topScores
    };
    localStorage.setItem('cat_game_save_v2', JSON.stringify(data));
}

function loadData() {
    const saved = localStorage.getItem('cat_game_save_v2');
    if (saved) {
        const data = JSON.parse(saved);
        fishCount = data.fish || 0;
        valerianStock = data.valerian || 0;
        seenMemes = new Set(data.memes || []);
        currentSkin = data.skin || 'cat';
        currentBgKey = data.bg || 'bg_game';
        ownedCats = data.ownedCats || ['cat'];
        ownedBgs = data.ownedBgs || ['bg_game'];
        isSoundOn = data.sound !== false;
        lastDaily = data.lastDaily || 0;
        referralCount = data.referralCount || 0;
        topScores = data.topScores || [0, 0, 0];
    }
}

function canClaimDaily() {
    return Date.now() - lastDaily >= 86400000; // 24 часа
}

function preload() {
    this.load.image('bg_game', 'assets/backgrounds/bg_game.png');
    this.load.image('bg_garden', 'assets/backgrounds/bg_garden.png');
    this.load.image('bg_kitchen', 'assets/backgrounds/bg_kitchen.png');
    this.load.image('bg_space', 'assets/backgrounds/bg_space.png');
    this.load.image('cat_happy', 'assets/sprites/cat_happy.png');
    this.load.image('cat_angry', 'assets/sprites/cat_angry.png');
    this.load.image('cat_sleep', 'assets/sprites/cat_sleep.png');
    this.load.image('cat_orange_happy', 'assets/sprites/cat_orange_happy.png');
    this.load.image('cat_orange_angry', 'assets/sprites/cat_orange_angry.png');
    this.load.image('cat_orange_sleep', 'assets/sprites/cat_orange_sleep.png');
    this.load.image('cat_grey_happy', 'assets/sprites/cat_grey_happy.png');
    this.load.image('cat_grey_angry', 'assets/sprites/cat_grey_angry.png');
    this.load.image('cat_grey_sleep', 'assets/sprites/cat_grey_sleep.png');
    this.load.image('cat_black_happy', 'assets/sprites/cat_black_happy.png');
    this.load.image('cat_black_angry', 'assets/sprites/cat_black_angry.png');
    this.load.image('cat_black_sleep', 'assets/sprites/cat_black_sleep.png');
    this.load.image('tomato', 'assets/sprites/tomato.png');
    this.load.image('icon_fish', 'assets/sprites/icon_fish.png');
    this.load.image('icon_valerian', 'assets/sprites/icon_valerian.png');
    this.load.audio('meow', 'assets/sounds/meow.mp3');
    this.load.audio('meow2', 'assets/sounds/meow2.mp3');
    this.load.audio('tap', 'assets/sounds/tap.mp3');
    this.load.audio('loss', 'assets/sounds/loss.mp3');
}

function create() {
    loadData();

    const bg = this.add.image(180, 320, currentBgKey);

    cat = this.add.image(180, 550, `${currentSkin}_sleep`);

    tomatoesGroup = this.physics.add.group();

    scoreText = this.add.text(20, 20, '0', { fontSize: '24px', fill: '#fff' });

    livesText = this.add.text(20, 50, '❤❤❤', { fontSize: '24px', fill: '#fff' });

    levelText = this.add.text(300, 20, 'Ур. 1', { fontSize: '18px', fill: '#fff' }).setOrigin(1, 0);

    fishText = this.add.text(340, 50, `${fishCount} 🐟`, { fontSize: '18px', fill: '#fff' }).setOrigin(1, 0.5).setInteractive();
    fishText.on('pointerdown', () => UI.showShop(this));

    valStockText = this.add.text(340, 80, valerianStock, { fontSize: '18px', fill: '#fff' }).setOrigin(1, 0.5);

    memeCountText = this.add.text(340, 110, `🖼️ ${seenMemes.size}/${memes.length}`, { fontSize: '18px', fill: '#fff' }).setOrigin(1, 0.5).setInteractive();
    memeCountText.on('pointerdown', () => UI.showCollection(this, seenMemes, memes));

    if (!gameStarted) {
        startBtn = this.add.text(180, 320, 'ИГРАТЬ', { fontSize: '40px', fill: '#00ff00' }).setOrigin(0.5).setInteractive();
        startBtn.on('pointerdown', () => {
            gameStarted = true;
            startBtn.destroy();
            updateCatTexture('happy');
        });

        const settingsBtn = this.add.text(180, 400, 'НАСТРОЙКА', { fontSize: '20px', fill: '#fff' }).setOrigin(0.5).setInteractive();
        settingsBtn.on('pointerdown', () => UI.showSettings(this));
    }

    this.input.on('pointerdown', (pointer) => {
        if (gameRunning && !isPaused) {
            const tomato = tomatoesGroup.getChildren().find(t => t.getBounds().contains(pointer.x, pointer.y));
            if (tomato) {
                tomato.destroy();
                score += 10 * currentLevel;
                scoreText.setText(score);
                this.sound.play('tap');
                if (Phaser.Math.Between(1, 10) === 1) spawnFish.call(this);
            }
        }
    });
}

function update(time) {
    if (gameRunning && !isPaused && time > lastSpawnTime + (1000 / (currentLevel * gameDifficulty))) {
        lastSpawnTime = time;
        spawnTomato.call(this);
    }

    if (score >= currentLevel * 1000) {
        currentLevel++;
        levelText.setText(`Ур. ${currentLevel}`);
        gameDifficulty += 0.1;
    }

    if (score > lastMemeScore + 500) {
        lastMemeScore += 500;
        const idx = Phaser.Math.Between(0, memes.length - 1);
        if (!seenMemes.has(idx)) {
            seenMemes.add(idx);
            memeCountText.setText(`🖼️ ${seenMemes.size}/${memes.length}`);
            saveData();
            showMeme.call(this, idx);
        }
    }
}

function spawnTomato() {
    const tomato = this.physics.add.image(Phaser.Math.Between(20, 340), -20, 'tomato').setVelocityY(100 + currentLevel * 20);
    tomatoesGroup.add(tomato);

    this.physics.add.collider(tomato, cat, () => {
        tomato.destroy();
        loseLife.call(this);
    });

    tomato.body.onWorldBounds = true;
    tomato.body.world.on('worldbounds', (body) => {
        if (body.gameObject === tomato && body.blocked.bottom) tomato.destroy();
    });
}

function spawnFish() {
    const fish = this.physics.add.image(Phaser.Math.Between(20, 340), -20, 'icon_fish').setVelocityY(150);
    this.physics.add.collider(fish, cat, () => {
        fish.destroy();
        fishCount++;
        fishText.setText(`${fishCount} 🐟`);
        saveData();
    });

    fish.body.onWorldBounds = true;
    fish.body.world.on('worldbounds', (body) => {
        if (body.gameObject === fish && body.blocked.bottom) fish.destroy();
    });
}

function showMeme(idx) {
    isPaused = true;
    this.physics.pause();
    const overlay = this.add.container(0, 0).setDepth(500);
    const bg = this.add.rectangle(180, 320, 360, 640, 0x000000, 0.8);
    const txt = this.add.text(180, 300, memes[idx], { 
        fontSize: '24px', fill: '#fff', stroke: '#000', strokeThickness: 6, align: 'center', wordWrap: { width: 320 } 
    }).setOrigin(0.5);
    overlay.add([bg, txt]);

    UI.showMemeDetail(this, memes[idx]);
}

function loseLife() {
    lives--; this.sound.play('meow'); updateCatTexture('angry'); 
    let h = ''; for(let i=0; i<3; i++) h += (i < lives) ? '❤' : '♡';
    livesText.setText(h);
    if (lives <= 0) showGameOver.call(this);
}

function showGameOver() {
    gameRunning = false; this.physics.pause(); this.sound.play('loss');
    const over = this.add.container(0, 0).setDepth(600);
    over.add(this.add.rectangle(180, 320, 360, 640, 0x000000, 0.7));
    const btn = this.add.rectangle(180, 320, 280, 60, 0x9400d3).setInteractive();
    let lblText = (valerianStock > 0) ? `ИСПОЛЬЗОВАТЬ ВАЛЕРЬЯНКУ (${valerianStock})` : "НЕТ ВАЛЕРЬЯНКИ! ЗАПАСИСЬ!";
    const btnTxt = this.add.text(180, 320, lblText, { fontSize: '16px', fill: '#fff', fontWeight: 'bold' }).setOrigin(0.5);
    over.add([btn, btnTxt]);
    const rst = this.add.text(180, 400, '🔄 СНАЧАЛА', { fontSize: '22px', fill: '#fff' }).setOrigin(0.5).setInteractive();
    over.add(rst);
    
    // Обновление topScores
    if (score > topScores[2]) {
        topScores.push(score);
        topScores.sort((a, b) => b - a);
        topScores = topScores.slice(0, 3);
        saveData();
    }
    
    btn.on('pointerdown', () => { 
        if(valerianStock > 0) {
            valerianStock--; valStockText.setText(valerianStock); saveData();
            over.destroy(); resume.call(this); 
        }
    });
    rst.on('pointerdown', () => location.reload());
}

function resume() {
    lives = 3; livesText.setText('❤❤❤'); gameRunning = true; this.physics.resume();
    updateCatTexture('happy'); this.sound.play('meow2');
}

function togglePause() {
    if (!gameStarted || !gameRunning) return;
    isPaused = !isPaused;
    if (isPaused) {
        this.physics.pause();
        if (!pauseLabel) {
            pauseLabel = this.add.text(180, 320, 'ПАУЗА', { 
                fontSize: '50px', fill: '#fff', stroke: '#000', strokeThickness: 6 
            }).setOrigin(0.5).setDepth(501);
        }
    } else {
        this.physics.resume();
        if (pauseLabel) { pauseLabel.destroy(); pauseLabel = null; }
    }
}

function updateCatTexture(state) {
    cat.setTexture(`${currentSkin}_${state}`);
}
