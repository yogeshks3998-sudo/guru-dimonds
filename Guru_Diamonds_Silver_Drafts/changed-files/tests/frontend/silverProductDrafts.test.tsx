import React from 'react';
import { fireEvent, screen, waitFor, cleanup, act } from '@testing-library/react';
import { jest } from '@jest/globals';
import { renderWithProviders } from '../helpers/render';
import { SILVER_COLLECTION_PRODUCTS as batch } from '../../src/data/silverCollectionProducts';
import { ProductDetailPage } from '../../src/pages/ProductDetailPage';
import { AdminProductFormPage } from '../../src/pages/admin/AdminProductFormPage';
import { ProductCard } from '../../src/components/storefront/ProductCard';
import { useProductStore } from '../../src/stores/useProductStore';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { useCompareStore } from '../../src/stores/useCompareStore';
import { useWishlistStore } from '../../src/stores/useWishlistStore';
import { CompareDrawer } from '../../src/components/storefront/CompareDrawer';
import { WishlistPage } from '../../src/pages/WishlistPage';
import { ImageWithFallback } from '../../src/components/ui/ImageWithFallback';

describe('Supplier draft editing and PDP', () => {
  beforeEach(()=>{
    useProductStore.setState({products:batch});
    useAuthStore.setState({isAdminLoggedIn:true,adminUser:{id:'owner',name:'Owner',email:'owner@test.invalid',role:'OWNER',active:true,lastLogin:new Date().toISOString()}});
  });
  test.each(batch)('$sku renders a safe admin preview with technical details and no false reviews', (p)=>{
    renderWithProviders(<ProductDetailPage slug={p.slug}/>);
    expect(screen.getByRole('heading',{name:p.name})).toBeInTheDocument();
    expect(screen.getByAltText(p.name)).toHaveAttribute('src','/images/product-placeholder.svg');
    for(const button of screen.getAllByRole('button',{name:/Add to Shopping Bag|Buy Now|^Add$|^Buy$/i})) expect(button).toBeDisabled();
    fireEvent.click(screen.getByRole('button',{name:'Technical Specifications'}));
    expect(screen.getByText(p.supplierReview.specifications.Warranty)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'Hallmark & Certification'}));
    expect(screen.getByText(/No product-specific certificate has been verified/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'Patron Reviews (0)'}));
    expect(screen.getByText('No reviews yet.')).toBeInTheDocument();
    expect(screen.queryByText('Verified Patron')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'Review supplier price breakdown'}));
    expect(screen.getByText('Supplier price review')).toBeInTheDocument();
    expect(screen.getByText('Supplier selling price (unapproved)')).toBeInTheDocument();
  });
  test('draft cannot be accessed by a shopper; hydration does not change hook order', ()=>{
    useAuthStore.setState({isAdminLoggedIn:false});
    renderWithProviders(<ProductDetailPage slug={batch[0].slug}/>);
    expect(screen.getByText('Product Currently Unavailable')).toBeInTheDocument();
    act(() => useAuthStore.setState({isAdminLoggedIn:true}));
    expect(screen.getByRole('heading',{name:batch[0].name})).toBeInTheDocument();
  });
  test('missing and failed images use neutral placeholder', ()=>{
    const {rerender}=renderWithProviders(<ImageWithFallback alt="Missing"/>);
    expect(screen.getByAltText('Missing')).toHaveAttribute('src','/images/product-placeholder.svg');
    rerender(<ImageWithFallback alt="Missing" src="/bad-photo.jpg"/>);
    fireEvent.error(screen.getByAltText('Missing'));
    expect(screen.getByAltText('Missing')).toHaveAttribute('src','/images/product-placeholder.svg');
  });
  test('product card never substitutes a stock photograph for an empty image array', ()=>{
    renderWithProviders(<ProductCard product={batch[0]}/>);
    expect(screen.getByAltText(batch[0].name)).toHaveAttribute('src','/images/product-placeholder.svg');
    expect(screen.getByText('Price on enquiry')).toBeInTheDocument();
  });
  test('draft can be saved without media; source values and review notes survive', async ()=>{
    const save=jest.spyOn(useProductStore.getState(),'updateProduct').mockResolvedValue(batch[0]);
    renderWithProviders(<AdminProductFormPage productId={batch[0].id}/>);
    fireEvent.change(screen.getByLabelText('Resolution notes'),{target:{value:'Awaiting supplier certificate'}});
    fireEvent.click(screen.getByRole('button',{name:'Save Changes'}));
    await waitFor(()=>expect(save).toHaveBeenCalled());
    const payload=save.mock.calls[0][1];
    expect(payload.images).toEqual([]);expect(payload.status).toBe('DRAFT');
    expect(payload.supplierReview.raw).toEqual(batch[0].supplierReview.raw);
    expect(payload.supplierReview.resolutionNotes).toBe('Awaiting supplier certificate');
    cleanup();
  });
  test('image upload attaches actual local media while preserving draft status', async ()=>{
    const NativeImage=globalThis.Image;
    const getContext=jest.spyOn(HTMLCanvasElement.prototype,'getContext').mockReturnValue({drawImage:jest.fn()} as any);
    const toData=jest.spyOn(HTMLCanvasElement.prototype,'toDataURL').mockReturnValue('data:image/jpeg;base64,actual-upload');
    class LoadedImage {
      width=10; height=10; onload:()=>void; onerror:()=>void;
      set src(_value:string) { queueMicrotask(()=>this.onload?.()); }
    }
    globalThis.Image=LoadedImage as any;
    const save=jest.spyOn(useProductStore.getState(),'updateProduct').mockResolvedValue(batch[1]);
    try {
      const {container}=renderWithProviders(<AdminProductFormPage productId={batch[1].id}/>);
      const file=new File(['actual local file'],'ring.png',{type:'image/png'});
      fireEvent.change(container.querySelector('input[type=file]')!,{target:{files:[file]}});
      await waitFor(()=>expect(screen.getByText('1 Photo(s) Attached')).toBeInTheDocument());
      fireEvent.click(screen.getByRole('button',{name:'Save Changes'}));
      await waitFor(()=>expect(save).toHaveBeenCalled());
      expect(save.mock.calls[0][1].images).toEqual(['data:image/jpeg;base64,actual-upload']);
      expect(save.mock.calls[0][1].status).toBe('DRAFT');
      expect(save.mock.calls[0][1].supplierReview.raw).toEqual(batch[1].supplierReview.raw);
    } finally { globalThis.Image=NativeImage;getContext.mockRestore();toData.mockRestore(); }
  });

  test('comparison uses supplier specifications and blocks purchase', ()=>{
    useCompareStore.setState({compareIds:[batch[0].id],drawerOpen:true});
    renderWithProviders(<CompareDrawer/>);
    expect(screen.getByText('Price on enquiry')).toBeInTheDocument();
    expect(screen.getByText('Tulasi and Rudraksha')).toBeInTheDocument();
    expect(screen.getByRole('button',{name:'Add to Bag'})).toBeDisabled();
    expect(screen.queryByText(/inclusive of 3% GST/)).not.toBeInTheDocument();
    useCompareStore.setState({compareIds:[],drawerOpen:false});
  });
  test('shopper wishlist does not expose admin-saved drafts', ()=>{
    useAuthStore.setState({isAdminLoggedIn:false});
    useWishlistStore.setState({wishlistIds:[batch[0].id]});
    renderWithProviders(<WishlistPage/>);
    expect(screen.getByText('Your Wishlist is Empty')).toBeInTheDocument();
    expect(screen.queryByText(batch[0].name)).not.toBeInTheDocument();
    useWishlistStore.setState({wishlistIds:[]});
  });

});
