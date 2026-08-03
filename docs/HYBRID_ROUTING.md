# Hybrid routing

Configuration source: `assets/hybrid-functions.json`

| Function | Official destination | Behaviour |
|---|---|---|
| Find a store | `https://www.auping.com/en/store-locator` | New tab |
| Configurator | `https://configurator.auping.com/en-gb` | New tab |
| Contact | `https://www.auping.com/en/customer-service/contact` | New tab |
| My Auping | `https://www.auping.com/en/myauping` | New tab |
| Shopping cart | `https://www.auping.com/en/shoppingcart` | New tab |
| Official shop | `https://shop.auping.com/` | New tab |

The runtime rewrites captured local service URLs and marks them as official-service links. Direct visits to a local special-function route are redirected to the official destination.

Do not scatter official URLs through hundreds of HTML files. Update the JSON configuration and the fallback object in `assets/snapshot-interactions.js` together.
