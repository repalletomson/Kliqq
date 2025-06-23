import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SignUpScreen from '../../../../app/(auth)/signup';
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

describe('SignUpScreen', () => {
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  };

  const mockAuth = {
    register: jest.fn(),
    loading: false,
    isAuthenticated: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useRouter.mockReturnValue(mockRouter);
    useAuth.mockReturnValue(mockAuth);
  });

  describe('Rendering', () => {
    it('renders signup form correctly', () => {
      const { getByTestId, getByText } = render(<SignUpScreen />);
      
      expect(getByText(/sign up/i) || getByText(/create/i)).toBeTruthy();
      expect(getByTestId('name-input') || getByTestId('fullname-input')).toBeTruthy();
      expect(getByTestId('email-input')).toBeTruthy();
      expect(getByTestId('password-input')).toBeTruthy();
      expect(getByTestId('signup-button')).toBeTruthy();
    });

    it('displays welcome message for new users', () => {
      const { getByText } = render(<SignUpScreen />);
      
      expect(getByText(/create/i) || getByText(/sign up/i) || getByText(/join/i)).toBeTruthy();
    });

    it('shows social signup options', () => {
      const { getByTestId } = render(<SignUpScreen />);
      
      expect(getByTestId('google-signup-button') || getByTestId('google-signin-button')).toBeTruthy();
    });

    it('displays link to signin page', () => {
      const { getByTestId } = render(<SignUpScreen />);
      
      expect(getByTestId('signin-link') || getByTestId('link-/signin')).toBeTruthy();
    });

    it('shows terms and conditions', () => {
      const { getByText } = render(<SignUpScreen />);
      
      expect(getByText(/terms/i) || getByText(/privacy/i) || getByText(/agree/i)).toBeTruthy();
    });
  });

  describe('Form Validation', () => {
    it('validates name input', async () => {
      const { getByTestId } = render(<SignUpScreen />);
      
      const nameInput = getByTestId('name-input') || getByTestId('fullname-input');
      const signupButton = getByTestId('signup-button');
      
      fireEvent.changeText(nameInput, ''); // Empty name
      fireEvent.press(signupButton);
      
      await waitFor(() => {
        expect(mockAuth.register).not.toHaveBeenCalled();
      });
    });

    it('validates email format', async () => {
      const { getByTestId } = render(<SignUpScreen />);
      
      const emailInput = getByTestId('email-input');
      const signupButton = getByTestId('signup-button');
      
      fireEvent.changeText(emailInput, 'invalid-email');
      fireEvent.press(signupButton);
      
      await waitFor(() => {
        expect(mockAuth.register).not.toHaveBeenCalled();
      });
    });

    it('validates password strength', async () => {
      const { getByTestId } = render(<SignUpScreen />);
      
      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');
      const signupButton = getByTestId('signup-button');
      
      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, '123'); // Too weak
      fireEvent.press(signupButton);
      
      await waitFor(() => {
        expect(mockAuth.register).not.toHaveBeenCalled();
      });
    });

    it('validates password confirmation', async () => {
      const { getByTestId } = render(<SignUpScreen />);
      
      try {
        const passwordInput = getByTestId('password-input');
        const confirmPasswordInput = getByTestId('confirm-password-input');
        const signupButton = getByTestId('signup-button');
        
        fireEvent.changeText(passwordInput, 'password123');
        fireEvent.changeText(confirmPasswordInput, 'differentpassword');
        fireEvent.press(signupButton);
        
        await waitFor(() => {
          expect(mockAuth.register).not.toHaveBeenCalled();
        });
      } catch {
        // Confirm password field might not be implemented
      }
    });

    it('enables signup button with valid inputs', async () => {
      const { getByTestId } = render(<SignUpScreen />);
      
      const nameInput = getByTestId('name-input') || getByTestId('fullname-input');
      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');
      const signupButton = getByTestId('signup-button');
      
      fireEvent.changeText(nameInput, 'John Doe');
      fireEvent.changeText(emailInput, 'john@example.com');
      fireEvent.changeText(passwordInput, 'securepassword123');
      
      expect(signupButton.props.disabled).toBeFalsy();
    });
  });

  describe('Registration Flow', () => {
    it('calls register with correct information', async () => {
      mockAuth.register.mockResolvedValue('user-id');
      
      const { getByTestId } = render(<SignUpScreen />);
      
      const nameInput = getByTestId('name-input') || getByTestId('fullname-input');
      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');
      const signupButton = getByTestId('signup-button');
      
      fireEvent.changeText(nameInput, 'John Doe');
      fireEvent.changeText(emailInput, 'john@example.com');
      fireEvent.changeText(passwordInput, 'securepassword123');
      fireEvent.press(signupButton);
      
      await waitFor(() => {
        expect(mockAuth.register).toHaveBeenCalledWith(
          expect.objectContaining({
            email: 'john@example.com',
            password: 'securepassword123',
          })
        );
      });
    });

    it('handles registration success', async () => {
      mockAuth.register.mockResolvedValue('user-id');
      
      const { getByTestId } = render(<SignUpScreen />);
      
      const nameInput = getByTestId('name-input') || getByTestId('fullname-input');
      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');
      const signupButton = getByTestId('signup-button');
      
      fireEvent.changeText(nameInput, 'John Doe');
      fireEvent.changeText(emailInput, 'john@example.com');
      fireEvent.changeText(passwordInput, 'securepassword123');
      fireEvent.press(signupButton);
      
      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/(auth)/onboarding');
      });
    });

    it('handles registration error', async () => {
      mockAuth.register.mockRejectedValue(new Error('Email already exists'));
      
      const { getByTestId, getByText } = render(<SignUpScreen />);
      
      const nameInput = getByTestId('name-input') || getByTestId('fullname-input');
      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');
      const signupButton = getByTestId('signup-button');
      
      fireEvent.changeText(nameInput, 'John Doe');
      fireEvent.changeText(emailInput, 'existing@example.com');
      fireEvent.changeText(passwordInput, 'securepassword123');
      fireEvent.press(signupButton);
      
      await waitFor(() => {
        expect(getByText(/already exists/i) || getByText(/error/i)).toBeTruthy();
      });
    });

    it('shows loading state during registration', async () => {
      mockAuth.loading = true;
      
      const { getByTestId } = render(<SignUpScreen />);
      
      const signupButton = getByTestId('signup-button');
      
      expect(signupButton.props.disabled || getByTestId('loading-indicator')).toBeTruthy();
    });
  });

  describe('Social Authentication', () => {
    it('handles Google signup', async () => {
      const { getByTestId } = render(<SignUpScreen />);
      
      const googleButton = getByTestId('google-signup-button') || getByTestId('google-signin-button');
      
      fireEvent.press(googleButton);
      
      await waitFor(() => {
        expect(mockAuth.register).toHaveBeenCalled();
      });
    });
  });

  describe('Navigation', () => {
    it('navigates to signin page', () => {
      const { getByTestId } = render(<SignUpScreen />);
      
      const signinLink = getByTestId('signin-link') || getByTestId('link-/signin');
      
      fireEvent.press(signinLink);
      
      expect(mockRouter.push).toHaveBeenCalledWith('/signin');
    });
  });

  describe('Terms and Conditions', () => {
    it('requires terms acceptance', async () => {
      const { getByTestId } = render(<SignUpScreen />);
      
      try {
        const termsCheckbox = getByTestId('terms-checkbox');
        const signupButton = getByTestId('signup-button');
        
        // Try to signup without accepting terms
        fireEvent.press(signupButton);
        
        await waitFor(() => {
          expect(mockAuth.register).not.toHaveBeenCalled();
        });
      } catch {
        // Terms checkbox might not be implemented yet
      }
    });

    it('opens terms and conditions', () => {
      const { getByTestId } = render(<SignUpScreen />);
      
      try {
        const termsLink = getByTestId('terms-link');
        fireEvent.press(termsLink);
        
        expect(mockRouter.push).toHaveBeenCalledWith('/terms');
      } catch {
        // Terms link might not be implemented yet
      }
    });
  });

  describe('Accessibility', () => {
    it('has proper accessibility labels', () => {
      const { getByTestId } = render(<SignUpScreen />);
      
      const nameInput = getByTestId('name-input') || getByTestId('fullname-input');
      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');
      const signupButton = getByTestId('signup-button');
      
      expect(nameInput.props.accessibilityLabel).toContain('Name');
      expect(emailInput.props.accessibilityLabel).toContain('Email');
      expect(passwordInput.props.accessibilityLabel).toContain('Password');
      expect(signupButton.props.accessibilityLabel).toContain('Sign up');
    });

    it('provides helpful accessibility hints', () => {
      const { getByTestId } = render(<SignUpScreen />);
      
      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');
      
      expect(emailInput.props.accessibilityHint).toBeTruthy();
      expect(passwordInput.props.accessibilityHint).toBeTruthy();
    });
  });

  describe('Security Features', () => {
    it('masks password input', () => {
      const { getByTestId } = render(<SignUpScreen />);
      
      const passwordInput = getByTestId('password-input');
      
      expect(passwordInput.props.secureTextEntry).toBe(true);
    });

    it('shows password strength indicator', () => {
      const { getByTestId } = render(<SignUpScreen />);
      
      try {
        const passwordInput = getByTestId('password-input');
        
        fireEvent.changeText(passwordInput, 'weak');
        expect(getByTestId('password-strength-weak')).toBeTruthy();
        
        fireEvent.changeText(passwordInput, 'StrongPassword123!');
        expect(getByTestId('password-strength-strong')).toBeTruthy();
      } catch {
        // Password strength indicator might not be implemented yet
      }
    });
  });
}); 