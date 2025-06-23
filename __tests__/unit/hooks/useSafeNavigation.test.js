import { renderHook, act } from '@testing-library/react-native';
import { useSafeNavigation } from '../../../hooks/useSafeNavigation';
import { useRouter } from 'expo-router';

jest.mock('expo-router');

describe('useSafeNavigation', () => {
  let mockRouter;

  beforeEach(() => {
    mockRouter = {
      push: jest.fn(),
      back: jest.fn(),
      replace: jest.fn(),
      navigate: jest.fn(),
      canGoBack: jest.fn(() => true),
    };
    useRouter.mockReturnValue(mockRouter);
    jest.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useSafeNavigation({}));

    expect(result.current.safeNavigate).toBeDefined();
    expect(result.current.safeBack).toBeDefined();
    expect(typeof result.current.safeNavigate).toBe('function');
    expect(typeof result.current.safeBack).toBe('function');
  });

  it('should navigate safely with push method', async () => {
    const { result } = renderHook(() => useSafeNavigation({}));

    await act(async () => {
      await result.current.safeNavigate('/test-route', { push: true });
    });

    expect(mockRouter.push).toHaveBeenCalledWith('/test-route');
  });

  it('should navigate safely with replace method', async () => {
    const { result } = renderHook(() => useSafeNavigation({}));

    await act(async () => {
      await result.current.safeNavigate('/test-route', { replace: true });
    });

    expect(mockRouter.replace).toHaveBeenCalledWith('/test-route');
  });

  it('should default to push when no method specified', async () => {
    const { result } = renderHook(() => useSafeNavigation({}));

    await act(async () => {
      await result.current.safeNavigate('/test-route');
    });

    expect(mockRouter.push).toHaveBeenCalledWith('/test-route');
  });

  it('should handle back navigation safely', async () => {
    const { result } = renderHook(() => useSafeNavigation({}));

    await act(async () => {
      await result.current.safeBack();
    });

    expect(mockRouter.back).toHaveBeenCalled();
  });

  it('should close modals before navigation', async () => {
    const mockModalClose = jest.fn();
    const { result } = renderHook(() => 
      useSafeNavigation({
        modals: [mockModalClose],
      })
    );

    await act(async () => {
      await result.current.safeNavigate('/test-route');
    });

    expect(mockModalClose).toHaveBeenCalled();
    expect(mockRouter.push).toHaveBeenCalledWith('/test-route');
  });

  it('should call cleanup function', async () => {
    const mockCleanup = jest.fn();
    const { result } = renderHook(() => 
      useSafeNavigation({
        onCleanup: mockCleanup,
      })
    );

    await act(async () => {
      await result.current.safeNavigate('/test-route');
    });

    expect(mockCleanup).toHaveBeenCalled();
  });

  it('should handle navigation errors gracefully', async () => {
    mockRouter.push.mockRejectedValue(new Error('Navigation failed'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const { result } = renderHook(() => useSafeNavigation({}));

    await act(async () => {
      await result.current.safeNavigate('/test-route');
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      'Navigation error:', 
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it('should handle back navigation when cannot go back', async () => {
    mockRouter.canGoBack.mockReturnValue(false);
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

    const { result } = renderHook(() => useSafeNavigation({}));

    await act(async () => {
      await result.current.safeBack();
    });

    expect(consoleSpy).toHaveBeenCalledWith('Cannot go back - no previous screen');
    expect(mockRouter.back).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should wait for modal closure', async () => {
    const slowModalClose = jest.fn(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );

    const { result } = renderHook(() => 
      useSafeNavigation({
        modals: [slowModalClose],
      })
    );

    const startTime = Date.now();
    
    await act(async () => {
      await result.current.safeNavigate('/test-route');
    });

    const endTime = Date.now();
    expect(endTime - startTime).toBeGreaterThanOrEqual(100);
    expect(slowModalClose).toHaveBeenCalled();
    expect(mockRouter.push).toHaveBeenCalledWith('/test-route');
  });

  it('should handle multiple modals', async () => {
    const modal1Close = jest.fn();
    const modal2Close = jest.fn();

    const { result } = renderHook(() => 
      useSafeNavigation({
        modals: [modal1Close, modal2Close],
      })
    );

    await act(async () => {
      await result.current.safeNavigate('/test-route');
    });

    expect(modal1Close).toHaveBeenCalled();
    expect(modal2Close).toHaveBeenCalled();
    expect(mockRouter.push).toHaveBeenCalledWith('/test-route');
  });
}); 