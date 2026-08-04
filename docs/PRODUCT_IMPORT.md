# Guru Diamonds Product Import

Use this importer to add products from the Excel catalog into PostgreSQL without deleting existing website data.

## Source File

`Products/Gemstone_Product_Catalog.xlsx`

The importer reads the workbook, validates the expected column layout, creates/updates category and collection records, and imports products with variants, media, and inventory.

## Commands

Dry run:

```bash
npm run import:products:dry-run
```

Safe import:

```bash
npm run import:products
```

Overwrite existing imported products:

```bash
npm run import:products -- --overwrite
```

## Notes

- Existing products are skipped by default when SKU, slug, or product id already exists.
- The workbook has placeholder pricing and inventory text, so imported products use `IMPORT_PRODUCT_DEFAULT_PRICE` or `0` and `IMPORT_PRODUCT_DEFAULT_STOCK` or `1`.
- Product managers and owners can edit imported products from the admin product management screens.
- Google image-search links in the workbook are not direct product image URLs, so the importer uses a safe gemstone fallback image until final product photos are uploaded.
