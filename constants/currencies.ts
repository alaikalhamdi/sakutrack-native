import { CurrencyCode, CurrencyConfig } from '../types/expense';

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  IDR: {
    code: 'IDR',
    symbol: 'Rp',
    decimals: 0,
    format: (amount: number) => {
      const rounded = Math.round(amount);
      const parts = Math.abs(rounded).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      return `${rounded < 0 ? '-' : ''}Rp ${parts}`;
    },
  },
  USD: {
    code: 'USD',
    symbol: '$',
    decimals: 2,
    format: (amount: number) => {
      const parts = Math.abs(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return `${amount < 0 ? '-' : ''}$${parts}`;
    },
  },
};
