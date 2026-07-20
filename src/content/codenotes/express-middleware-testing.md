---
title: Express middleware testing
tags:
  - javascript
  - node
  - testing
date: 2026-07-20
---

Heads up: `reqresnext` is barely maintained these days — [node-mocks-http](https://github.com/eugef/node-mocks-http) or [supertest](https://github.com/ladjs/supertest) are the ecosystem standards now. The pattern below still works though.

```js
import reqresnext from 'reqresnext'

import { userIdChecker } from './userIdMiddleware'

const DOMAIN = 'https://example.com'
const VALID_USER_ID = '103003'
const jwtToken = 'fake.jwt.token'

describe('Given a userIdChecker middleware', () => {
  describe(`when it is called with matching userId's`, () => {
    describe('when the request has a user_id as a query param', () => {
      it('should not modify the request', () => {
        const originalRequest = `${DOMAIN}/api/fx-api/user/103003?user_id=103003`
        const path = `/api/fx-api/user/${VALID_USER_ID}?user_id=${VALID_USER_ID}`
        const { req, res, next } = reqresnext({
          url: `${DOMAIN}${path}`,
          originalUrl: `${DOMAIN}${path}`,
          path,
          cookies: {
            jwt_id_token: jwtToken,
          },
        })

        userIdChecker(req, res, next)

        expect(req.url).toEqual(originalRequest)
      })
    })

    describe('when the request has a userId in the request body', () => {
      it('should not modify the request', () => {
        const path = `/api/fx-api/user/${VALID_USER_ID}`
        const { req, res, next } = reqresnext({
          url: `${DOMAIN}${path}`,
          originalUrl: `${DOMAIN}${path}`,
          path,
          cookies: {
            jwt_id_token: jwtToken,
          },
          body: {
            userId: VALID_USER_ID,
          },
        })

        userIdChecker(req, res, next)

        expect(req.body.userId).toEqual(VALID_USER_ID)
      })
    })
  })

  describe(`when it is called with mismatching userId's`, () => {
    const WRONG_USER_ID = '12345'

    it('should forbid the API call', () => {
      const originalRequest = `${DOMAIN}/api/fx-api/user/103003?user_id=${WRONG_USER_ID}`
      const path = `/api/fx-api/user/${VALID_USER_ID}?user_id=${WRONG_USER_ID}`
      const { req, res, next } = reqresnext({
        url: `${DOMAIN}${path}`,
        originalUrl: `${DOMAIN}${path}`,
        path,
        cookies: {
          jwt_id_token: jwtToken,
        },
      })

      userIdChecker(req, res, next)

      expect(req.url).toEqual(originalRequest)
      expect(res.statusCode).toEqual(403)
      expect(JSON.parse(res.body)).toEqual({ message: 'Forbidden' })
    })

    describe('when the request has a userId in the request body', () => {
      it('should forbid the API call', () => {
        const path = `/api/fx-api/user/${VALID_USER_ID}`
        const { req, res, next } = reqresnext({
          url: `${DOMAIN}${path}`,
          originalUrl: `${DOMAIN}${path}`,
          path,
          cookies: {
            jwt_id_token: jwtToken,
          },
          body: {
            userId: WRONG_USER_ID,
          },
        })

        userIdChecker(req, res, next)

        expect(res.statusCode).toEqual(403)
        expect(JSON.parse(res.body)).toEqual({ message: 'Forbidden' })
      })
    })
  })
})
```
