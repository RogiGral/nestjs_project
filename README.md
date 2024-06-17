## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

# Users Controller

## Endpoints

### 1. Create User

URL: /users/create
Method: POST
Guards: JwtAuthGuard, ClaimsGuard
Claims: RequiredClaims.CAN_ACCESS_USER_CREATE

Description:

Creates a new user. The request body should contain the user details in the form of a UserDto.

Request Body:

```json
{
  "username": "string",
  "password": "string",
  "claims": ["claim1", "claim2"]
}
```

Response:

Returns the created user object.

Error Codes:

- 302 FOUND if the user already exists.
- 400 BAD REQUEST if the claims are invalid.

### 2. Register User

URL: /users/register
Method: POST

Description:

Registers a new user. This endpoint does not require authentication or claims.

Request Body:

```json
{
  "username": "string",
  "password": "string"
}
```

Response:

Returns the created user object.

Error Codes:

- 302 FOUND if the user already exists.

### 3. Get All Users

URL: /users
Method: GET
Guards: JwtAuthGuard, ClaimsGuard
Claims: RequiredClaims.CAN_ACCESS_USER_READ

Description:

Retrieves a list of all users.

Response:

Returns an array of user objects.

### 4. Check User Status

URL: /users/status
Method: GET
Guards: JwtAuthGuard, ClaimsGuard
Claims: RequiredClaims.CAN_ACCESS_USER_STATUS

Description:

Checks the status of the currently authenticated user.

Response:

Returns the user object.

Error Codes:

- 404 NOT FOUND if the user does not exist.

### 5. Get User by ID

URL: /users/:id
Method: GET
Guards: JwtAuthGuard, ClaimsGuard
Claims: RequiredClaims.CAN_ACCESS_USER_READ

Description:

Retrieves a user by their ID.

Response:

Returns the user object.

Error Codes:

- 400 BAD REQUEST if the ID is invalid.
- 404 NOT FOUND if the user does not exist.

### 6. Get User by Username

URL: /users/:username
Method: GET
Guards: JwtAuthGuard, ClaimsGuard
Claims: RequiredClaims.CAN_ACCESS_USER_READ

Description:

Retrieves a user by their username.

Response:

Returns the user object.

Error Codes:

- 404 NOT FOUND if the user does not exist.

### 7. Update User

URL: /users/:id
Method: PATCH
Guards: JwtAuthGuard, ClaimsGuard
Claims: RequiredClaims.CAN_ACCESS_USER_UPDATE
Pipes: ValidationPipe

Description:

Updates a user's information.

Request Body:

```json
{
  "username": "string",
  "password": "string"
}
```

Response:

Returns the updated user object.

Error Codes:

- 400 BAD REQUEST if the ID is invalid.

### 8. Delete User

URL: /users/:id
Method: DELETE
Guards: JwtAuthGuard, ClaimsGuard
Claims: RequiredClaims.CAN_ACCESS_USER_DELETE

Description:

Deletes a user by their ID. A user cannot delete themselves.

Response:

Returns a success message.

Error Codes:

- 400 BAD REQUEST if the ID is invalid.
- 403 FORBIDDEN if the user tries to delete themselves.

### 9. Add Claims to User

URL: /users/:id/claims
Method: PATCH
Guards: JwtAuthGuard, ClaimsGuard
Claims: RequiredClaims.CAN_ACCESS_USER_UPDATE

Description:

Adds claims to a user.

Request Body:

```json
{
  "claims": ["claim1", "claim2"]
}
```

Response:

Returns the updated user object.

Error Codes:

- 400 BAD REQUEST if the ID or claims are invalid.
- 404 NOT FOUND if the user does not exist.

## Guards and Claims

### Guards

- JwtAuthGuard: Ensures the request is authenticated using JWT.
- ClaimsGuard: Ensures the user has the necessary claims to access the endpoint.

### Claims

- RequiredClaims.CAN_ACCESS_USER_CREATE
- RequiredClaims.CAN_ACCESS_USER_READ
- RequiredClaims.CAN_ACCESS_USER_UPDATE
- RequiredClaims.CAN_ACCESS_USER_DELETE
- RequiredClaims.CAN_ACCESS_USER_STATUS

## Utility Methods

- validateClaims

Description:

Validates the provided claims to ensure they are within the set of allowed claims.

Parameters:

- claims: string[]: The claims to validate.

Returns:

- boolean: true if all claims are valid, false otherwise.

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
