import { IAIEngine } from './types';
import { MockEngine } from './mockEngine';
import { GeminiEngine } from './geminiEngine';
import { HuggingFaceEngine } from './huggingFaceEngine';
import { logger } from '../config/logger';
import { prisma } from '../config/db';

class AIManager {
  private mockEngine: MockEngine;
  private geminiEngine: GeminiEngine | null = null;
  private hfEngine: HuggingFaceEngine | null = null;

  constructor() {
    this.mockEngine = new MockEngine();
    this.refreshEngines();
  }

  // Reload keys from process.env if updated at runtime
  public refreshEngines() {
    const geminiKey = process.env.GEMINI_API_KEY;
    const hfKey = process.env.HUGGING_FACE_API_KEY;

    if (geminiKey) {
      this.geminiEngine = new GeminiEngine(geminiKey);
      logger.info('AIManager: Gemini Engine initialized successfully.');
    } else {
      this.geminiEngine = null;
    }

    if (hfKey) {
      this.hfEngine = new HuggingFaceEngine(hfKey);
      logger.info('AIManager: Hugging Face Engine initialized successfully.');
    } else {
      this.hfEngine = null;
    }
  }

  public getEngine(requestedProvider?: string): { engine: IAIEngine; providerName: string } {
    const provider = (requestedProvider || 'AUTO').toUpperCase();

    if (provider === 'GEMINI') {
      if (this.geminiEngine) {
        return { engine: this.geminiEngine, providerName: 'GEMINI' };
      }
      logger.warn('AIManager: Gemini requested but key not set. Falling back to local statistical analysis.');
    }

    if (provider === 'HUGGING_FACE' || provider === 'HUGGINGFACE') {
      if (this.hfEngine) {
        return { engine: this.hfEngine, providerName: 'HUGGING_FACE' };
      }
      logger.warn('AIManager: HuggingFace requested but key not set. Falling back to local statistical analysis.');
    }

    // Auto resolution based on available keys
    if (provider === 'AUTO') {
      if (this.geminiEngine) {
        return { engine: this.geminiEngine, providerName: 'GEMINI' };
      }
      if (this.hfEngine) {
        return { engine: this.hfEngine, providerName: 'HUGGING_FACE' };
      }
    }

    // Default fallback
    return { engine: this.mockEngine, providerName: 'MOCK' };
  }

  // Logs usage statistics to the database
  public async logUsage(provider: string, endpoint: string, status: number, processingTime: number) {
    try {
      await prisma.aPIUsage.create({
        data: {
          provider,
          endpoint,
          status,
          processingTime
        }
      });
    } catch (error) {
      logger.error('Failed to log API usage:', error);
    }
  }
}

export const aiManager = new AIManager();
