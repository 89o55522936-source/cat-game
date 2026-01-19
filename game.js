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

let lastDailyTime = 0;
let referralCount = 0;
let topScores = [0, 0, 0];

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
        lastDaily: lastDailyTime,
        refCount: referralCount,
        tops: topScores
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
        isSoundOn = (data.sound !== undefined) ? data.sound : true;
        lastDailyTime = data.lastDaily || 0;
        referralCount = data.refCount || 0;
        topScores = data.tops || [0, 0, 0];
    }
}

function preload() {
    loadData();
    // Фоны
    this.load.image('bg_game', 'assets/backgrounds/bg_game.png');
    this.load.image('bg_garden', 'assets/backgrounds/bg_garden.png');
    this.load.image('bg_kitchen', 'assets/backgrounds/bg_kitchen.png');
    this.load.image('bg_space', 'assets/backgrounds/bg_space.png');

    // Спрайты (Белый)
    this.load.image('cat_sleep', 'assets/sprites/cat_sleep.png');
    this.load.image('cat_angry', 'assets/sprites/cat_angry.png');
    this.load.image('cat_happy', 'assets/sprites/cat_happy.png');
    // Рыжий
    this.load.image('cat_orange_sleep', 'assets/sprites/cat_orange_sleep.png');
    this.load.image('cat_orange_angry', 'assets/sprites/cat_orange_angry.png');
    this.load.image('cat_orange_happy', 'assets/sprites/cat_orange_happy.png');
    // Серый
    this.load.image('cat_grey_sleep', 'assets/sprites/cat_grey_sleep.png');
    this.load.image('cat_grey_angry', 'assets/sprites/cat_grey_angry.png');
    this.load.image('cat_grey_happy', 'assets/sprites/cat_grey_happy.png');
    // Черный
    this.load.image('cat_black_sleep', 'assets/sprites/cat_black_sleep.png');
    this.load.image('cat_black_angry', 'assets/sprites/cat_black_angry.png');
    this.load.image('cat_black_happy', 'assets/sprites/cat_black_happy.png');

    // Общие
    this.load.image('tomato', 'assets/sprites/tomato.png');
    this.load.image('icon_fish', 'assets/sprites/icon_fish.png');
    this.load.image('icon_valerian', 'assets/sprites/icon_valerian.png');

    // Звуки
    this.load.audio('tap', 'assets/sounds/tap.mp3');
    this.load.audio('meow', 'assets/sounds/meow.mp3');
    this.load.audio('meow2', 'assets/sounds/meow2.mp3');
    this.load.audio('loss', 'assets/sounds/loss.mp3');
}

function create() {
    this.sound.mute = !isSoundOn;

    const bg = this.add.image(180, 320, currentBgKey).setScale(1);
    cat = this.add.image(180, 560, `${currentSkin}_sleep`).setScale(0.55);
    tomatoesGroup = this.physics.add.group();

    scoreText = this.add.text(20, 10, '0', { fontSize: '24px', fill: '#fff' });
    livesText = this.add.text(300, 10, '❤❤❤', { fontSize: '24px', fill: '#fff' });
    fishText = this.add.text(20, 50, `🐟 ${fishCount}`, { fontSize: '20px', fill: '#fff' });
    valStockText = this.add.text(300, 50, `🌿 ${valerianStock}`, { fontSize: '20px', fill: '#fff' });
    levelText = this.add.text(180, 10, 'LVL 1', { fontSize: '20px', fill: '#aaa' }).setOrigin(0.5);
    memeCountText = this.add.text(180, 50, `🖼️ ${seenMemes.size}/${memes.length}`, { fontSize: '18px', fill: '#aaa' }).setOrigin(0.5);

    startBtn = this.add.rectangle(180, 320, 200, 60, 0x00ff00).setInteractive();
    const startTxt = this.add.text(180, 320, 'ИГРАТЬ', { fontSize: '24px', fill: '#000', fontWeight: 'bold' }).setOrigin(0.5);

    startBtn.on('pointerdown', () => {
        gameStarted = true; startBtn.destroy(); startTxt.destroy();
        updateCatTexture('happy'); this.sound.play('meow2');
    });

    const settingsBtn = this.add.rectangle(300, 580, 50, 50, 0x444444).setInteractive();
    this.add.text(300, 580, '⚙️', { fontSize: '30px', fill: '#fff' }).setOrigin(0.5);
    settingsBtn.on('pointerdown', () => UI.showSettings(this));

    const collectionBtn = this.add.rectangle(60, 580, 50, 50, 0x444444).setInteractive();
    this.add.text(60, 580, '🖼️', { fontSize: '30px', fill: '#fff' }).setOrigin(0.5);
    collectionBtn.on('pointerdown', () => UI.showCollection(this, seenMemes, memes));

    const shopBtn = this.add.rectangle(180, 580, 50, 50, 0x444444).setInteractive();
    this.add.text(180, 580, '🏪', { fontSize: '30px', fill: '#fff' }).setOrigin(0.5);
    shopBtn.on('pointerdown', () => UI.showShop(this));

    this.input.on('pointerdown', togglePause);

    tomatoesGroup.enableBody = true;
    this.physics.add.overlap(cat, tomatoesGroup, (c, t) => {
        if (t.texture.key === 'icon_fish') {
            fishCount++; fishText.setText(`🐟 ${fishCount}`); saveData();
            t.destroy(); this.sound.play('meow2');
        } else {
            t.destroy(); loseLife.call(this);
        }
    });

    tomatoesGroup.children.iterate(t => t.on('pointerdown', () => destroyTomato.call(this, t)));
}

