import express from "express"; //фреймворк Express для создания HTTP-сервера
import cors from "cors"; //middleware CORS для разрешения кросс-доменных запросов
import bodyParser from "body-parser"; //парсинг тела запросов в формате JSON
import * as crypto from "crypto"; //модуль crypto для генерации уникальных идентификаторов (UUID)
import pino from 'pino'; //логгер для ведения журналов событий
import pinoPretty from 'pino-pretty';
import { faker } from '@faker-js/faker'; //библиотека faker для генерации случайных данных

const app = express();
const logger = pino(pinoPretty()); //логгер Pino с использованием Pino Pretty для форматирования логов

app.use(cors()); //middleware CORS для обработки запросов с других доменов

app.use(
  bodyParser.json({
    type(req) {
      return true; //bodyParser должен парсить все запросы как JSON
    },
  })
);

app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next(); // передаем управление следующему middleware
});

// Генерация случайных сообщений с помощью faker
const generateRandomMessages = (count) => {
  const messages = [];
  for (let i = 0; i < count; i++) {
    messages.push({
      id: crypto.randomUUID(),
      from: faker.internet.email(),
      subject: faker.lorem.sentence(), //тема сообщения
      body: faker.lorem.paragraph(), //текст сообщения
      received: faker.date.past().getTime() / 1000 // время в формате Unix (в секундах)
    });
  }
  return messages;
};

// Endpoint для получения непрочитанных сообщений
app.get('/messages/unread', (req, res) => {
  const unreadMessages = generateRandomMessages(1); // генерируем непрочитанные сообщения

  const response = {
    status: 'ok',
    timestamp: Math.floor(Date.now() / 1000), // текущий timestamp в формате Unix (в секундах)
    messages: unreadMessages
  };

  logger.info(`Unread messages: ${JSON.stringify(response)}`);
  res.send(JSON.stringify(response));
});

const port = process.env.PORT || 7070;

const bootstrap = async () => { //функция для запуска сервера
  try {
    app.listen(port, () =>
        logger.info(`Server has been started on http://localhost:${port}`)
    );
  } catch (error) {
    console.error(error);
  }
};

bootstrap();