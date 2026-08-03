import React from 'react';
import { render } from '@testing-library/react';
import { ToastProvider } from '../../src/components/ui/Toast';

export const renderWithProviders = (ui: React.ReactElement) => render(<ToastProvider>{ui}</ToastProvider>);
