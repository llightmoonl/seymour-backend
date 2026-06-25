Вот полный промпт одним текстом — со всем из предыдущих шагов плюс админ-разделы «Пользователи» и «Документация».

---

# Задача: реализовать backend для проекта Seymour (NestJS + Prisma + PostgreSQL)

Сейчас фронтенд работает на моковых данных. Нужно поднять реальные эндпоинты на **NestJS + Prisma (PostgreSQL)**. Покрываем: пользовательский дашборд, настройки пользователя, аутентификацию с RBAC, а также админ-панель «Администрирование» с разделами «Пользователи» и «Документация». Раздел «Мониторинг» НЕ делаем. Сначала покажи план файлов и схему Prisma, затем реализуй. JWT — через httpOnly-куки.

## Контекст
Дашборд показывает проекты обучения нейросетей по трём правилам: правило Хебба (`HEBB`), дельта-правило (`DELTA`), обратное распространение (`BACKPROP`). Есть пользовательская часть (дашборд + настройки) и админ-панель (только для роли `ADMIN`) с управлением пользователями и базой документации.

---

## Prisma schema

```prisma
enum LearningRule { HEBB DELTA BACKPROP }
enum ProjectStatus { DRAFT IN_PROGRESS TRAINED }
enum ActivityType { TRAINING_STARTED TRAINING_COMPLETED PROJECT_CREATED }
enum Role { STUDENT TEACHER ADMIN }
enum UserStatus { ACTIVE INACTIVE BLOCKED }
enum Theme { LIGHT DARK }
enum Locale { RU EN }
enum DocSection { BASICS ALGORITHMS ADVANCED OTHER }
enum DocStatus { DRAFT REVIEW PUBLISHED ARCHIVED }
enum DocVisibility { ALL STUDENTS TEACHERS }

model User {
  id                String       @id @default(uuid())
  name              String
  email             String       @unique
  emailVerified     Boolean      @default(false)
  passwordHash      String
  avatarUrl         String?
  role              Role         @default(STUDENT)
  status            UserStatus   @default(ACTIVE)
  group             String?      // "ИУ-401"
  theme             Theme        @default(DARK)
  locale            Locale       @default(RU)
  passwordChangedAt DateTime?
  lastActiveAt      DateTime?
  deletionRequestedAt  DateTime?
  deletionScheduledFor DateTime?
  projects          Project[]
  activities        Activity[]
  sessions          Session[]
  authoredDocs      Document[]   @relation("DocAuthor")
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt

  @@index([role])
  @@index([status])
  @@index([group])
}

model Project {
  id         String        @id @default(uuid())
  name       String
  rule       LearningRule
  status     ProjectStatus @default(DRAFT)
  accuracy   Float?        // 0..1, точность обученной модели
  examples   Int?          // кол-во примеров
  epochs     Int?          // кол-во эпох
  userId     String
  user       User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  activities Activity[]
  createdAt  DateTime      @default(now())
  updatedAt  DateTime      @updatedAt

  @@index([userId, status])
  @@index([userId, rule])
}

model Activity {
  id        String       @id @default(uuid())
  type      ActivityType
  projectId String
  project   Project      @relation(fields: [projectId], references: [id], onDelete: Cascade)
  userId    String
  user      User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime     @default(now())

  @@index([userId, createdAt])
}

model Session {
  id               String   @id @default(uuid())
  userId           String
  user             User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  refreshTokenHash String
  device           String?
  browser          String?
  ip               String?
  location         String?
  lastActiveAt     DateTime @default(now())
  createdAt        DateTime @default(now())

  @@index([userId])
}

model Document {
  id          String        @id @default(uuid())
  title       String
  section     DocSection    @default(OTHER)
  status      DocStatus     @default(DRAFT)
  visibility  DocVisibility @default(ALL)
  authorId    String?
  author      User?         @relation("DocAuthor", fields: [authorId], references: [id], onDelete: SetNull)
  contentMd   String?       @db.Text   // тело в Markdown
  tags        String[]      // ["hebb", "без учителя"]
  views       Int           @default(0)
  wordCount   Int           @default(0)
  version     Int           @default(1)
  publishedAt DateTime?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  @@index([section])
  @@index([status])
  @@index([authorId])
}
```
Создай миграцию.

