import fs from 'fs';
import { IAIEngine, ImageAnalysisResult, VideoAnalysisResult, TextAnalysisResult } from './types';
import { logger } from '../config/logger';

export class MockEngine implements IAIEngine {
  async analyzeImage(filePath: string): Promise<ImageAnalysisResult> {
    logger.info(`MockEngine: Analyzing image ${filePath}`);
    
    // Read basic file statistics
    const stats = fs.statSync(filePath);
    const fileSize = stats.size;
    const fileExt = filePath.split('.').pop()?.toUpperCase() || 'UNKNOWN';

    // Simulate scanning compression and noise
    // Real analysis would parse EXIF, pixel histograms, etc.
    // We compute a hash of the file size to make the mock output deterministic yet varied
    const hash = fileSize % 100;
    
    const noiseScore = Number((0.15 + (hash % 40) / 100).toFixed(4)); // 0.15 to 0.55
    const compressionFactor = Number((0.4 + (hash % 50) / 100).toFixed(4)); // 0.4 to 0.9
    const ganArtifactScore = Number(((hash % 100) / 100).toFixed(4)); // 0.0 to 1.0

    // Heuristics for "AI" detection
    // e.g. very low noise, high compression, specific file sizes
    const isAI = ganArtifactScore > 0.65 || (noiseScore < 0.25 && compressionFactor > 0.85);
    const confidence = isAI 
      ? Number((60 + (ganArtifactScore * 35)).toFixed(2)) 
      : Number((65 + (1 - ganArtifactScore) * 30).toFixed(2));

    let explanation = '';
    if (isAI) {
      explanation = `Automated analysis detected anomalies in pixel distributions typical of GAN and Diffusion models. The noise floor is unnaturally uniform (${(noiseScore * 100).toFixed(1)}% variance), and edge frequency analysis reveals geometric artifacts in high-frequency regions. No camera EXIF metadata was found.`;
    } else {
      explanation = `The image exhibits natural sensor noise levels (${(noiseScore * 100).toFixed(1)}% variance) and standard JPEG compression artifacts. Organic pixel clustering and standard EXIF metadata signatures conform to physical optical capture devices.`;
    }

    return {
      isAI,
      confidence,
      metadata: {
        format: fileExt,
        width: 1920, // default placeholder
        height: 1080,
        size: fileSize,
        hasExif: !isAI,
        software: isAI ? undefined : 'Apple iPhone 15 Pro'
      },
      compressionFactor,
      noiseScore,
      ganArtifactScore,
      explanation
    };
  }

  async analyzeVideo(filePath: string): Promise<VideoAnalysisResult> {
    logger.info(`MockEngine: Analyzing video ${filePath}`);
    const stats = fs.statSync(filePath);
    const hash = stats.size % 100;

    const faceConsistency = Number((0.4 + (hash % 55) / 100).toFixed(4)); // 0.4 to 0.95
    const lipSyncScore = Number((0.5 + (hash % 45) / 100).toFixed(4));    // 0.5 to 0.95
    const temporalInconsistency = Number(((hash % 85) / 100).toFixed(4)); // 0.0 to 0.85

    const isAI = temporalInconsistency > 0.55 || faceConsistency < 0.6;
    const confidence = isAI 
      ? Number((70 + (temporalInconsistency * 25)).toFixed(2))
      : Number((75 + (faceConsistency * 20)).toFixed(2));

    // Timeline analysis - 10 segment steps
    const timelineAnalysis = [];
    const suspiciousFrames: number[] = [];
    for (let i = 0; i < 10; i++) {
      const stepHash = (hash + i * 17) % 100;
      const aiScore = isAI 
        ? Number((0.5 + stepHash / 200).toFixed(2)) 
        : Number((0.05 + stepHash / 500).toFixed(2));
      
      timelineAnalysis.push({ timestamp: i * 2, aiScore });
      
      if (aiScore > 0.6) {
        suspiciousFrames.push(i * 60 + Math.floor(stepHash / 2));
      }
    }

    let explanation = '';
    if (isAI) {
      explanation = `Automated spatiotemporal analysis detected face-swapping patterns and lip-synchronization discrepancies. Frame consistency drops in transition scenes, and frequency analysis of facial regions indicates synthesized warping (Deepfake).`;
    } else {
      explanation = `No deepfake patterns or facial coordinate warping were detected. Temporal frame consistency matches camera capture sequences, and facial movement vectors show natural 3D muscle contractions.`;
    }

    return {
      isAI,
      confidence,
      faceConsistency,
      lipSyncScore,
      temporalInconsistency,
      suspiciousFrames,
      timelineAnalysis,
      explanation
    };
  }

  async analyzeText(text: string): Promise<TextAnalysisResult> {
    logger.info('MockEngine: Analyzing text with statistical model');
    
    // Split text into words and sentences
    const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
    const words = text.split(/\s+/).map(w => w.trim().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"")).filter(w => w.length > 0);
    
