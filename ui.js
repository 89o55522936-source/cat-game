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
        const startX = 65, startY = 135, stepX = 75, stepY = 75, cols = 4;
        let isMemeOpen = false; // Флаг для предотвращения множественных открытий
        for (let i = 0; i < this.itemsPerPage; i++) {
            const index = (this.currentPage * this.itemsPerPage) + i;
            if (index >= allMemes.length) break;
            const x = startX + (i % cols) * stepX;
            const y = startY + Math.floor(i / cols) * stepY;
            const isOpened = seenMemes.has(index);
            const boxColor = isOpened ? 0x00ff00 : 0x333333;
            const box = scene.add.rectangle(x, y, 60, 60, boxColor).setStrokeStyle(2, 0xffffff).setInteractive();
            const numText = scene.add.text(x, y, index + 1, { fontSize: '22px', fill: isOpened ? '#000' : '#fff', fontWeight: 'bold' }).setOrigin(0.5);
            container.add([box, numText]);
            if (isOpened) {
                box.on('pointerdown', () => {
                    if (isMemeOpen) return; // Блокировка, если уже открыт мем
                    isMemeOpen = true;
                    const memeContainer = scene.add.container(0, 0).setDepth(1500);
                    const memeBg = scene.add.rectangle(180, 320, 320, 200, 0x222222).setStrokeStyle(2, 0xffffff);
                    const memeText = scene.add.text(180, 280, allMemes[index], { fontSize: '18px', fill: '#fff', align: 'center', wordWrap: { width: 280 } }).setOrigin(0.5);
                    const shareBtn = scene.add.rectangle(100, 380, 100, 40, 0x0066cc).setInteractive();
                    const shareText = scene.add.text(100, 380, 'ПОДЕЛИТЬСЯ', { fontSize: '14px', fill: '#fff' }).setOrigin(0.5);
                    const okBtn = scene.add.rectangle(260, 380, 80, 40, 0x00aa00).setInteractive();
                    const okText = scene.add.text(260, 380, 'ОК', { fontSize: '14px', fill: '#fff' }).setOrigin(0.5);
                    memeContainer.add([memeBg, memeText, shareBtn, shareText, okBtn, okText]);
                    shareBtn.on('pointerdown', () => {
                        shareMeme(allMemes[index]);
                    });
                    okBtn.on('pointerdown', () => {
                        memeContainer.destroy();
                        isMemeOpen = false;
                    });
                });
            }
        }
    },

    showSettings: function(scene) {
        if (this.container) this.container.destroy();
        this.container = scene.add.container(0, 0).setDepth(2000);
        
        const bg = scene.add.rectangle(180, 320, 300, 400, 0x000000, 0.9).setStrokeStyle(3, 0xffffff);
        const title = scene.add.text(180, 160, 'НАСТРОЙКИ', { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);
        this.container.add([bg, title]);

        // Вкладки
        this.settingsTab = 'general';
        const tabGeneral = scene.add.text(80, 200, 'ОБЩИЕ', { fontSize: '16px', fill: this.settingsTab === 'general' ? '#fff' : '#aaa' }).setOrigin(0.5).setInteractive();
        tabGeneral.on('pointerdown', () => { this.settingsTab = 'general'; this.showSettings(scene); });
        const tabSocial = scene.add.text(180, 200, 'СОЦ.', { fontSize: '16px', fill: this.settingsTab === 'social' ? '#fff' : '#aaa' }).setOrigin(0.5).setInteractive();
        tabSocial.on('pointerdown', () => { this.settingsTab = 'social'; this.showSettings(scene); });
        const tabRating = scene.add.text(280, 200, 'РЕЙТИНГ', { fontSize: '16px', fill: this.settingsTab === 'rating' ? '#fff' : '#aaa' }).setOrigin(0.5).setInteractive();
        tabRating.on('pointerdown', () => { this.settingsTab = 'rating'; this.showSettings(scene); });
        this.container.add([tabGeneral, tabSocial, tabRating]);

        if (this.settingsTab === 'general') {
            const soundBtn = scene.add.rectangle(180, 250, 220, 40, 0x444444).setInteractive();
            const soundTxt = scene.add.text(180, 250, `ЗВУК: ${isSoundOn ? 'ВКЛ' : 'ВЫКЛ'}`, { fontSize: '18px', fill: '#fff' }).setOrigin(0.5);
            soundBtn.on('pointerdown', () => {
                isSoundOn = !isSoundOn;
                scene.sound.mute = !isSoundOn;
                soundTxt.setText(`ЗВУК: ${isSoundOn ? 'ВКЛ' : 'ВЫКЛ'}`);
                saveData();
            });

            const resetBtn = scene.add.rectangle(180, 310, 220, 40, 0x660000).setInteractive();
            const resetTxt = scene.add.text(180, 310, 'СБРОС ПРОГРЕССА', { fontSize: '16px', fill: '#fff' }).setOrigin(0.5);
            resetBtn.on('pointerdown', () => {
                this.showConfirm(scene, "Сбросить весь прогресс?", () => {
                    localStorage.clear();
                    location.reload();
                });
            });

            const infoBtn = scene.add.rectangle(180, 370, 220, 40, 0x006600).setInteractive();
            const infoTxt = scene.add.text(180, 370, 'ИНСТРУКЦИЯ', { fontSize: '16px', fill: '#fff' }).setOrigin(0.5);
            infoBtn.on('pointerdown', () => {
                this.showInfo(scene, "ИНСТРУКЦИЯ\n\n1. Сбивай помидоры кликом.\n2. Лови рыбок для магазина.\n3. Каждые 500 очков - новый мем.\n4. Валерьянка спасет при проигрыше.\n5. Покупай скины в магазине!");
            });

            const author = scene.add.text(180, 430, 'Автор: @AlexCosta1978', { fontSize: '14px', fill: '#aaa' }).setOrigin(0.5);
            this.container.add([soundBtn, soundTxt, resetBtn, resetTxt, infoBtn, infoTxt, author]);
        } else if (this.settingsTab === 'social') {
            const recommendBtn = scene.add.rectangle(180, 250, 220, 40, 0x0066cc).setInteractive();
            const recommendTxt = scene.add.text(180, 250, 'РЕКОМЕНДОВАТЬ ДРУГУ', { fontSize: '16px', fill: '#fff' }).setOrigin(0.5);
            recommendBtn.on('pointerdown', () => {
                if (referralCount < 50) {
                    referralCount++;
                    valerianStock++;
                    valStockText.setText(valerianStock);
                    saveData();
                }
                shareGame();
            });

            const dailyBtn = scene.add.rectangle(180, 310, 220, 40, 0x00aa00).setInteractive();
            const now = Date.now();
            const canClaim = (now - lastDailyTime) >= 86400000; // 24 часа
            const dailyTxt = scene.add.text(180, 310, canClaim ? 'ЕЖЕДНЕВНЫЙ БОНУС (+1 ВАЛЕРЬЯНКА)' : 'БОНУС УЖЕ ЗАБРАН (ПОДОЖДИ 24 ЧАСА)', { fontSize: '14px', fill: '#fff', wordWrap: { width: 200 } }).setOrigin(0.5);
            if (!canClaim) dailyBtn.setFillStyle(0x444444);
            dailyBtn.on('pointerdown', () => {
                if (canClaim) {
                    lastDailyTime = now;
                    valerianStock++;
                    valStockText.setText(valerianStock);
                    saveData();
                    this.showSettings(scene); // Обновить UI
                }
            });

            const refInfo = scene.add.text(180, 370, `ВАЛЕРЬЯНОК ЗА РЕКОМЕНДАЦИИ: ${referralCount}/50`, { fontSize: '14px', fill: '#aaa' }).setOrigin(0.5);
            this.container.add([recommendBtn, recommendTxt, dailyBtn, dailyTxt, refInfo]);
        } else if (this.settingsTab === 'rating') {
            const top1 = scene.add.text(180, 250, `1. ${topScores[0]} ОЧКОВ`, { fontSize: '18px', fill: '#fff' }).setOrigin(0.5);
            const shareTopBtn = scene.add.rectangle(280, 250, 60, 30, 0x0066cc).setInteractive();
            const shareTopTxt = scene.add.text(280, 250, 'ПОДЕЛИТЬСЯ', { fontSize: '12px', fill: '#fff' }).setOrigin(0.5);
            shareTopBtn.on('pointerdown', () => {
                shareTopScore(topScores[0]);
            });

            const top2 = scene.add.text(180, 310, `2. ${topScores[1]} ОЧКОВ`, { fontSize: '18px', fill: '#fff' }).setOrigin(0.5);
            const top3 = scene.add.text(180, 370, `3. ${topScores[2]} ОЧКОВ`, { fontSize: '18px', fill: '#fff' }).setOrigin(0.5);
            this.container.add([top1, shareTopBtn, shareTopTxt, top2, top3]);
        }

        const closeBtn = scene.add.text(180, 490, 'ЗАКРЫТЬ', { fontSize: '20px', fill: '#ff0000', fontWeight: 'bold' }).setOrigin(0.5).setInteractive();
        closeBtn.on('pointerdown', () => this.container.destroy());
        this.container.add(closeBtn);
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