---

## Аутентификация и безопасность

**cookie-parser:** подключи глобально в `main.ts` (`app.use(cookieParser())`), чтобы JWT читался из httpOnly-куки, а не только из заголовка — закрывает подмену токена клиентским JS. Access/refresh клади в куки с флагами `httpOnly: true`, `secure: true` (prod), `sameSite: 'lax'`, `path: '/'`. В `JwtStrategy` доставай токен кастомным экстрактором:
```ts
ExtractJwt.fromExtractors([(req) => req?.cookies?.access_token ?? null])
```
CORS — с `credentials: true`, на фронте `withCredentials: true`. Пароли — Argon2.

**Эндпоинты auth:**
- `POST /auth/register` (публичный).
- `POST /auth/login` (публичный) — выдаёт куки, создаёт `Session` с device/browser/ip/location (парси User-Agent через `ua-parser-js`).
- `POST /auth/refresh` (публичный) — ротация refresh, обновляет `Session`.
- `POST /auth/logout` (`JwtAuthGuard`) — `res.clearCookie(...)` с теми же флагами, инвалидирует текущую `Session`, `204`.

**Guard для авторизованных:** `JwtAuthGuard` (extends `AuthGuard('jwt')`) на защищённых контроллерах. Неавторизованный → `401`. Стратегия кладёт `user` (`id`, `role`) в `req`.

**Guard для админов (RBAC):** `role` в JWT-пейлоаде. Декоратор `@Roles(...)` через `SetMetadata` + `RolesGuard`, читающий метаданные `Reflector`'ом и сверяющий с `req.user.role`. Применяй поверх: `@UseGuards(JwtAuthGuard, RolesGuard)`. Нет роли → `403`. Все `/admin/*` — только `@Roles(Role.ADMIN)`.

---

## Пользовательский дашборд

### GET /dashboard/summary
Агрегаты в `$transaction`: всего проектов, `TRAINED` («Обучено»), `IN_PROGRESS` («В процессе»); распределение по правилам через `groupBy({ by: ['rule'] })`.
```json
{ "totalProjects": 10, "trained": 7, "inProgress": 3,
  "distribution": [ {"rule":"HEBB","count":4}, {"rule":"DELTA","count":3}, {"rule":"BACKPROP","count":3} ] }
```
Лейблы правил на бэк не отдавай — i18n на фронте.

### GET /projects
Query: `?page=1&limit=10&status=&rule=&sort=updatedAt:desc`. DTO + `class-validator`, `limit` ≤ 50.
```json
{ "items":[ {"id":"uuid","name":"Хебба","rule":"HEBB","status":"TRAINED","updatedAt":"2025-12-25T10:00:00.000Z"} ],
  "meta": {"page":1,"limit":10,"total":10,"hasMore":false} }
```
`updatedAt` — ISO, относительное время форматирует фронт.

### GET /activity
Query: `?page=1&limit=6`, сортировка `createdAt desc`, подтягивай `project.name`.
```json
{ "items":[ {"id":"uuid","type":"TRAINING_STARTED","projectId":"uuid","projectName":"Хебба","createdAt":"2025-06-11T12:00:00.000Z"} ],
  "meta": {"page":1,"limit":6,"total":24,"hasMore":true} }
```
Текст «Запущено/Завершено обучение» собирает фронт. Пагинацию вынеси в `PaginationQueryDto` + `paginate`.

---

## Настройки пользователя

Делаем только: Основное (профиль), Внешний вид (тема + язык), Доступ и пароль (только смена пароля), Активные сессии, Удаление аккаунта. НЕ делаем: часовой пояс, плотность интерфейса, уведомления, конфиденциальность, 2FA, резервные коды.

