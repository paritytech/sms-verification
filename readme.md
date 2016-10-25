# [Parity](https://ethcore.io/parity.html) SMS verification

[![Join the chat at https://gitter.im/ethcore/parity][gitter-image]][gitter-url] [![GPLv3][license-image]][license-url]

[gitter-image]: https://badges.gitter.im/Join%20Chat.svg
[gitter-url]: https://gitter.im/ethcore/parity
[license-image]: https://img.shields.io/badge/license-GPL%20v3-green.svg
[license-url]: https://www.gnu.org/licenses/gpl-3.0.en.html

The following process **verifies a number**:

```
respond(sha(number),sha(token))
         +-------------------> +--------+
         |                     |contract|   challenge(sha(number), token)
         |       +-----------> +--------+ <-----------+
         |       |                                    |
         |       | request(sha(number))               |
         |       |                                    |
         |       |                                    |
         |   +------+          POST /:number      +------+
         +-- |client| +-------------------------> |server| code=rand()
             +------+                             +------+ token=sha(code)
token=sha(code)  ^             SMS with code          |
                 +------------------------------------+
```

1. client requests verification (`request(sha(number))`)
2. client calls verification server (`POST /:number`)
3. server generates `code` and computes `token`
4. server posts challenge (`challenge(sha(number), token)`)
5. server sends SMS to client (with `code`)
6. client computes `token`
7. client posts response (`respond(sha(number), sha(token))`)

Now, anyone can easily **check if a number is verified by calling `verified(sha3(number))`** on the contract.
