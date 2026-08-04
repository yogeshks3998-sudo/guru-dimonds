import { isGemstoneProduct, productMatchesCategory } from '../../src/utils/productFilters';
import { productFactory } from '../helpers/factories';

describe('product filter helpers', () => {
  it('matches imported Natural Gemstones when the storefront Gemstones filter is selected', () => {
    const product = productFactory({
      category: 'Natural Gemstones',
      subcategory: 'Precious Gemstones',
      tags: ['Ruby', 'Certified natural stone'],
      gemstones: [{ type: 'Ruby', weightCaratOrGrams: 0, color: '', count: 1, totalPrice: 0, certified: true }],
    });

    expect(isGemstoneProduct(product)).toBe(true);
    expect(productMatchesCategory(product, 'Gemstones')).toBe(true);
  });

  it('keeps non-gemstone categories out of the Gemstones filter', () => {
    const product = productFactory({
      name: 'Classic Gold Chain',
      category: 'Chains',
      subcategory: 'Gold Chains',
      tags: ['Gold', 'Chain'],
      gemstones: [],
    });

    expect(productMatchesCategory(product, 'Gemstones')).toBe(false);
  });
});