    if (words.length === 0) {
      return {
        isAI: false,
        confidence: 100,
        perplexity: 0,
        burstiness: 0,
        sentenceAnalysis: [],
        suspiciousParagraphs: [],
        explanation: 'No readable text content provided.'
      };
    }

    // 1. Calculate Burstiness (standard deviation of sentence lengths in words)
    const sentenceLengths = sentences.map(s => s.split(/\s+/).filter(w => w.length > 0).length);
    const totalSentences = sentenceLengths.length || 1;
    const avgSentenceLength = sentenceLengths.reduce((a, b) => a + b, 0) / totalSentences;
    
    const variance = sentenceLengths.reduce((acc, len) => acc + Math.pow(len - avgSentenceLength, 2), 0) / totalSentences;
    const burstiness = Number(Math.sqrt(variance).toFixed(4)); // Standard deviation

    // 2. Perplexity Heuristic: Based on Lexical Diversity (Type-Token Ratio)
    // TTR = unique words / total words. Human writing is high, AI is low/repetitive
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    const typeTokenRatio = uniqueWords.size / words.length;
    
    // Standard AI Perplexity score representation.
    // Lower TTR implies lower perplexity (more predictable, like AI).
    const perplexity = Number((10 + typeTokenRatio * 150).toFixed(4));

    // Heuristic:
    // AI text usually has low burstiness (sentences are of uniform length, e.g. SD < 3)
    // and lower lexical diversity relative to length.
    // Let's calculate an AI Score (0 to 1)
    let aiScore = 0.5; // neutral base

    // Sentence length uniformity penalty
    if (burstiness < 2.5) {
      aiScore += 0.25;
    } else if (burstiness > 5.5) {
      aiScore -= 0.2;
    }

    // Sentence length avg penalty (AI loves 15-22 word sentences)
    if (avgSentenceLength > 12 && avgSentenceLength < 22) {
      aiScore += 0.1;
    }

    // Lexical diversity check (highly redundant = AI-like)
    if (typeTokenRatio < 0.45 && words.length > 50) {
      aiScore += 0.2;
    } else if (typeTokenRatio > 0.65) {
      aiScore -= 0.15;
    }

    // Bound score
    aiScore = Math.max(0.01, Math.min(0.99, aiScore));
    const isAI = aiScore > 0.55;
    
    const confidence = isAI 
      ? Number((aiScore * 100).toFixed(2)) 
      : Number(((1 - aiScore) * 100).toFixed(2));

    // Sentence-level analysis
    const sentenceAnalysis = sentences.map((sent, index) => {
      const sentWords = sent.split(/\s+/).filter(w => w.length > 0).length;
      // Sentences close to the average length get flagged higher if overall text is AI
      const lenDiff = Math.abs(sentWords - avgSentenceLength);
      let sentenceAIScore = isAI ? 0.6 : 0.2;
      
      if (lenDiff < 3) {
        sentenceAIScore += 0.25; // uniform sentence length
      } else {
        sentenceAIScore -= 0.15;
      }
      
      sentenceAIScore = Math.max(0.05, Math.min(0.95, sentenceAIScore));

      return {
        sentence: sent,
        score: Number(sentenceAIScore.toFixed(2)),
        perplexity: Number((perplexity * (0.8 + (index % 5) * 0.1)).toFixed(2))
      };
    });

    // Paragraph level highlights
    const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 0);
    const suspiciousParagraphs: number[] = [];
    paragraphs.forEach((p, idx) => {
      const pSentences = p.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
      if (pSentences.length > 0) {
        // If majority of sentences in paragraph are AI-like, flag it
        const aiSentences = pSentences.filter(s => {
          const sentWords = s.split(/\s+/).filter(w => w.length > 0).length;
          return Math.abs(sentWords - avgSentenceLength) < 3.5;
        });
        
        if (isAI && aiSentences.length / pSentences.length > 0.5) {
          suspiciousParagraphs.push(idx);
        }
      }
    });

    let explanation = '';
    if (isAI) {
      explanation = `Automated statistical analyzer detected highly uniform sentence structures and lower lexical diversity (burstiness index: ${burstiness.toFixed(2)}, perplexity rating: ${perplexity.toFixed(1)}). The text shows low syntax variability and repetitive transitional phrasing consistent with Transformer-based generation models (e.g. GPT-4, Gemini).`;
    } else {
      explanation = `The content demonstrates natural stylistic variance. Sentence lengths fluctuate dynamically (burstiness index: ${burstiness.toFixed(2)}), showing diverse syntactic patterns, conversational pauses, and high lexical diversity typical of organic human writing.`;
    }

    return {
      isAI,
      confidence,
      perplexity,
      burstiness,
      sentenceAnalysis,
      suspiciousParagraphs,
      explanation
    };
  }
}
