# MVP Telegram AI Bot Plan

## Summary

Цель: довести текущий Bun + TypeScript + grammY + Prisma проект до MVP приватного Telegram-бота с ИИ внутри.

Приоритеты MVP:

- приватный личный ассистент, без групповых сценариев на первом этапе;
- экономный контекст: последние сообщения + краткое summary диалога;
- приятный UX в Telegram: быстрый `typing`, сообщение-заготовка и редактирование финальным ответом;
- умеренные, но обязательные лимиты запросов и токенов;
- деплой на VPS через long polling.

Ключевой принцип: сначала стабильная база, типы и поток данных, потом AI/UX. Сейчас архитектурно слабое место не в промпте, а в несогласованности Prisma-схемы, generated client и кода.

## Phase 1. Stabilize Foundation - Done

### Prisma schema and migrations

- Привести `prisma/schema.prisma`, миграции и `src/generated/prisma` к одному состоянию.
- Исправить модель `Conversation`:
  - использовать единые поля `provider`, `model`, `systemPromptVersion`, `state`, `lastMessageAt`;
  - хранить связь с реальным `Chat`, а не подставлять случайный UUID в `chatId`;
  - добавить `summary String?` для сжатой памяти;
  - оставить один активный private-диалог на пользователя и чат для MVP.
- Исправить модель `Message`:
  - хранить `provider`, `model`, `promptTokens`, `completionTokens`, `totalTokens`, `latencyMs`;
  - решить конфликт `tokenCount` vs раздельные token-поля и оставить один подход;
  - хранить `telegramMessageId` для связи с Telegram-сообщениями.
- Упростить `UserSettings`:
  - задать дефолты для `responseMode`, `language`, `memoryEnabled`, `temperature`;
  - убрать лишнее поле `userSettingsId` из `User`, если связь уже идет через `UserSettings.userId`.
- Добавить индексы:
  - `Conversation(userId, chatId)`;
  - `Message(conversationId, createdAt)`;
  - `AiRequestLog(userId, createdAt)`;
  - `RateLimitWindow(userId, key, windowStart, windowEnd)`.

### TypeScript and runtime

- Исправить `src/app/env.ts`: использовать нормальный `process.env`, не импорт из `zod/v4/core`.
- Добиться прохождения `bunx tsc --noEmit`.
- Исправить `shutdown`: вызывать `await prisma.$disconnect()`.
- Убрать или реализовать пустые модули, чтобы не было мертвой архитектуры.

## Phase 2. Telegram Core

### User and chat registration - Done

- Реализовать реальный `registerUserMiddleware`:
  - брать `ctx.from` и `ctx.chat`;
  - создавать или обновлять `User`;
  - создавать или обновлять `Chat`;
  - класть в `ctx.user` реальную запись из базы.
- Обрабатывать только private chat в MVP.
- Для group/supergroup/channel отвечать коротко, что MVP работает только в личке, либо молча игнорировать.

### Commands - Done

- `/start`:
  - короткое приветствие;
  - объяснить, что можно просто писать вопрос;
  - кнопки: `Новый диалог`, `Настройки`, `Помощь`.
- `/new`:
  - завершает текущий активный диалог;
  - создает новый диалог или очищает состояние;
  - подтверждает действие.
- `/help`:
  - кратко описывает возможности и ограничения.
- `/settings`:
  - показывает текущий режим ответа, язык, memory on/off, модель.
- `/stats`:
  - показывает дневные запросы и примерное использование токенов.

### Message handling UX - Done

- Игнорировать пустые и неподдерживаемые сообщения.
- Ограничить длину входного сообщения.
- Сразу отправлять `ctx.api.sendChatAction(chatId, 'typing')`.
- Создавать placeholder-сообщение вроде `Думаю...`.
- После получения ответа редактировать placeholder через `editMessageText`.
- Если ответ слишком длинный для Telegram, разбивать на несколько сообщений.
- При ошибке редактировать placeholder в понятный fallback, не оставлять пользователя в тишине.

## Phase 3. AI Core and Token Economy

### Provider layer - Done

- Оставить один реальный provider для MVP: `DeepseekProvider`.
- Зафиксировать интерфейс `IAIProvider`:
  - `generateText(params): Promise<IGenerateTextResponse>`;
  - response должен возвращать `content`, `usage`, `model`, `provider`, `latencyMs`.
- Вынести OpenAI-compatible client в инфраструктурный слой.
- Настройки модели брать из config/env, а не хардкодить в сервисах.

### Prompt and context builder - Done

- Сделать отдельный `PromptBuilder` или чистую функцию сборки messages.
- Порядок сообщений:
  1.  короткий system prompt;
  2.  summary диалога, если есть;
  3.  последние N сообщений;
  4.  текущее сообщение.
- Не отправлять всю историю. Это главный источник лишних токенов.
- Для MVP дефолт:
  - последние 8-12 сообщений;
  - короткий system prompt;
  - max output tokens из env;
  - короткий стиль ответа по умолчанию.