**GET /profile** — текущий юзер по `userId`. Никогда не отдавай `passwordHash`/refresh-токены (явный `select` или `@Exclude()` + `ClassSerializerInterceptor`). Включи `theme` и `locale`, чтобы фронт гидрировал состояние.
```json
{ "id":"uuid","name":"Олег Скворцов","email":"ai@example.com","emailVerified":false,
  "avatarUrl":null,"role":"STUDENT","theme":"DARK","locale":"RU","createdAt":"2025-01-10T08:00:00.000Z" }
```

**PATCH /profile** — обновление `name` (+ опц. `avatarUrl`). `role`/`id`/`email` через этот эндпоинт не меняются. Возврат — форма `GET /profile`.

**Подтверждение email:**
- `POST /profile/email/verify/request` — генерит токен, шлёт письмо (в dev — лог).
- `POST /profile/email/verify/confirm` body `{ "token":"..." }` — `emailVerified = true`.

**PATCH /settings/appearance** — только тема и язык:
```json
{ "theme":"DARK", "locale":"RU" }
```
Валидируй: `theme ∈ {LIGHT,DARK}`, `locale ∈ {RU,EN}`, оба опциональны. Сохраняй в `User`. Возврат — актуальные значения.

**POST /auth/change-password** (`JwtAuthGuard`) body `{ "currentPassword":"...", "newPassword":"..." }`. Проверь текущий Argon2-verify (несовпадение → `400`/`401`), захэшируй новый, обнови `passwordHash` и `passwordChangedAt` (для «Последнее изменение — 2 месяца назад»). По возможности инвалидируй остальные сессии. `204`.

**GET /sessions** — сессии текущего юзера, помечай текущую (по `sessionId`/refresh из куки).
```json
{ "items":[
  {"id":"uuid","device":"MacBook Pro","browser":"Safari 17","location":"Москва, Россия","lastActiveAt":"2026-06-25T10:00:00.000Z","isCurrent":true},
  {"id":"uuid","device":"Windows","browser":"Chrome 120","location":"Санкт-Петербург","lastActiveAt":"2026-06-23T10:00:00.000Z","isCurrent":false}
]}
```
**DELETE /sessions/:id** — завершить сессию (кнопка «Выйти»), проверь принадлежность (иначе `403`/`404`).
**DELETE /sessions** — «Выйти со всех устройств», удалить все, кроме текущей. `204`.

**DELETE /account** (`JwtAuthGuard`) — soft-delete с отложенным стиранием: выставь `deletionRequestedAt = now()`, `deletionScheduledFor = now() + 30 дней`, очисти куки, инвалидируй сессии. Можно запросить пароль в body `{ "password":"..." }`. Cron-джоба (`@nestjs/schedule`) раз в сутки физически удаляет юзеров с `deletionScheduledFor <= now()` (каскад на Project/Activity/Session уже в схеме).

---

## Админ-панель «Администрирование» (только `@Roles(Role.ADMIN)`)

Работаем только с двумя разделами: **Пользователи** и **Документация**. Раздел «Мониторинг» не реализуем.

### Раздел «Пользователи»

**GET /admin/users/stats** — карточки сверху.
```json
{ "total":12, "newLastWeek":3, "active":10, "students":9, "studentGroups":3, "teachers":3 }
```
`active` = со `status=ACTIVE`; `teachers` включает админов (преподаватели + админы); `studentGroups` = число различных непустых `group`.

**GET /admin/users** — таблица. Query: `?page=1&limit=20&search=&role=&status=&sort=createdAt:desc`. `search` ищет по `name`/`email`/`group` (`contains`, `mode: 'insensitive'`).
```json
{ "items":[
  {"id":"uuid","name":"Алексей Иванов","email":"a.ivanov@niu.ru","role":"ADMIN","group":null,
   "status":"ACTIVE","projectsCount":12,"registeredAt":"2023-09-01T00:00:00.000Z","lastActiveAt":"2026-06-25T10:00:00.000Z"}
], "meta": {"page":1,"limit":20,"total":12,"hasMore":false} }
```
`projectsCount` — через `_count: { projects: true }`. Дата регистрации и активность — ISO, форматирует фронт.

