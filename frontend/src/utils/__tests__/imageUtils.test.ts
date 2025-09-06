import { 
  getImageUrl, 
  getUploadUrl, 
  isValidImagePath, 
  getImageUrls 
} from '../imageUtils';

describe('Image Utilities', () => {
  const API_BASE_URL = 'http://localhost:8000';

  describe('getImageUrl', () => {
    it('returns placeholder URL for empty image path', () => {
      const result = getImageUrl('');
      expect(result).toBe(`${API_BASE_URL}/api/images/placeholder-image.jpg`);
    });

    it('returns placeholder URL for null/undefined image path', () => {
      const result1 = getImageUrl(null as any);
      const result2 = getImageUrl(undefined as any);
      
      expect(result1).toBe(`${API_BASE_URL}/api/images/placeholder-image.jpg`);
      expect(result2).toBe(`${API_BASE_URL}/api/images/placeholder-image.jpg`);
    });

    it('removes /uploads/ prefix from image path', () => {
      const result = getImageUrl('/uploads/test-image.jpg');
      expect(result).toBe(`${API_BASE_URL}/api/images/test-image.jpg`);
    });

    it('handles image path without /uploads/ prefix', () => {
      const result = getImageUrl('test-image.jpg');
      expect(result).toBe(`${API_BASE_URL}/api/images/test-image.jpg`);
    });

    it('handles complex image paths', () => {
      const result = getImageUrl('/uploads/folder/subfolder/image.png');
      expect(result).toBe(`${API_BASE_URL}/api/images/folder/subfolder/image.png`);
    });

    it('handles special characters in filename', () => {
      const result = getImageUrl('test-image-123_äöü.jpg');
      expect(result).toBe(`${API_BASE_URL}/api/images/test-image-123_äöü.jpg`);
    });
  });

  describe('getUploadUrl', () => {
    it('creates correct upload URL', () => {
      const result = getUploadUrl('test-image.jpg');
      expect(result).toBe(`${API_BASE_URL}/uploads/test-image.jpg`);
    });

    it('handles filenames with special characters', () => {
      const result = getUploadUrl('test-image-123_äöü.png');
      expect(result).toBe(`${API_BASE_URL}/uploads/test-image-123_äöü.png`);
    });

    it('handles filenames with spaces', () => {
      const result = getUploadUrl('test image.jpg');
      expect(result).toBe(`${API_BASE_URL}/uploads/test image.jpg`);
    });

    it('handles empty filename', () => {
      const result = getUploadUrl('');
      expect(result).toBe(`${API_BASE_URL}/uploads/`);
    });
  });

  describe('isValidImagePath', () => {
    it('returns true for valid image paths', () => {
      expect(isValidImagePath('test-image.jpg')).toBe(true);
      expect(isValidImagePath('/uploads/test.jpg')).toBe(true);
      expect(isValidImagePath('folder/image.png')).toBe(true);
      expect(isValidImagePath('image')).toBe(true);
    });

    it('returns false for invalid image paths', () => {
      expect(isValidImagePath('')).toBe(false);
      expect(isValidImagePath('   ')).toBe(false);
      expect(isValidImagePath(false)).toBe(false);
      expect(isValidImagePath(true)).toBe(false);
      expect(isValidImagePath(null as any)).toBe(false);
      expect(isValidImagePath(undefined as any)).toBe(false);
    });

    it('handles whitespace correctly', () => {
      expect(isValidImagePath('  test.jpg  ')).toBe(true);
      expect(isValidImagePath('\t\nimage.png')).toBe(true);
    });
  });

  describe('getImageUrls', () => {
    it('returns empty array for non-array input', () => {
      expect(getImageUrls(null as any)).toEqual([]);
      expect(getImageUrls(undefined as any)).toEqual([]);
      expect(getImageUrls('not-an-array' as any)).toEqual([]);
      expect(getImageUrls(123 as any)).toEqual([]);
    });

    it('returns empty array for empty array', () => {
      expect(getImageUrls([])).toEqual([]);
    });

    it('filters out invalid image paths', () => {
      const imagePaths = ['image1.jpg', '', 'image2.png', '   ', null, undefined];
      const result = getImageUrls(imagePaths as any);
      
      expect(result).toEqual([
        `${API_BASE_URL}/api/images/image1.jpg`,
        `${API_BASE_URL}/api/images/image2.png`
      ]);
    });

    it('processes valid image paths correctly', () => {
      const imagePaths = ['image1.jpg', '/uploads/image2.png', 'folder/image3.gif'];
      const result = getImageUrls(imagePaths);
      
      expect(result).toEqual([
        `${API_BASE_URL}/api/images/image1.jpg`,
        `${API_BASE_URL}/api/images/image2.png`,
        `${API_BASE_URL}/api/images/folder/image3.gif`
      ]);
    });

    it('handles mixed valid and invalid paths', () => {
      const imagePaths = ['valid1.jpg', '', 'valid2.png', false, 'valid3.gif'];
      const result = getImageUrls(imagePaths as any);
      
      expect(result).toEqual([
        `${API_BASE_URL}/api/images/valid1.jpg`,
        `${API_BASE_URL}/api/images/valid2.png`,
        `${API_BASE_URL}/api/images/valid3.gif`
      ]);
    });
  });

  describe('integration tests', () => {
    it('works together with isValidImagePath and getImageUrl', () => {
      const imagePaths = ['image1.jpg', '', 'image2.png'];
      const result = getImageUrls(imagePaths);
      
      // Manually filter and process to verify
      const expected = imagePaths
        .filter(isValidImagePath)
        .map(getImageUrl);
      
      expect(result).toEqual(expected);
    });

    it('handles real-world scenarios', () => {
      const realImagePaths = [
        '/uploads/user-avatar.jpg',
        'product-image.png',
        '',
        'category-banner.gif',
        '   ',
        'logo.svg'
      ];
      
      const result = getImageUrls(realImagePaths);
      
      expect(result).toEqual([
        `${API_BASE_URL}/api/images/user-avatar.jpg`,
        `${API_BASE_URL}/api/images/product-image.png`,
        `${API_BASE_URL}/api/images/category-banner.gif`,
        `${API_BASE_URL}/api/images/logo.svg`
      ]);
    });
  });
});