function update(time) {
    if (!gameStarted || !gameRunning || isPaused) return;
    let spawnInterval = Math.max(500, 2500 / (gameDifficulty * 0.9));
    if (time > lastSpawnTime + spawnInterval) {
        spawn.call(this);
        lastSpawnTime = time;
    }
    tomatoesGroup.getChildren().forEach(t => { if (t.y > 640) t.destroy(); });
    if (score >= lastMemeScore + 500) { lastMemeScore += 500; showMeme.call(this); }
}

function spawn() {
    let x = Phaser.Math.Between(50, 310);
    let speed = Phaser.Math.Between(120, 180) * gameDifficulty;
    if (Phaser.Math.Between(1, 100) <= 8) {
        tomatoesGroup.create(x, -50, 'icon_fish').setScale(0.35).setInteractive().setVelocityY(speed * 0.8);
    } else {
        tomatoesGroup.create(x, -50, 'tomato').setScale(0.31).setInteractive().setVelocityY(speed);
    }
}

function destroyTomato(t) {
    score += 10; scoreText.setText(score);
    let nextLvl = Math.floor(score / 200) + 1;
    if (nextLvl > currentLevel) {
        currentLevel = nextLvl;
        levelText.setText('LVL ' + currentLevel);
        gameDifficulty += 0.10; 
    }
    this.sound.play('tap');
    this.tweens.add({ targets: t, scale: 0, duration: 100, onComplete: () => t.destroy() });
}

function showMeme() {
    isPaused = true; this.physics.pause();
    const idx = Phaser.Math.Between(0, memes.length - 1);
    seenMemes.add(idx);
    memeCountText.setText(`🖼️ ${seenMemes.size}/${memes.length}`);
    saveData(); 

    const overlay = this.add.container(0, 0).setDepth(500);
    const bg = this.add.rectangle(180, 320, 360, 640, 0x000000, 0.8);
    const txt = this.add.text(180, 300, memes[idx], { 
        fontSize: '24px', fill: '#fff', stroke: '#000', strokeThickness: 6, align: 'center', wordWrap: { width: 320 } 
    }).setOrigin(0.5);
    const btn = this.add.rectangle(180, 420, 200, 50, 0xffffff).setInteractive();
    const bTxt = this.add.text(180, 420, 'ПРОДОЛЖИТЬ', { fontSize: '20px', fill: '#000', fontWeight: 'bold' }).setOrigin(0.5);
    overlay.add([bg, txt, btn, bTxt]);

    btn.on('pointerdown', () => { overlay.destroy(); isPaused = false; this.physics.resume(); });
}

function loseLife() {
    lives--; this.sound.play('meow'); updateCatTexture('angry'); 
    let h = ''; for(let i=0; i<3; i++) h += (i < lives) ? '❤' : '♡';
    livesText.setText(h);
    if (lives <= 0) showGameOver.call(this);
}

function showGameOver() {
    gameRunning = false; this.physics.pause(); this.sound.play('loss');

    // Обновление топ-скоров
    topScores.push(score);
    topScores.sort((a, b) => b - a);
    topScores = topScores.slice(0, 3);
    saveData();

    const over = this.add.container(0, 0).setDepth(600);
    over.add(this.add.rectangle(180, 320, 360, 640, 0x000000, 0.7));
    const btn = this.add.rectangle(180, 320, 280, 60, 0x9400d3).setInteractive();
    let lblText = (valerianStock > 0) ? `ИСПОЛЬЗОВАТЬ ВАЛЕРЬЯНКУ (${valerianStock})` : "НЕТ ВАЛЕРЬЯНКИ! ЗАПАСИСЬ!";
    const btnTxt = this.add.text(180, 320, lblText, { fontSize: '16px', fill: '#fff', fontWeight: 'bold' }).setOrigin(0.5);
    over.add([btn, btnTxt]);
    const rst = this.add.text(180, 400, '🔄 СНАЧАЛА', { fontSize: '22px', fill: '#fff' }).setOrigin(0.5).setInteractive();
    over.add(rst);
    
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

function updateCatTexture(mood) {
    cat.setTexture(`${currentSkin}_${mood}`);
}
