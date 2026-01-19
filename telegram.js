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
            // error может содержать информацию об ошибке (опционально для логов)
            if (error) {
                console.warn("Adsgram rejected or error:", error);
            }
            callback(false);
        });
}
