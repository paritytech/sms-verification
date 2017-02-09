# [Parity](https://ethcore.io/parity.html) SMS verification

[![Join the chat at https://gitter.im/ethcore/parity][gitter-image]][gitter-url] [![GPLv3][license-image]][license-url]

[gitter-image]: https://badges.gitter.im/Join%20Chat.svg
[gitter-url]: https://gitter.im/ethcore/parity
[license-image]: https://img.shields.io/badge/license-GPL%20v3-green.svg
[license-url]: https://www.gnu.org/licenses/gpl-3.0.en.html

The following process **verifies a number**:

```
           confirm(token)
         +-------------------> +--------+
         |                     |contract|   puzzle(address, sha(token))
         |       +-----------> +--------+ <-----------+
         |       |                                    |
         |       | request()                          |
         |       |                                    |
         |       |                                    |
         |   +------+  POST /?number=…&address=…  +------+
         +-- |client| +-------------------------> |server| code=rand()
             +------+                             +------+ token=sha(code)
token=sha(code)  ^             SMS with code          |
                 +------------------------------------+
```

1. client requests verification (`request()`)
2. client calls verification server (`POST /?number=…&address=…`)
3. server generates `code` and computes `token`
4. server posts challenge (`puzzle(address, sha(token))`)
5. server sends SMS to client (with `code`)
6. client computes `token`
7. client posts response (`confirm(token)`)

Now, anyone can easily **check if a number is verified by calling `certified(address)`** on the contract.

[latest deployed `SMSVerification.sol`](https://github.com/ethcore/contracts/blob/58842b9/SMSVerification.sol)

## Installation

```shell
git clone https://github.com/ethcore/sms-verification.git
cd sms-verification
npm install --production
```

## Usage

**The account calling `puzzle` has to be the `delegate` of the contract.**

1. Set up an account and put its password in a file.
2. Run Parity with `--jsonrpc-apis net,eth,personal,parity`.
3. Create a config file `config/<env>.json`, which partially overrides `config/default.json`.
4. `env NODE_ENV=<env> node index.js`

Deploy to production using process managers like [forever](https://github.com/foreverjs/forever#readme).

---

To run on both testnet and mainnet, just create two config files. Make sure to use

- separate Parity processes listening on different ports (`parity.host`)
- separate `db` files
- separate ports to listen on (`http.port`)
