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
    const tgUrl = `tg://msg_url?url=&text=${encodeURIComponent(shareText)}`; // Прямой протокол для Десктопа

    try {
        if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.openTelegramLink) {
            // Если десктоп не реагирует на https ссылку, попробуй скормить ему tg:// версию
            // Но обычно https версии через openTelegramLink достаточно.
            window.Telegram.WebApp.openTelegramLink(shareUrl);
        } 
        else {
            const win = window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=700');
            
            if (!win) {
                // Если Десктоп заблокировал окно, Iframe с tg:// ссылкой часто его "будит"
                const iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                iframe.src = tgUrl; // Используем tg:// здесь для принудительного вызова
                document.body.appendChild(iframe);
                setTimeout(() => iframe.remove(), 100);
                
                // Alert оставляем, чтобы понять, дошли ли мы до этой точки
                console.log("Окно заблокировано, вызван Iframe");
            }
        }
    } catch (e) {
        window.open(shareUrl, '_blank');
    }
}
// ======================================================