### Conversation summary - Done

- Добавить `Conversation.summary`.
- Обновлять summary после каждых 10-15 сообщений или когда примерный размер истории превышает лимит.
- Summary должно быть коротким: факты о пользователе, текущая задача, важные решения.
- Не включать в summary мусор, приветствия и одноразовые детали.

### Token accounting - Done

- Сохранять usage в `Message` и `AiRequestLog`.
- Если provider не вернул usage, считать примерную оценку локально по длине текста.
- Логировать:
  - input tokens;
  - output tokens;
  - total tokens;
  - latency;
  - model;
  - status;
  - errorCode.

## Phase 4. Limits, Reliability, Errors

### Rate limits - Done

- Реализовать `RateLimitService`.
- Для MVP использовать Postgres `RateLimitWindow`; Redis оставить как оптимизацию.
- Умеренные дефолты:
  - лимит запросов в минуту;
  - лимит запросов в день;
  - дневной лимит токенов;
  - отдельный ключ `user:{id}:ai`.
- При превышении лимита отвечать спокойно и конкретно: когда можно попробовать снова.

### Parallel requests

- Использовать `Conversation.state`.
- Перед AI-запросом ставить `awaiting_ai`.
- После успеха возвращать `idle`.
- После ошибки ставить `error` или возвращать `idle` с записью ошибки в лог.
- Если пользователь пишет второй запрос во время обработки, отвечать: `Я еще отвечаю на прошлый запрос`.

### Error handling - Done

- Добавить timeout на AI-запрос.
- Разделить ошибки:
  - provider unavailable;
  - timeout;
  - rate limit;
  - validation error;
  - unknown error.
- Все ошибки логировать через `logger`, без `console.error` в production-коде.
- Пользователю не показывать технические детали.

## Phase 5. Settings and MVP Polish

### User settings - Done

- Минимальные настройки:
  - language: `ru` по умолчанию;
  - responseMode: `short` по умолчанию;
  - temperature: `0.7`;
  - memoryEnabled: `true`.
- Для MVP достаточно inline-кнопок:
  - кратко / подробно;
  - память on/off;
  - новый диалог.

### Response quality - Done

- System prompt должен требовать:
  - отвечать кратко;
  - уточнять только при реальной неоднозначности;
  - не раздувать ответ;
  - сохранять практичный тон.
- Не надо делать огромный универсальный system prompt. Он будет постоянно жечь токены.

## Phase 6. Tests and Acceptance

### Automated tests

Добавить `bun:test` тесты:

- сборка AI messages не отправляет всю историю;
- summary включается в prompt;
- длинная история обрезается;
- rate limit блокирует сверхлимит;
- регистрация пользователя создает `User` и `Chat`;
- `findOrCreate` диалога не создает дубликаты;
- AI error пишет `AiRequestLog` со статусом `error`;
- `/new` сбрасывает активный диалог;
- слишком длинное сообщение отклоняется до AI-запроса.

### Manual Telegram checks - Done

Проверить вручную:

- `/start`;
- обычный вопрос;
- длинный вопрос;
- два быстрых сообщения подряд;
- ошибка AI provider;
- достижение дневного лимита;
- `/new`;
- `/settings`;
- `/stats`.

### Definition of Done for MVP

- `bunx tsc --noEmit` проходит.
- `bun test` проходит.
- Бот запускается на VPS через long polling.
- Пользователь может начать диалог, получить ответ и сбросить контекст.
- История не отправляется целиком в AI.
- Есть rate limit и логирование AI-запросов.
- Ошибки не ломают UX и не оставляют пользователя без ответа.

## Current Problems To Fix First - Done

- Проект сейчас не компилируется:
  - `src/app/env.ts` импортирует `process` из `zod/v4/core`;
  - `src/app/api/chat/route.ts` вызывает `ChatService.sendMessage` с неверной сигнатурой;
  - `src/entities/message/message.repository.ts` пишет `provider/model`, которых нет в текущем generated Prisma `Message`.
- `schema.prisma`, migration SQL и generated Prisma client расходятся. Это критично и должно быть исправлено до новых фич.
- `registerUserMiddleware` подставляет фейкового пользователя `id: '1'`; реальной регистрации нет.
- `ConversationRepository.create` создает невалидный `chatId` и использует поля, не совпадающие со схемой/generated client.
- Сейчас в AI отправляется вся история сообщений. Это быстро приведет к лишним токенам, высокой задержке и росту стоимости.
- Нет rate limit, timeout, защиты от параллельных запросов и нормального `AiRequestLog`.
- `shutdown` не вызывает `prisma.$disconnect()`.
- `src/modules/ai/ai.service.ts`, `src/modules/dialog/*` фактически пустые. Их надо либо реализовать, либо удалить.
- В проекте нет тестов, поэтому `bun test` сейчас падает с `No tests found`.
