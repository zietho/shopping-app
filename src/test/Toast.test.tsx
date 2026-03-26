import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ToastContainer from '../components/common/Toast';

const mockRemoveToast = vi.fn();
let mockToasts: { id: string; message: string; undoFn?: () => void }[] = [];

vi.mock('../contexts/AppContext', () => ({
  useApp: () => ({ toasts: mockToasts, removeToast: mockRemoveToast }),
}));

vi.mock('../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: {
      itemActions: { undo: 'Undo', dismiss: 'Dismiss' },
    },
  }),
}));

beforeEach(() => {
  mockToasts = [];
  mockRemoveToast.mockClear();
});

describe('ToastContainer', () => {
  it('renders nothing when there are no toasts', () => {
    const { container } = render(<ToastContainer />);
    expect(container.firstChild).toBeNull();
  });

  it('renders a toast message', () => {
    mockToasts = [{ id: '1', message: 'Item removed' }];
    render(<ToastContainer />);
    expect(screen.getByText('Item removed')).toBeInTheDocument();
  });

  it('shows undo button when undoFn is provided', () => {
    mockToasts = [{ id: '1', message: 'Item removed', undoFn: vi.fn() }];
    render(<ToastContainer />);
    expect(screen.getByText('Undo')).toBeInTheDocument();
  });

  it('does not show undo button without undoFn', () => {
    mockToasts = [{ id: '1', message: 'Done' }];
    render(<ToastContainer />);
    expect(screen.queryByText('Undo')).not.toBeInTheDocument();
  });

  it('calls removeToast and undoFn when undo is clicked', () => {
    const undoFn = vi.fn();
    mockToasts = [{ id: '1', message: 'Item removed', undoFn }];
    render(<ToastContainer />);
    fireEvent.click(screen.getByText('Undo'));
    expect(undoFn).toHaveBeenCalled();
    expect(mockRemoveToast).toHaveBeenCalledWith('1');
  });

  it('calls removeToast when dismiss is clicked', () => {
    mockToasts = [{ id: '1', message: 'Done' }];
    render(<ToastContainer />);
    fireEvent.click(screen.getByLabelText('Dismiss'));
    expect(mockRemoveToast).toHaveBeenCalledWith('1');
  });
});
