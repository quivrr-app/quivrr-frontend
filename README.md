# Quivrr Frontend

The main Quivrr web client for global canonical board search, regional availability, retailer partnership entry, and the internal Operations Centre shell.

## Runtime architecture

- Canonical brands, models, constructions, dimensions, and board identity come from `quivrr-backend-api` and are global.
- Regional retailer and manufacturer-direct availability uses an explicit `region` or `regionCode`.
- AU, EU, ID, and US are active runtime regions.
- Invalid or missing regions must not silently fall back to AU.
- Region changes stock, price, currency, source, product URL, and location—not canonical board identity or board intelligence.

## Frontend surface map

- `/australia/`, `/europe/`, `/indonesia/`, `/united-states/` are the live regional search pages.
- The hero manufacturer logo band remains a trust signal for searchable supported brands.
- The lower strip above Close Matches is the Regional Retailer Network and is populated from `regional-retailer-network.js`.
- `/retailers/` is the public retailer partnership page and currently uses a client-side prefilled `mailto:` handoff rather than a server-side form service.
- `/operations/` is the internal Operations Centre frontend shell and should not be treated as a public marketing page.
- `/` currently redirects to `/australia/`.

Validated June 2026 production baselines:

| Table | AU | EU | ID | US | NULL |
| --- | ---: | ---: | ---: | ---: | ---: |
| RetailerInventory | 11,746 | 9,105 | 1,998 | 7,812 | 0 |
| ManufacturerInventory | 6,498 | 2,736 | 185 | 4,647 | 0 |

The separate surf experience and Bodhi board guide live on [quivrr.surf](https://quivrr.surf). Bodhi consumes the same canonical catalogue and explicit region-scoped availability APIs.

See also:

- [Retailer Partnership And Regional Retailer Network](RETAILER_PARTNERSHIP.md)
