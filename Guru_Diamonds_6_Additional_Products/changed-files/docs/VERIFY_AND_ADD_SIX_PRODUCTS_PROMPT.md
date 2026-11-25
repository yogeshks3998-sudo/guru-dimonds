# Verify and integrate the six additional Guru Diamonds products

Act as a senior full-stack developer and QA engineer. Work in the current website repository. Perform the integration and verification; do not stop at recommendations.

Repository: https://github.com/yogeshks3998-sudo/guru-dimonds

## Locate the delivery and preserve current work

Inspect the current branch, git status, existing supplier draft implementation and product persistence. Locate the extracted `Guru_Diamonds_6_Additional_Products` folder in the website root, including any nested extraction folder. Read its README and SIX_ADDITIONAL_SILVER_PRODUCTS_REPORT.md. The earlier `Guru_Diamonds_Silver_Drafts` folder may also be present.

Preserve all uncommitted work and existing product/inventory records. Create a review branch. Never run git reset/clean, database reset, destructive seeds or wholesale file replacement.

## Check these six products individually

| Draft | Net/gross grams | Stone data | Supplied metal / stone / making / total INR |
|---|---|---|---|
| Silver Turtle Ring with White AD Stones | 5.500 / 6.500 | White AD; 5 ct; square; men; custom ring sizing | 1100 / 400 / 74 / 1574 |
| Silver Stud Earrings with White & Red Synthetic Stones | 5.000 / 5.110 | Round; weight literally `0.110mili`; women | 1000 / 700 / 344 / 2044 |
| Silver Stud Earrings with White, Red & Green Synthetic Stones | 8.000 / 9.000 | 5 ct; round; women | 1600 / 1020 / 980 / 3600 |
| Silver Pearl Stud Earrings | 3.260 / 4.260 | Pearl; 5 ct; round; women | 652 / 400 / 650 / 1702 |
| Silver Stud Earrings with Uncut Synthetic Ruby Stones | 3.760 / 4.760 | 5 ct; round; unisex | 752 / 500 / 652 / 1904 |
| Silver Stud Earrings with Oval Synthetic Emerald Stones | 3.200 / 4.410 | 6 ct; oval; unisex | 640 / 720 / 404 / 1764 |

All supplied rates are INR 200/g and purity is literally `92`. Certificate and warranty fields are blank. The two source records named `silver stones tops` are distinct products. The white/red stone-value expression is `14*50=700rs`; the white/red/green expression is `34*30=1020rs`. These expressions do not establish verified stone counts. The pearl value expression is `5ct*80=400rs`.

Check source code AND the configured local/development database independently, matching IDs, SKUs, slugs, original/revised names, descriptions and specifications. Report SOURCE PRESENT, DATABASE PRESENT, ADMIN VISIBLE and CUSTOMER PUBLISHED separately. Source records alone do not prove database import or customer availability.

## Integrate only missing changes

If the earlier ten-product implementation is already applied, check/apply the incremental `six-additional-products.patch`. If neither batch is integrated, check/apply `all-sixteen-products.patch` instead. Do not apply both. If a patch conflicts, use changed-files/ as a reference and merge selectively into the latest code. Do not overwrite newer changes.

If the six records already exist, preserve admin edits; do not re-create or overwrite them. Add missing records with the supplied professional descriptions, SEO metadata, source snapshots and discrepancy notes. Preserve the earlier ten supplier drafts and all existing products. The full source data for this batch is in `src/data/silverTurtleAndStudProducts.ts`.

## Mandatory product safety

Keep all new products DRAFT, disabled, `images: []`, zero stock and enquiry-only. Retain the neutral placeholder and admin image upload/save functionality. Do not fabricate sizes, reviews, discounts, certificates, warranties, delivery promises, pair quantities, dimensions or stock.

Do not interpret `92` as certified 925. Preserve `0.110mili` verbatim; do not convert its unit. Keep AD as a supplier trade term until the material is confirmed. Ruby and emerald entries are synthetic; never call them natural. Do not assume the pearl is natural or cultured. Keep inappropriate supplier ring-size fields in review metadata for the earrings, without rendering ring-size selectors. Confirm whether earring prices and weights cover one item or a pair. Flag the emerald 0.010 g weight difference.

The component totals reconcile but GST basis is unknown. Do not approve a fixed selling price or apply GST blindly. Inspect the existing pricing utility and keep original prices separate from verified retail calculations. No global bullion rate changes.

## Persistence and tests

Inspect Prisma migration status. For a confirmed local/development database, apply only the necessary additive migration via the established workflow; never reset or seed the entire catalogue. If the connection is production, remote or unclear, stop database mutations and report that step as pending without exposing credentials.

Run `npm run import:silver-studs:dry-run`. When safe local DB access is available, run `npm run import:silver-studs -- --database --dry-run`, review skips, then `npm run import:silver-studs -- --apply`. Repeat the database dry run and verify zero duplicate creates. Check actual database save/reload and admin list/edit/image-upload behavior. Use `import:silver` separately for the earlier ten if required.

Run TypeScript checks, frontend/server builds, SEO generation, relevant tests and desktop/tablet/mobile checks. Confirm no drafts appear in the public catalogue or sitemap and all purchase entry points reject them. Fix errors introduced by this integration. Preserve unrelated code and baseline failures.

Review the final diff. Commit only intended implementation files, excluding extracted delivery archives and credentials. Do not deploy or publish. Do not push unless explicitly requested.

Finish with an evidence-based table for all six: SKU, slug, category, source presence, database presence, admin visibility, image count, status and supplier price. State actual created/skipped counts, tests, files changed, branch/commit and remaining issues. Never say products are live or on GitHub merely because they exist locally.
