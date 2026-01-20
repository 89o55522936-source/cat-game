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
    const shareUrl = `https://t.me/share/url?text=${encodeURIComponent(shareText)}`;

    // 1. ТОЛЬКО мобильный Telegram использует нативный метод
    if (tg && tg.openTelegramLink && tg.platform !== 'tdesktop') {
        tg.openTelegramLink(shareUrl);
        return; // Игра остаётся открытой
    }

    // 2. Для Telegram Desktop и браузера — открываем в новом окне/вкладке
    // Параметры окна делают его похожим на нативное
    const shareWindow = window.open(
        shareUrl, 
        '_blank', 
        'noopener,noreferrer,width=600,height=700,left=100,top=100'
    );

    // 3. Если окно не открылось (попап-блокер)
    if (!shareWindow || shareWindow.closed || typeof shareWindow.closed === 'undefined') {
        // Крайний случай — перенаправляем текущую вкладку
        window.location.href = shareUrl;
    }
}
// ======================================================

