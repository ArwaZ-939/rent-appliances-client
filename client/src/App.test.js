import { render, screen } from '@testing-library/react';
// Mock axios to avoid ESM parsing issues in Jest
jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    create: () => ({ get: jest.fn(), post: jest.fn() })
  }
}));
import App from './App';

test('renders sign in form', () => {
  render(<App />);
  expect(screen.getByText(/Sign in to your account/i)).toBeInTheDocument();
});
