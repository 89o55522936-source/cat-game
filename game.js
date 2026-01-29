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

// ========= НОВЫЕ ПЕРЕМЕННЫЕ =========
let shareCount = 0;
let bestScore = 0;
let lastDailyTime = 0;
// ===================================

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
    "Рыбка в лапы — помидор в морду! Котий рай.",
    "Ой, всё! Иду спать в коробку.",
    "Кетчуп — это кровь моих врагов.",
    "Помидор упал? Желание загадал!",
    "Ловлю помидоры так же ловко, как депрессию.",
    "Кликай активнее, мне на вискас не хватает!",
    "Кто-то должен работать, и хорошо, что это не я.",
    "Помидоры летят, нервы горят.",
    "Девять жизней? Поверь, я уже потратил восемь на глупости.",
    "Всё тлен. Кроме еды в моей миске.",
    "Жизнь — это очередь за рыбой, в конце которой тебя ждёт пылесос.",
    "Я не царапаюсь, я ставлю автографы на твоей коже.",
    "Работа не волк, работа — это когда я ору в 3 часа ночи.",
    "Единственное, что я хочу развивать — это свою лень.",
    "Твои нервы — моя любимая чесалка для когтей.",
    "Собрал еще 1000? Возьми с полки пирожок, только не мой.",
    "Шерстяное облачко с характером бензопилы.",
    "Я кот-арбузер: сначала мурчу, потом кусаю за пятку.",
    "Ты не ты, когда ты не съел кусок обоев.",
    "Мой вайб сегодня — «уставшая креветка».",
    "Если долго смотреть на помидор, он начнёт смотреть на тебя."
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
        // ========= НОВЫЕ ПОЛЯ ДЛЯ СОХРАНЕНИЯ =========
        shareCount: shareCount,
        bestScore: bestScore,
        lastDaily: lastDailyTime
        // =============================================
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
        // ========= ЗАГРУЗКА НОВЫХ ПЕРЕМЕННЫХ =========
        shareCount = data.shareCount || 0;
        bestScore = data.bestScore || 0;
        lastDailyTime = data.lastDaily || 0;
        // =============================================
    }
    
    // ========= АВТОМАТИЧЕСКИЙ БОНУС ЗА ВХОД =========
    const now = Date.now();
    if ((now - lastDailyTime) >= 86400000) {
        lastDailyTime = now;
        valerianStock++;
        saveData(); // Сохраняем сразу
    }
    // ================================================
}

function preload() {
    loadData();
    // Фоны
    this.load.image('bg_game', 'assets/backgrounds/bg_game.png');
    this.load.image('bg_garden', 'assets/backgrounds/bg_garden.png');
    this.load.image('bg_kitchen', 'assets/backgrounds/bg_kitchen.png');
    this.load.image('bg_space', 'assets/backgrounds/bg_space.png');
    this.load.image('bg_savannah', 'assets/backgrounds/bg_savannah.png'); // НОВЫЙ ФОН

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
    // Пятнистый (НОВЫЙ СКИН)
    this.load.image('cat_spotted_sleep', 'assets/sprites/cat_spotted_sleep.png');
    this.load.image('cat_spotted_angry', 'assets/sprites/cat_spotted_angry.png');
    this.load.image('cat_spotted_happy', 'assets/sprites/cat_spotted_happy.png');

    this.load.image('tomato', 'assets/sprites/tomato.png');
    this.load.image('icon_valerian', 'assets/sprites/icon_valerian.png');
    this.load.image('icon_fish', 'assets/sprites/icon_fish.png');
    
    this.load.audio('meow', 'assets/sounds/meow.mp3');
    this.load.audio('meow2', 'assets/sounds/meow2.mp3');
    this.load.audio('tap', 'assets/sounds/tap.mp3');
    this.load.audio('loss', 'assets/sounds/loss.mp3');
}

