import asyncio
import os
from aiogram import Bot, Dispatcher, types
from aiohttp import web

TOKEN = "8463257112:AAGtOCYVJjWGermEH6tH_k51Kbr7YxebaBk"
URL = "https://89o55522936-source.github.io/cat-game/"

bot = Bot(token=TOKEN)
dp = Dispatcher()

# Этот кусок нужен, чтобы хостинг видел, что бот живой
async def handle(request):
    return web.Response(text="Bot is running!")

@dp.callback_query()
async def game_handler(callback: types.CallbackQuery):
    await callback.answer(url=URL)

@dp.message()
async def start_handler(msg: types.Message):
    from aiogram.utils.keyboard import InlineKeyboardBuilder
    b = InlineKeyboardBuilder()
    b.button(text="Играть!", callback_game=types.CallbackGame())
    await msg.answer_game("cat_vs_tomatoes", reply_markup=b.as_markup())

async def main():
    # Запуск веб-сервера для хостинга
    app = web.Application()
    app.router.add_get("/", handle)
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, '0.0.0.0', int(os.getenv("PORT", 10000)))
    await site.start()
    
    # Запуск самого бота
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())