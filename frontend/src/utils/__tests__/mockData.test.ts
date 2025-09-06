import { 
  getMockData, 
  clearMockDataCache,
  type Shop,
  type Dienstleister,
  type User,
  type Event,
  type NewsArticle,
  type JobPosition
} from '../mockData';

describe('Mock Data Utility', () => {
  beforeEach(() => {
    // Clear cache before each test
    clearMockDataCache();
  });

  afterEach(() => {
    // Clear cache after each test
    clearMockDataCache();
  });

  describe('Data Interfaces', () => {
    describe('Shop Interface', () => {
      it('has correct structure', () => {
        const mockShop: Shop = {
          id: '1',
          name: 'Test Shop',
          description: 'A test shop',
          category: 'Electronics',
          location: 'Berlin',
          rating: 4.5,
          reviewCount: 25,
          listingCount: 150,
          image: 'shop.jpg',
          phone: '+49 30 123456',
          email: 'shop@test.com',
          website: 'https://testshop.com',
          verified: true,
          featured: false
        };

        expect(mockShop.id).toBe('1');
        expect(mockShop.name).toBe('Test Shop');
        expect(mockShop.verified).toBe(true);
        expect(mockShop.featured).toBe(false);
        expect(typeof mockShop.rating).toBe('number');
        expect(typeof mockShop.reviewCount).toBe('number');
        expect(typeof mockShop.listingCount).toBe('number');
      });

      it('handles all required properties', () => {
        const mockShop: Shop = {
          id: '2',
          name: 'Another Shop',
          description: 'Another test shop',
          category: 'Fashion',
          location: 'München',
          rating: 3.8,
          reviewCount: 12,
          listingCount: 75,
          image: 'another-shop.jpg',
          phone: '+49 89 654321',
          email: 'another@test.com',
          website: 'https://anothershop.com',
          verified: false,
          featured: true
        };

        expect(mockShop).toHaveProperty('id');
        expect(mockShop).toHaveProperty('name');
        expect(mockShop).toHaveProperty('description');
        expect(mockShop).toHaveProperty('category');
        expect(mockShop).toHaveProperty('location');
        expect(mockShop).toHaveProperty('rating');
        expect(mockShop).toHaveProperty('reviewCount');
        expect(mockShop).toHaveProperty('listingCount');
        expect(mockShop).toHaveProperty('image');
        expect(mockShop).toHaveProperty('phone');
        expect(mockShop).toHaveProperty('email');
        expect(mockShop).toHaveProperty('website');
        expect(mockShop).toHaveProperty('verified');
        expect(mockShop).toHaveProperty('featured');
      });
    });

    describe('Dienstleister Interface', () => {
      it('has correct structure', () => {
        const mockDienstleister: Dienstleister = {
          id: '1',
          name: 'John Doe',
          company: 'Test Company',
          serviceType: 'Consulting',
          description: 'Professional consulting services',
          location: 'Hamburg',
          rating: 4.7,
          reviewCount: 18,
          experience: '5+ Jahre',
          verified: true,
          image: 'john.jpg',
          phone: '+49 40 123456',
          email: 'john@testcompany.com'
        };

        expect(mockDienstleister.id).toBe('1');
        expect(mockDienstleister.name).toBe('John Doe');
        expect(mockDienstleister.company).toBe('Test Company');
        expect(mockDienstleister.serviceType).toBe('Consulting');
        expect(mockDienstleister.verified).toBe(true);
        expect(typeof mockDienstleister.rating).toBe('number');
        expect(typeof mockDienstleister.reviewCount).toBe('number');
      });

      it('handles all required properties', () => {
        const mockDienstleister: Dienstleister = {
          id: '2',
          name: 'Jane Smith',
          company: 'Another Company',
          serviceType: 'Design',
          description: 'Creative design services',
          location: 'Köln',
          rating: 4.2,
          reviewCount: 8,
          experience: '3+ Jahre',
          verified: false,
          image: 'jane.jpg',
          phone: '+49 221 654321',
          email: 'jane@anothercompany.com'
        };

        expect(mockDienstleister).toHaveProperty('id');
        expect(mockDienstleister).toHaveProperty('name');
        expect(mockDienstleister).toHaveProperty('company');
        expect(mockDienstleister).toHaveProperty('serviceType');
        expect(mockDienstleister).toHaveProperty('description');
        expect(mockDienstleister).toHaveProperty('location');
        expect(mockDienstleister).toHaveProperty('rating');
        expect(mockDienstleister).toHaveProperty('reviewCount');
        expect(mockDienstleister).toHaveProperty('experience');
        expect(mockDienstleister).toHaveProperty('verified');
        expect(mockDienstleister).toHaveProperty('image');
        expect(mockDienstleister).toHaveProperty('phone');
        expect(mockDienstleister).toHaveProperty('email');
      });
    });

    describe('User Interface', () => {
      it('has correct structure', () => {
        const mockUser: User = {
          id: '1',
          name: 'Test User',
          username: 'testuser',
          bio: 'A test user bio',
          location: 'Frankfurt',
          rating: 4.3,
          reviewCount: 15,
          memberSince: '2023-01-15',
          lastActive: '2024-01-20',
          verified: true,
          premium: false,
          interests: ['Technology', 'Sports'],
          listingsCount: 8,
          followers: 45,
          following: 23,
          avatar: 'user-avatar.jpg',
          phone: '+49 69 123456',
          email: 'user@test.com'
        };

        expect(mockUser.id).toBe('1');
        expect(mockUser.username).toBe('testuser');
        expect(mockUser.verified).toBe(true);
        expect(mockUser.premium).toBe(false);
        expect(Array.isArray(mockUser.interests)).toBe(true);
        expect(typeof mockUser.listingsCount).toBe('number');
        expect(typeof mockUser.followers).toBe('number');
        expect(typeof mockUser.following).toBe('number');
      });

      it('handles all required properties', () => {
        const mockUser: User = {
          id: '2',
          name: 'Another User',
          username: 'anotheruser',
          bio: 'Another test user bio',
          location: 'Dortmund',
          rating: 3.9,
          reviewCount: 7,
          memberSince: '2023-06-10',
          lastActive: '2024-01-19',
          verified: false,
          premium: true,
          interests: ['Music', 'Art'],
          listingsCount: 3,
          followers: 12,
          following: 8,
          avatar: 'another-avatar.jpg',
          phone: '+49 231 654321',
          email: 'another@test.com'
        };

        expect(mockUser).toHaveProperty('id');
        expect(mockUser).toHaveProperty('name');
        expect(mockUser).toHaveProperty('username');
        expect(mockUser).toHaveProperty('bio');
        expect(mockUser).toHaveProperty('location');
        expect(mockUser).toHaveProperty('rating');
        expect(mockUser).toHaveProperty('reviewCount');
        expect(mockUser).toHaveProperty('memberSince');
        expect(mockUser).toHaveProperty('lastActive');
        expect(mockUser).toHaveProperty('verified');
        expect(mockUser).toHaveProperty('premium');
        expect(mockUser).toHaveProperty('interests');
        expect(mockUser).toHaveProperty('listingsCount');
        expect(mockUser).toHaveProperty('followers');
        expect(mockUser).toHaveProperty('following');
        expect(mockUser).toHaveProperty('avatar');
        expect(mockUser).toHaveProperty('phone');
        expect(mockUser).toHaveProperty('email');
      });
    });

    describe('Event Interface', () => {
      it('has correct structure', () => {
        const mockEvent: Event = {
          id: '1',
          title: 'Test Event',
          description: 'A test event description',
          category: 'Technology',
          location: 'Berlin',
          date: '2024-02-15',
          time: '18:00',
          price: '25€',
          organizer: 'Test Organizer',
          verified: true,
          image: 'event.jpg',
          rating: 4.6,
          reviewCount: 32,
          attendees: 45,
          maxAttendees: 100,
          tags: ['Tech', 'Networking'],
          phone: '+49 30 123456',
          email: 'event@test.com',
          website: 'https://testevent.com'
        };

        expect(mockEvent.id).toBe('1');
        expect(mockEvent.title).toBe('Test Event');
        expect(mockEvent.verified).toBe(true);
        expect(Array.isArray(mockEvent.tags)).toBe(true);
        expect(typeof mockEvent.attendees).toBe('number');
        expect(typeof mockEvent.maxAttendees).toBe('number');
        expect(mockEvent.price).toBe('25€');
      });

      it('handles optional properties', () => {
        const mockEvent: Event = {
          id: '2',
          title: 'Simple Event',
          description: 'A simple event',
          category: 'Sports',
          location: 'München',
          date: '2024-03-20',
          time: '14:00',
          price: 15,
          organizer: 'Simple Organizer',
          verified: false,
          image: 'simple-event.jpg',
          rating: 4.1,
          reviewCount: 18,
          attendees: 23,
          maxAttendees: 50,
          tags: ['Sports', 'Fitness']
          // Optional properties omitted
        };

        expect(mockEvent).toHaveProperty('id');
        expect(mockEvent).toHaveProperty('title');
        expect(mockEvent).toHaveProperty('description');
        expect(mockEvent).toHaveProperty('category');
        expect(mockEvent).toHaveProperty('location');
        expect(mockEvent).toHaveProperty('date');
        expect(mockEvent).toHaveProperty('time');
        expect(mockEvent).toHaveProperty('price');
        expect(mockEvent).toHaveProperty('organizer');
        expect(mockEvent).toHaveProperty('verified');
        expect(mockEvent).toHaveProperty('image');
        expect(mockEvent).toHaveProperty('rating');
        expect(mockEvent).toHaveProperty('reviewCount');
        expect(mockEvent).toHaveProperty('attendees');
        expect(mockEvent).toHaveProperty('maxAttendees');
        expect(mockEvent).toHaveProperty('tags');
      });
    });

    describe('NewsArticle Interface', () => {
      it('has correct structure', () => {
        const mockArticle: NewsArticle = {
          id: '1',
          title: 'Test Article',
          summary: 'A test article summary',
          content: 'Full article content here...',
          category: 'Technology',
          location: 'Berlin',
          author: 'Test Author',
          publishDate: '2024-01-20',
          tags: ['Tech', 'News'],
          featured: true,
          trending: false,
          readTime: 5,
          views: 1250,
          bookmarks: 45,
          image: 'article.jpg'
        };

        expect(mockArticle.id).toBe('1');
        expect(mockArticle.title).toBe('Test Article');
        expect(mockArticle.featured).toBe(true);
        expect(mockArticle.trending).toBe(false);
        expect(typeof mockArticle.readTime).toBe('number');
        expect(typeof mockArticle.views).toBe('number');
        expect(typeof mockArticle.bookmarks).toBe('number');
        expect(Array.isArray(mockArticle.tags)).toBe(true);
      });

      it('handles optional image property', () => {
        const mockArticle: NewsArticle = {
          id: '2',
          title: 'Article Without Image',
          summary: 'An article without an image',
          content: 'Content here...',
          category: 'Sports',
          location: 'Hamburg',
          author: 'Another Author',
          publishDate: '2024-01-19',
          tags: ['Sports'],
          featured: false,
          trending: true,
          readTime: 3,
          views: 850,
          bookmarks: 23
          // image property omitted
        };

        expect(mockArticle).toHaveProperty('id');
        expect(mockArticle).toHaveProperty('title');
        expect(mockArticle).toHaveProperty('summary');
        expect(mockArticle).toHaveProperty('content');
        expect(mockArticle).toHaveProperty('category');
        expect(mockArticle).toHaveProperty('location');
        expect(mockArticle).toHaveProperty('author');
        expect(mockArticle).toHaveProperty('publishDate');
        expect(mockArticle).toHaveProperty('tags');
        expect(mockArticle).toHaveProperty('featured');
        expect(mockArticle).toHaveProperty('trending');
        expect(mockArticle).toHaveProperty('readTime');
        expect(mockArticle).toHaveProperty('views');
        expect(mockArticle).toHaveProperty('bookmarks');
      });
    });

    describe('JobPosition Interface', () => {
      it('has correct structure', () => {
        const mockJob: JobPosition = {
          id: '1',
          title: 'Software Developer',
          department: 'Engineering',
          location: 'Berlin',
          type: 'full-time',
          experience: '3+ Jahre',
          salary: '60.000€ - 80.000€',
          description: 'Develop software solutions',
          requirements: ['JavaScript', 'React', 'Node.js'],
          benefits: ['Remote work', 'Health insurance'],
          featured: true
        };

        expect(mockJob.id).toBe('1');
        expect(mockJob.title).toBe('Software Developer');
        expect(mockJob.department).toBe('Engineering');
        expect(mockJob.type).toBe('full-time');
        expect(mockJob.featured).toBe(true);
        expect(Array.isArray(mockJob.requirements)).toBe(true);
        expect(Array.isArray(mockJob.benefits)).toBe(true);
      });

      it('handles all required properties', () => {
        const mockJob: JobPosition = {
          id: '2',
          title: 'Designer',
          department: 'Design',
          location: 'München',
          type: 'part-time',
          experience: '2+ Jahre',
          salary: '35.000€ - 50.000€',
          description: 'Create beautiful designs',
          requirements: ['Figma', 'Adobe Creative Suite'],
          benefits: ['Creative freedom', 'Modern tools']
          // featured property omitted
        };

        expect(mockJob).toHaveProperty('id');
        expect(mockJob).toHaveProperty('title');
        expect(mockJob).toHaveProperty('department');
        expect(mockJob).toHaveProperty('location');
        expect(mockJob).toHaveProperty('type');
        expect(mockJob).toHaveProperty('experience');
        expect(mockJob).toHaveProperty('salary');
        expect(mockJob).toHaveProperty('description');
        expect(mockJob).toHaveProperty('requirements');
        expect(mockJob).toHaveProperty('benefits');
      });
    });
  });

  describe('Cache Functions', () => {
    it('caches data correctly', () => {
      const testData = [
        { id: '1', name: 'Test Item 1' },
        { id: '2', name: 'Test Item 2' }
      ];

      const result1 = getMockData('test-key', testData);
      const result2 = getMockData('test-key', testData);

      expect(result1).toEqual(testData);
      expect(result2).toEqual(testData);
      expect(result1).toBe(result2); // Same reference due to caching
    });

    it('handles different cache keys', () => {
      const data1 = [{ id: '1', name: 'Data 1' }];
      const data2 = [{ id: '2', name: 'Data 2' }];

      const result1 = getMockData('key1', data1);
      const result2 = getMockData('key2', data2);

      expect(result1).toEqual(data1);
      expect(result2).toEqual(data2);
      expect(result1).not.toBe(result2); // Different references
    });

    it('clears cache correctly', () => {
      const testData = [{ id: '1', name: 'Test' }];
      
      getMockData('test-key', testData);
      expect(getMockData('test-key', [])).toEqual(testData); // Cached data returned
      
      clearMockDataCache();
      expect(getMockData('test-key', [])).toEqual([]); // Fresh data returned
    });

    it('handles empty arrays', () => {
      const emptyData: any[] = [];
      
      const result = getMockData('empty-key', emptyData);
      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });

    it('handles complex objects', () => {
      const complexData = [
        {
          id: '1',
          nested: {
            value: 'test',
            array: [1, 2, 3],
            object: { key: 'value' }
          }
        }
      ];

      const result = getMockData('complex-key', complexData);
      expect(result).toEqual(complexData);
      expect(result[0].nested.value).toBe('test');
      expect(result[0].nested.array).toEqual([1, 2, 3]);
      expect(result[0].nested.object.key).toBe('value');
    });
  });

  describe('Type Safety', () => {
    it('maintains type information', () => {
      const shops: Shop[] = [
        {
          id: '1',
          name: 'Test Shop',
          description: 'A test shop',
          category: 'Electronics',
          location: 'Berlin',
          rating: 4.5,
          reviewCount: 25,
          listingCount: 150,
          image: 'shop.jpg',
          phone: '+49 30 123456',
          email: 'shop@test.com',
          website: 'https://testshop.com',
          verified: true,
          featured: false
        }
      ];

      const result = getMockData<Shop>('shops', shops);
      
      // TypeScript should recognize this as Shop[]
      expect(result[0]).toHaveProperty('rating');
      expect(result[0]).toHaveProperty('verified');
      expect(typeof result[0].rating).toBe('number');
      expect(typeof result[0].verified).toBe('boolean');
    });

    it('handles generic types correctly', () => {
      const numbers = [1, 2, 3, 4, 5];
      const strings = ['a', 'b', 'c'];
      
      const numberResult = getMockData<number>('numbers', numbers);
      const stringResult = getMockData<string>('strings', strings);
      
      expect(numberResult).toEqual(numbers);
      expect(stringResult).toEqual(strings);
      expect(typeof numberResult[0]).toBe('number');
      expect(typeof stringResult[0]).toBe('string');
    });
  });

  describe('Edge Cases', () => {
    it('handles null and undefined values in data', () => {
      const dataWithNulls = [
        { id: '1', name: 'Item 1', value: null },
        { id: '2', name: 'Item 2', value: undefined }
      ];

      const result = getMockData('nulls-key', dataWithNulls);
      expect(result).toEqual(dataWithNulls);
      expect(result[0].value).toBeNull();
      expect(result[1].value).toBeUndefined();
    });

    it('handles special characters in data', () => {
      const dataWithSpecialChars = [
        { id: '1', name: 'Item with äöüß€$%&', description: 'Special chars: <>&"' }
      ];

      const result = getMockData('special-chars-key', dataWithSpecialChars);
      expect(result).toEqual(dataWithSpecialChars);
      expect(result[0].name).toBe('Item with äöüß€$%&');
      expect(result[0].description).toBe('Special chars: <>&"');
    });

    it('handles very long strings', () => {
      const longString = 'A'.repeat(1000);
      const dataWithLongString = [{ id: '1', name: longString }];

      const result = getMockData('long-string-key', dataWithLongString);
      expect(result).toEqual(dataWithLongString);
      expect(result[0].name).toBe(longString);
      expect(result[0].name.length).toBe(1000);
    });

    it('handles empty cache keys', () => {
      const testData = [{ id: '1', name: 'Test' }];
      
      const result = getMockData('', testData);
      expect(result).toEqual(testData);
    });
  });

  describe('Integration Tests', () => {
    it('works with multiple data types', () => {
      const shops: Shop[] = [
        {
          id: '1',
          name: 'Shop 1',
          description: 'First shop',
          category: 'Electronics',
          location: 'Berlin',
          rating: 4.5,
          reviewCount: 25,
          listingCount: 150,
          image: 'shop1.jpg',
          phone: '+49 30 123456',
          email: 'shop1@test.com',
          website: 'https://shop1.com',
          verified: true,
          featured: false
        }
      ];

      const users: User[] = [
        {
          id: '1',
          name: 'User 1',
          username: 'user1',
          bio: 'First user',
          location: 'München',
          rating: 4.2,
          reviewCount: 15,
          memberSince: '2023-01-01',
          lastActive: '2024-01-20',
          verified: true,
          premium: false,
          interests: ['Tech'],
          listingsCount: 5,
          followers: 20,
          following: 10,
          avatar: 'user1.jpg',
          phone: '+49 89 654321',
          email: 'user1@test.com'
        }
      ];

      const shopsResult = getMockData<Shop>('shops', shops);
      const usersResult = getMockData<User>('users', users);

      expect(shopsResult).toEqual(shops);
      expect(usersResult).toEqual(users);
      expect(shopsResult[0]).toHaveProperty('verified');
      expect(usersResult[0]).toHaveProperty('premium');
    });

    it('maintains data integrity across operations', () => {
      const originalData = [{ id: '1', name: 'Original' }];
      
      // Cache the data
      const cachedResult = getMockData('integrity-key', originalData);
      
      // Modify the cached result
      cachedResult[0].name = 'Modified';
      
      // Get fresh data (should not be affected)
      const freshResult = getMockData('integrity-key', [{ id: '1', name: 'Fresh' }]);
      
      // The cache returns the same reference, so modifications affect both
      expect(freshResult).toEqual([{ id: '1', name: 'Modified' }]);
      expect(cachedResult[0].name).toBe('Modified');
    });
  });
});
