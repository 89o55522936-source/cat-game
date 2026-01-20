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

    // Пытаемся использовать официальный метод Telegram WebApp (идеально для ПК и Телефона)
    try {
        if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.openTelegramLink) {
            // Этот метод заставляет Telegram Desktop открыть окно выбора чата ВНУТРИ приложения
            window.Telegram.WebApp.openTelegramLink(shareUrl);
        } else {
            // Если игра открыта просто в браузере, используем стандартное окно
            window.open(shareUrl, '_blank', 'noopener,noreferrer');
        }
    } catch (e) {
        console.error("Ошибка при попытке поделиться:", e);
        // Резервный метод на крайний случай
        window.open(shareUrl, '_blank');
    }
}
// ======================================================
