// telegram.js — ФИНАЛЬНАЯ ВЕРСИЯ ДЛЯ ЗАПУСКА В TELEGRAM
const tg = window.Telegram.WebApp;

// Расширяем приложение на весь экран и сообщаем о готовности сразу
tg.expand();
tg.ready();

// Настройка цветов темы (черный фон)
tg.setHeaderColor('#000000');
tg.setBackgroundColor('#000000');

// Функция для вызова рекламы (сейчас — тестовое подтверждение Telegram)
function showTelegramAds(callback) {
    // Вызываем нативное окно подтверждения Telegram
    tg.showConfirm("Посмотреть рекламу, чтобы получить валерьянку?", (isConfirmed) => {
        if (isConfirmed) {
            // Если игрок нажал "ОК" — выдаем бонус
            tg.showAlert("Реклама просмотрена! +1 валерьянка");
            callback(true);
        } else {
            // Если игрок нажал "Отмена" — ничего не происходит
            callback(false);
        }
    });
}