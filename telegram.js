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
    const shareText = "Сегодня в юморной игре «Котики против томатов» получил такой мем: " + memeText + " Играй @CatMemeGame_bot";
    
    // Чистые ссылки без дублирования параметров
    const telegramAppUrl = `tg://msg?text=${encodeURIComponent(shareText)}`;
    const telegramWebUrl = `https://t.me/share/url?text=${encodeURIComponent(shareText)}`;

    // Проверяем наличие SDK Telegram WebApp
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.openTelegramLink) {
        // Внутри Telegram: используем встроенный метод, чтобы не выходить из приложения
        window.Telegram.WebApp.openTelegramLink(telegramWebUrl);
    } else {
        // Вне Telegram (Chrome/Edge): используем невидимый iframe для вызова Desktop-версии
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = telegramAppUrl;
        document.body.appendChild(iframe);
        
        // Быстрая очистка и открытие веб-версии в новом окне как подстраховка
        setTimeout(() => {
            iframe.remove();
            window.open(telegramWebUrl, '_blank', 'noopener,noreferrer,width=600,height=700');
        }, 100);
    }
}
// ======================================================





