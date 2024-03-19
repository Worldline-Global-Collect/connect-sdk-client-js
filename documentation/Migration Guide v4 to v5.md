# Migration from version 4 to version 5

The landscape of frontend development and supported technologies by browsers has evolved rapidly in recent years.
To name a few; handling asynchronous code with native Promises, new javascript data structures `Map`, `Set`
and sequence operations like `find`, `include`, `some` are now more declarative and built into all stable browsers.

Rewriting the codebase results in a smaller package size by using tree shaking and native APIs instead of polyfills.
Not only is the package size smaller, the package can also be used as ESModules with full TypeScript support!

This guide is meant to help you upgrade from the Connect Client JS SDK **4.x.x** to **5.0.0** successfully!



## Major breaking changes

We've accumulated the following breaking changes in Connect Client JS SDK



### Drop support for old browsers

To support as many users as possible worldwide where the library can make use of the native browser APIs (fetch, promises etc.),
we support the following minimum browser versions:

| Browser        | Minimal version |
|:---------------|:----------------|
| Chrome         | 69              |
| Chrome mobile  | 87              |
| Safari         | 13.1            |
| Safari mobile  | 14              |
| MS Edge        | 90              |
| MS Edge mobile | 103             |
| Firefox        | 78              |
| Opera          | 85              |
| Samsung mobile | 7.4             |



### Promises

The library now uses [native Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise). In version 4 you needed to use a custom Promise implement with the following interface:

```ts
interface Promise<T> {
  readonly resolve: (result: T) => void;
  readonly reject: (error: any) => void;

  then(success: (result: T) => void, error: (error: any) => void): Promise<T>;
}
```

This implementation introduces callback hell *(especially when another async method needed to be called with the response of the previous async method)*

```ts
session.getIinDetails(partialCreditCardNumber, paymentDetails).then(
  (iinDetails) => {
    session.getPaymentProduct(iinDetails.paymentProductId, paymentDetails).then(
      (paymentProduct) => {
        ...
      },
      (error) => console.error(error)
    )
  },
  (error) => console.error(error)
)
```

within version 5 this needs to be replaced with native Promise handling:

```ts
try {
	const iinDetails = await session.getIinDetails(partialCreditCardNumber, paymentDetails);
  const paymentProduct = await session.getPaymentProduct(iinDetails.paymentProductId, paymentDetails);
} catch(error) {
  console.error(error);
}
```



### Error handling

Some methods in version 4 did not always return an instance of `Error` when a Promise was rejected. This could vary in different return types, such as `string`, `Object` or `JSON`. As a developer, you needed to be aware of the return type and value. This has changed in version 5, when a Promise is rejected, the rejected value is always an instance of `Error`.

#### `session.getPaymentProduct`

```ts
session.getPaymentProduct(...).then(successCallback, (error) => {
  // error was of type `Object`, even the object could change based on internal errors

  // example when browser did not support the payment method `{ errorId: string; errors: Error[] }`
  // example when payment method is Apple / GooglePay and an error occurred `{ reason: string; json: JSON }`
})
```

This has been replaced with:

```ts
import {
  ResponseError,
  ResponseJsonError,
  PaymentProductError,
} from "connect-sdk-client-js";

try {
  const paymentProduct = await session.getPaymentProduct(...);
} catch(error) {
  // error occurred while fetching payment product...

  if (error instanceof ResponseJsonError) {
    // ResponseJsonError is thrown when there is an error with
    // a given id and an array of errors
    error.message 	// error message as string
    error.errorId 	// error unique identifier of the error as string
    error.errors		// array of errors
  }

  if (error instanceof PaymentProductError) {
    // PaymentProductError is thrown when an error occurs while
    // returning the PaymentProduct after the request to the backend is successful
    error.message   // error message as string
    error.json      // optional backend response raw json value
  }

  if (error instanceof ResponseError) {
    // ResponseError is thrown when the request to the backend API throws an error
    error.message; 	// error message as string
    error.response; // response from backend api
  }
}
```

Using type guard in TypeScript will allow you to inspect the error type correctly.



#### `session.getIinDetails`

```ts
session.getIinDetails(...).then(successCallback, (error) => {
  // The error is an instance of `IinDetailsResponse` (same type as used when the promise is resolved)
});
```

This has been replaced with:

```ts
import { IinDetailsResponseError, ResponseError } from "connect-sdk-client-js";

try {
	const iinDetails = await session.getIinDetails(...);
} catch(err) {
  // error occurred while fetching IIN details...

  if (err instanceof IinDetailsResponseError) {
    // 'UNKNOWN' or 'NOT_ENOUGH_DIGITS'
    err.status;

    // optional successful response from backend api
    err.json;
  }

  if (err instanceof ResponseError) {
    // ResponseError is thrown when the request to the backend API throws an error
    err.message; // error message as string
    err.response; // response from backend api
  }
}
```



