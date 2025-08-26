# TacoMail API
TacoMail provides an API which may be incorporated by third-party developers. This document describes the available routes. All mails will be automatically deleted after one hour.

The base URL for all requests is `https://tacomail.de`.

## Creating an inbox session
Only incoming mails with an associated inbox session are saved. A session is valid for a configured time and can be renewed by posting to the same endpoint again.

```
POST /api/v2/session
```
**Body**
```
{
    "username": string,
    "domain": string
}
```
Expected status: 200

### Example response
```json
{
    "expires": 1756229705148,
    "username": "axolotl_friend",
    "domain": "tacomail.de"
}
```

## Deleting an inbox session
Deleting an inbox session will cause any incoming mails associated with the session's address to be rejected. It does not delete already saved mails. See *Deleting a single mail* and *Deleting an entire inbox* for this purpose.

```
DELETE /api/v2/session
```
**Body**
```
{
    "username": string,
    "domain": string
}
```
Expected status: 200

## Fetching the contact email address
Returns the contact email address of this instance.
```
GET /api/v2/contactEmail
```
Expected status: 200

### Example response
```json
{
    "email": "contact@admin.tacomail.de"
}
```

## Fetching a random username
Returns a random username.
```
GET /api/v2/randomUsername
```

### Example response
```json
{
    "username": "unpreparedace69117"
}
```

## Fetching all available domains
Returns an array of available domains.
```
GET /api/v2/domains
```
Expected status: 200

### Example response
```json
[
    "tacomail.de",
    "axolotl.club"
]
```

## Fetching mails of an inbox
Returns the last 10 mails received by an inbox. An optional `limit` query parameter may be used to reduce the amount of mails returned. The maximum is 10.
```
GET /api/v2/mail/:address
```
Expected status: 200

### Example response
```json
[
    {
        "id": "97d5b620-b607-41c2-a10f-fad14901dc59",
        "from": {
            "address": "georg@outsider.com",
            "name": ""
        },
        "to": {
            "address": "poolforgiving@tacomail.de",
            "name": ""
        },
        "subject": "This is the subject",
        "date": "2022-08-03T14:16:51.000Z",
        "body": {
            "text": "This is an example body",
            "html": ""
        },
        "headers": {},
        "attachments": [
            {
                "id": "a28c488f-73aa-4b07-9d62-424f882354a8",
                "fileName": "logo.png",
                "present": true
            }
        ]
    }
]
```

## Fetching a single mail
Returns the data of a single mail identified by the recipient and its ID.
```
GET /api/v2/mail/:address/:mailId
```
Expected status: 200

### Example response
```json
{
    "id": "97d5b620-b607-41c2-a10f-fad14901dc59",
    "from": {
        "address": "georg@outsider.com",
        "name": ""
    },
    "to": {
        "address": "poolforgiving@tacomail.de",
        "name": ""
    },
    "subject": "This is the subject",
    "date": "2022-08-03T14:16:51.000Z",
    "body": {
        "text": "This is an example body",
        "html": ""
    },
    "headers": {},
    "attachments": [
        {
            "id": "a28c488f-73aa-4b07-9d62-424f882354a8",
            "fileName": "logo.png",
            "present": true
        }
    ]
}
```

## Fetching attachments
Returns the ID and name of all attachments of a mail. The `present` field indicates whether the attachment can be downloaded. Attachments will only be saved until their total sizes exceeds the configured `maxAttachmentsSize`.
```
GET /api/v2/mail/:address/:mailId/attachments
```
Expected status: 200

### Example response
```json
[
    {
        "id": "a28c488f-73aa-4b07-9d62-424f882354a8",
        "fileName": "logo.png",
        "present": true
    }
]
```

## Downloading an attachment
Downloads a single attachment of a mail. Make sure the `present` field is set to `true`.
```
GET /api/v2/mail/:address/:mailId/attachments/:attachmentId
```
Expected status: 200

## Deleting a single mail
Deletes a single mail and its attachments from the server.
```
DELETE /api/v2/mail/:address/:mailId
```
Expected status: 204

## Deleting an entire inbox
Deletes an entire inbox and all mails inside it.
```
DELETE /api/v2/mail/:address
``` 
Expected status: 204