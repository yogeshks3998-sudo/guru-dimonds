import 'dotenv/config';
import ExcelJS from 'exceljs';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { prisma } from '../backend/src/config/db';
import type { Product } from '../src/types';

type WorkbookProductRow = {
  productName: string;
  slug: string;
  sku: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  subcategory: string;
  collection: string;
  tags: string;
  gender: string;
  occasion: string;
  images: string;
  metalType: string;
  metalPurity: string;
  metalColor: string;
  grossWeight: string;
  netWeight: string;
  gemstones: string;
  hallmarkDetails: string;
  certificationDetails: string;
  pricing: string;
  stock: string;
  variants: string;
  badges: string;
  seoDetails: string;
  status: string;
};

type ImportOptions = {
  dryRun: boolean;
  overwrite: boolean;
  filePath: string;
  defaultPrice: number;
  defaultStock: number;
};

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=80';
const CATEGORY_IMAGE =
  'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80';
const COLLECTION_IMAGE =
  'https://images.unsplash.com/photo-1611591475281-a120023a105f?auto=format&fit=crop&w=1200&q=80';

const EXPECTED_HEADERS = [
  'Product Name',
  'Slug',
  'SKU',
  'Short Description',
  'Full Description',
  'Category',
  'Subcategory',
  'Collection',
  'Tags',
  'Gender',
  'Occasion',
  'Images',
  'Metal Type',
  'Metal Purity',
  'Metal Color',
  'Gross Weight',
  'Net Weight',
  'Gemstones',
  'Hallmark Details',
  'Certification Details',
  'Pricing',
  'Stock / Inventory',
  'Variants',
  'Badges',
  'SEO Details',
  'Status',
] as const;

function getOptions(): ImportOptions {
  const args = new Set(process.argv.slice(2));
  const explicitPath = process.argv.find((arg) => arg.startsWith('--file='));
  const defaultCandidates = [
    path.resolve('Products', 'Gemstone_Product_Catalog.xlsx'),
    path.resolve('products', 'Gemstone_Product_Catalog.xlsx'),
  ];
  const filePath = explicitPath
    ? path.resolve(explicitPath.replace('--file=', ''))
    : defaultCandidates.find((candidate) => existsSync(candidate)) || defaultCandidates[0];

  return {
    dryRun: args.has('--dry-run'),
    overwrite: args.has('--overwrite'),
    filePath,
    defaultPrice: Number(process.env.IMPORT_PRODUCT_DEFAULT_PRICE || 0),
    defaultStock: Math.max(0, Number(process.env.IMPORT_PRODUCT_DEFAULT_STOCK || 1)),
  };
}

function cellText(value: ExcelJS.CellValue): string {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object') {
    if ('richText' in value && Array.isArray(value.richText)) {
      return value.richText.map((part) => part.text).join('').trim();
    }
    if ('text' in value && typeof value.text === 'string') return value.text.trim();
    if ('result' in value) return cellText(value.result as ExcelJS.CellValue);
    if ('hyperlink' in value && typeof value.hyperlink === 'string') return value.hyperlink.trim();
  }
  return String(value).trim();
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);
}

