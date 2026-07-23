# Personal Finance Manager Backend

## Getting started

```bash
npm install
npm run dev
```

The API runs on `http://localhost:3000` by default. Set the `PORT` environment
variable to use another port.

## Endpoints

### Get a user

```http
GET /api/users/:userId
```

Example response:

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Get a user's accounts

```http
GET /api/accounts/:userId
```

Returns the user's accounts and their current balances. Balances include the
initial balance and all posted credit and debit transactions.

Example response:

```json
[
  {
    "id": "302c8799-09c2-4f1f-9daf-6f47c39f7993",
    "name": "Checking",
    "accountNumber": "1234",
    "type": "CHECKING",
    "createdAt": "2026-07-20T12:00:00.000Z",
    "currency": "USD",
    "bankName": "Example Bank",
    "bankLogo": null,
    "balance": "1250.00"
  }
]
```

### Get transactions by account

```http
GET /api/transactions/:accountId
```

Returns all transactions belonging to the account.

### Get monthly expenses grouped by category

```http
POST /api/transactions/expenses-by-category
Content-Type: application/json
```

Request body:

```json
{
  "accountId": "302c8799-09c2-4f1f-9daf-6f47c39f7993",
  "effectiveDate": "2026-06"
}
```

`effectiveDate` must use the `YYYY-MM` format. The endpoint returns only debit
transactions whose effective date falls within the requested UTC calendar
month, grouped by category.

Example response:

```json
[
  {
    "categoryId": "5ae2fd9c-cf86-44c0-99fb-845fba300f13",
    "categoryName": "Groceries",
    "categoryColor": "#22C55E",
    "categoryIcon": "shopping-cart",
    "transactions": [
      {
        "id": "66508852-138f-4309-bf08-a37cfabeca16",
        "scheduledTransactionId": null,
        "transferTransactionId": null,
        "entryType": "DEBIT",
        "description": "Supermarket",
        "status": "POSTED",
        "transactionDate": "2026-06-10T14:30:00.000Z",
        "effectiveDate": "2026-06-10T00:00:00.000Z",
        "projectName": null,
        "amount": "82.50"
      }
    ]
  }
]
```

## Error responses

Invalid endpoint parameters or request bodies return `400`:

```json
{
  "error": "Effective date must use the YYYY-MM format"
}
```

Unexpected server or database errors return `500`:

```json
{
  "error": "Internal server error"
}
```
