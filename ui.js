// ui.js — Версия v1.6 (Фикс UI и кастомные окна)
const UI = {
    currentPage: 0,
    itemsPerPage: 20,
    container: null,

    // --- МАГАЗИН (ЦЕНЫ ТУТ) ---
    shopTab: 'cats',
    shopItems: {
        cats: [
            { id: 'cat', name: 'Белый', price: 0 },
            { id: 'cat_orange', name: 'Рыжий', price: 10 }, // МЕНЯТЬ ЦЕНУ ЗДЕСЬ
            { id: 'cat_grey', name: 'Серый', price: 30 },   // МЕНЯТЬ ЦЕНУ ЗДЕСЬ
            { id: 'cat_black', name: 'Черный', price: 70 }  // МЕНЯТЬ ЦЕНУ ЗДЕСЬ
        ],
        backgrounds: [
            { id: 'bg_game', name: 'Комната', price: 0 },
            { id: 'bg_garden', name: 'Сад', price: 10 },    // МЕНЯТЬ ЦЕНУ ЗДЕСЬ
            { id: 'bg_kitchen', name: 'Кухня', price: 40 }, // МЕНЯТЬ ЦЕНУ ЗДЕСЬ
            { id: 'bg_space', name: 'Космос', price: 80 }   // МЕНЯТЬ ЦЕНУ ЗДЕСЬ
        ]
    },

    showCollection: function(scene, seenMemes, allMemes) {
        const wasPausedBefore = isPaused;
        isPaused = true;
        scene.physics.pause();
        this.drawMainOverlay(scene, seenMemes, allMemes, wasPausedBefore);
    },

    drawMainOverlay: function(scene, seenMemes, allMemes, wasPausedBefore) {
        if (this.container) this.container.destroy();
        this.container = scene.add.container(0, 0).setDepth(1000);
        
        const bg = scene.add.rectangle(180, 320, 340, 540, 0x000000, 0.95).setStrokeStyle(4, 0xffffff);
        const title = scene.add.text(180, 75, 'КОЛЛЕКЦИЯ МЕМОВ', { fontSize: '22px', fontWeight: 'bold', fill: '#fff' }).setOrigin(0.5);
        this.container.add([bg, title]);

        this.drawGrid(scene, this.container, seenMemes, allMemes);

        const totalPages = Math.ceil(allMemes.length / this.itemsPerPage);
        const navY = 495;

        const prevBtn = scene.add.text(80, navY, '<', { fontSize: '40px', fill: this.currentPage > 0 ? '#fff' : '#444' }).setOrigin(0.5).setInteractive();
        prevBtn.on('pointerdown', () => { if (this.currentPage > 0) { this.currentPage--; this.drawMainOverlay(scene, seenMemes, allMemes, wasPausedBefore); }});

        const pageText = scene.add.text(180, navY, `${this.currentPage + 1} / ${totalPages}`, { fontSize: '18px', fill: '#aaa' }).setOrigin(0.5);

        const nextBtn = scene.add.text(280, navY, '>', { fontSize: '40px', fill: (this.currentPage + 1) < totalPages ? '#fff' : '#444' }).setOrigin(0.5).setInteractive();
        nextBtn.on('pointerdown', () => { if ((this.currentPage + 1) < totalPages) { this.currentPage++; this.drawMainOverlay(scene, seenMemes, allMemes, wasPausedBefore); }});
        
        const closeBtn = scene.add.rectangle(180, 555, 200, 40, 0xcc0000).setInteractive();
        const closeText = scene.add.text(180, 555, 'ВЕРНУТЬСЯ', { fontSize: '18px', fill: '#fff', fontWeight: 'bold' }).setOrigin(0.5);
        
        this.container.add([prevBtn, pageText, nextBtn, closeBtn, closeText]);

        closeBtn.on('pointerdown', () => {
            this.container.destroy();
            this.container = null;
            if (!wasPausedBefore) { isPaused = false; scene.physics.resume(); }
        });
    },

    drawGrid: function(scene, container, seenMemes, allMemes) {
        // ========= ФИКС БАГА: ФЛАГ МНОЖЕСТВЕННОГО ОТКРЫТИЯ =========
        let isMemeOpen = false;
        // ===========================================================
        
        const startX = 65, startY = 135, stepX = 75, stepY = 75, cols = 4;
        for (let i = 0; i < this.itemsPerPage; i++) {
            const index = (this.currentPage * this.itemsPerPage) + i;
            if (index >= allMemes.length) break;
            const x = startX + (i % cols) * stepX;
            const y = startY + Math.floor(i / cols) * stepY;
            const isOpened = seenMemes.has(index);
            const boxColor = isOpened ? 0x00ff00 : 0x444444;
            const box = scene.add.rectangle(x, y, 60, 60, boxColor).setStrokeStyle(2, 0xffffff).setInteractive();
            const numText = scene.add.text(x, y, index + 1, { fontSize: '16px', fill: isOpened ? '#000' : '#fff' }).setOrigin(0.5);
            container.add([box, numText]);
            
            if (isOpened) box.on('pointerdown', () => {
                // ========= ПРЕДОТВРАЩЕНИЕ МНОЖЕСТВЕННОГО ОТКРЫТИЯ =========
                if (isMemeOpen) return;
                isMemeOpen = true;
                // =========================================================
                
                // ========= ОРИГИНАЛЬНЫЙ КОД ОКНА МЕМА С КНОПКАМИ =========
                const detail = scene.add.container(0, 0).setDepth(1100);
                const dim = scene.add.rectangle(180, 320, 360, 640, 0x000000, 0.8);
                const back = scene.add.rectangle(180, 320, 310, 200, 0x111111, 0.98); // ОРИГИНАЛЬНЫЙ размер 320x200
                const memeText = scene.add.text(180, 300, allMemes[index], { fontSize: '18px', fill: '#fff', align: 'center', wordWrap: { width: 270 } }).setOrigin(0.5);
                
                // ========= КНОПКА "ПОДЕЛИТЬСЯ" (НОВАЯ ПО ТЗ) =========
                const shareBtn = scene.add.rectangle(100, 380, 100, 40, 0x0066cc).setInteractive();
                const shareTxt = scene.add.text(100, 380, 'ПОДЕЛИТЬСЯ', { fontSize: '14px', fill: '#fff' }).setOrigin(0.5);
                // =====================================================
                
                // ========= КНОПКА "ОК" (ПЕРЕИМЕНОВАНА ПО ТЗ) =========
                const closeBtn = scene.add.rectangle(260, 380, 80, 40, 0x00aa00).setInteractive();
                const closeTxt = scene.add.text(260, 380, 'ОК', { fontSize: '14px', fill: '#fff', fontWeight: 'bold' }).setOrigin(0.5);
                // =====================================================
                
                detail.add([dim, back, memeText, shareBtn, shareTxt, closeBtn, closeTxt]);
                
                // ========= ОБРАБОТЧИК "ПОДЕЛИТЬСЯ" =========
                shareBtn.on('pointerdown', () => {
                    // Вызов функции из telegram.js
                    shareMeme(allMemes[index]);
                    
                    // Начисление бонуса (максимум 10 раз)
                    if (shareCount < 10) {
                        shareCount++;
                        valerianStock++;
                        valStockText.setText(valerianStock);
                        saveData();
                    }
                });
                
                // ========= ОБРАБОТЧИК "ОК" (СО СБРОСОМ ФЛАГА) =========
                closeBtn.on('pointerdown', () => {
                    detail.destroy();
                    // ========= СБРОС ФЛАГА ПРИ ЗАКРЫТИИ =========
                    isMemeOpen = false;
                    // ============================================
                });
            });
        }
    },

    showShop: function(scene) {
        const wasPaused = isPaused;
        isPaused = true; scene.physics.pause();
        if (this.container) this.container.destroy();
        this.container = scene.add.container(0, 0).setDepth(1000);

        const bg = scene.add.rectangle(180, 320, 340, 540, 0x000022, 0.95).setStrokeStyle(4, 0x00ffff);
        const title = scene.add.text(180, 75, 'МАГАЗИН', { fontSize: '26px', fontWeight: 'bold', fill: '#fff' }).setOrigin(0.5);
        this.container.add([bg, title]);

        // Вкладки
        const isCats = this.shopTab === 'cats';
        const btnCats = scene.add.rectangle(110, 120, 120, 40, isCats ? 0x00ffff : 0x444444).setInteractive();
        const txtCats = scene.add.text(110, 120, 'КОТЫ', { fontSize: '16px', fill: isCats ? '#000' : '#fff' }).setOrigin(0.5);
        
        const isBgs = this.shopTab === 'backgrounds';
        const btnBgs = scene.add.rectangle(250, 120, 120, 40, isBgs ? 0x00ffff : 0x444444).setInteractive();
        const txtBgs = scene.add.text(250, 120, 'ФОНЫ', { fontSize: '16px', fill: isBgs ? '#000' : '#fff' }).setOrigin(0.5);
        
        this.container.add([btnCats, txtCats, btnBgs, txtBgs]);

        btnCats.on('pointerdown', () => { this.shopTab = 'cats'; this.showShop(scene); });
        btnBgs.on('pointerdown', () => { this.shopTab = 'backgrounds'; this.showShop(scene); });

        const items = this.shopItems[this.shopTab];
        items.forEach((item, i) => {
            const y = 190 + i * 70;
            const isOwned = (this.shopTab === 'cats') ? ownedCats.includes(item.id) : ownedBgs.includes(item.id);
            const isSelected = (this.shopTab === 'cats') ? currentSkin === item.id : currentBgKey === item.id;

            const itemBg = scene.add.rectangle(180, y, 300, 60, isSelected ? 0x225522 : 0x222222).setStrokeStyle(2, 0xffffff).setInteractive();
            const itemName = scene.add.text(45, y, item.name, { fontSize: '18px', fill: '#fff' }).setOrigin(0, 0.5);
            
            let statusTxt = isOwned ? (isSelected ? "ВЫБРАНО" : "ВЫБРАТЬ") : `🛒 ${item.price}`;
            const statusBtn = scene.add.text(315, y, statusTxt, { fontSize: '16px', fill: isOwned ? '#00ff00' : '#ffff00', fontWeight: 'bold' }).setOrigin(1, 0.5);

            this.container.add([itemBg, itemName, statusBtn]);

            itemBg.on('pointerdown', () => {
                if (!isOwned) {
                    if (fishCount >= item.price) {
                        fishCount -= item.price;
                        if (this.shopTab === 'cats') ownedCats.push(item.id);
                        else ownedBgs.push(item.id);
                        fishText.setText(fishCount);
                        saveData();
                        this.showShop(scene);
                    }
                } else {
                    if (this.shopTab === 'cats') currentSkin = item.id;
                    else {
                        currentBgKey = item.id;
                        scene.children.list[0].setTexture(item.id);
                    }
                    saveData();
                    updateCatTexture();
                    this.showShop(scene);
                }
            });
        });

        const closeBtn = scene.add.rectangle(180, 555, 200, 40, 0xcc0000).setInteractive();
        const closeText = scene.add.text(180, 555, 'ЗАКРЫТЬ', { fontSize: '18px', fill: '#fff', fontWeight: 'bold' }).setOrigin(0.5);
        this.container.add([closeBtn, closeText]);
        closeBtn.on('pointerdown', () => { 
            this.container.destroy(); this.container = null; 
            if (!wasPaused) { isPaused = false; scene.physics.resume(); }
        });
    },

    showSettings: function(scene) {
        if (this.container) this.container.destroy();
        this.container = scene.add.container(0, 0).setDepth(2000);
        
        const bg = scene.add.rectangle(180, 320, 300, 360, 0x000000, 0.9).setStrokeStyle(3, 0xffffff);
        // ========= ЗАГОЛОВОК "ТОП-1" ВМЕСТО "НАСТРОЙКИ" =========
        const title = scene.add.text(180, 160, 'ТОП-1: ' + bestScore, { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);
        // ========================================================
        
        const soundBtn = scene.add.rectangle(180, 230, 220, 40, 0x444444).setInteractive();
        const soundTxt = scene.add.text(180, 230, `ЗВУК: ${isSoundOn ? 'ВКЛ' : 'ВЫКЛ'}`, { fontSize: '18px', fill: '#fff' }).setOrigin(0.5);
        soundBtn.on('pointerdown', () => {
            isSoundOn = !isSoundOn;
            scene.sound.mute = !isSoundOn;
            soundTxt.setText(`ЗВУК: ${isSoundOn ? 'ВКЛ' : 'ВЫКЛ'}`);
            saveData();
        });

        const resetBtn = scene.add.rectangle(180, 290, 220, 40, 0x660000).setInteractive();
        const resetTxt = scene.add.text(180, 290, 'СБРОС ПРОГРЕССА', { fontSize: '15px', fill: '#fff' }).setOrigin(0.5);
        resetBtn.on('pointerdown', () => {
            this.showConfirm(scene, "Сбросить весь прогресс?", () => {
                localStorage.clear();
                location.reload();
            });
        });

        const infoBtn = scene.add.rectangle(180, 350, 220, 40, 0x006600).setInteractive();
        const infoTxt = scene.add.text(180, 350, 'ИНСТРУКЦИЯ', { fontSize: '15px', fill: '#fff' }).setOrigin(0.5);
        infoBtn.on('pointerdown', () => {
    this.showInfo(scene, 
        "1. Кликай по падающим помидорам\n" +
        "2. Рыбки котику для магазина\n" + 
        "3. Собирай мемы каждые 500 очков\n" +
        "4. Валерьянка спасет при проигрыше\n" +
        "5. Делись мемами — получай валерьянку\n" +
        "6. Каждый день одна валерьянка бонусом\n" +
        "7. Бей свой рекорд — обновляй ТОП-1"
    );
});

        const author = scene.add.text(180, 410, 'Автор: zodiac', { fontSize: '15px', fill: '#aaa' }).setOrigin(0.5);
        const closeBtn = scene.add.text(180, 470, 'ЗАКРЫТЬ', { fontSize: '20px', fill: '#ff0000', fontWeight: 'bold' }).setOrigin(0.5).setInteractive();
        closeBtn.on('pointerdown', () => this.container.destroy());

        this.container.add([bg, title, soundBtn, soundTxt, resetBtn, resetTxt, infoBtn, infoTxt, author, closeBtn]);
    },

    showConfirm: function(scene, text, onConfirm) {
        const dialog = scene.add.container(0, 0).setDepth(3000);
        dialog.add(scene.add.rectangle(180, 320, 360, 640, 0x000000, 0.8));
        dialog.add(scene.add.rectangle(180, 320, 280, 200, 0x222222, 1).setStrokeStyle(2, 0xffffff));
        dialog.add(scene.add.text(180, 280, text, { fontSize: '18px', fill: '#fff', align: 'center', wordWrap: { width: 240 } }).setOrigin(0.5));
        
        const okBtn = scene.add.rectangle(110, 370, 100, 40, 0x00aa00).setInteractive();
        dialog.add(okBtn);
        dialog.add(scene.add.text(110, 370, 'ДА', { fontSize: '18px', fill: '#fff' }).setOrigin(0.5));
        
        const noBtn = scene.add.rectangle(250, 370, 100, 40, 0xaa0000).setInteractive();
        dialog.add(noBtn);
        dialog.add(scene.add.text(250, 370, 'НЕТ', { fontSize: '18px', fill: '#fff' }).setOrigin(0.5));
        
        okBtn.on('pointerdown', onConfirm);
        noBtn.on('pointerdown', () => dialog.destroy());
    },

    showInfo: function(scene, text) {
        const dialog = scene.add.container(0, 0).setDepth(3000);
        dialog.add(scene.add.rectangle(180, 320, 360, 640, 0x000000, 0.8));
        dialog.add(scene.add.rectangle(180, 320, 300, 320, 0x222222, 1).setStrokeStyle(2, 0xffffff));
        dialog.add(scene.add.text(180, 300, text, { fontSize: '16px', fill: '#fff', align: 'left', wordWrap: { width: 260 } }).setOrigin(0.5));
        
        const closeBtn = scene.add.rectangle(180, 440, 120, 40, 0x444444).setInteractive();
        dialog.add(closeBtn);
        dialog.add(scene.add.text(180, 440, 'ПОНЯЛ', { fontSize: '18px', fill: '#fff' }).setOrigin(0.5));
        closeBtn.on('pointerdown', () => dialog.destroy());
    }
};