**POST /admin/users** — «Добавить пользователя». Body `{ name, email, role, group?, status? }`. Сгенерь временный пароль или отправь инвайт. Возврат — созданный юзер.

**PATCH /admin/users/:id** — «Редактирование пользователя» (сохраняется сразу). Body `{ name?, email?, role?, group?, status? }`. Email уникален — при конфликте `409`. Возврат — обновлённый юзер.

**DELETE /admin/users/:id** — «Удалить навсегда» (модалка «Это действие нельзя отменить»). Hard-delete юзера со всеми проектами и историей (каскад в схеме). Запрети админу удалять самого себя (`400`). `204`.

**GET /admin/users/:id/projects** — модалка «Проекты пользователя».
```json
{ "user": {"id":"uuid","name":"Алексей Иванов","email":"a.ivanov@niu.ru","role":"ADMIN","registeredAt":"2023-09-01T00:00:00.000Z"},
  "summary": {"total":6,"hebbAccuracyAvg":1.0,"deltaAccuracyAvg":1.0,"backpropAccuracyAvg":0.92},
  "projects": [
    {"id":"uuid","name":"Ассоциативная память — буквы","rule":"HEBB","status":"TRAINED","examples":26,"epochs":1,"accuracy":1.0,"updatedAt":"2026-06-22T00:00:00.000Z"}
  ] }
```
`summary` — средняя точность по каждому правилу (для строки «Хебб: 100% · Дельта: 100% · Backprop: 92%»).

**GET /admin/users/:id/projects/report** — «Выгрузить отчёт» (CSV или PDF; начни с CSV — поток с заголовками `Content-Disposition: attachment`).

**GET /admin/users/export** — «Экспорт» таблицы пользователей (CSV, учитывает текущие фильтры из query).

### Раздел «Документация»

**GET /admin/docs/stats** — карточки.
```json
{ "total":9, "sections":4, "published":5, "inReview":1, "drafts":2,
  "totalViews":7100, "viewsGrowthPct":12, "totalWords":4500, "approxPages":18 }
```
`approxPages ≈ totalWords / 250` (или своя константа). `viewsGrowthPct` — рост к прошлому месяцу.

**GET /admin/docs** — таблица. Query: `?page=1&limit=20&search=&section=&status=&sort=updatedAt:desc`. `search` — по `title`/`tags`/автору.
```json
{ "items":[
  {"id":"uuid","number":1,"title":"Введение в обучение нейронных сетей","section":"BASICS",
   "tags":["введение","обзор"],"authorName":"Е. Зайцева","status":"PUBLISHED",
   "updatedAt":"2026-05-03T00:00:00.000Z","views":1200,"wordCount":320}
], "meta": {"page":1,"limit":20,"total":9,"hasMore":false} }
```
Лейблы разделов («Основы»/«Алгоритмы»/«Продвинутое») и статусов — на фронте.

**POST /admin/docs** — «Новый документ». Body `{ title, section?, status?, visibility?, contentMd?, tags? }`. `wordCount` считай из `contentMd` на сервере. Возврат — созданный документ.

**GET /admin/docs/:id** — полный документ для редактора/предпросмотра (`contentMd`, `tags`, `section`, `status`, `visibility`, `author`, `views`, `wordCount`, `version`, метрики «Блоков/Слов/Чтение/Версия» — чтение ≈ wordCount/200 слов/мин).

**PATCH /admin/docs/:id** — автосохранение из редактора («Сохранено · только что»). Body — любые из `{ title, section, status, visibility, contentMd, tags }`. При изменении `contentMd` пересчитай `wordCount` и инкрементни `version`. Возврат — обновлённый документ.