function splitList(value: string): string[] {
  return value
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeGender(value: string): Product['gender'] {
  const gender = value.toLowerCase();
  if (gender.includes('men') && gender.includes('women')) return 'Unisex';
  if (gender.includes('women')) return 'Women';
  if (gender.includes('kid')) return 'Kids';
  if (gender.includes('men')) return 'Men';
  return 'Unisex';
}

function normalizeStatus(value: string): Product['status'] {
  const status = value.trim().toUpperCase();
  if (['DRAFT', 'SCHEDULED', 'HIDDEN', 'ARCHIVED'].includes(status)) {
    return status as Product['status'];
  }
  return 'ACTIVE';
}

function normalizeBadges(value: string): Product['badges'] {
  const normalized = splitList(value).map((badge) => badge.toUpperCase().replace(/[^A-Z0-9]+/g, '_'));
  const allowed = new Set<Product['badges'][number]>([
    'NEW',
    'BEST_SELLER',
    'HALLMARKED',
    'CERTIFIED',
    'SALE',
    'LIMITED',
    'MADE_TO_ORDER',
  ]);
  const badges = normalized.filter((badge): badge is Product['badges'][number] => allowed.has(badge as Product['badges'][number]));
  if (value.toLowerCase().includes('natural') && !badges.includes('CERTIFIED')) badges.push('CERTIFIED');
  return [...new Set(badges)];
}

function numberFromText(value: string, fallback: number): number {
  const firstNumber = value.replace(/,/g, '').match(/\d+(\.\d+)?/);
  return firstNumber ? Number(firstNumber[0]) : fallback;
}

function parsePrice(value: string, fallback: number): number {
  const mentionsManualPricing = /to be set|per carat|based on quality|updated/i.test(value);
  return mentionsManualPricing ? fallback : numberFromText(value, fallback);
}

function parseImages(value: string): string[] {
  const urls = splitList(value).filter((item) => /^https?:\/\//i.test(item) && !/google\.com\/search/i.test(item));
  return urls.length > 0 ? urls : [FALLBACK_IMAGE];
}

function parseSeo(value: string, fallbackTitle: string, fallbackDescription: string) {
  const title = value.match(/Title:\s*([^|]+)/i)?.[1]?.trim();
  const meta = value.match(/Meta:\s*([^|]+)/i)?.[1]?.trim();
  return {
    seoTitle: title || fallbackTitle,
    seoDescription: meta || fallbackDescription,
  };
}

function parseVariantAttributes(value: string) {
  const shape = value.match(/Shape\/Cut:\s*([^;]+)/i)?.[1]?.trim();
  const carat = value.match(/Carat:\s*([^;]+)/i)?.[1]?.trim();
  return [
    ...(shape ? [{ name: 'Shape/Cut', options: splitList(shape) }] : []),
    ...(carat ? [{ name: 'Carat', options: [carat] }] : []),
  ];
}

function buildProduct(row: WorkbookProductRow, options: ImportOptions): Product {
  const now = new Date().toISOString();
  const slug = row.slug || slugify(row.productName);
  const price = parsePrice(row.pricing, options.defaultPrice);
  const stock = numberFromText(row.stock, options.defaultStock);
  const images = parseImages(row.images);
  const gemstoneType = row.gemstones || row.productName.replace(/^Natural\s+/i, '').replace(/\s+Gemstone$/i, '');
  const isCertified = /cert|subject/i.test(row.certificationDetails);
  const seo = parseSeo(row.seoDetails, row.productName, row.shortDescription);

  return {
    id: `prod-${slug}`,
    name: row.productName,
    slug,
    sku: row.sku,
    shortDescription: row.shortDescription,
    description: [
      row.fullDescription,
      row.hallmarkDetails ? `Hallmark: ${row.hallmarkDetails}` : '',
      row.certificationDetails ? `Certification: ${row.certificationDetails}` : '',
      row.pricing ? `Pricing note: ${row.pricing}` : '',
      row.stock ? `Inventory note: ${row.stock}` : '',
    ]
      .filter(Boolean)
      .join('\n\n'),
    category: row.category,
    subcategory: row.subcategory,
    collection: row.collection,
    tags: [...new Set([...splitList(row.tags), gemstoneType, 'Guru Diamonds'])],
    gender: normalizeGender(row.gender),
    occasion: splitList(row.occasion),
    images,
    metalType: 'SILVER',
    metalPurity: '925',
    metalColor: 'White',
    grossWeightGrams: 0,
    netWeightGrams: 0,
    gemstones: [
      {
        type: gemstoneType,
        weightCaratOrGrams: 0,
        color: '',
        count: 1,
        totalPrice: price,
        certified: isCertified,
      },
    ],
    hallmarked: false,
    hallmarkCenter: row.hallmarkDetails,
    certified: isCertified,
    certificationAgency: row.certificationDetails,
    pricingMode: 'FIXED',
    fixedPrice: price,
    compareAtPrice: undefined,
    makingChargeType: 'FIXED',
    makingChargeValue: 0,
    wastagePercentage: 0,
    certificationCharge: 0,
    packagingCharge: 0,
    gstPercentage: 3,
    totalStock: stock,
    hasVariants: true,
    variantAttributes: parseVariantAttributes(row.variants),
    variants: [
      {
        id: `var-${slug}-default`,
        sku: `${row.sku}-DEFAULT`,
        barcode: row.sku,
        attributes: {
          Gemstone: gemstoneType,
          'Carat Range': row.netWeight || row.grossWeight || 'To be updated',
        },
        price,
        compareAtPrice: undefined,
        netWeightGrams: 0,
        grossWeightGrams: 0,
        stock,
        images,
        enabled: true,
        dispatchTimeDays: 7,
      },
    ],
    lowStockThreshold: 1,
    readyToShip: false,
    dispatchDays: 7,
    returnEligible: true,
    returnPolicyDays: 7,
    codAvailable: true,
    badges: normalizeBadges(row.badges),
    rating: 0,
    reviewCount: 0,
    status: normalizeStatus(row.status),
    createdAt: now,
    updatedAt: now,
    ...seo,
  };
}

async function readWorkbookRows(filePath: string): Promise<WorkbookProductRow[]> {
  if (!existsSync(filePath)) {
    throw new Error(`Product workbook not found: ${filePath}`);
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.worksheets[0];
  if (!worksheet) throw new Error('Product workbook does not contain any worksheets.');

  const headers = EXPECTED_HEADERS.map((expected, index) => cellText(worksheet.getRow(1).getCell(index + 1).value));
  const missingHeaders = EXPECTED_HEADERS.filter((expected, index) => headers[index] !== expected);
  if (missingHeaders.length > 0) {
    throw new Error(`Workbook header mismatch. Missing/changed columns: ${missingHeaders.join(', ')}`);
  }

  const rows: WorkbookProductRow[] = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const values = EXPECTED_HEADERS.map((_, index) => cellText(row.getCell(index + 1).value));
    if (values.every((value) => !value)) return;
    rows.push({
      productName: values[0],
      slug: values[1],
      sku: values[2],
      shortDescription: values[3],
      fullDescription: values[4],
      category: values[5],
      subcategory: values[6],
      collection: values[7],
      tags: values[8],
      gender: values[9],
      occasion: values[10],
      images: values[11],
      metalType: values[12],
      metalPurity: values[13],
      metalColor: values[14],
      grossWeight: values[15],
      netWeight: values[16],
      gemstones: values[17],
      hallmarkDetails: values[18],
      certificationDetails: values[19],
      pricing: values[20],
      stock: values[21],
      variants: values[22],
      badges: values[23],
      seoDetails: values[24],
      status: values[25],
    });
  });

  return rows.filter((row) => row.productName && row.sku);
}

async function ensureCategoriesAndCollections(products: Product[], dryRun: boolean) {
  const categories = new Map<string, { name: string; subcategories: Set<string>; count: number }>();
  const collections = new Map<string, string>();

  for (const product of products) {
    const existingCategory = categories.get(product.category) || {
      name: product.category,
      subcategories: new Set<string>(),
      count: 0,
    };
    existingCategory.count += 1;
    if (product.subcategory) existingCategory.subcategories.add(product.subcategory);
    categories.set(product.category, existingCategory);
    if (product.collection) collections.set(product.collection, product.collection);
  }

  if (dryRun) {
    console.log(`Dry run: ${categories.size} categories and ${collections.size} collections would be ensured.`);
    return;
  }

  for (const category of categories.values()) {
    const slug = slugify(category.name);
    await prisma.category.upsert({
      where: { slug },
      create: {
        id: `cat-${slug}`,
        name: category.name,
        slug,
        description: `Explore ${category.name.toLowerCase()} from Guru Diamonds.`,
        image: CATEGORY_IMAGE,
        subcategories: [...category.subcategories],
        featured: category.name.toLowerCase().includes('gemstone'),
        itemCount: category.count,
      },
      update: {
        subcategories: [...category.subcategories],
        itemCount: category.count,
      },
    });
  }

  for (const collection of collections.keys()) {
    const slug = slugify(collection);
    await prisma.jewelleryCollection.upsert({
      where: { slug },
      create: {
        id: `col-${slug}`,
        name: collection,
        slug,
        description: `${collection} curated by Guru Diamonds.`,
        bannerImage: COLLECTION_IMAGE,
        featured: collection.toLowerCase().includes('navratna'),
      },
      update: {},
    });
  }
}

async function importProduct(product: Product, overwrite: boolean) {
  const existing = await prisma.product.findFirst({
    where: {
      OR: [{ sku: product.sku }, { slug: product.slug }, { id: product.id }],
    },
  });

  if (existing && !overwrite) {
    return { action: 'skipped' as const, product };
  }

  const productData = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    shortDescription: product.shortDescription,
    description: product.description,
    category: product.category,
    subcategory: product.subcategory,
    collection: product.collection,
    tags: product.tags,
    gender: product.gender,
    occasion: product.occasion,
    images: product.images,
    videoUrl: product.videoUrl,
    metalType: product.metalType,
    metalPurity: product.metalPurity,
    metalColor: product.metalColor,
    grossWeightGrams: product.grossWeightGrams,
    netWeightGrams: product.netWeightGrams,
    gemstones: product.gemstones,
    hallmarked: product.hallmarked,
    hallmarkCenter: product.hallmarkCenter,
    certified: product.certified,
    certificationAgency: product.certificationAgency,
    pricingMode: product.pricingMode,
    fixedPrice: product.fixedPrice,
    compareAtPrice: product.compareAtPrice,
    makingChargeType: product.makingChargeType,
    makingChargeValue: product.makingChargeValue,
    wastagePercentage: product.wastagePercentage,
    certificationCharge: product.certificationCharge,
    packagingCharge: product.packagingCharge,
    gstPercentage: product.gstPercentage,
    totalStock: product.totalStock,
    hasVariants: product.hasVariants,
    variantAttributes: product.variantAttributes,
    lowStockThreshold: product.lowStockThreshold,
    readyToShip: product.readyToShip,
    dispatchDays: product.dispatchDays,
    returnEligible: product.returnEligible,
    returnPolicyDays: product.returnPolicyDays,
    codAvailable: product.codAvailable,
    badges: product.badges,
    rating: product.rating,
    reviewCount: product.reviewCount,
    status: product.status,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    createdAt: new Date(product.createdAt),
    updatedAt: new Date(product.updatedAt),
  };

  await prisma.$transaction(async (tx) => {
    const productId = existing?.id || product.id;
    if (existing) {
      await tx.productVariant.deleteMany({ where: { productId } });
      await tx.productMedia.deleteMany({ where: { productId } });
      await tx.inventoryItem.deleteMany({ where: { productId } });
    }

    await tx.product.upsert({
      where: { id: productId },
      create: {
        ...productData,
        id: productId,
        variants: { create: product.variants },
        media: {
          create: product.images.map((url, position) => ({ url, position })),
        },
        inventoryItems: {
          create: [{ sku: product.sku, quantity: product.totalStock }],
        },
      },
      update: {
        ...productData,
        id: productId,
        variants: { create: product.variants.map((variant) => ({ ...variant, productId: undefined })) },
        media: {
          create: product.images.map((url, position) => ({ url, position })),
        },
        inventoryItems: {
          create: [{ sku: product.sku, quantity: product.totalStock }],
        },
      },
    });
  });

  return { action: existing ? ('updated' as const) : ('created' as const), product };
}

