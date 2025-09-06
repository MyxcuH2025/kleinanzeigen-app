/**
 * AI Service für Frontend-Integration
 * Verbindet das Frontend mit den AI-API-Endpunkten
 */

const API_BASE_URL = 'http://localhost:8000';

export interface OptimizeDescriptionRequest {
  title: string;
  description: string;
  category: string;
}

export interface OptimizeDescriptionResponse {
  optimized_description: string;
}

export interface SuggestCategoryRequest {
  title: string;
  description: string;
}

export interface SuggestCategoryResponse {
  suggested_category: string;
}

export interface ImproveSearchRequest {
  search_query: string;
}

export interface ImproveSearchResponse {
  improved_terms: string[];
}

export interface DetectSpamRequest {
  title: string;
  description: string;
}

export interface DetectSpamResponse {
  spam_score: number;
  suspicious_features: string[];
  recommendation: string;
  reason: string;
}

export interface GenerateTagsRequest {
  title: string;
  description: string;
  category: string;
}

export interface GenerateTagsResponse {
  tags: string[];
}

class AIService {
  private async makeRequest<T>(endpoint: string, data: any): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        let errorMessage = 'AI-Service Fehler';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch {
          // Falls JSON-Parsing fehlschlägt, verwende Standard-Fehlermeldung
          errorMessage = `Server-Fehler (${response.status}): ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error('AI Service Error:', error);
      // Bessere Fehlermeldung für den Benutzer
      if (error instanceof Error) {
        throw new Error(`AI-Service ist derzeit nicht verfügbar: ${error.message}`);
      }
      throw new Error('AI-Service ist derzeit nicht verfügbar');
    }
  }

  /**
   * Optimiert eine Anzeigenbeschreibung
   */
  async optimizeDescription(request: OptimizeDescriptionRequest): Promise<OptimizeDescriptionResponse> {
    return this.makeRequest<OptimizeDescriptionResponse>('/api/ai/test/optimize-description', request);
  }

  /**
   * Schlägt eine passende Kategorie vor
   */
  async suggestCategory(request: SuggestCategoryRequest): Promise<SuggestCategoryResponse> {
    return this.makeRequest<SuggestCategoryResponse>('/api/ai/test/suggest-category', request);
  }

  /**
   * Verbessert Suchbegriffe
   */
  async improveSearchTerms(request: ImproveSearchRequest): Promise<ImproveSearchResponse> {
    return this.makeRequest<ImproveSearchResponse>('/api/ai/improve-search', request);
  }

  /**
   * Erkennt Spam
   */
  async detectSpam(request: DetectSpamRequest): Promise<DetectSpamResponse> {
    return this.makeRequest<DetectSpamResponse>('/api/ai/detect-spam', request);
  }

  /**
   * Generiert Tags
   */
  async generateTags(request: GenerateTagsRequest): Promise<GenerateTagsResponse> {
    return this.makeRequest<GenerateTagsResponse>('/api/ai/generate-tags', request);
  }

  /**
   * Überprüft den AI-Service Status
   */
  async checkHealth(): Promise<{ status: string; service: string; api_key_configured: boolean }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/health`);
      if (!response.ok) {
        throw new Error('AI-Service nicht verfügbar');
      }
      return await response.json();
    } catch (error) {
      console.error('AI Health Check Error:', error);
      throw error;
    }
  }
}

export const aiService = new AIService();