**POST /admin/docs/:id/publish** — «Опубликовать»: `status = PUBLISHED`, `publishedAt = now()`.
**POST /admin/docs/:id/approve** — из `REVIEW` → `PUBLISHED` (галочка в таблице у «На проверке»).
**POST /admin/docs/:id/unpublish** — снять с публикации (крестик в таблице) → `DRAFT`/`REVIEW`.
**POST /admin/docs/:id/archive** — «В архив»: `status = ARCHIVED`.
**DELETE /admin/docs/:id** — удалить документ. `204`.

**POST /admin/docs/:id/view** — инкремент `views` (вызывается при открытии документа читателем; защити от накрутки разумно — необязательно строго).

**GET /admin/docs/:id/export?format=pdf|md** — «Экспорт PDF» / «Копия в Markdown». MD — отдать `contentMd` как файл; PDF — рендер Markdown в PDF (поток с `Content-Disposition`).

**POST /admin/docs/import** — «Импорт» документа из загруженного `.md`-файла.

> Историю версий (кнопка «История») можно вынести во вторую итерацию — при необходимости добавь модель `DocumentRevision { id, documentId, version, contentMd, authorId, createdAt }` и снапшоти её при каждом `publish`/значимом сохранении.

---

## Архитектура
- Модули: `AuthModule`, `DashboardModule`, `ProjectsModule`, `ActivityModule`, `ProfileModule`, `SettingsModule`, `SessionsModule`, `AccountModule`, `AdminUsersModule`, `AdminDocsModule` — каждый со своим service/controller.
- Контроллеры тонкие, логика в сервисах; response-формы через DTO/типы.
- Защищённые контроллеры под `JwtAuthGuard`, `userId` — через `@CurrentUser()`. Все `/admin/*` дополнительно под `RolesGuard` + `@Roles(Role.ADMIN)`.
- Глобальный `ValidationPipe` (`whitelist: true`, `forbidNonWhitelisted: true`).

## Сводка доступа
- Публичные: `POST /auth/register`, `/auth/login`, `/auth/refresh`, `POST /profile/email/verify/confirm`.
- Авторизованные (`JwtAuthGuard`): `/auth/logout`, `/auth/change-password`, `/dashboard/*`, `/projects`, `/activity`, `/profile`, `/settings/*`, `/sessions/*`, `/account`.
- Только админ (`JwtAuthGuard` + `RolesGuard` + `@Roles(Role.ADMIN)`): `/admin/*`.

## Сид (`prisma/seed.ts`)
Создай юзеров под скриншоты админки: 1 `ADMIN` (Алексей Иванов, a.ivanov@niu.ru, 12 проектов, рег. 01.09.2023), преподавателей (`TEACHER`, напр. Екатерина Зайцева, 24 проекта) и студентов (`STUDENT`) с группами `ИУ-401`/`ИУ-402` — всего 12 пользователей, из них 10 `ACTIVE`, 9 студентов в 3 группах, 3 преподавателя включая админов. Для тестового пользователя-владельца дашборда заведи 10 проектов (4 HEBB, 3 DELTA, 3 BACKPROP; 7 `TRAINED`, 3 `IN_PROGRESS`) с `accuracy`/`examples`/`epochs`, записи `Activity` и 3 сессии (MacBook Pro / Windows / iPhone). Заведи 9 документов в 4 разделах (5 `PUBLISHED`, 1 `REVIEW`, 2 `DRAFT`) с тегами, авторами, `views` и `wordCount`, чтобы цифры на всех экранах совпадали со скриншотами.

Сначала покажи план файлов и схему, затем реализуй.

Все эндпоинты должны быть полностью задокументированы и видны в Swagger UI. Используй @nestjs/swagger.Настройка
Подключи @nestjs/swagger и swagger-ui-express. В main.ts сконфигурируй DocumentBuilder и подними Swagger UI на /api/docs (JSON-схема — на /api/docs-json):
