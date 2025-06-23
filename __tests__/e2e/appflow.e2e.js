import { device, element, by, expect as detoxExpect, waitFor } from 'detox';

describe('SocialZ App E2E Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Authentication Flow', () => {
    it('should show welcome screen on first launch', async () => {
      await detoxExpect(element(by.text('Welcome to SocialZ'))).toBeVisible();
      await detoxExpect(element(by.id('get-started-button'))).toBeVisible();
    });

    it('should navigate to signin screen', async () => {
      await element(by.id('get-started-button')).tap();
      await detoxExpect(element(by.text('Sign In'))).toBeVisible();
      await detoxExpect(element(by.id('email-input'))).toBeVisible();
      await detoxExpect(element(by.id('password-input'))).toBeVisible();
    });

    it('should complete signin flow', async () => {
      // Navigate to signin
      await element(by.id('get-started-button')).tap();
      
      // Fill credentials
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('password123');
      
      // Sign in
      await element(by.id('sign-in-button')).tap();
      
      // Should reach home screen
      await waitFor(element(by.text('SocialZ')))
        .toBeVisible()
        .withTimeout(10000);
      
      await detoxExpect(element(by.id('home-feed'))).toBeVisible();
    });

    it('should show validation errors for invalid input', async () => {
      await element(by.id('get-started-button')).tap();
      
      await element(by.id('email-input')).typeText('invalid-email');
      await element(by.id('password-input')).typeText('123');
      await element(by.id('sign-in-button')).tap();
      
      await detoxExpect(element(by.text('Please enter a valid email address')))
        .toBeVisible();
    });

    it('should navigate to signup screen', async () => {
      await element(by.id('get-started-button')).tap();
      await element(by.id('signup-link')).tap();
      
      await detoxExpect(element(by.text('Create Account'))).toBeVisible();
      await detoxExpect(element(by.id('fullname-input'))).toBeVisible();
    });

    it('should complete signup and onboarding flow', async () => {
      // Navigate to signup
      await element(by.id('get-started-button')).tap();
      await element(by.id('signup-link')).tap();
      
      // Fill signup form
      await element(by.id('fullname-input')).typeText('John Doe');
      await element(by.id('email-input')).typeText('john.doe@example.com');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('confirm-password-input')).typeText('password123');
      
      await element(by.id('sign-up-button')).tap();
      
      // Should navigate to onboarding
      await waitFor(element(by.text('Personal Details')))
        .toBeVisible()
        .withTimeout(10000);
      
      // Complete onboarding - Step 1
      await element(by.id('username-input')).typeText('johndoe');
      await element(by.text('Coding')).tap(); // Select interest
      await element(by.id('next-button')).tap();
      
      // Step 2: Education
      await waitFor(element(by.text('Education Details'))).toBeVisible();
      await element(by.id('college-input')).typeText('Test University');
      await element(by.id('branch-input')).typeText('Computer Science');
      await element(by.id('next-button')).tap();
      
      // Step 3: Notifications
      await waitFor(element(by.text('Stay Connected'))).toBeVisible();
      await element(by.id('finish-button')).tap();
      
      // Should reach home screen
      await waitFor(element(by.id('home-feed')))
        .toBeVisible()
        .withTimeout(10000);
    });
  });

  describe('Home Feed Flow', () => {
    beforeEach(async () => {
      // Assume user is logged in
      await element(by.id('get-started-button')).tap();
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('sign-in-button')).tap();
      await waitFor(element(by.id('home-feed'))).toBeVisible().withTimeout(10000);
    });

    it('should display feed posts', async () => {
      await detoxExpect(element(by.id('home-feed'))).toBeVisible();
      await detoxExpect(element(by.id('post-card')).atIndex(0)).toBeVisible();
    });

    it('should allow liking posts', async () => {
      await element(by.id('like-button')).atIndex(0).tap();
      await detoxExpect(element(by.id('like-button')).atIndex(0))
        .toHaveToggleValue(true);
    });

    it('should navigate to post detail view', async () => {
      await element(by.id('comment-button')).atIndex(0).tap();
      await waitFor(element(by.text('Comments')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should open create post screen', async () => {
      await element(by.id('create-post-input')).tap();
      await waitFor(element(by.text('Create Post')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should create a new post', async () => {
      await element(by.id('create-post-input')).tap();
      await waitFor(element(by.id('post-content-input'))).toBeVisible();
      
      await element(by.id('post-content-input'))
        .typeText('This is a test post from E2E tests');
      
      await element(by.id('publish-button')).tap();
      
      // Should return to feed and show new post
      await waitFor(element(by.text('This is a test post from E2E tests')))
        .toBeVisible()
        .withTimeout(10000);
    });

    it('should refresh feed on pull down', async () => {
      await element(by.id('home-feed')).swipe('down', 'fast', 0.8);
      // Should trigger refresh loading
      await waitFor(element(by.id('refresh-indicator')))
        .toBeVisible()
        .withTimeout(2000);
    });

    it('should load more posts on scroll', async () => {
      // Scroll to bottom
      await element(by.id('home-feed')).scrollTo('bottom');
      
      // Should trigger load more
      await waitFor(element(by.text('Loading more posts...')))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('Chat Flow', () => {
    beforeEach(async () => {
      // Login and navigate to chat tab
      await element(by.id('get-started-button')).tap();
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('sign-in-button')).tap();
      await waitFor(element(by.id('home-feed'))).toBeVisible().withTimeout(10000);
      
      await element(by.id('chat-tab')).tap();
    });

    it('should show chat list', async () => {
      await detoxExpect(element(by.text('Chat'))).toBeVisible();
      await detoxExpect(element(by.id('new-chat-button'))).toBeVisible();
    });

    it('should open new chat modal', async () => {
      await element(by.id('new-chat-button')).tap();
      await waitFor(element(by.text('New Chat')))
        .toBeVisible()
        .withTimeout(5000);
      
      await detoxExpect(element(by.id('user-search-input'))).toBeVisible();
    });

    it('should search and start new chat', async () => {
      await element(by.id('new-chat-button')).tap();
      await waitFor(element(by.id('user-search-input'))).toBeVisible();
      
      await element(by.id('user-search-input')).typeText('John');
      await waitFor(element(by.id('user-result')).atIndex(0))
        .toBeVisible()
        .withTimeout(5000);
      
      await element(by.id('user-result')).atIndex(0).tap();
      
      // Should open chat room
      await waitFor(element(by.id('message-input')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should send and receive messages', async () => {
      // Assume we're in a chat room
      await element(by.id('new-chat-button')).tap();
      await element(by.id('user-search-input')).typeText('John');
      await element(by.id('user-result')).atIndex(0).tap();
      
      // Send message
      await element(by.id('message-input')).typeText('Hello from E2E test!');
      await element(by.id('send-button')).tap();
      
      // Should see message in chat
      await waitFor(element(by.text('Hello from E2E test!')))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('Groups Flow', () => {
    beforeEach(async () => {
      // Login and navigate to groups tab
      await element(by.id('get-started-button')).tap();
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('sign-in-button')).tap();
      await waitFor(element(by.id('home-feed'))).toBeVisible().withTimeout(10000);
      
      await element(by.id('groups-tab')).tap();
    });

    it('should show groups list', async () => {
      await detoxExpect(element(by.text('Groups'))).toBeVisible();
      await detoxExpect(element(by.text('collegeClubs'))).toBeVisible();
      await detoxExpect(element(by.text('Movies'))).toBeVisible();
    });

    it('should join a group', async () => {
      await element(by.text('Movies')).tap();
      await waitFor(element(by.text('Join Movies Group')))
        .toBeVisible()
        .withTimeout(5000);
      
      await element(by.id('join-group-button')).tap();
      
      // Should navigate to group chat
      await waitFor(element(by.text('Movies')))
        .toBeVisible()
        .withTimeout(10000);
      
      await detoxExpect(element(by.id('message-input'))).toBeVisible();
    });

    it('should send message in group', async () => {
      // Join group first
      await element(by.text('Movies')).tap();
      await element(by.id('join-group-button')).tap();
      
      // Send message
      await waitFor(element(by.id('message-input'))).toBeVisible();
      await element(by.id('message-input')).typeText('Hello group!');
      await element(by.id('send-button')).tap();
      
      // Should see message
      await waitFor(element(by.text('Hello group!')))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('Profile Flow', () => {
    beforeEach(async () => {
      // Login and navigate to profile
      await element(by.id('get-started-button')).tap();
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('sign-in-button')).tap();
      await waitFor(element(by.id('home-feed'))).toBeVisible().withTimeout(10000);
      
      await element(by.id('profile-avatar')).tap();
    });

    it('should show profile screen', async () => {
      await detoxExpect(element(by.text('Profile'))).toBeVisible();
      await detoxExpect(element(by.id('edit-profile-button'))).toBeVisible();
    });

    it('should edit profile', async () => {
      await element(by.id('edit-profile-button')).tap();
      await waitFor(element(by.text('Edit Profile')))
        .toBeVisible()
        .withTimeout(5000);
      
      await element(by.id('bio-input')).typeText('Updated bio from E2E test');
      await element(by.id('save-button')).tap();
      
      // Should return to profile with updated info
      await waitFor(element(by.text('Updated bio from E2E test')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should logout user', async () => {
      await element(by.id('settings-button')).tap();
      await waitFor(element(by.text('Settings'))).toBeVisible();
      
      await element(by.id('logout-button')).tap();
      await element(by.text('Logout')).tap(); // Confirm
      
      // Should return to welcome screen
      await waitFor(element(by.text('Welcome to SocialZ')))
        .toBeVisible()
        .withTimeout(10000);
    });
  });

  describe('Search Flow', () => {
    beforeEach(async () => {
      // Login first
      await element(by.id('get-started-button')).tap();
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('sign-in-button')).tap();
      await waitFor(element(by.id('home-feed'))).toBeVisible().withTimeout(10000);
    });

    it('should search for users and posts', async () => {
      await element(by.id('search-button')).tap();
      await waitFor(element(by.id('search-input'))).toBeVisible();
      
      await element(by.id('search-input')).typeText('coding');
      
      // Should show search results
      await waitFor(element(by.id('search-results')))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // Simulate network disconnection
      await device.setURLBlacklist(['*']);
      
      await element(by.id('get-started-button')).tap();
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('sign-in-button')).tap();
      
      // Should show error message
      await waitFor(element(by.text('Network error')))
        .toBeVisible()
        .withTimeout(10000);
      
      // Restore network
      await device.setURLBlacklist([]);
    });

    it('should handle app crashes gracefully', async () => {
      // This would typically involve triggering conditions that might cause crashes
      // and ensuring the app recovers properly
      
      await device.launchApp({ newInstance: true });
      await detoxExpect(element(by.text('Welcome to SocialZ'))).toBeVisible();
    });
  });
}); 