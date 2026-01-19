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

        const closeBtn = scene.add.text(180, 550, 'ЗАКРЫТЬ', { fontSize: '20px', fill: '#ff0000' }).setOrigin(0.5).setInteractive();
        closeBtn.on('pointerdown', () => {
            this.container.destroy();
            isPaused = wasPausedBefore;
            if (!isPaused) scene.physics.resume();
        });

        this.container.add([prevBtn, pageText, nextBtn, closeBtn]);
    },

    drawGrid: function(scene, container, seenMemes, allMemes) {
        const cols = 4;
        const startX = 20, startY = 110, stepX = 80, stepY = 80;

        for (let i = 0; i < this.itemsPerPage; i++) {
            const index = (this.currentPage * this.itemsPerPage) + i;
            if (index >= allMemes.length) break;

            const x = startX + (i % cols) * stepX;
            const y = startY + Math.floor(i / cols) * stepY;

            const rect = scene.add.rectangle(x + 40, y + 40, 70, 70, seenMemes.has(index) ? 0x00ff00 : 0xaaaaaa).setStrokeStyle(2, 0xffffff).setInteractive();
            const txt = scene.add.text(x + 40, y + 40, seenMemes.has(index) ? allMemes[index] : '?', { fontSize: '12px', fill: '#000', wordWrap: { width: 60 }, align: 'center' }).setOrigin(0.5);

            rect.on('pointerdown', () => {
                if (isMemeOpen || !seenMemes.has(index)) return;
                isMemeOpen = true;
                this.showMemeDetail(scene, allMemes[index]);
            });

            container.add([rect, txt]);
        }
    },

    showMemeDetail: function(scene, memeText) {
        const dialog = scene.add.container(0, 0).setDepth(3000);
        dialog.add(scene.add.rectangle(180, 320, 360, 640, 0x000000, 0.8));
        dialog.add(scene.add.rectangle(180, 320, 300, 320, 0x222222, 1).setStrokeStyle(2, 0xffffff));
        dialog.add(scene.add.text(180, 300, memeText, { fontSize: '16px', fill: '#fff', align: 'left', wordWrap: { width: 260 } }).setOrigin(0.5));
        
        const shareBtn = scene.add.rectangle(100, 440, 120, 40, 0x006600).setInteractive();
        dialog.add(shareBtn);
        dialog.add(scene.add.text(100, 440, 'ПОДЕЛИТЬСЯ', { fontSize: '18px', fill: '#fff' }).setOrigin(0.5));
        shareBtn.on('pointerdown', () => {
            tg.share({ text: memeText + '\nИз игры Cat vs Tomato! ' + URL });
        });

        const closeBtn = scene.add.rectangle(260, 440, 120, 40, 0x444444).setInteractive();
        dialog.add(closeBtn);
        dialog.add(scene.add.text(260, 440, 'ОК', { fontSize: '18px', fill: '#fff' }).setOrigin(0.5));
        closeBtn.on('pointerdown', () => {
            dialog.destroy();
            isMemeOpen = false;
        });
    },

    showSettings: function(scene) {
        if (this.container) this.container.destroy();
        this.container = scene.add.container(0, 0).setDepth(1000);

        const bg = scene.add.rectangle(180, 320, 340, 540, 0x000000, 0.95).setStrokeStyle(4, 0xffffff);
        const title = scene.add.text(180, 75, 'НАСТРОЙКИ', { fontSize: '22px', fontWeight: 'bold', fill: '#fff' }).setOrigin(0.5);
        this.container.add([bg, title]);

        // Вкладки
        this.settingsTab = 'general'; // По умолчанию 'Общие'
        const tabGeneral = scene.add.text(90, 110, 'ОБЩИЕ', { fontSize: '18px', fill: this.settingsTab === 'general' ? '#fff' : '#aaa' }).setOrigin(0.5).setInteractive();
        tabGeneral.on('pointerdown', () => { this.settingsTab = 'general'; this.showSettings(scene); });
        const tabSocial = scene.add.text(180, 110, 'СОЦ.', { fontSize: '18px', fill: this.settingsTab === 'social' ? '#fff' : '#aaa' }).setOrigin(0.5).setInteractive();
        tabSocial.on('pointerdown', () => { this.settingsTab = 'social'; this.showSettings(scene); });
        const tabRating = scene.add.text(270, 110, 'РЕЙТИНГ', { fontSize: '18px', fill: this.settingsTab === 'rating' ? '#fff' : '#aaa' }).setOrigin(0.5).setInteractive();
        tabRating.on('pointerdown', () => { this.settingsTab = 'rating'; this.showSettings(scene); });
        this.container.add([tabGeneral, tabSocial, tabRating]);

        // Контент вкладок
        if (this.settingsTab === 'general') {
            const soundBtn = scene.add.rectangle(180, 160, 220, 40, isSoundOn ? 0x00aa00 : 0xaa0000).setInteractive();
            const soundTxt = scene.add.text(180, 160, `ЗВУК: ${isSoundOn ? 'ВКЛ' : 'ВЫКЛ'}`, { fontSize: '18px', fill: '#fff' }).setOrigin(0.5);
            soundBtn.on('pointerdown', () => { isSoundOn = !isSoundOn; saveData(); this.showSettings(scene); });

            const resetBtn = scene.add.rectangle(180, 210, 220, 40, 0xaa0000).setInteractive();
            const resetTxt = scene.add.text(180, 210, 'СБРОС ПРОГРЕССА', { fontSize: '18px', fill: '#fff' }).setOrigin(0.5);
            resetBtn.on('pointerdown', () => {
                this.showConfirm(scene, 'СБРОСИТЬ ВЕСЬ ПРОГРЕСС?', () => {
                    localStorage.clear(); location.reload();
                });
            });

            const infoBtn = scene.add.rectangle(180, 260, 220, 40, 0x444444).setInteractive();
            const infoTxt = scene.add.text(180, 260, 'ИНСТРУКЦИЯ', { fontSize: '18px', fill: '#fff' }).setOrigin(0.5);
            infoBtn.on('pointerdown', () => {
                this.showInfo(scene, "ИНСТРУКЦИЯ\n\n1. Сбивай помидоры кликом.\n2. Лови рыбок для магазина.\n3. Каждые 500 очков - новый мем.\n4. Валерьянка спасет при проигрыше.\n5. Покупай скины в магазине!");
            });

            const author = scene.add.text(180, 310, 'Автор: @AlexCosta1978', { fontSize: '14px', fill: '#aaa' }).setOrigin(0.5);

            this.container.add([soundBtn, soundTxt, resetBtn, resetTxt, infoBtn, infoTxt, author]);
        } else if (this.settingsTab === 'social') {
            const shareGameBtn = scene.add.rectangle(180, 160, 220, 40, 0x006600).setInteractive();
            const shareGameTxt = scene.add.text(180, 160, 'РЕКОМЕНДОВАТЬ ДРУГУ', { fontSize: '18px', fill: '#fff' }).setOrigin(0.5);
            shareGameBtn.on('pointerdown', () => {
                if (referralCount < 50) {
                    referralCount++;
                    valerianStock++;
                    valStockText.setText(valerianStock);
                    saveData();
                }
                tg.shareUrl(URL, 'Играй в Cat vs Tomato! Юморная игра с котиками и мемами против помидоров.');
            });

            const dailyBtn = scene.add.rectangle(180, 210, 220, 40, canClaimDaily() ? 0x00aa00 : 0xaaaaaa).setInteractive();
            const dailyTxt = scene.add.text(180, 210, canClaimDaily() ? 'ЗАБРАТЬ ЕЖЕДНЕВНЫЙ БОНУС (+1 валерьянка)' : 'БОНУС УЖЕ ЗАБРАН', { fontSize: '18px', fill: '#fff' }).setOrigin(0.5);
            dailyBtn.on('pointerdown', () => {
                if (canClaimDaily()) {
                    valerianStock++;
                    lastDaily = Date.now();
                    valStockText.setText(valerianStock);
                    saveData();
                    this.showSettings(scene);
                }
            });

            const referralInfo = scene.add.text(180, 260, `Валерьянок за друзей: ${referralCount}/50`, { fontSize: '14px', fill: '#aaa' }).setOrigin(0.5);

            this.container.add([shareGameBtn, shareGameTxt, dailyBtn, dailyTxt, referralInfo]);
        } else if (this.settingsTab === 'rating') {
            const top1 = scene.add.text(180, 160, `1. ${topScores[0]} очков`, { fontSize: '18px', fill: '#fff' }).setOrigin(0.5);
            const top2 = scene.add.text(180, 210, `2. ${topScores[1]} очков`, { fontSize: '18px', fill: '#fff' }).setOrigin(0.5);
            const top3 = scene.add.text(180, 260, `3. ${topScores[2]} очков`, { fontSize: '18px', fill: '#fff' }).setOrigin(0.5);

            const shareTopBtn = scene.add.rectangle(180, 310, 220, 40, 0x006600).setInteractive();
            const shareTopTxt = scene.add.text(180, 310, 'ПОДЕЛИТЬСЯ РЕЙТИНГОМ', { fontSize: '18px', fill: '#fff' }).setOrigin(0.5);
            shareTopBtn.on('pointerdown', () => {
                const topText = `Мой топ в Cat vs Tomato:\n1. ${topScores[0]}\n2. ${topScores[1]}\n3. ${topScores[2]}\nЯ спас котика от помидоров! Играй: ${URL}`;
                tg.share({ text: topText });
            });

            this.container.add([top1, top2, top3, shareTopBtn, shareTopTxt]);
        }

        const closeBtn = scene.add.text(180, 470, 'ЗАКРЫТЬ', { fontSize: '20px', fill: '#ff0000', fontWeight: 'bold' }).setOrigin(0.5).setInteractive();
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
