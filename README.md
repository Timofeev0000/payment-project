# Payment Project — тестовое задание backend‑разработчика

Это репозиторий с решением тестового задания на позицию **Backend‑разработчика**.

**Формулировка задания (кратко):**

> Спроектировать БД и написать приложение на Node.js для реализации механизма оплаты в SaaS‑приложении.
> В качестве биллинга использовать любого провайдера банковских услуг, работающего в РФ (ЮKassa, Т‑Банк, Сбер и т.п.).
> Важно не собрать production‑готовое приложение, а:
> 
> - выявить особенности процесса,
> - найти потенциальные проблемы,
> - реализовать необходимые API‑методы для оплаты и обработки ошибок,
> - защитить спроектированную структуру БД.

В этом проекте в качестве провайдера выбран **ЮKassa (YooMoney)**.

---

## Стек и архитектура

### Backend

- **Node.js 20+**
- **NestJS 10** — каркас приложения, модули, DI
- **Prisma ORM 6** — доступ к PostgreSQL
- **PostgreSQL** — основная БД
- **JWT**:
  - `accessToken` — короткоживущий, в заголовке `Authorization`
  - `refreshToken` — долго живёт, хранится в HTTP‑only cookie
- **ЮKassa (YooMoney)**:
  - библиотека [`nestjs-yookassa`](https://www.npmjs.com/package/nestjs-yookassa)
  - сценарий `redirect` (пользователь уходит на страницу ЮKassa)
  - webhook для подтверждения статуса платежа
- **class-validator / class-transformer** — валидация DTO
- **Swagger** (`/docs`) — документация по API

### Frontend

- **Nuxt 3 (Vue 3 + Vite)** — минимальный SPA/SSR‑клиент
- Страницы:
  - `login` — авторизация
  - `register` — регистрация
  - `index` — создание платежа
  - `payment-success` — страница «Спасибо, оплата прошла успешно»
- Хранение токенов:
  - `accessToken` — в cookie `accessToken`
  - `refreshToken` — HTTP‑only cookie, устанавливается бэкендом
- Вызовы API — через `$fetch` с `baseURL = public.apiBase` из `nuxt.config.ts`

### Инфраструктура

- **Docker Compose** — контейнеры для:
  - `postgres` — база данных
  - `backend` — API
  - `frontend` — интерфейс
- **ngrok** — проброс публичного HTTPS‑адреса для webhook’ов от ЮKassa

---

## Структура репозитория

- `backend/` — NestJS + Prisma, основная логика тестового задания
- `frontend/` — Nuxt 3, формы логина/регистрации и создания платежа
- `docker-compose.yml` — запуск Postgres + backend + frontend
- `docker/` — Dockerfile’ы для сервисов

---

## Модель данных (Prisma / PostgreSQL)

Схема БД описана в `backend/prisma/schema.prisma`.

### User

- `id` — PK, autoincrement
- `name`
- `email` — уникальный
- `password` — Argon2‑хэш
- `payment[]` — связь «1 ко многим» с платежами

### Payment

- `id` — PK
- `amount` — сумма платежа (целое число, рубли)
- `provider` — enum `PaymentProvider` (сейчас `YOOKASSA`)
- `providerPaymentId` — ID платежа в ЮKassa (уникальный)
- `idempotencyKey` — уникальный ключ запроса (идемпотентность)
- `description` — описание операции
- `status` — enum `PaymentStatus`:
  - `PENDING`
  - `WAITING_FOR_CAPTURE`
  - `SUCCEEDED`
  - `CANCELED`
  - `FAILED`
- `paidAt` — время успешной оплаты
- `userId` — FK на `User`, каскадное удаление

### Enums

- **PaymentProvider**
  - `YOOKASSA`

- **PaymentStatus**
  - `PENDING`
  - `WAITING_FOR_CAPTURE`
  - `SUCCEEDED`
  - `CANCELED`
  - `FAILED`

Такой дизайн:

- отделяет нашу доменную модель от конкретного платёжного провайдера,
- даёт возможность безопасно обрабатывать повторные уведомления и дубли запросов,
- легко расширяется под дополнительных провайдеров.

---

## Реализованные API и сценарии

### Аутентификация

- `POST /auth/register` — регистрация
- `POST /auth/login` — вход, выдача `accessToken` + установка refresh‑cookie
- `POST /auth/refresh` — обновление пары токенов по refresh‑cookie
- `POST /auth/logout` — выход, очистка refresh‑cookie

Особенности:

- пароли хэшируются Argon2;
- `accessToken` имеет небольшой TTL (например, 15 минут);
- `refreshToken` живёт дольше и хранится только в HTTP‑only cookie.

### Платежи

- `GET /payments` — история платежей пользователя
  - требуется авторизация (`Authorization: Bearer <accessToken>`)
  - возвращает все операции с сортировкой по дате

- `POST /payments` — создание платежа
  - тело запроса: `amount`, `description`
  - создаёт платёж через ЮKassa, сохраняет запись `Payment` со статусом `PENDING`
  - возвращает `confirmation_url` — редирект на платёжную страницу ЮKassa

- `POST /payments/webhook` — webhook от ЮKassa
  - ЮKassa присылает уведомления о смене статуса (`succeeded`, `canceled`, `pending`)
  - сервис находит платёж по `providerPaymentId`
  - маппит внешний статус в `PaymentStatus` и обновляет запись в БД

### Возврат пользователя на фронтенд

При создании платежа задаётся `return_url`:

- если задан `CLIENT_URL` → `${CLIENT_URL}/payment-success`
- иначе по умолчанию → `http://localhost:10016/payment-success`

Страница `payment-success` показывает:

- сообщение «Спасибо! Оплата прошла успешно»
- кнопку «Вернуться на главную», ведущую в приложение.

---

## Потенциальные проблемы и как они учтены

1. **Идемпотентность и повторные запросы**
   - используется `idempotencyKey` и уникальный `providerPaymentId`;
   - повторные HTTP‑запросы и webhook’и не создают дубликатов, а обновляют текущую запись.

2. **Асинхронность статусов**
   - `POST /payments` лишь инициирует платёж (`PENDING`);
   - финальный статус (`SUCCEEDED` / `CANCELED` / `WAITING_FOR_CAPTURE`) выставляется только по webhook’у от ЮKassa.

3. **Безопасность токенов**
   - refresh‑токены только в HTTP‑only cookie;
   - доступ к защищённым маршрутам только по `accessToken` в заголовке;
   - DTO валидируются через `class-validator`.

4. **CORS и браузеры**
   - CORS настраивается через переменную `HTTP_CORS` (список разрешённых origin’ов);
   - для дев‑режима достаточно `HTTP_CORS=http://localhost:10016`.

---

## Пошаговая установка и запуск

Ниже — сценарий локального запуска **без Docker** (для отладки). В конце — вариант через Docker Compose.

### 0. Предварительные требования

- Node.js **20+**
- Yarn или npm
- Docker + Docker Compose
- Аккаунт в **ЮKassa** (тестовый магазин)
- **ngrok** (для публичного HTTPS‑адреса webhook’а)

---

### 1. Клонировать репозиторий

```bash
git clone <url-репозитория>
cd payment-project
```

---

### 2. Поднять PostgreSQL через Docker

В корне проекта:

```bash
docker compose up -d postgres
```

В `.env` (в корне или окружении Docker) должны быть заданы минимум:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DATABASE=payment_project
```

Postgres будет доступен на `localhost:5433`.

---

### 3. Настроить backend (`backend/`)

Перейти в каталог:

```bash
cd backend
yarn install

```env
HTTP_PORT=20016

# Разрешённые origin'ы для CORS
HTTP_CORS=http://localhost:10016

# Подключение к Postgres
POSTGRES_URI=postgresql://postgres:postgres@localhost:5433/payment_project

# JWT
JWT_ACCESS_TOKEN_TTL=15m
JWT_REFRESH_TOKEN_TTL=7d

# Cookie / домен
COOKIES_SECRET=super_secret_cookie_key
COOKES_DOMAIN=localhost

# ЮKassa
YOOKASSA_SHOP_ID=<shop_id_из_кабинета_ЮKassa>
YOOKASSA_SECRET_KEY=<secret_key_из_кабинета_ЮKassa>

# URL фронтенда (используется для return_url)
CLIENT_URL=http://localhost:10016
```

Применить миграции Prisma:

```bash
npx prisma migrate dev
```

Запустить backend:

```bash
yarn start:dev
```

Теперь API доступно по адресу `http://localhost:20016`, а Swagger — `http://localhost:20016/docs`.

---

### 4. Настроить frontend (`frontend/`)

Перейти в каталог:

```bash
cd ../frontend
yarn install

```env
HTTP_HOST=http://localhost:20016
```

В `nuxt.config.ts` это значение используется как:

```ts
runtimeConfig: {
  public: {
    apiBase: process.env.HTTP_HOST || 'http://localhost:20016'
  }
}
```

Запустить фронтенд:

```bash
yarn dev
```

Nuxt по умолчанию поднимается на `http://localhost:3000`
(в Docker‑режиме фронт мапится на `http://localhost:10016`).

---

### 5. Создать тестовый магазин в ЮKassa

1. Зарегистрироваться в **ЮKassa**.
2. Создать **тестовый магазин**.
3. В настройках получить:
   - `shopId`
   - `secretKey`
4. Записать их в `.env` backend:

   ```env
   YOOKASSA_SHOP_ID=<shopId>
   YOOKASSA_SECRET_KEY=<secretKey>
   ```

5. Включить тестовый режим (sandbox), чтобы не списывать реальные деньги.

---

### 6. Настроить webhook через ngrok

1. Убедиться, что backend уже работает на `http://localhost:20016`.
2. Запустить ngrok:

   ```bash
   ngrok http 20016
   ```

3. Ngrok выдаст URL вида `https://<random>.ngrok.io`.
4. В личном кабинете ЮKassa:
   - открыть раздел HTTP‑уведомлений / webhook’ов;
   - указать URL:

     ```text
     https://<random>.ngrok.io/payments/webhook
     ```

   - включить уведомления по событиям `payment.succeeded`, `payment.canceled`, `payment.waiting_for_capture` и т.п.

Теперь ЮKassa сможет уведомлять приложение о смене статусов платежей.

---

### 7. Запуск всего стека через Docker Compose (опционально)

Для полного стека (Postgres + backend + frontend):

```bash
cd /path/to/payment-project
docker compose up -d
```

Поднимутся:

- `postgres` — БД
- `backend` — API (порт `20016` наружу)
- `frontend` — Nuxt (порт `10016` наружу)

Адреса:

- Backend: `http://localhost:20016`
- Frontend: `http://localhost:10016`

Переменные окружения (ЮKassa, JWT, Postgres) передаются через `.env` и секцию `environment` в `docker-compose.yml`.

---

## Как прогнать основной сценарий

1. Открыть фронтенд и зарегистрировать пользователя (`/register`).
2. Залогиниться (`/login`), получить access‑токен.
3. На главной (`/`) ввести сумму и описание, нажать «Оплатить».
4. Перейти на страницу оплаты ЮKassa и провести тестовый платёж.
5. Нажать «Вернуться на сайт» → попасть на `/payment-success` фронтенда.
6. После прихода webhook статус платежа в БД изменится на `SUCCEEDED`.

---

## Вывод

Проект демонстрирует:

- спроектированную под биллинговый сценарий структуру БД;
- интеграцию с российским платёжным провайдером (ЮKassa) с учётом особенностей процесса;
- обработку ошибок и асинхронных webhook‑уведомлений;
- минимальный, но завершённый сценарий оплаты от регистрации пользователя до успешного платежа.

