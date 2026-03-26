import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginScreen from '../screens/LoginScreen';

// Mock dependencies
const mockSignIn = vi.fn();
const mockSignUp = vi.fn();

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ signIn: mockSignIn, signUp: mockSignUp }),
}));

vi.mock('../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: {
      login: {
        title: 'Welcome back',
        titleRegister: 'Create account',
        subtitle: 'Sign in to continue',
        subtitleRegister: 'Create an account to get started',
        username: 'Username',
        usernamePlaceholder: 'e.g. thomas',
        usernameHint: 'Letters, numbers and _ only',
        password: 'Password',
        passwordPlaceholder: 'Enter password',
        confirmPassword: 'Confirm password',
        confirmPasswordPlaceholder: 'Repeat password',
        showPassword: 'Show password',
        hidePassword: 'Hide password',
        submit: 'Sign in',
        submitRegister: 'Create account',
        switchToRegister: 'No account? Register',
        switchToLogin: 'Already have an account? Sign in',
        errorUnknownUser: 'Unknown username.',
        errorWrongPassword: 'Wrong password.',
        errorRequired: 'Please fill in all fields.',
        errorPasswordMismatch: 'Passwords do not match.',
        errorUsernameTaken: 'Username already taken.',
        errorUsernameTooShort: 'Username too short.',
        errorUsernameInvalid: 'Invalid username.',
        errorPasswordTooShort: 'Password too short.',
      },
    },
  }),
}));

describe('LoginScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear sessionStorage to avoid pending join code banner
    sessionStorage.clear();
  });

  it('renders the login form', () => {
    render(<LoginScreen />);
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('shows error when submitting empty form', async () => {
    render(<LoginScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByText('Please fill in all fields.')).toBeInTheDocument();
  });

  it('calls signIn with correct args on submit', async () => {
    mockSignIn.mockResolvedValue({ error: null });
    render(<LoginScreen />);

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'sara' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('sara', 'password123');
    });
  });

  it('shows unknown user error from signIn', async () => {
    mockSignIn.mockResolvedValue({ error: 'UNKNOWN_USER' });
    render(<LoginScreen />);

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'nobody' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Unknown username.')).toBeInTheDocument();
  });

  it('shows wrong password error from signIn', async () => {
    mockSignIn.mockResolvedValue({ error: 'WRONG_PASSWORD' });
    render(<LoginScreen />);

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'sara' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Wrong password.')).toBeInTheDocument();
  });

  it('switches to register mode', () => {
    render(<LoginScreen />);
    fireEvent.click(screen.getByText('No account? Register'));
    expect(screen.getByRole('button', { name: 'Create account' })).toBeInTheDocument();
  });

  it('shows password mismatch error in register mode', async () => {
    render(<LoginScreen />);
    fireEvent.click(screen.getByText('No account? Register'));

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'newuser' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Confirm password'), { target: { value: 'different' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument();
  });
});
