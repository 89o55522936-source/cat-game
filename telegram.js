// telegram.js — ФИНАЛЬНАЯ ВЕРСИЯ ДЛЯ ЗАПУСКА В TELEGRAM + Adsgram Rewarded Video

const tg = window.Telegram.WebApp;

// Расширяем приложение на весь экран и сообщаем о готовности сразу
tg.expand();
tg.ready();

// Настройка цветов темы (черный фон)
tg.setHeaderColor('#000000');
tg.setBackgroundColor('#000000');

/**
 * Показывает rewarded video рекламу через Adsgram
 * @param {function(boolean)} callback - вызывается с true при успешном просмотре, false при отмене/ошибке
 */
function showTelegramAds(callback) {
    // Инициализация Adsgram контроллера с вашим Unit ID
    const adsgramController = Adsgram.init({
        blockId: "21312"   // ← ваш реальный ID из Adsgram
    });

    // Запуск рекламы
    adsgramController.show()
        .then(() => {
            // Успешный просмотр (пользователь досмотрел до конца)
            callback(true);
        })
        .catch((error) => {
            // Пользователь закрыл рекламу раньше или произошла ошибка
            if (error) {
                console.warn("Adsgram rejected or error:", error);
            }
            callback(false);
        });
}

// ========= НОВАЯ ФУНКЦИЯ ДЛЯ ПОДЕЛИТЬСЯ МЕМОМ =========
function shareMeme(memeText) {
    const shareText = "Сегодня в игре «Котики против томатов» получил мем: " + memeText + " Играй @CatMemeGame_bot";
    const shareUrl = `https://t.me/share/url?text=${encodeURIComponent(shareText)}`;

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile && window.Telegram?.WebApp?.openTelegramLink) {
        window.Telegram.WebApp.openTelegramLink(shareUrl);
    } else {
        showCopyDialog(shareText, shareUrl);
    }
}

function showCopyDialog(text, url) {
    if (document.getElementById('meme-copy-dialog')) return;

    const dialog = document.createElement('div');
    dialog.id = 'meme-copy-dialog';
    dialog.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        background: #1a1a1a; color: white; padding: 25px; border-radius: 15px;
        z-index: 10000; text-align: center; box-shadow: 0 0 30px rgba(0,0,0,0.8);
        font-family: Arial, sans-serif; border: 2px solid #00aa00; width: 300px;
        user-select: none; cursor: default;
    `;
    
    dialog.innerHTML = `
        <b style="color: #00ff00; font-size: 18px; display: block; margin-bottom: 10px;">📱 ПОДЕЛИТЬСЯ МЕМОМ</b>
        <p style="background: #000; padding: 12px; border-radius: 8px; font-size: 14px; margin: 15px 0; border: 1px solid #333; line-height: 1.4; user-select: text;">
            ${text}
        </p>
        <div style="font-size: 12px; color: #aaa; margin-bottom: 15px;">
            Нажмите кнопку ниже, чтобы скопировать ссылку для Telegram
        </div>
        <button id="copyBtn" style="background: #00aa00; color: white; border: none; padding: 12px; border-radius: 8px; width: 100%; cursor: pointer; font-weight: bold; margin-bottom: 10px;">📋 КОПИРОВАТЬ ССЫЛКУ</button>
        <div style="font-size: 11px; color: #888; margin-bottom: 10px;">
            Или откройте: <a href="${url}" target="_blank" style="color: #00aaff; text-decoration: underline;">Telegram Web</a>
        </div>
        <button id="closeBtn" style="background: transparent; color: #ff4444; border: none; cursor: pointer; font-size: 12px; margin-top: 5px;">[ ЗАКРЫТЬ ]</button>
    `;
    
    document.body.appendChild(dialog);
    
    document.getElementById('copyBtn').onclick = function() {
        navigator.clipboard.writeText(url).then(() => {
            this.textContent = '✅ ССЫЛКА СКОПИРОВАНА!';
            this.style.background = '#008800';
            setTimeout(() => { if(dialog.parentNode) document.body.removeChild(dialog); }, 1200);
        });
    };
    
    document.getElementById('closeBtn').onclick = () => { if(dialog.parentNode) document.body.removeChild(dialog); };
}
// ======================================================
