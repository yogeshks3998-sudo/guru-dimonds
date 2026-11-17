import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import { SILVER_TURTLE_AND_STUD_PRODUCTS as batch } from '../../src/data/silverTurtleAndStudProducts';
import { ProductDetailPage } from '../../src/pages/ProductDetailPage';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { useProductStore } from '../../src/stores/useProductStore';

describe('Turtle ring and stud draft previews',()=>{
 beforeEach(()=>{
  useProductStore.setState({products:batch});
  useAuthStore.setState({isAdminLoggedIn:true});
 });
 test.each(batch)('$sku displays correct specifications with no invented certificate, warranty, images or sizes',(p)=>{
  renderWithProviders(<ProductDetailPage slug={p.slug}/>);
  expect(screen.getByRole('heading',{name:p.name})).toBeInTheDocument();
  expect(screen.getByAltText(p.name)).toHaveAttribute('src','/images/product-placeholder.svg');
  expect(screen.getByRole('button',{name:'Add to Shopping Bag'})).toBeDisabled();
  expect(screen.getByRole('button',{name:/Buy Now/})).toBeDisabled();
  if(p.category==='Earrings'){
   expect(screen.queryByText(/28 inches/)).not.toBeInTheDocument();
   expect(screen.queryByText(/Select Ring Size/)).not.toBeInTheDocument();
   expect(screen.getByText('Earring dimensions, fastening and package quantity require confirmation.')).toBeInTheDocument();
  }
  fireEvent.click(screen.getByRole('button',{name:'Technical Specifications'}));
  expect(screen.getByText('Not supplied; availability and terms unknown')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'Hallmark & Certification'}));
  expect(screen.getByText(/Certification information was not supplied/)).toBeInTheDocument();
  expect(screen.queryByText(/seller claims certification availability/)).not.toBeInTheDocument();
 });
});
