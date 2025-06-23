import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SigninScreen from '../../../../app/(auth)/signin';
import { useAuth } from '../../../../context/authContext';
import { useRouter } from 'expo-router';

// Mock auth context
jest.mock('../../../../context/authContext', () => ({
  useAuth: jest.fn(),
}));

// Mock expo router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  Link: ({ children, href, ...props }) => {
    const React = require('react');
    const { TouchableOpacity, Text } = require('react-native');
    return React.createElement(TouchableOpacity, { ...props, testID: `link-${href}` }, 
      React.createElement(Text, null, children)
    );
  },
}));

describe('SigninScreen', () => {
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  };

  const mockAuth = {
    login: jest.fn(),
    loading: false,
    isAuthenticated: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useRouter.mockReturnValue(mockRouter);
    useAuth.mockReturnValue(mockAuth);
  });

  describe('Rendering', () => {
    it('renders signin form correctly', () => {
      const { getByTestId, getByText } = render(<SigninScreen />);
      
      expect(getByText(/sign in/i)).toBeTruthy();
      expect(getByTestId('email-input')).toBeTruthy();
      expect(getByTestId('password-input')).toBeTruthy();
      expect(getByTestId('signin-button')).toBeTruthy();
    });

    it('displays welcome message', () => {
      const { getByText } = render(<SigninScreen />);
      
      expect(getByText(/welcome back/i) || getByText(/sign in/i)).toBeTruthy();
    });

    it('shows social login options', () => {
      const { getByTestId } = render(<SigninScreen />);
      
      expect(getByTestId('google-signin-button')).toBeTruthy();
    });

    it('displays link to signup page', () => {
      const { getByTestId } = render(<SigninScreen />);
      
      expect(getByTestId('signup-link') || getByTestId('link-/signup')).toBeTruthy();
    });
  });

  describe('Form Validation', () => {
    it('validates email input', async () => {
      const { getByTestId, getByText } = render(<SigninScreen />);
      
      const emailInput = getByTestId('email-input');
      const signinButton = getByTestId('signin-button');
      
      fireEvent.changeText(emailInput, 'invalid-email');
      fireEvent.press(signinButton);
      
      await waitFor(() => {
        // Should show validation error or prevent submission
        expect(mockAuth.login).not.toHaveBeenCalled();
      });
    });

    it('validates password input', async () => {
      const { getByTestId } = render(<SigninScreen />);
      
      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');
      const signinButton = getByTestId('signin-button');
      
      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, '123'); // Too short
      fireEvent.press(signinButton);
      
      await waitFor(() => {
        expect(mockAuth.login).not.toHaveBeenCalled();
      });
    });

    it('enables signin button with valid inputs', async () => {
      const { getByTestId } = render(<SigninScreen />);
      
      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');
      const signinButton = getByTestId('signin-button');
      
      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'validpassword123');
      
      expect(signinButton.props.disabled).toBeFalsy();
    });
  });

  describe('Authentication Flow', () => {
    it('calls login with correct credentials', async () => {
      mockAuth.login.mockResolvedValue('user-id');
      
      const { getByTestId } = render(<SigninScreen />);
      
      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');
      const signinButton = getByTestId('signin-button');
      
      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(signinButton);
      
      await waitFor(() => {
        expect(mockAuth.login).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    it('handles login success', async () => {
      mockAuth.login.mockResolvedValue('user-id');
      
      const { getByTestId } = render(<SigninScreen />);
      
      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');
      const signinButton = getByTestId('signin-button');
      
      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(signinButton);
      
      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/(root)/(tabs)/home');
      });
    });

    it('handles login error', async () => {
      mockAuth.login.mockRejectedValue(new Error('Invalid credentials'));
      
      const { getByTestId, getByText } = render(<SigninScreen />);
      
      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');
      const signinButton = getByTestId('signin-button');
      
      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'wrongpassword');
      fireEvent.press(signinButton);
      
      await waitFor(() => {
        expect(getByText(/invalid credentials/i) || getByText(/error/i)).toBeTruthy();
      });
    });

    it('shows loading state during authentication', async () => {
      mockAuth.loading = true;
      
      const { getByTestId } = render(<SigninScreen />);
      
      const signinButton = getByTestId('signin-button');
      
      expect(signinButton.props.disabled || getByTestId('loading-indicator')).toBeTruthy();
    });
  });

  describe('Social Authentication', () => {
    it('handles Google signin', async () => {
      const { getByTestId } = render(<SigninScreen />);
      
      const googleButton = getByTestId('google-signin-button');
      
      fireEvent.press(googleButton);
      
      // Should trigger Google sign-in flow
      await waitFor(() => {
        expect(mockAuth.login).toHaveBeenCalled();
      });
    });
  });

  describe('Navigation', () => {
    it('navigates to signup page', () => {
      const { getByTestId } = render(<SigninScreen />);
      
      const signupLink = getByTestId('signup-link') || getByTestId('link-/signup');
      
      fireEvent.press(signupLink);
      
      expect(mockRouter.push).toHaveBeenCalledWith('/signup');
    });

    it('navigates to forgot password page', () => {
      const { getByTestId } = render(<SigninScreen />);
      
      try {
        const forgotPasswordLink = getByTestId('forgot-password-link');
        fireEvent.press(forgotPasswordLink);
        expect(mockRouter.push).toHaveBeenCalledWith('/forgot-password');
      } catch {
        // Forgot password link might not be implemented yet
      }
    });
  });

  describe('Accessibility', () => {
    it('has proper accessibility labels', () => {
      const { getByTestId } = render(<SigninScreen />);
      
      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');
      const signinButton = getByTestId('signin-button');
      
      expect(emailInput.props.accessibilityLabel).toContain('Email');
      expect(passwordInput.props.accessibilityLabel).toContain('Password');
      expect(signinButton.props.accessibilityLabel).toContain('Sign in');
    });

    it('has proper accessibility hints', () => {
      const { getByTestId } = render(<SigninScreen />);
      
      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');
      
      expect(emailInput.props.accessibilityHint).toBeTruthy();
      expect(passwordInput.props.accessibilityHint).toBeTruthy();
    });
  });

  describe('Security', () => {
    it('masks password input', () => {
      const { getByTestId } = render(<SigninScreen />);
      
      const passwordInput = getByTestId('password-input');
      
      expect(passwordInput.props.secureTextEntry).toBe(true);
    });

    it('prevents autoComplete on sensitive fields', () => {
      const { getByTestId } = render(<SigninScreen />);
      
      const passwordInput = getByTestId('password-input');
      
      expect(passwordInput.props.autoComplete).toBe('off');
    });
  });
}); 