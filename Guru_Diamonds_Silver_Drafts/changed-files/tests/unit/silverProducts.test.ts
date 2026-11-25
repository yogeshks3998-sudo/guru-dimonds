import { SILVER_COLLECTION_PRODUCTS as batch } from '../../src/data/silverCollectionProducts';
import { INITIAL_PRODUCTS } from '../../src/data/mockProducts';
import { canPurchaseProduct, mergeMissingSupplierProducts, supplierPublicationError } from '../../src/utils/supplierProducts';
import { isProductActive, productMatchesCategory } from '../../src/utils/productFilters';
import { applySilverImport, planSilverImport } from '../../scripts/lib/import-silver-products';
import { toProductCreateData, toProductResponse } from '../../backend/src/utils/serializers';
import { useCartStore } from '../../src/stores/useCartStore';
import { useProductStore } from '../../src/stores/useProductStore';

const source = [
  [55,75,195,200,1200,5500,8500,6900], [12.4,13.4,200,2680,1750,800,5230,5230],
  [10.6,12,200,2280,4210,800,7290,7290], [9.73,10.33,200,2066,2400,800,5266,5266],
  [7.64,8.64,200,1528,4000,800,null,6328], [4.76,5.26,200,1052,3125,1500,5677,5677],
  [3.61,4.41,200,722,4000,1500,6382,6222], [8.26,9.26,200,1852,3500,1500,6852,6852],
  [6.2,6.6,200,1320,1200,800,3320,3320], [2.2,2.32,2.22,444,800,800,2064,2044],
];

describe('Supplier silver batch', () => {
  test('contains ten unique records and one Ayyappa entry', () => {
    expect(batch).toHaveLength(10);
    for (const key of ['id','sku','slug'] as const) expect(new Set(INITIAL_PRODUCTS.map(p => p[key])).size).toBe(INITIAL_PRODUCTS.length);
    expect(batch.filter(p => p.category === 'Spiritual Maalas')).toHaveLength(1);
    expect(batch[0].supplierReview.raw.duplicateSubmissions).toBe(2);
    expect(planSilverImport(INITIAL_PRODUCTS.filter(p => !p.supplierReview)).create).toHaveLength(10);
  });
  test.each(batch.map((p, i) => [p.sku, p, source[i]] as const))('%s preserves original values and blocks all purchase/publication paths', (_sku, p, raw) => {
    const r = p.supplierReview!;
    expect([p.netWeightGrams,p.grossWeightGrams,r.pricing.suppliedMetalRate,r.pricing.suppliedMetalValue,r.pricing.stoneOrBeadValue,r.pricing.makingCharges,r.pricing.suppliedSellingPrice,r.pricing.suppliedComponentSubtotal]).toEqual(raw);
    expect(p.images).toEqual([]);
    expect(p.variants).toEqual([]);
    expect(p.variantAttributes).toEqual([]);
    expect(p.fixedPrice).toBeUndefined();
    expect(p.status).toBe('DRAFT'); expect(p.enabled).toBe(false); expect(p.totalStock).toBe(0);
    expect(p.rating).toBe(0); expect(p.reviewCount).toBe(0); expect(p.certified).toBe(false); expect(p.hallmarked).toBe(false);
    expect(p.metalPurity).toBe('UNVERIFIED'); expect(p.metalColor).toBe('UNVERIFIED');
    expect(r.raw.puritySupplied).toBe('92'); expect(r.pricing.gstBasis).toBe('UNKNOWN');
    expect(supplierPublicationError(p)).toBeTruthy();
    expect(isProductActive({...p,status:'ACTIVE',enabled:true})).toBe(false);
    expect(canPurchaseProduct({...p,status:'ACTIVE',enabled:true})).toBe(false);
    expect(productMatchesCategory(p, p.category)).toBe(true);
    expect(p.shortDescription.split(/\s+/).length).toBeGreaterThanOrEqual(20);
    expect(p.shortDescription.split(/\s+/).length).toBeLessThanOrEqual(35);
    expect(p.description.split(/\s+/).length).toBeGreaterThanOrEqual(90);
    expect(p.description.split(/\s+/).length).toBeLessThanOrEqual(150);
    expect(toProductResponse({...p,...toProductCreateData(p)} as any).supplierReview).toEqual(r);
    useCartStore.setState({items:[]});
    useCartStore.getState().addItem({product:p});
    expect(useCartStore.getState().items).toHaveLength(0);
  });
  test('does not invent ruby weight, approve ambiguous prices or infer pearl rate', () => {
    expect(batch[2].supplierReview.raw.rubyWeightCarat).toBeNull();
    expect(batch[4].supplierReview.pricing.possibleSourceIntendedPrice).toBe(6528);
    expect(batch[4].supplierReview.pricing.suppliedSellingPrice).toBeNull();
    expect(batch[9].supplierReview.pricing.calculatedMetalValue).toBeNull();
    expect(batch[0].supplierReview.raw.beadWeightGrams).toBe(80);
  });
  test('local merge preserves edited records and does not create identical specifications', () => {
    const edited = {...batch[0],name:'Admin edited title',description:'Admin edited copy',images:['/real-photo.jpg']};
    const merged = mergeMissingSupplierProducts([edited],batch);
    expect(merged).toHaveLength(10); expect(merged[0]).toBe(edited);
    expect(mergeMissingSupplierProducts(merged,batch)).toEqual(merged);
    const collision = {...batch[1],id:'existing',sku:'OLD-SKU',slug:'existing',name:'Existing ring'};
    expect(planSilverImport([collision]).skip).toEqual(expect.arrayContaining([expect.objectContaining({sku:batch[1].sku,existingId:'existing'})]));
  });
  test('admin toggle cannot activate unverified drafts, including local-only operation', async () => {
    useProductStore.setState({products:[batch[0]]});
    await expect(useProductStore.getState().updateProduct(batch[0].id,{status:'ACTIVE',enabled:true})).rejects.toThrow('Supplier review incomplete');
    expect(useProductStore.getState().products[0].status).toBe('DRAFT');
  });
  test('transaction importer is create-only and skips edited records on repeats', async () => {
    const records: any[] = [];
    const categories: any[] = [];
    const tx = {
      product: {findMany:async()=>records,create:async({data}:any)=>{records.push({...data,variants:[]});return data;}},
      category: {
        findFirst:async({where}:any)=>categories.find(c=>c.name.toLowerCase()===where.name.equals.toLowerCase()),
        create:async({data}:any)=>{categories.push(data);return data;},
        update:async({where,data}:any)=>{Object.assign(categories.find(c=>c.id===where.id),data);},
      },
    };
    expect((await applySilverImport(tx)).created).toHaveLength(10);
    records[0].name='Do not overwrite'; records[0].images=['/actual.jpg'];records[0].inventoryItems={existing:42};
    const before=JSON.stringify(records);
    const repeat=await applySilverImport(tx);
    expect(repeat.created).toHaveLength(0);expect(repeat.skipped).toHaveLength(10);
    expect(JSON.stringify(records)).toBe(before);
    expect(categories.find(c=>c.name==='Spiritual Maalas').subcategories).toContain('Ayyappa Mala');
  });
});