function create() {
    this.add.image(180, 320, currentBgKey).setDisplaySize(360, 640);
    cat = this.physics.add.sprite(180, 500, currentSkin + '_sleep').setScale(0.65).setImmovable(true);
    this.sound.mute = !isSoundOn;

    const textStyle = { fontSize: '22px', fill: '#000', fontWeight: 'bold', stroke: '#fff', strokeThickness: 4 };
    const row1Y = 565, row2Y = 610; 

    const pauseBtn = this.add.text(30, row1Y, '⏸', { fontSize: '34px', fill: '#000', stroke: '#fff', strokeThickness: 4 }).setOrigin(0.5).setInteractive();
    pauseBtn.on('pointerdown', () => togglePause.call(this));

    const fishImg = this.add.image(80, row1Y, 'icon_fish').setScale(0.20).setInteractive();
    fishText = this.add.text(100, row1Y, fishCount, textStyle).setOrigin(0, 0.5);
    fishImg.on('pointerdown', () => UI.showShop(this)); // ПЕРЕХОД В МАГАЗИН

   // Обновленный блок валерьянки с вызовом рекламы Telegram
    const valImg = this.add.image(190, row1Y, 'icon_valerian').setScale(0.18).setInteractive().setDepth(10);
    valStockText = this.add.text(215, row1Y, valerianStock, textStyle).setOrigin(0, 0.5).setDepth(10);
    
    valImg.on('pointerdown', () => { 
        // Теперь проверка if (isPaused) удалена, клик работает всегда
        
        // Вызываем функцию показа рекламы из telegram.js
        showTelegramAds((success) => {
            if (success) {
                valerianStock++; 
                valStockText.setText(valerianStock); 
                this.sound.play('tap'); 
                saveData();
            }
        });
    });

    memeCountText = this.add.text(345, row1Y, `🖼️ ${seenMemes.size}/${memes.length}`, { 
        fontSize: '15px', fill: '#000', fontWeight: 'bold', stroke: '#fff', strokeThickness: 3 
    }).setOrigin(1, 0.5).setInteractive();
    memeCountText.on('pointerdown', () => UI.showCollection(this, seenMemes, memes));

    scoreText = this.add.text(15, row2Y, '0', textStyle).setOrigin(0, 0.5);
    livesText = this.add.text(180, row2Y, '❤❤❤', { fontSize: '24px', fill: '#ff0000' }).setOrigin(0.5);
    levelText = this.add.text(345, row2Y, 'LVL 1', textStyle).setOrigin(1, 0.5);

    // Кнопки старта и настройки
    startBtn = this.add.container(180, 320).setDepth(200);
    const sRect = this.add.rectangle(0, 0, 200, 60, 0x00aa00).setInteractive();
    const sText = this.add.text(0, 0, 'ИГРАТЬ', { fontSize: '28px', fill: '#fff', fontWeight: 'bold' }).setOrigin(0.5);
    
    const settingsBtn = this.add.rectangle(0, -80, 200, 50, 0x555555).setInteractive();
    const settingsText = this.add.text(0, -80, 'НАСТРОЙКА', { fontSize: '20px', fill: '#fff' }).setOrigin(0.5);
    
    startBtn.add([sRect, sText, settingsBtn, settingsText]);
    
    sRect.on('pointerdown', () => { gameStarted = true; startBtn.destroy(); });
    settingsBtn.on('pointerdown', () => UI.showSettings(this));

    tomatoesGroup = this.physics.add.group();

    this.input.on('gameobjectdown', (pointer, obj) => {
        if (isPaused || !gameRunning) return;
        
        if (obj.texture) {
            // Если игрок нажал на ПОМИДОР — уничтожаем его и даем очки
            if (obj.texture.key === 'tomato') {
                destroyTomato.call(this, obj);
            } 
            // Если игрок случайно нажал на РЫБКУ — она исчезает БЕЗ начисления в счетчик
            else if (obj.texture.key === 'icon_fish') {
                this.sound.play('tap'); // Звук обычного нажатия
                obj.destroy(); // Удаляем объект с экрана
                // Счетчик fishCount НЕ увеличиваем
            }
        }
    });

    this.physics.add.overlap(cat, tomatoesGroup, (c, obj) => {
        if (obj.texture.key === 'tomato') {
            obj.destroy();
            loseLife.call(this);
        } else if (obj.texture.key === 'icon_fish') {
            obj.destroy();
            fishCount++; fishText.setText(fishCount);
            this.sound.play('meow2');
            updateCatTexture('sleep'); 
            saveData();
        }
    });
}

function updateCatTexture(state = 'sleep') {
    if (!cat) return;
    cat.setTexture(currentSkin + '_' + state);
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
    if (Phaser.Math.Between(1, 100) <= 7) {
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
    
    // ========= ОБНОВЛЕНИЕ ЛУЧШЕГО РЕКОРДА =========
    if (score > bestScore) {
        bestScore = score;
        saveData();
    }
    // =============================================
    
    const over = this.add.container(0, 0).setDepth(600);
    over.add(this.add.rectangle(180, 320, 360, 640, 0x000000, 0.7));
    const btn = this.add.rectangle(180, 320, 280, 60, 0x9400d3).setInteractive();
    let lblText = (valerianStock > 0) ? `ДАТЬ ВАЛЕРЬЯНКУ (${valerianStock})` : "НЕТ ВАЛЕРЬЯНКИ! ЗАПАСИСЬ!";
    const btnTxt = this.add.text(180, 320, lblText, { fontSize: '15px', fill: '#fff', fontWeight: 'bold' }).setOrigin(0.5);
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

