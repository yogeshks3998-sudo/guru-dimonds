# Guru Diamonds — supplier silver product import

Base: `main` at `9d08e92778383414a7c8c682d2ce6914edd4bfa6`.
Branch: `feature/new-silver-gemstone-products`.

## Apply the patch

The accompanying delivery contains a Git format patch and the changed files. From a clean checkout of the repository:

```bash
git switch main
git pull --ff-only
git switch -c feature/new-silver-gemstone-products
git am /absolute/path/to/guru-silver-products.patch
npm ci
npm run db:generate
npm run lint
npm run build
npm run build:server
npm run import:silver:dry-run
```

If your branch has diverged, review and resolve patch conflicts instead of overwriting files. The bundle does not contain production credentials.

## Database import

The code adds one nullable JSONB column. Existing rows are left unchanged. `UNVERIFIED` is a deliberately non-tradable purity/colour marker, not a 920/925 grade. No global bullion rates are altered.

With the correct existing `DATABASE_URL` configured, review existing migration status and take the normal database backup before applying pending migrations:

```bash
npm exec -- prisma migrate status
npm run db:deploy
npm run db:generate
npm run import:silver -- --database --dry-run
npm run import:silver -- --apply
npm run import:silver -- --database --dry-run
```

Do **not** use `db:seed`, `fast-seed`, `migrate reset` or the spreadsheet importer to load this batch. The dedicated importer creates missing records only, never overwrites edited products, never deletes inventory and never resets existing products. It runs all changes in one serializable transaction and has no overwrite option. A concurrent import may fail safely with a serialization/unique conflict; review and repeat the dry run.

The database dry run checks every current product for matching IDs, normalized SKUs/slugs/names, exact descriptions, or matching category, metal, net/gross weights and making charges. Suspected matches are skipped and reported for manual review rather than duplicated. Identical weights alone do not establish that two pieces are the same: review each skipped match. The repository check found ten unique additions; the production database has not been accessed from this environment.

For missing categories, the importer reuses the existing category definitions. Existing categories are preserved; only a missing subcategory is appended. New inventory entries have quantity zero. There are no new variants or media rows.

Migration rollback SQL is recorded in the migration comment. Export review metadata before any rollback; do not drop the column while this version is running.

## Review and publish later

All ten records are `DRAFT`, disabled, zero-stock, enquiry-only and have `images: []`. No reviews, badges, verified certificate, hallmark agency, stock, delivery promise or approved selling price has been invented. Supplier certification availability is a claim rather than evidence. All source values remain under `supplierReview.raw`; the API and local update flow retain this original snapshot.

The pricing function applies a purity factor to net weight × rate, then adds GST even in fixed-price mode. Seller calculations in `supplierReview.pricing` deliberately use the seller's simple weight × rate basis and are **not** passed through the live formula. There is no approved `fixedPrice`. Zero-valued tax/logistics/fees in the required product interface are draft sentinels, not confirmed exemptions, charges or service terms. Unknown stone counts/colours/individual weights stay in review specifications; `gemstones: []` avoids fabricating the required legacy gemstone fields.

In Admin → Products, edit each draft to upload actual images, correct the operational product fields, confirm technical specifications and add resolution notes. The supplier review panel shows original values, component totals, issues, pending fields, claimed warranty and certificate status. Its verification section allows verified specifications, highlights, tax details and review decision to be recorded. Clear only resolved issues and pending fields after checking evidence. Original raw values remain unchanged.

For an approved GST-inclusive quotation, convert it to its pre-GST base before entering **Fixed Price Before GST**; the existing calculator adds GST. Set the applicable GST percentage and record the GST basis/amount in the review. Publication requires approved review state, no unresolved issues or pending fields, evidence notes, actual images, verified purity and colour, a positive fixed base price and consistent GST rate. Customised rings remain enquiry-only because the seller did not supply exact sizes. Only a separately verified size/variant and stock workflow should enable direct purchase.

The PDP, cards, cart store, server cart route and checkout prevent unresolved drafts from being purchased, including when an admin previews a draft or attempts to toggle it active. Sitemap generation excludes unpublished records. A neutral local placeholder is used for empty images. Upload, replace, reorder and removal remain available; drafts may have no images.

## Verification

```bash
npm test -- tests/unit/silverProducts.test.ts tests/frontend/silverProductDrafts.test.tsx --runInBand
npm run test:vitest
```

The full completion report contains test outcomes and known environment limitations. Browser-level responsive and real database tests must be completed in a staging environment before deployment. No deployment or publication was performed.