#### Response errors

In version 4, promises were rejected with type `JSON` when an error occurred while communicating with the backend API. This has been replaced with the type `ResponseError`, example:

```ts
import { ResponseError } from "connect-sdk-client-js";

try {
  const basicPaymentItems = await session.getBasicPaymentItems(...);
} catch(error) {
  // error occurred while fetching basic payment items...

  if (err instanceof ResponseError) {
    // ResponseError is thrown when the request to the backend API throws an error
    err.message; 	// error message as string
    err.response; // response from backend api
  }
}
```




#### `session.createApplePayPayment`

```ts
session.createApplePayPayment(...).then(successCallback, (error) => {
  // The error is of type `JSON`, `Object` or `Error` based on what error internally occurred
});
```

This has been replaced with:

```ts
try {
  const applePayInitResult = await session.createApplePayPayment(...);
} catch(error) {
  // error is always instance of Error

  if (error instanceof Error) {
    err.message; // error message as string
  }
}
```



#### Encryption

```ts
const encryptor = session.getEncryptor();

encryptor.encrypt(paymentRequest).then(successCallback, (error) => {
  // error can be `JSON` (api response) or `Error` when Jose encryption failed
});
```

This has been replaced with:

```ts
import { EncryptError, ResponseError } from "connect-sdk-client-js";

try {
  const encryptor = session.getEncryptor();
  const encryptedPaymentRequest = await encryptor.encrypt(paymentRequest);
} catch(error)  {
  // error occurred while encrypting payment request...

  if (err instanceof EncryptError) {
    // EncryptError can optionally have the property `validationErrors`
    // when validation errors are found within the PaymentRequest
    err.message; // error message as string
    err.validationErrors; // array of validation errors
  }

  if (err instanceof ResponseError) {
    // ResponseError is thrown when the request to the backend API throws an error
    err.message; // error message as string
    err.response; // response from backend api
  }
}
```



### Refer by ID

In version 4, the instance of some classes contains a property suffixed with `ById`, which is an `Object` used for lookup an entity by id, example:

```ts
const items = new BasicPaymentItems(...);

const productId = 1;
items.basicPaymentItemById[productId];

const accountOnFileId = 2;
items.accountOnFileById[accountOnFileId];
```

The following classes contains such properties:

| Class | Properties |
| :-- | :-- |
| `BasicPaymentItems` | `basicPaymentItemById` & `accountOnFileById` |
| `BasicPaymentProduct` | `accountOnFileById` |
| `BasicPaymentProducts` | `basicPaymentProductById` & `accountOnFileById` |
| `BasicPaymentProductGroup` | `accountOnFileById` |
| `BasicPaymentProductGroups` | `basicPaymentProductGroupById` & `accountOnFileById`|
| `PaymentProduct` |  `paymentProductFieldById` |
| `PaymentProductGroup` | `paymentProductFieldById` |

Version 5 removed the property as `Object` and uses `Map` internally. The suffix `ById` is removed from the method name, since the argument already tells the function what's expected and use the possibility to use [function overloading](https://www.tutorialsteacher.com/typescript/function-overloading) in the future.

```ts
const items = new BasicPaymentItems(...);

const productId = 1;
items.getBasicPaymentItem(productId);

const accountOnFileId = 2;
items.getAccountOnFile(accountOnFileId);
```

> The transformation will be add  `get` as prefix and remove the `ById` as suffix, make sure the method is name camel-cased.



### Removed session methods

The following legacy methods are removed from the `Session` instance:

- `transformPaymentProductJSON`
- `transformPaymentProductGroupJSON`

It is no longer necessary to use these methods because the return values of `getPaymentItem(s)` and `getBasicPaymentItem(s)` are transformed by default.



### AMD partially supported

While you may be able to load the entire library with [AMD](https://en.wikipedia.org/wiki/Asynchronous_module_definition) _(e.g. in RequireJS)_, loading individual modules is no longer supported.
For example, previously you could access the `Session` class within require js, like so:

```ts
define(['connectsdk.Session'], (Session) = > {
  // access to Session class
});
```

This is not longer supported, this will be replaced with:
```ts
define(['connectsdk'], (connectSdk) => {
  // access to the whole library
  const Session = connectSdk.Session;
})
```

Although it is still possible to use legacy AMD, it is not recommended in modern bundlers anymore, because of:

- can lead to waterfal loading (async loads dependency of dependencies)
- hard to analyze for static analyzers
- loader libraries are required unless transpiled

We strongly recommend to use native JavaScript  **ECMAScript 6 modules** instead.

