import { Response } from 'express';
import { prisma } from '../config/db';
import { logger } from '../config/logger';
import { aiManager } from '../ai/aiManager';
import { AuthenticatedRequest } from '../middleware/auth';
import { textScanSchema } from '../utils/validators';

export const scanImage = async (req: AuthenticatedRequest, res: Response) => {
  const startTime = Date.now();
  const file = req.file;
  const provider = req.body.provider || 'AUTO';
  const userId = req.user?.id;

  if (!file) {
    return res.status(400).json({ error: 'Please upload an image file (PNG, JPG, JPEG, WEBP)' });
  }

  try {
    const { engine, providerName } = aiManager.getEngine(provider);
    
    // Perform AI analysis
    const analysis = await engine.analyzeImage(file.path);
    
    const processingTime = Date.now() - startTime;
    
    // Save to Database
    const history = await prisma.detectionHistory.create({
      data: {
        userId: userId!,
        fileName: file.originalname,
        fileType: 'IMAGE',
        fileUrl: `/uploads/${file.filename}`, // relative static file path
        result: analysis.isAI ? 'AI' : 'HUMAN',
        confidence: analysis.confidence,
        processingTime,
        imageResult: {
          create: {
            metadata: analysis.metadata ? JSON.stringify(analysis.metadata) : null,
            compressionFactor: analysis.compressionFactor,
            noiseScore: analysis.noiseScore,
            ganArtifactScore: analysis.ganArtifactScore,
            explanation: analysis.explanation
          }
        }
      },
      include: {
        imageResult: true
      }
    });

    // Log API usage stats
    await aiManager.logUsage(providerName, 'IMAGE_DETECTION', 200, processingTime);

    res.json({
      message: 'Image scan complete',
      historyId: history.id,
      fileName: history.fileName,
      fileType: history.fileType,
      fileUrl: history.fileUrl,
      result: history.result,
      confidence: history.confidence,
      processingTime: history.processingTime,
      details: history.imageResult
    });
  } catch (error: any) {
    logger.error('Image scan failed:', error);
    const processingTime = Date.now() - startTime;
    await aiManager.logUsage(provider, 'IMAGE_DETECTION', 500, processingTime);
    res.status(500).json({ error: 'AI analysis service failed. Please try again later.' });
  }
};

export const scanVideo = async (req: AuthenticatedRequest, res: Response) => {
  const startTime = Date.now();
  const file = req.file;
  const provider = req.body.provider || 'AUTO';
  const userId = req.user?.id;

  if (!file) {
    return res.status(400).json({ error: 'Please upload a video file (MP4, MOV, AVI)' });
  }

  try {
    const { engine, providerName } = aiManager.getEngine(provider);
    
    // Perform AI analysis
    const analysis = await engine.analyzeVideo(file.path);
    
    const processingTime = Date.now() - startTime;
    
    // Save to Database
    const history = await prisma.detectionHistory.create({
      data: {
        userId: userId!,
        fileName: file.originalname,
        fileType: 'VIDEO',
        fileUrl: `/uploads/${file.filename}`,
        result: analysis.isAI ? 'AI' : 'HUMAN',
        confidence: analysis.confidence,
        processingTime,
        videoResult: {
          create: {
            faceConsistency: analysis.faceConsistency,
            lipSyncScore: analysis.lipSyncScore,
            temporalInconsistency: analysis.temporalInconsistency,
            suspiciousFrames: JSON.stringify(analysis.suspiciousFrames),
            timelineAnalysis: JSON.stringify(analysis.timelineAnalysis),
            explanation: analysis.explanation
          }
        }
      },
      include: {
        videoResult: true
      }
    });

    // Log API usage stats
    await aiManager.logUsage(providerName, 'VIDEO_DETECTION', 200, processingTime);

    res.json({
      message: 'Video scan complete',
      historyId: history.id,
      fileName: history.fileName,
      fileType: history.fileType,
      fileUrl: history.fileUrl,
      result: history.result,
      confidence: history.confidence,
      processingTime: history.processingTime,
      details: {
        ...history.videoResult,
        suspiciousFrames: analysis.suspiciousFrames,
        timelineAnalysis: analysis.timelineAnalysis
      }
    });
  } catch (error: any) {
    logger.error('Video scan failed:', error);
    const processingTime = Date.now() - startTime;
    await aiManager.logUsage(provider, 'VIDEO_DETECTION', 500, processingTime);
    res.status(500).json({ error: 'AI video analysis failed. Please verify format.' });
  }
};

export const scanText = async (req: AuthenticatedRequest, res: Response) => {
  const startTime = Date.now();
  const userId = req.user?.id;

  try {
    const validated = textScanSchema.parse(req.body);
    const { engine, providerName } = aiManager.getEngine(validated.provider);

    // Perform AI analysis
    const analysis = await engine.analyzeText(validated.text);
    
    const processingTime = Date.now() - startTime;

    // Save to Database
    const history = await prisma.detectionHistory.create({
      data: {
        userId: userId!,
        fileName: validated.text.substring(0, 30) + '...',
        fileType: 'TEXT',
        fileUrl: null,
        result: analysis.isAI ? 'AI' : 'HUMAN',
        confidence: analysis.confidence,
        processingTime,
        textResult: {
          create: {
            perplexity: analysis.perplexity,
            burstiness: analysis.burstiness,
            sentenceAnalysis: JSON.stringify(analysis.sentenceAnalysis),
            suspiciousParagraphs: JSON.stringify(analysis.suspiciousParagraphs),
            explanation: analysis.explanation
          }
        }
      },
      include: {
        textResult: true
      }
    });

    // Log API usage stats
    await aiManager.logUsage(providerName, 'TEXT_DETECTION', 200, processingTime);

    res.json({
      message: 'Text scan complete',
      historyId: history.id,
      fileName: history.fileName,
      fileType: history.fileType,
      result: history.result,
      confidence: history.confidence,
      processingTime: history.processingTime,
      details: {
        ...history.textResult,
        sentenceAnalysis: analysis.sentenceAnalysis,
        suspiciousParagraphs: analysis.suspiciousParagraphs
      }
    });
  } catch (error: any) {
    logger.error('Text scan failed:', error);
    const processingTime = Date.now() - startTime;
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    await aiManager.logUsage(req.body.provider || 'AUTO', 'TEXT_DETECTION', 500, processingTime);
    res.status(500).json({ error: 'Text analysis failed. Please try again.' });
  }
};
