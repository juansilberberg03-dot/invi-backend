# Conectar el checkout a Shopify

Esto es lo único de los 4 frentes que no puedo dejarte ya construido, porque
depende de que exista una tienda Shopify real con vuestros 35 productos
cargados — sin eso no hay nada a lo que conectar el botón de "Finalizar compra".

## Lo que hace falta antes de tocar código

1. Una cuenta de Shopify (plan Básico, ~29 €/mes) — si no la tenéis, es el primer paso.
2. Cargar los 35 productos en Shopify: nombre, precio, SKU, tallas/variantes,
   fotos y stock. Si me pasas un Excel con esas columnas te ayudo a darle
   formato para importarlo en bloque a Shopify (tienen un importador CSV).
3. Sacar del panel de Shopify: el nombre de la tienda (`algo.myshopify.com`) y
   un "Storefront API access token" (Configuración → Apps → Desarrollar apps).

## El camino más simple: Shopify Buy Button

Para una tienda que ya tiene su propio diseño (como la vuestra) y no quiere
depender de una app externa, lo más directo es el SDK "Buy Button" de Shopify:
cada ficha de producto llama a Shopify solo en el momento de pagar — el resto
de la web (fotos, descripciones, carrito visual) sigue siendo el vuestro tal
cual está.

Esquema de lo que cambiaría en el botón "Finalizar compra":

```js
const client = ShopifyBuy.buildClient({
  domain: 'vuestra-tienda.myshopify.com',
  storefrontAccessToken: 'vuestro-token-aqui'
});

// Por cada línea del carrito, necesitas el ID de la variante en Shopify
// (esto reemplaza al SKU interno que usa ahora mismo la web)
client.checkout.create().then(checkout => {
  return client.checkout.addLineItems(checkout.id, [
    { variantId: 'gid://shopify/ProductVariant/XXXXXXXX', quantity: 2 }
  ]);
}).then(checkout => {
  window.location.href = checkout.webUrl; // Shopify se encarga del pago
});
```

El paso que falta y que no puedo inventar: la tabla que relaciona cada uno de
vuestros 35 SKU (`INV-COD-001`, `INV-ROD-001`...) con su `variantId` real de
Shopify. Esa tabla solo existe una vez que los productos estén cargados ahí.

## Cuando tengas la cuenta y los productos cargados

Pásame:
- El dominio de la tienda (`algo.myshopify.com`)
- El Storefront access token
- Un listado de qué SKU corresponde a qué variantId de Shopify (o dime que
  entre yo a revisarlo si me das acceso)

Y conecto el botón de cada ficha de producto directamente, sin tocar nada más
del diseño.
