# react-shopify-drop
[![npm version](https://badge.fury.io/js/react-shopify-drop.svg)](https://badge.fury.io/js/react-shopify-drop)

react-shopify-drop is a react library for interacting with [shopify's storefront api](https://shopify.dev/api/storefront#top).

## Installation

Use the package manager [yarn](https://www.npmjs.com/package/react-shopify-drop) to install react-shopify-drop.

```bash
yarn add react-shopify-drop
```

## First steps

### Set up

#### **`app.js`**

```typescript
import { createStorefrontClient, StorefrontProvider } from 'react-shopify-drop';

export const storefrontClient = createStorefrontClient({
  accessToken: 'storefront-app-access-token',
  endpoint: 'storefront-app-graphql-endpoint',
});

const App = () => (
  <StorefrontProvider
    appCartId="app-name-cart-id"
    client={storefrontClient}
  >
    <MyApp />
  </StorefrontProvider>
);

export default App;
```

### Usage

#### **`component.js`**
Under the hood, the `<StorefrontProvider />` creates a friendly API with a set of useful properties to interact with your shopify application

```typescript
import { useStorefront } from 'react-shopify-drop';

const Component = () => {
  const api = useStorefront();

  return <div />;
};
```

## API properties
The API comes in form of an object with the following properties:

##### `cart`: _object_
An object which contains the shopify users cart.

##### `cartItemsCount`: _number_
The amount of items in the current cart.

##### `cartToggleState`: _object_
A toggle state to help manage the cart UI state (opened / closed).
- isOn: _boolean_ - Defines the cart UI state.
- handleToggle: _function_ - Toggles the cart UI state. 
- handleOn: _function_ - Sets the cart UI state as on (opened). 
- handleOff: _function_ - Sets the cart UI state as on (closed). 

##### `errors`: _object_
An object containing a set of possible errors
- createCartError: _Error_ | _null_
- addLineItemError: _Error_ | _null_
- updateLineItemError: _Error_ | _null_
- removeLineItemError: _Error_ | _null_

##### `onAddLineItem`: _function_ ``({ merchandiseId: string, quantity: number }) => Promise<void>``
Adds an item to the shopify cart.

##### `onUpdateLineItem`: _function_ ``({ merchandiseId: string, quantity: number }) => Promise<void>``
Updates an item inside the shopify cart.

##### `onRemoveLineItem`: _function_ ``({ merchandiseId: string }) => Promise<void>``
Removes an item from the shopify cart.

## Using the full Storefront client
In the other hand, you can also export the created client and import it outside your application frontend (f.e: next.js page getStaticProps function)

```typescript
import { storefrontClient } from '~/pages/_app.js';

export const getStaticProps = async () => {
  const { product } = await storefrontClient.GetProductByHandle({ handle: 'my-product' });

  return {
    props: {
      product
    },
    revalidate: 1
  };
};
```
### Client properties

```typescript
CreateCart
CreateCartWithLines
AddLineItem
UpdateLineItem
RemoveLineItem
FetchCart
GetProductByHandle
GetAllProducts
GetProductsOnCollection
GetCollections
```
## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](https://choosealicense.com/licenses/mit/)