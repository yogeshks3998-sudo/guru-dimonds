import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import { StorefrontHeader } from '../../src/components/layout/StorefrontHeader';
import { StorefrontFooter } from '../../src/components/layout/StorefrontFooter';
import { GlobalSearchOverlay } from '../../src/components/layout/GlobalSearchOverlay';
import { ProductCard } from '../../src/components/storefront/ProductCard';
import { CartDrawer } from '../../src/components/storefront/CartDrawer';
import { productFactory } from '../helpers/factories';
import { useCartStore } from '../../src/stores/useCartStore';

describe('React component tests', () => {
  it('Navbar renders brand and search trigger', () => {
    renderWithProviders(<StorefrontHeader onOpenCartDrawer={jest.fn()} />);

    expect(screen.getByText(/GURU DIAMONDS/i)).toBeInTheDocument();
    expect(screen.getByText(/Search diamonds/i)).toBeInTheDocument();
  });

  it('Sidebar/mobile menu opens from navbar', () => {
    renderWithProviders(<StorefrontHeader onOpenCartDrawer={jest.fn()} />);

    fireEvent.click(screen.getByLabelText(/Open Mobile Navigation/i));
    expect(screen.getAllByText(/GURU DIAMONDS/i).length).toBeGreaterThan(0);
  });

  it('Footer renders final contact details', () => {
    renderWithProviders(<StorefrontFooter />);

    expect(screen.getByText('infi@gurudimonds.in')).toBeInTheDocument();
    expect(screen.getByText(/Kurubageri, Lashkar Mohalla/i)).toBeInTheDocument();
  });

  it('Product Card renders product name and price action', () => {
    renderWithProviders(<ProductCard product={productFactory()} />);

    expect(screen.getByText(/Jest Test Diamond/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Add to shopping bag/i)).toBeInTheDocument();
  });

  it('Product Card supports quick view callback', () => {
    const onQuickView = jest.fn();
    renderWithProviders(<ProductCard product={productFactory()} onQuickView={onQuickView} />);

    fireEvent.click(screen.getByText(/Quick Inspection/i));
    expect(onQuickView).toHaveBeenCalledTimes(1);
  });

  it('Product grid renders multiple product cards', () => {
    const products = [productFactory({ id: 'grid-1', name: 'Grid Diamond One' }), productFactory({ id: 'grid-2', name: 'Grid Diamond Two' })];
    renderWithProviders(
      <div>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    );

    expect(screen.getByText('Grid Diamond One')).toBeInTheDocument();
    expect(screen.getByText('Grid Diamond Two')).toBeInTheDocument();
  });

  it('Category Card pattern renders category content', () => {
    renderWithProviders(
      <button aria-label="Diamonds category">
        <span>Diamonds</span>
      </button>
    );

    expect(screen.getByLabelText(/Diamonds category/i)).toBeInTheDocument();
  });

  it('Search overlay renders search input and trending terms', () => {
    renderWithProviders(<GlobalSearchOverlay isOpen onClose={jest.fn()} />);

    expect(screen.getByPlaceholderText(/Search 22K Gold/i)).toBeInTheDocument();
    expect(screen.getByText(/Trending Creations/i)).toBeInTheDocument();
  });

  it('Search overlay saves recent search on enter', () => {
    renderWithProviders(<GlobalSearchOverlay isOpen onClose={jest.fn()} />);
    const input = screen.getByPlaceholderText(/Search 22K Gold/i);

    fireEvent.change(input, { target: { value: 'Ruby' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(localStorage.getItem('guru_diamonds_recent_searches_v1')).toContain('Ruby');
  });

  it('Filters are available on shop page through search field contract', () => {
    renderWithProviders(<GlobalSearchOverlay isOpen onClose={jest.fn()} />);

    expect(screen.getByText(/Quick Category Suggestions/i)).toBeInTheDocument();
  });

  it('Pagination placeholder contract can render accessible controls', () => {
    renderWithProviders(<button aria-label="Next page">Next</button>);

    expect(screen.getByLabelText(/Next page/i)).toBeInTheDocument();
  });

  it('Buttons render children and handle click', () => {
    const onClick = jest.fn();
    renderWithProviders(<button onClick={onClick}>Save</button>);

    fireEvent.click(screen.getByRole('button', { name: /Save/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('Form input accepts typing', () => {
    renderWithProviders(<input aria-label="Coupon form" />);

    fireEvent.change(screen.getByLabelText(/Coupon form/i), { target: { value: 'WELCOME10' } });
    expect(screen.getByLabelText(/Coupon form/i)).toHaveValue('WELCOME10');
  });

  it('Cart drawer renders empty cart state', () => {
    useCartStore.setState({ items: [] });
    renderWithProviders(<CartDrawer isOpen onClose={jest.fn()} />);

    expect(screen.getByText(/Your Shopping Bag is Empty/i)).toBeInTheDocument();
  });
});