async function main() {
  const options = getOptions();
  const rows = await readWorkbookRows(options.filePath);
  const products = rows.map((row) => buildProduct(row, options));

  console.log(`Workbook: ${options.filePath}`);
  console.log(`Rows ready: ${products.length}`);
  console.log(`Mode: ${options.dryRun ? 'dry run' : options.overwrite ? 'overwrite import' : 'safe import'}`);
  console.log(`Default price: ${options.defaultPrice}`);
  console.log(`Default stock: ${options.defaultStock}`);
  console.log(`First product: ${products[0]?.name || 'none'} (${products[0]?.sku || 'no sku'})`);

  const duplicateSkus = products
    .map((product) => product.sku)
    .filter((sku, index, skus) => skus.indexOf(sku) !== index);
  if (duplicateSkus.length > 0) {
    throw new Error(`Duplicate SKU values in workbook: ${[...new Set(duplicateSkus)].join(', ')}`);
  }

  await ensureCategoriesAndCollections(products, options.dryRun);

  if (options.dryRun) {
    await prisma.$disconnect();
    return;
  }

  const summary = { created: 0, updated: 0, skipped: 0 };
  for (const product of products) {
    const result = await importProduct(product, options.overwrite);
    summary[result.action] += 1;
    console.log(`${result.action.toUpperCase()}: ${result.product.sku} - ${result.product.name}`);
  }

  console.log(`Import complete: ${summary.created} created, ${summary.updated} updated, ${summary.skipped} skipped.`);
  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
