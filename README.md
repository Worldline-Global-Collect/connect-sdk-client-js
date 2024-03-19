# Worldline Connect JavaScript SDK

### Introduction

The JavaScript SDK helps you to communicate with the [Worldline Connect](https://docs.connect.worldline-solutions.com/) Client API. Its primary features are:

- handling of all the details concerning the encryption of the payment details,
- convenient JavaScript wrapper around the API calls and responses,
- localization of various labels and messages,
- user-friendly formatting (masking) of payment data such as card numbers and expiry dates,
- validation of input
- check to determine to which payment provider a card number is associated.

See the [Worldline Global Collect Developer Hub](https://docs.connect.worldline-solutions.com/documentation/sdk/mobile/javascript/) for more information on how to use the SDK.

### Requirements

 Minimal browser versions:

- Chrome 69+
- Chrome mobile 87+
- Safari 13.1+
- Safari mobile 14+
- MS Edge 90+
- MS Edge mobile 103+
- Firefox 78+
- Opera 85+
- Samsung mobile 7.4+

### Examples

⚠ Please note that all examples have been moved to their own [repository](https://github.com/Worldline-Global-Collect/connect-sdk-client-js-example).

### Installation

Install this SDK using your preferred node package manager [`npm`](https://www.npmjs.com), [`yarn`](https://yarnpkg.com), [`pnpm`](https://pnpm.io) or [Bun](https://bun.sh/package-manager).

```bash
npm install connect-sdk-client-js
```

### Distributed packages

The SDK can be used AS UMD, CJS or ESM module.

#### Example Universal Module Definition (UMD)

The SDK is available under global namespace `connectsdk` and can be used in the following way:

_app.js_

```js
const sessionDetails = {
  /* ... */
};

// We can access the SDK via the global namespace `window.connectsdk`
const session = new window.connectsdk.Session(sessionDetails);
```

_index.html_

```html
<!doctype html>
<html lang="en">
  <head>
    <title>Example UMD</title>
    <script
      defer
      src="./node_modules/connect-sdk-client-js/dist/connect-sdk-client-js.umd.js"
    ></script>
    <script defer src="./app.js"></script>
  </head>
</html>
```

#### Example ECMAScript Module (ESM)

```ts
import { Session, type SessionDetails } from 'connect-sdk-client-js';

const sessionDetails: SessionDetails = {
  /* ... */
};

const session = new Session(sessionDetails);
```

#### Example CommonJS (CJS)

```js
const { Session } = require('connect-sdk-client-js');

/**
 * @type {import('connect-sdk-client-js').SessionDetails}
 */
const sessionDetails = {
  /* ... */
};

const session = new Session(sessionDetails);
```

### Build from source

This repository uses [microbundle](https://github.com/developit/microbundle) to build the SDK.
You can build the sdk by running the following commands:

```bash
npm run build
```

The result of the build will have been written to the `dist` folder. This folder will contain the following files:

- `/dist/types` - Directory containing all type declaration file. The `index.d.ts` is set as main file for the exported package, see `package.json:types` property.
- `/dist/connect-sdk-client-js.js` - The compiled TypeScript as ESM module. This file will be when using ESM, see `package.json:module` property.
- `/dist/connect-sdk-client-js.umd.js` - The compiled TypeScript as UMD module. This file can be used when you want to use the library as UMD, see `package.json:unpkg` property.
- `/dist/connect-sdk-client-js.cjs` - The compiled TypeScript as CommonJS module. This file can be used when you want to use the library as CommonJS, see `package.json:main` property.

### Test

This library contains unit- and integration tests written with [Vitest](https://vitest.dev).
By default Vitest starts in _watch mode_ when starting locally and _run mode_ when running in CI (when environment var `CI` is set), [see documentation](https://vitest.dev/guide/features.html#watch-mode).

| Command                    | Description           |
|:---------------------------|:----------------------|
| `npm run test`             | Run unit tests        |
| `npm run test:integration` | Run integration tests |
