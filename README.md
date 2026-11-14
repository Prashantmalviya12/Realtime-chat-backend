# Chat Backend

Node.js + Express + TypeScript + PostgreSQL/Sequelize + Firebase Firestore.

## 1. Requirements

- Node.js 20+
- PostgreSQL
- Firebase project with Firestore enabled
- Firebase service-account credentials

## 2. Install

```bash
npm install
```

Copy `.env.example` to `.env` and fill in PostgreSQL and Firebase credentials.

`FIREBASE_SERVICE_ACCOUNT_JSON` must contain the complete service-account JSON on one line. Never commit it.

Create a PostgreSQL database:

```sql
CREATE DATABASE chat_backend;
```

Start the server:

```bash
npm run dev
```

On startup, Sequelize `sync()` creates the tables. For production, replace this demo sync with versioned migrations.

## 3. Add test users

The task does not specify a user-registration API. Create two users in PostgreSQL before testing. Example:

```sql
INSERT INTO users (id, name, email, created_at, updated_at)
VALUES
('11111111-1111-4111-8111-111111111111', 'Aarav', 'aarav@example.com', NOW(), NOW()),
('22222222-2222-4222-8222-222222222222', 'Diya', 'diya@example.com', NOW(), NOW());
```

Use these UUIDs in Postman.

## 4. APIs

### Create or get a direct chat

`POST /chat/create`

```json
{
  "userAId": "11111111-1111-4111-8111-111111111111",
  "userBId": "22222222-2222-4222-8222-222222222222"
}
```

### Send message

`POST /chat/:chatId/message/send`

```json
{
  "senderId": "11111111-1111-4111-8111-111111111111",
  "text": "Hello!"
}
```

### Get messages

`GET /chat/:chatId/messages?userId=11111111-1111-4111-8111-111111111111&limit=50`

For the next page, pass `cursor=<nextCursor>` from the previous response.

The assignment's endpoint omits userId, but membership authorization requires an identity. This demo uses a query parameter. In a real system, take the identity from verified authentication middleware instead.

### Mark message read

`POST /chat/:chatId/message/:messageId/read`

```json
{
  "userId": "22222222-2222-4222-8222-222222222222"
}
```

### Update last seen

`POST /chat/:chatId/lastseen`

```json
{
  "userId": "22222222-2222-4222-8222-222222222222",
  "messageId": "FIRESTORE_MESSAGE_ID"
}
```

### List a user's chats

`GET /user/:userId/chats`

## 5. Firestore structure

```text
chats/{chatId}
  messages/{messageId}
    readReceipts/{userId}
  lastSeen/{userId}
```

Messages are ordered by `createdAt`. Firestore server timestamps are used.

## 6. Important production notes

- The task does not include user registration or authentication. The SQL seed above is only for local testing.
- Do not trust senderId/userId supplied by a client in production. Use authenticated identity from a verified JWT/session.
- Protect Firebase credentials and restrict Firestore access.
- Add rate limiting, request logging, tests, and migrations before production deployment.
- A Firestore message write and chat-summary write are separate operations. For stronger consistency, use a Firestore transaction or a retryable outbox pattern.
- The last-seen backward check shown here is a basic check; use a Firestore transaction for concurrent updates in production.
- For large chat histories, use cursor pagination as implemented here.
