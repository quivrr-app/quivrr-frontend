# Quivrr Frontend

The main Quivrr web client for global canonical board search and regional availability.

## Runtime architecture

- Canonical brands, models, constructions, dimensions, and board identity come from `quivrr-backend-api` and are global.
- Regional retailer and manufacturer-direct availability uses an explicit `region` or `regionCode`.
- AU, EU, and ID are active runtime regions.
- Invalid or missing regions must not silently fall back to AU.
- Region changes stock, price, currency, source, product URL, and location—not canonical board identity or board intelligence.

Validated June 2026 production baselines:

| Table | AU | EU | ID | NULL |
| --- | ---: | ---: | ---: | ---: |
| RetailerInventory | 11,746 | 9,105 | 1,998 | 0 |
| ManufacturerInventory | 6,498 | 2,736 | 185 | 0 |

The separate surf experience and Bodhi board guide live on [quivrr.surf](https://quivrr.surf). Bodhi consumes the same canonical catalogue and explicit region-scoped availability APIs.
