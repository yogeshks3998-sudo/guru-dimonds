import type { Product } from '../types';

export interface StoneDetails {
  name: string;
  weight?: string;
  shape?: string;
}

export function getStoneDetails(product: Product): StoneDetails {
  const raw = product.supplierReview?.raw;
  const nameLower = (product.name || '').toLowerCase();

  let name = 'Fine Natural Gemstone';
  if (product.gemstones && product.gemstones.length > 0 && product.gemstones[0].type) {
    name = product.gemstones[0].type;
  } else if (typeof raw?.stone === 'string') {
    name = raw.stone.replace(/\(supplier description\)/gi, '').trim();
  } else if (nameLower.includes('gomed')) {
    name = 'Natural Gomedhika (Hessonite)';
  } else if (nameLower.includes('sapphire') && nameLower.includes('ruby')) {
    name = 'Natural Yellow Sapphire & Ruby';
  } else if (nameLower.includes('yellow sapphire')) {
    name = 'Natural Yellow Sapphire';
  } else if (nameLower.includes('synthetic ruby') || nameLower.includes('synth ruby')) {
    name = 'Uncut Synthetic Ruby';
  } else if (nameLower.includes('ruby')) {
    name = 'Natural Ruby';
  } else if (nameLower.includes('synthetic emerald') || nameLower.includes('synth emerald')) {
    name = 'Oval Synthetic Emerald';
  } else if (nameLower.includes('pearl')) {
    name = 'Natural Freshwater Pearl';
  } else if (nameLower.includes('navaratna')) {
    name = 'Natural 9 Sacred Navaratna Gems';
  } else if (nameLower.includes('tulasi') || nameLower.includes('rudraksha')) {
    name = 'Tulasi & Rudraksha Sacred Beads';
  } else if (nameLower.includes('turtle')) {
    name = 'Brilliant White AD / Cubic Zirconia';
  } else if (nameLower.includes('green') && nameLower.includes('red')) {
    name = 'Emerald, Ruby & White AD Stones';
  } else if (nameLower.includes('white & red') || nameLower.includes('white, red')) {
    name = 'Ruby & White AD Stones';
  }

  let weight: string | undefined;
  if (product.gemstones?.[0]?.weightCaratOrGrams) {
    weight = `${product.gemstones[0].weightCaratOrGrams} ct`;
  } else if (raw?.stoneWeightCarat) {
    weight = `${raw.stoneWeightCarat} ct`;
  } else if (product.supplierReview?.specifications?.['Stone weight']) {
    weight = product.supplierReview.specifications['Stone weight'];
  }

  let shape: string | undefined;
  if (typeof raw?.shape === 'string') {
    shape = raw.shape;
  } else if (typeof product.supplierReview?.specifications?.['Stone shape'] === 'string') {
    shape = product.supplierReview.specifications['Stone shape'];
  } else if (nameLower.includes('oval')) {
    shape = 'Oval Cut';
  } else if (nameLower.includes('round')) {
    shape = 'Round Brilliant Cut';
  }

  return { name, weight, shape };
}

export function getWarrantyText(product: Product): string {
  const raw = product.supplierReview?.raw;
  if (typeof raw?.warrantySupplied === 'string') {
    const w = raw.warrantySupplied.trim();
    return w.toLowerCase().includes('month') || w.toLowerCase().includes('year')
      ? `${w} Warranty`
      : w;
  }
  if (typeof product.supplierReview?.specifications?.Warranty === 'string') {
    return product.supplierReview.specifications.Warranty;
  }
  return '1 Year Craftsmanship Guarantee';
}

export interface JewelleryOptionGroup {
  name: string;
  options: string[];
  defaultOption: string;
  helperText?: string;
  guideType?: 'RING' | 'CHAIN';
}

export function getJewellerySizeOptions(product: Product): JewelleryOptionGroup | null {
  // If product already has explicit variantAttributes with options, preserve them
  if (product.variantAttributes && product.variantAttributes.length > 0) {
    const primary = product.variantAttributes[0];
    if (primary.options && primary.options.length > 0) {
      return {
        name: primary.name,
        options: primary.options,
        defaultOption: primary.options[0],
      };
    }
  }

  const category = (product.category || '').toLowerCase();
  const nameLower = (product.name || '').toLowerCase();

  if (category === 'rings' || nameLower.includes('ring')) {
    return {
      name: 'Ring Size (Indian Standard)',
      options: ['12', '14', '16', '18', '20', '22', '24', 'Custom Size'],
      defaultOption: '16',
      helperText: 'Standard Indian jeweller sizing. Free custom resizing available on request.',
      guideType: 'RING',
    };
  }

  if (
    category.includes('mala') ||
    category.includes('neck') ||
    category.includes('chain') ||
    nameLower.includes('mala') ||
    nameLower.includes('necklace')
  ) {
    const isAyyappa = nameLower.includes('ayyappa');
    return {
      name: 'Mala / Chain Length',
      options: isAyyappa
        ? ['28 Inches (Traditional Standard)', '24 Inches', '30 Inches', 'Custom Length']
        : ['18 Inches', '20 Inches', '22 Inches', '24 Inches', 'Custom Length'],
      defaultOption: isAyyappa ? '28 Inches (Traditional Standard)' : '20 Inches',
      helperText: 'Measured end-to-end including solid silver fastening.',
      guideType: 'CHAIN',
    };
  }

  if (
    category.includes('pendant') ||
    nameLower.includes('pendant') ||
    category.includes('doler') ||
    nameLower.includes('doler')
  ) {
    return {
      name: 'Bail & Chain Selection',
      options: [
        'Pendant Only (Standard 4mm Bail)',
        'With 925 Silver Chain (18 Inch)',
        'With 925 Silver Chain (22 Inch)',
      ],
      defaultOption: 'Pendant Only (Standard 4mm Bail)',
      helperText: 'Bail comfortably accommodates standard gold and silver chains up to 4mm.',
      guideType: 'CHAIN',
    };
  }

  if (category.includes('earring') || nameLower.includes('earring') || nameLower.includes('stud')) {
    return {
      name: 'Fastening Style',
      options: ['Push Back (Bombay Screw)', 'South Indian Screw Back', 'Standard Stud Fit'],
      defaultOption: 'Push Back (Bombay Screw)',
      helperText: 'Secure hypoallergenic 925 silver backing mechanism.',
    };
  }

  if (
    category.includes('statue') ||
    category.includes('idol') ||
    nameLower.includes('shankha') ||
    nameLower.includes('lingam')
  ) {
    return {
      name: 'Consecrated Dimension',
      options: ['Standard Pooja Idol', 'Bespoke Consecration'],
      defaultOption: 'Standard Pooja Idol',
      helperText: 'Handcrafted according to sacred Shilpa Shastra proportions.',
    };
  }

  return null;
}
