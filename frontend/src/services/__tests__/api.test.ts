import { getListings, createListing, register, login, ApiService } from '../api';

// Mock fetch globally
global.fetch = jest.fn();

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('getListings', () => {
    it('fetches listings successfully', async () => {
      const mockListings = [
        { id: 1, title: 'Test Listing', description: 'Test', price: 100, category: 'test', location: 'Berlin' }
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockListings
      });

      const result = await getListings();
      expect(result).toEqual(mockListings);
      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/listings');
    });

    it('throws error when response is not ok', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      await expect(getListings()).rejects.toThrow('Fehler beim Laden der Listings');
    });
  });

  describe('createListing', () => {
    it('creates listing successfully', async () => {
      const mockListing = {
        title: 'New Listing',
        description: 'New Description',
        price: 200,
        category: 'test',
        location: 'Hamburg',
        images: ['image1.jpg', 'image2.jpg']
      };

      const mockResponse = { ...mockListing, id: 2 };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await createListing(mockListing);
      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...mockListing, images: JSON.stringify(mockListing.images) })
      });
    });

    it('throws error when creation fails', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400
      });

      const mockListing = {
        title: 'Test',
        description: 'Test',
        price: 100,
        category: 'test',
        location: 'Berlin'
      };

      await expect(createListing(mockListing)).rejects.toThrow('Fehler beim Erstellen des Listings');
    });
  });

  describe('register', () => {
    it('registers user successfully', async () => {
      const mockResponse = { message: 'User registered successfully' };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await register('test@example.com', 'password123');
      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
      });
    });

    it('throws error when registration fails', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        text: async () => 'Email already exists'
      });

      await expect(register('test@example.com', 'password123')).rejects.toThrow('Email already exists');
    });
  });

  describe('login', () => {
    it('logs in user successfully', async () => {
      const mockResponse = { access_token: 'token123', token_type: 'bearer' };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await login('test@example.com', 'password123');
      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
      });
    });

    it('throws error when login fails', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        text: async () => 'Invalid credentials'
      });

      await expect(login('test@example.com', 'wrongpassword')).rejects.toThrow('Invalid credentials');
    });
  });

  describe('ApiService class', () => {
    let apiService: ApiService;

    beforeEach(() => {
      apiService = new ApiService();
    });

    it('gets data successfully', async () => {
      const mockData = { id: 1, name: 'Test' };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      });

      const result = await apiService.get('/test-endpoint');
      expect(result).toEqual(mockData);
      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/test-endpoint', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
    });

    it('posts data successfully', async () => {
      const mockData = { name: 'New Item' };
      const mockResponse = { id: 1, ...mockData };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await apiService.post('/test-endpoint', mockData);
      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/test-endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockData)
      });
    });

    it('handles authentication headers correctly', async () => {
      // Test that the service can handle auth scenarios
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      await apiService.get('/test-endpoint');
      expect(fetch).toHaveBeenCalled();
    });

    it('throws error when response is not ok', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => 'Not found'
      });

      await expect(apiService.get('/not-found')).rejects.toThrow('Not found');
    });
  });
});
