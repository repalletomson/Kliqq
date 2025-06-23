import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from '../../../context/authContext';
import SigninScreen from '../../../app/(auth)/signin';
import SignUpScreen from '../../../app/(auth)/signup';
import OnboardingScreen from '../../../app/(auth)/onboarding/index';

// Mock Supabase
const mockSupabase = {
  auth: {
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    getUser: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } }
    })),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
  })),
};

jest.mock('../../../config/supabaseConfig', () => ({
  supabase: mockSupabase,
}));

// Mock router
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
};

jest.mock('expo-router', () => ({
  useRouter: () => mockRouter,
  router: mockRouter,
}));

// Test wrapper with providers
const TestWrapper = ({ children }) => (
  <NavigationContainer>
    <AuthProvider>
      {children}
    </AuthProvider>
  </NavigationContainer>
);

describe('Authentication Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset auth state
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });
  });

  describe('Sign In Flow', () => {
    it('should complete successful signin flow', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: {
          full_name: 'Test User',
        },
      };

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: { access_token: 'token' } },
        error: null,
      });

      const { getByTestId, getByPlaceholderText } = render(
        <TestWrapper>
          <SigninScreen />
        </TestWrapper>
      );

      // Fill in credentials
      const emailInput = getByPlaceholderText('Enter your email');
      const passwordInput = getByPlaceholderText('Enter your password');
      const signInButton = getByTestId('sign-in-button');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');

      // Submit form
      await act(async () => {
        fireEvent.press(signInButton);
      });

      await waitFor(() => {
        expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });

      // Should navigate to main app
      expect(mockRouter.replace).toHaveBeenCalledWith('/(root)/(tabs)/home');
    });

    it('should handle signin errors properly', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials' },
      });

      const { getByTestId, getByPlaceholderText, getByText } = render(
        <TestWrapper>
          <SigninScreen />
        </TestWrapper>
      );

      const emailInput = getByPlaceholderText('Enter your email');
      const passwordInput = getByPlaceholderText('Enter your password');
      const signInButton = getByTestId('sign-in-button');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'wrongpassword');

      await act(async () => {
        fireEvent.press(signInButton);
      });

      await waitFor(() => {
        expect(getByText('Invalid credentials')).toBeTruthy();
      });
    });

    it('should validate email format', async () => {
      const { getByTestId, getByPlaceholderText, getByText } = render(
        <TestWrapper>
          <SigninScreen />
        </TestWrapper>
      );

      const emailInput = getByPlaceholderText('Enter your email');
      const passwordInput = getByPlaceholderText('Enter your password');
      const signInButton = getByTestId('sign-in-button');

      fireEvent.changeText(emailInput, 'invalid-email');
      fireEvent.changeText(passwordInput, 'password123');

      await act(async () => {
        fireEvent.press(signInButton);
      });

      await waitFor(() => {
        expect(getByText('Please enter a valid email address')).toBeTruthy();
      });
    });
  });

  describe('Sign Up Flow', () => {
    it('should complete successful signup flow', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'newuser@example.com',
        user_metadata: {
          full_name: 'New User',
        },
      };

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: { access_token: 'token' } },
        error: null,
      });

      const { getByTestId, getByPlaceholderText } = render(
        <TestWrapper>
          <SignUpScreen />
        </TestWrapper>
      );

      // Fill in registration form
      const fullNameInput = getByPlaceholderText('Enter your full name');
      const emailInput = getByPlaceholderText('Enter your email');
      const passwordInput = getByPlaceholderText('Create a password');
      const confirmPasswordInput = getByPlaceholderText('Confirm your password');
      const signUpButton = getByTestId('sign-up-button');

      fireEvent.changeText(fullNameInput, 'New User');
      fireEvent.changeText(emailInput, 'newuser@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.changeText(confirmPasswordInput, 'password123');

      await act(async () => {
        fireEvent.press(signUpButton);
      });

      await waitFor(() => {
        expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
          email: 'newuser@example.com',
          password: 'password123',
          options: {
            data: {
              full_name: 'New User',
            },
          },
        });
      });

      // Should navigate to onboarding
      expect(mockRouter.replace).toHaveBeenCalledWith('/(auth)/onboarding');
    });

    it('should validate password confirmation', async () => {
      const { getByTestId, getByPlaceholderText, getByText } = render(
        <TestWrapper>
          <SignUpScreen />
        </TestWrapper>
      );

      const fullNameInput = getByPlaceholderText('Enter your full name');
      const emailInput = getByPlaceholderText('Enter your email');
      const passwordInput = getByPlaceholderText('Create a password');
      const confirmPasswordInput = getByPlaceholderText('Confirm your password');
      const signUpButton = getByTestId('sign-up-button');

      fireEvent.changeText(fullNameInput, 'New User');
      fireEvent.changeText(emailInput, 'newuser@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.changeText(confirmPasswordInput, 'differentpassword');

      await act(async () => {
        fireEvent.press(signUpButton);
      });

      await waitFor(() => {
        expect(getByText('Passwords do not match')).toBeTruthy();
      });
    });

    it('should handle signup errors', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Email already registered' },
      });

      const { getByTestId, getByPlaceholderText, getByText } = render(
        <TestWrapper>
          <SignUpScreen />
        </TestWrapper>
      );

      const fullNameInput = getByPlaceholderText('Enter your full name');
      const emailInput = getByPlaceholderText('Enter your email');
      const passwordInput = getByPlaceholderText('Create a password');
      const confirmPasswordInput = getByPlaceholderText('Confirm your password');
      const signUpButton = getByTestId('sign-up-button');

      fireEvent.changeText(fullNameInput, 'New User');
      fireEvent.changeText(emailInput, 'existing@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.changeText(confirmPasswordInput, 'password123');

      await act(async () => {
        fireEvent.press(signUpButton);
      });

      await waitFor(() => {
        expect(getByText('Email already registered')).toBeTruthy();
      });
    });
  });

  describe('Onboarding Flow', () => {
    it('should complete onboarding flow', async () => {
      // Mock successful user update
      mockSupabase.from.mockReturnValue({
        upsert: jest.fn().mockResolvedValue({ error: null }),
      });

      const { getByTestId, getByText } = render(
        <TestWrapper>
          <OnboardingScreen />
        </TestWrapper>
      );

      // Step 1: Personal Details
      const usernameInput = getByTestId('username-input');
      fireEvent.changeText(usernameInput, 'testuser');

      // Select some interests
      const codingInterest = getByText('Coding');
      fireEvent.press(codingInterest);

      const nextButton = getByTestId('next-button');
      fireEvent.press(nextButton);

      // Step 2: Education Details
      await waitFor(() => {
        expect(getByText('Education Details')).toBeTruthy();
      });

      const collegeInput = getByTestId('college-input');
      const branchInput = getByTestId('branch-input');
      
      fireEvent.changeText(collegeInput, 'Test University');
      fireEvent.changeText(branchInput, 'Computer Science');

      const nextButton2 = getByTestId('next-button');
      fireEvent.press(nextButton2);

      // Step 3: Notifications
      await waitFor(() => {
        expect(getByText('Stay Connected')).toBeTruthy();
      });

      const finishButton = getByTestId('finish-button');
      fireEvent.press(finishButton);

      // Should complete onboarding
      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/(root)/(tabs)/home');
      });
    });

    it('should handle onboarding data persistence', async () => {
      const mockUpdate = jest.fn().mockResolvedValue({ error: null });
      mockSupabase.from.mockReturnValue({
        upsert: mockUpdate,
      });

      const { getByTestId, getByText } = render(
        <TestWrapper>
          <OnboardingScreen />
        </TestWrapper>
      );

      // Complete onboarding steps
      const usernameInput = getByTestId('username-input');
      fireEvent.changeText(usernameInput, 'testuser');

      const codingInterest = getByText('Coding');
      fireEvent.press(codingInterest);

      // Skip through steps
      const nextButton = getByTestId('next-button');
      fireEvent.press(nextButton);

      await waitFor(() => {
        const collegeInput = getByTestId('college-input');
        fireEvent.changeText(collegeInput, 'Test University');
      });

      const nextButton2 = getByTestId('next-button');
      fireEvent.press(nextButton2);

      const finishButton = getByTestId('finish-button');
      fireEvent.press(finishButton);

      // Verify data was saved
      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            username: 'testuser',
            interests: expect.arrayContaining(['coding']),
            college: 'Test University',
          })
        );
      });
    });
  });

  describe('Auth State Management', () => {
    it('should persist auth state across app restarts', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      // Simulate existing session
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const { getByTestId } = render(
        <TestWrapper>
          <SigninScreen />
        </TestWrapper>
      );

      // Should automatically navigate to main app
      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/(root)/(tabs)/home');
      });
    });

    it('should handle auth state changes', async () => {
      let authStateCallback;
      mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
        authStateCallback = callback;
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      });

      render(
        <TestWrapper>
          <SigninScreen />
        </TestWrapper>
      );

      // Simulate auth state change
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      await act(async () => {
        authStateCallback('SIGNED_IN', { user: mockUser });
      });

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/(root)/(tabs)/home');
      });
    });
  });
}); 