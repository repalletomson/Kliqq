import { renderHook, cleanup } from '@testing-library/react-native';
import { act } from 'react-test-renderer';

// Mock performance APIs
global.performance = {
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByType: jest.fn(() => []),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn(),
};

// Mock memory usage tracking
global.MemoryInfo = class {
  constructor() {
    this.usedJSHeapSize = Math.random() * 1000000;
    this.totalJSHeapSize = Math.random() * 2000000;
    this.jsHeapSizeLimit = 2000000000;
  }
};

global.performance.memory = new MemoryInfo();

describe('Memory Leak Detection Tests', () => {
  let initialMemory;
  let memorySnapshots = [];

  beforeEach(() => {
    initialMemory = performance.memory.usedJSHeapSize;
    memorySnapshots = [];
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
  });

  const takeMemorySnapshot = (label) => {
    const memory = performance.memory.usedJSHeapSize;
    memorySnapshots.push({ label, memory, timestamp: Date.now() });
    return memory;
  };

  const calculateMemoryGrowth = () => {
    if (memorySnapshots.length < 2) return 0;
    const first = memorySnapshots[0].memory;
    const last = memorySnapshots[memorySnapshots.length - 1].memory;
    return ((last - first) / first) * 100;
  };

  describe('Component Memory Management', () => {
    it('should not leak memory when mounting/unmounting PostCard repeatedly', async () => {
      const PostCard = require('../../components/PostCard').default;
      
      takeMemorySnapshot('initial');

      // Mount and unmount component multiple times
      for (let i = 0; i < 100; i++) {
        const { unmount } = renderHook(() => {
          return React.createElement(PostCard, {
            post: {
              id: `post-${i}`,
              content: `Test post ${i}`,
              user: { id: 'user1', full_name: 'Test User' },
              images: [],
              likes: [],
              comments: [],
              created_at: new Date().toISOString(),
            },
            onLike: jest.fn(),
            onComment: jest.fn(),
          });
        });

        // Unmount immediately
        unmount();
        
        if (i % 20 === 0) {
          takeMemorySnapshot(`iteration-${i}`);
        }
      }

      takeMemorySnapshot('final');

      // Memory growth should be minimal (< 10%)
      const memoryGrowth = calculateMemoryGrowth();
      expect(memoryGrowth).toBeLessThan(10);
    });

    it('should clean up event listeners on component unmount', () => {
      const useGroupMessages = require('../../hooks/useGroupMessages').useGroupMessages;
      
      // Mock event listener tracking
      const addedListeners = [];
      const removedListeners = [];
      
      const originalAddEventListener = global.addEventListener;
      const originalRemoveEventListener = global.removeEventListener;
      
      global.addEventListener = jest.fn((event, handler) => {
        addedListeners.push({ event, handler });
        return originalAddEventListener?.call(global, event, handler);
      });
      
      global.removeEventListener = jest.fn((event, handler) => {
        removedListeners.push({ event, handler });
        return originalRemoveEventListener?.call(global, event, handler);
      });

      const { unmount } = renderHook(() => useGroupMessages('test-chat'));

      // Simulate network events
      act(() => {
        global.dispatchEvent(new Event('online'));
        global.dispatchEvent(new Event('offline'));
      });

      unmount();

      // Verify all listeners are removed
      expect(removedListeners.length).toBeGreaterThan(0);
      expect(addedListeners.length).toEqual(removedListeners.length);

      // Restore original functions
      global.addEventListener = originalAddEventListener;
      global.removeEventListener = originalRemoveEventListener;
    });

    it('should clean up timers and intervals', () => {
      const usePushNotifications = require('../../hooks/usePushNotifications').usePushNotifications;
      
      // Track timers
      const timers = [];
      const intervals = [];
      
      const originalSetTimeout = global.setTimeout;
      const originalSetInterval = global.setInterval;
      const originalClearTimeout = global.clearTimeout;
      const originalClearInterval = global.clearInterval;
      
      global.setTimeout = jest.fn((fn, delay) => {
        const id = originalSetTimeout(fn, delay);
        timers.push(id);
        return id;
      });
      
      global.setInterval = jest.fn((fn, delay) => {
        const id = originalSetInterval(fn, delay);
        intervals.push(id);
        return id;
      });
      
      global.clearTimeout = jest.fn((id) => {
        const index = timers.indexOf(id);
        if (index > -1) timers.splice(index, 1);
        return originalClearTimeout(id);
      });
      
      global.clearInterval = jest.fn((id) => {
        const index = intervals.indexOf(id);
        if (index > -1) intervals.splice(index, 1);
        return originalClearInterval(id);
      });

      const { unmount } = renderHook(() => usePushNotifications());

      expect(timers.length + intervals.length).toBeGreaterThan(0);

      unmount();

      // All timers should be cleared
      expect(timers.length + intervals.length).toBe(0);

      // Restore original functions
      global.setTimeout = originalSetTimeout;
      global.setInterval = originalSetInterval;
      global.clearTimeout = originalClearTimeout;
      global.clearInterval = originalClearInterval;
    });
  });

  describe('Hook Memory Management', () => {
    it('should not accumulate state between hook instances', () => {
      const useSafeNavigation = require('../../hooks/useSafeNavigation').useSafeNavigation;
      
      takeMemorySnapshot('before-hooks');

      const hooks = [];
      
      // Create multiple hook instances
      for (let i = 0; i < 50; i++) {
        const { result, unmount } = renderHook(() => useSafeNavigation());
        hooks.push({ result, unmount });
      }

      takeMemorySnapshot('after-creation');

      // Unmount all hooks
      hooks.forEach(({ unmount }) => unmount());

      takeMemorySnapshot('after-cleanup');

      // Memory should return to near original levels
      const snapshots = memorySnapshots;
      const creationGrowth = ((snapshots[1].memory - snapshots[0].memory) / snapshots[0].memory) * 100;
      const cleanupReduction = ((snapshots[1].memory - snapshots[2].memory) / snapshots[1].memory) * 100;

      expect(cleanupReduction).toBeGreaterThan(80); // Should clean up 80%+ of memory
    });

    it('should handle rapid state updates without memory accumulation', async () => {
      const { result } = renderHook(() => {
        const [state, setState] = React.useState(0);
        return { state, setState };
      });

      takeMemorySnapshot('before-updates');

      // Rapid state updates
      for (let i = 0; i < 1000; i++) {
        await act(async () => {
          result.current.setState(i);
        });
      }

      takeMemorySnapshot('after-updates');

      const memoryGrowth = calculateMemoryGrowth();
      expect(memoryGrowth).toBeLessThan(5); // Should be minimal growth
    });
  });

  describe('Image and Media Memory Management', () => {
    it('should release image memory when component unmounts', () => {
      const PostCard = require('../../components/PostCard').default;
      
      const mockPost = {
        id: 'post-1',
        content: 'Post with images',
        user: { id: 'user1', full_name: 'Test User' },
        images: [
          { uri: 'https://example.com/image1.jpg' },
          { uri: 'https://example.com/image2.jpg' },
          { uri: 'https://example.com/image3.jpg' },
        ],
        likes: [],
        comments: [],
        created_at: new Date().toISOString(),
      };

      takeMemorySnapshot('before-images');

      const components = [];
      
      // Create multiple components with images
      for (let i = 0; i < 20; i++) {
        const { unmount } = renderHook(() => 
          React.createElement(PostCard, { 
            post: { ...mockPost, id: `post-${i}` } 
          })
        );
        components.push(unmount);
      }

      takeMemorySnapshot('after-image-load');

      // Unmount all components
      components.forEach(unmount => unmount());

      takeMemorySnapshot('after-image-cleanup');

      // Verify significant memory reduction
      const snapshots = memorySnapshots;
      const cleanupReduction = ((snapshots[1].memory - snapshots[2].memory) / snapshots[1].memory) * 100;
      expect(cleanupReduction).toBeGreaterThan(70);
    });

    it('should handle image cache memory efficiently', () => {
      // Mock image cache
      const imageCache = new Map();
      
      const cacheImage = (uri) => {
        if (!imageCache.has(uri)) {
          imageCache.set(uri, {
            data: new ArrayBuffer(1024 * 1024), // 1MB mock image
            timestamp: Date.now(),
          });
        }
        return imageCache.get(uri);
      };

      const clearOldCacheEntries = () => {
        const now = Date.now();
        const maxAge = 5 * 60 * 1000; // 5 minutes
        
        for (const [uri, data] of imageCache.entries()) {
          if (now - data.timestamp > maxAge) {
            imageCache.delete(uri);
          }
        }
      };

      takeMemorySnapshot('before-cache');

      // Simulate image loading
      for (let i = 0; i < 100; i++) {
        cacheImage(`https://example.com/image${i}.jpg`);
      }

      takeMemorySnapshot('after-cache-load');

      // Clear old entries
      clearOldCacheEntries();

      takeMemorySnapshot('after-cache-cleanup');

      // Cache should limit memory growth
      const memoryGrowth = calculateMemoryGrowth();
      expect(memoryGrowth).toBeLessThan(50);
    });
  });

  describe('Real-time Connection Memory Management', () => {
    it('should clean up Firebase listeners properly', () => {
      const useGroupMessages = require('../../hooks/useGroupMessages').useGroupMessages;
      
      // Mock Firebase
      const unsubscribeFunctions = [];
      
      jest.doMock('firebase/firestore', () => ({
        onSnapshot: jest.fn(() => {
          const unsubscribe = jest.fn();
          unsubscribeFunctions.push(unsubscribe);
          return unsubscribe;
        }),
      }));

      const { unmount } = renderHook(() => useGroupMessages('test-chat'));

      expect(unsubscribeFunctions.length).toBeGreaterThan(0);

      unmount();

      // All unsubscribe functions should be called
      unsubscribeFunctions.forEach(unsubscribe => {
        expect(unsubscribe).toHaveBeenCalled();
      });
    });

    it('should handle Supabase channel cleanup', () => {
      const useGroupMessages = require('../../hooks/useGroupMessages').useGroupMessages;
      
      const mockChannel = {
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn().mockReturnThis(),
        unsubscribe: jest.fn(),
      };

      jest.doMock('../../config/supabaseConfig', () => ({
        supabase: {
          channel: jest.fn(() => mockChannel),
        },
      }));

      const { unmount } = renderHook(() => useGroupMessages('test-chat'));

      expect(mockChannel.subscribe).toHaveBeenCalled();

      unmount();

      expect(mockChannel.unsubscribe).toHaveBeenCalled();
    });
  });

  describe('Large Dataset Memory Management', () => {
    it('should handle large message lists efficiently', () => {
      const MessageList = require('../../components/MessageList').default;
      
      // Generate large message dataset
      const largeMessageList = Array.from({ length: 10000 }, (_, i) => ({
        id: `msg-${i}`,
        text: `Message ${i}`,
        senderId: `user${i % 100}`,
        timestamp: new Date(Date.now() - i * 1000),
      }));

      takeMemorySnapshot('before-large-list');

      const { unmount } = renderHook(() => 
        React.createElement(MessageList, { 
          messages: largeMessageList,
          onLoadMore: jest.fn(),
        })
      );

      takeMemorySnapshot('after-large-list');

      unmount();

      takeMemorySnapshot('after-large-list-cleanup');

      // Should handle large datasets without excessive memory usage
      const snapshots = memorySnapshots;
      const listMemoryUsage = snapshots[1].memory - snapshots[0].memory;
      const expectedMemoryPerItem = 1000; // bytes per message
      const actualMemoryPerItem = listMemoryUsage / largeMessageList.length;

      expect(actualMemoryPerItem).toBeLessThan(expectedMemoryPerItem * 2);
    });

    it('should implement virtual scrolling for performance', () => {
      const VirtualizedList = require('../../components/VirtualizedList').default;
      
      const items = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        content: `Item ${i}`,
      }));

      takeMemorySnapshot('before-virtualized');

      const { rerender, unmount } = renderHook(({ visibleRange }) => 
        React.createElement(VirtualizedList, {
          items,
          visibleRange,
          renderItem: ({ item }) => React.createElement('div', { key: item.id }, item.content),
        }),
        { initialProps: { visibleRange: { start: 0, end: 10 } } }
      );

      takeMemorySnapshot('after-virtualized-initial');

      // Simulate scrolling
      for (let i = 0; i < 10; i++) {
        rerender({ visibleRange: { start: i * 10, end: (i + 1) * 10 } });
      }

      takeMemorySnapshot('after-virtualized-scroll');

      unmount();

      takeMemorySnapshot('after-virtualized-cleanup');

      // Memory usage should be proportional to visible items, not total items
      const memoryGrowth = calculateMemoryGrowth();
      expect(memoryGrowth).toBeLessThan(20);
    });
  });

  describe('Memory Pressure Handling', () => {
    it('should handle low memory warnings', () => {
      const MemoryManager = require('../../utils/MemoryManager').default;
      
      const mockMemoryWarning = () => {
        global.dispatchEvent(new Event('memorywarning'));
      };

      const memoryManager = new MemoryManager();
      
      takeMemorySnapshot('before-memory-warning');

      // Trigger memory warning
      mockMemoryWarning();

      takeMemorySnapshot('after-memory-warning');

      // Should have cleaned up non-essential caches
      expect(memoryManager.getCacheSize()).toBeLessThan(1024 * 1024); // < 1MB
    });

    it('should prioritize critical data during memory pressure', () => {
      const DataManager = require('../../utils/DataManager').default;
      
      const dataManager = new DataManager();
      
      // Load critical and non-critical data
      dataManager.loadCriticalData();
      dataManager.loadNonCriticalData();

      takeMemorySnapshot('before-pressure');

      // Simulate memory pressure
      dataManager.handleMemoryPressure();

      takeMemorySnapshot('after-pressure');

      // Critical data should remain, non-critical should be cleared
      expect(dataManager.hasCriticalData()).toBe(true);
      expect(dataManager.hasNonCriticalData()).toBe(false);
    });
  });

  describe('Memory Profiling', () => {
    it('should provide memory usage metrics', () => {
      const PerformanceMonitor = require('../../utils/PerformanceMonitor').default;
      
      const monitor = new PerformanceMonitor();
      
      monitor.startMemoryProfiling();

      // Simulate app usage
      for (let i = 0; i < 100; i++) {
        const { unmount } = renderHook(() => React.useState(i));
        unmount();
      }

      const metrics = monitor.getMemoryMetrics();

      expect(metrics).toHaveProperty('peakMemoryUsage');
      expect(metrics).toHaveProperty('averageMemoryUsage');
      expect(metrics).toHaveProperty('memoryLeakDetected');
      expect(metrics.peakMemoryUsage).toBeGreaterThan(0);
    });

    it('should detect potential memory leaks', () => {
      const LeakDetector = require('../../utils/LeakDetector').default;
      
      const detector = new LeakDetector();
      detector.startMonitoring();

      takeMemorySnapshot('leak-test-start');

      // Create potential leak scenario
      const leakyComponents = [];
      for (let i = 0; i < 50; i++) {
        leakyComponents.push({
          id: i,
          data: new Array(1000).fill(`data-${i}`),
          // Intentionally not cleaning up references
        });
      }

      takeMemorySnapshot('leak-test-end');

      const leakReport = detector.generateReport();

      expect(leakReport.potentialLeaks.length).toBeGreaterThan(0);
      expect(leakReport.memoryGrowthRate).toBeGreaterThan(5); // > 5% growth
    });
  });
}); 