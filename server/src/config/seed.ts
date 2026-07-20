import bcrypt from 'bcryptjs';
import { prisma } from './db';
import { logger } from './logger';

async function seed() {
  logger.info('Database seeding started...');

  // 1. Clean existing records to avoid conflicts
  await prisma.aPIUsage.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.otp.deleteMany();
  await prisma.imageResult.deleteMany();
  await prisma.videoResult.deleteMany();
  await prisma.textResult.deleteMany();
  await prisma.detectionHistory.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create default Admin & User
  const passwordHash = await bcrypt.hash('admin123', 10);
  const userPasswordHash = await bcrypt.hash('user123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'TruthLens Admin',
      email: 'admin@truthlens.ai',
      passwordHash,
      role: 'ADMIN',
      isVerified: true,
      notifications: {
        create: [
          { title: 'Welcome Admin', message: 'System initialization successful. Database populated.' }
        ]
      }
    }
  });

  const demoUser = await prisma.user.create({
    data: {
      name: 'Alex Johnson',
      email: 'user@truthlens.ai',
      passwordHash: userPasswordHash,
      role: 'USER',
      isVerified: true,
      notifications: {
        create: [
          { title: 'Account Verified', message: 'Your account is verified. Begin running content scans.' }
        ]
      }
    }
  });

  logger.info('Users created: Admin (admin@truthlens.ai), User (user@truthlens.ai)');

  // 3. Create Sample Scan History for Demo User (last 10 days)
  const now = new Date();
  
  const textSample = `The artificial intelligence engine parsed the linguistic parameters of the dataset with high precision. Synthetic networks generated lexical tokens that exhibited low variance in sentence length, resulting in uniform burstiness scores. This stylistic homogenization makes the content highly predictable and typical of generative models.`;
  const humanSample = `I went for a walk this morning. The air was crisp, and the sun was just peeking over the hills. I noticed a stray dog chasing squirrels near the old oak tree – it made me smile. Life is full of these small, simple moments that remind you of the quiet beauty around us.`;

  const histories = [
    // Day 0 (today)
    {
      userId: demoUser.id,
      fileName: 'sunset_render.png',
      fileType: 'IMAGE',
      result: 'AI',
      confidence: 94.20,
      processingTime: 1200,
      daysAgo: 0,
      imageResult: {
        compressionFactor: 0.88,
        noiseScore: 0.12,
        ganArtifactScore: 0.95,
        explanation: 'Automated pixel pattern analysis detected high-frequency GAN artifacts and standard Stable Diffusion grid noise. Metadata is absent.'
      }
    },
    {
      userId: demoUser.id,
      fileName: 'academic_essay.txt',
      fileType: 'TEXT',
      result: 'AI',
      confidence: 88.50,
      processingTime: 450,
      daysAgo: 0,
      textResult: {
        perplexity: 22.4,
        burstiness: 1.8,
        sentenceAnalysis: JSON.stringify([
          { sentence: 'The artificial intelligence engine parsed the linguistic parameters with precision.', score: 0.9, perplexity: 15.2 },
          { sentence: 'Synthetic networks generated lexical tokens that exhibited low variance.', score: 0.85, perplexity: 18.1 }
        ]),
        suspiciousParagraphs: JSON.stringify([0]),
        explanation: 'Stylometric analysis indicates uniform sentence lengths (burstiness: 1.8) and highly predictable token sequences conforming to language model outputs.'
      }
    },
    // Day 1
    {
      userId: demoUser.id,
      fileName: 'family_photo.jpg',
      fileType: 'IMAGE',
      result: 'HUMAN',
      confidence: 98.40,
      processingTime: 850,
      daysAgo: 1,
      imageResult: {
        compressionFactor: 0.45,
        noiseScore: 0.65,
        ganArtifactScore: 0.08,
        explanation: 'Organic sensor noise verified. Color distribution, pixel density, and camera metadata conform to iPhone 14 capture standards.'
      }
    },
    // Day 2
    {
      userId: demoUser.id,
      fileName: 'deepfake_speech.mp4',
      fileType: 'VIDEO',
      result: 'AI',
      confidence: 96.80,
      processingTime: 3200,
      daysAgo: 2,
      videoResult: {
        faceConsistency: 0.35,
        lipSyncScore: 0.42,
        temporalInconsistency: 0.85,
        suspiciousFrames: JSON.stringify([12, 15, 60, 72]),
        timelineAnalysis: JSON.stringify([
          { timestamp: 0, aiScore: 0.1 },
          { timestamp: 2, aiScore: 0.85 },
          { timestamp: 4, aiScore: 0.95 },
          { timestamp: 6, aiScore: 0.98 }
        ]),
        explanation: 'Severe visual anomalies detected. Face warping and lip synchronization drift from sound markers, indicating face-swapped deepfake synthesis.'
      }
    },
    // Day 3
    {
      userId: demoUser.id,
      fileName: 'blog_post.txt',
      fileType: 'TEXT',
      result: 'HUMAN',
      confidence: 91.20,
      processingTime: 320,
      daysAgo: 3,
      textResult: {
        perplexity: 184.2,
        burstiness: 8.4,
        sentenceAnalysis: JSON.stringify([
          { sentence: 'I went for a walk this morning.', score: 0.1, perplexity: 150.2 },
          { sentence: 'The air was crisp, and the sun was just peeking over the hills.', score: 0.15, perplexity: 210.4 }
        ]),
        suspiciousParagraphs: JSON.stringify([]),
        explanation: 'High stylistic burstiness (8.4) and dynamic sentence structure variations indicate organic human composition.'
      }
    },
    // Day 4
    {
      userId: demoUser.id,
      fileName: 'avatar_midjourney.webp',
      fileType: 'IMAGE',
      result: 'AI',
      confidence: 91.50,
      processingTime: 920,
      daysAgo: 4,
      imageResult: {
        compressionFactor: 0.72,
        noiseScore: 0.22,
        ganArtifactScore: 0.88,
        explanation: 'Image contains typical diffusion blurring artifacts and floating pixel errors in ear and hair regions.'
      }
    },
    // Day 5
    {
      userId: demoUser.id,
      fileName: 'news_interview.mp4',
      fileType: 'VIDEO',
      result: 'HUMAN',
      confidence: 97.50,
      processingTime: 2900,
      daysAgo: 5,
      videoResult: {
        faceConsistency: 0.94,
        lipSyncScore: 0.91,
        temporalInconsistency: 0.05,
        suspiciousFrames: JSON.stringify([]),
        timelineAnalysis: JSON.stringify([
          { timestamp: 0, aiScore: 0.05 },
          { timestamp: 2, aiScore: 0.04 },
          { timestamp: 4, aiScore: 0.06 }
        ]),
        explanation: 'Natural frame transition curves. Facial coordinates show physical skeletal contractions matching camera movements. Lip sync is precise.'
      }
    },
    // Day 6
    {
      userId: demoUser.id,
      fileName: 'physics_homework.txt',
      fileType: 'TEXT',
      result: 'AI',
      confidence: 76.50,
      processingTime: 410,
      daysAgo: 6,
      textResult: {
        perplexity: 34.2,
        burstiness: 2.1,
        sentenceAnalysis: JSON.stringify([]),
        suspiciousParagraphs: JSON.stringify([0]),
        explanation: 'Text contains repetitive structural elements and low vocabulary diversity typical of AI homework generation.'
      }
    }
  ];

  for (const item of histories) {
    const scanDate = new Date();
    scanDate.setDate(now.getDate() - item.daysAgo);

    const history = await prisma.detectionHistory.create({
      data: {
        userId: item.userId,
        fileName: item.fileName,
        fileType: item.fileType,
        result: item.result,
        confidence: item.confidence,
        processingTime: item.processingTime,
        createdAt: scanDate
      }
    });

    if (item.fileType === 'IMAGE' && item.imageResult) {
      await prisma.imageResult.create({
        data: {
          historyId: history.id,
          ...item.imageResult
        }
      });
    } else if (item.fileType === 'VIDEO' && item.videoResult) {
      await prisma.videoResult.create({
        data: {
          historyId: history.id,
          ...item.videoResult
        }
      });
    } else if (item.fileType === 'TEXT' && item.textResult) {
      await prisma.textResult.create({
        data: {
          historyId: history.id,
          ...item.textResult
        }
      });
    }
  }

  // 4. Create API usage logs
  const apiLogs = [
    { provider: 'MOCK', endpoint: 'IMAGE_DETECTION', status: 200, count: 20 },
    { provider: 'MOCK', endpoint: 'TEXT_DETECTION', status: 200, count: 15 },
    { provider: 'MOCK', endpoint: 'VIDEO_DETECTION', status: 200, count: 8 },
    { provider: 'GEMINI', endpoint: 'TEXT_DETECTION', status: 200, count: 5 },
    { provider: 'HUGGING_FACE', endpoint: 'IMAGE_DETECTION', status: 200, count: 4 }
  ];

  for (const log of apiLogs) {
    for (let i = 0; i < log.count; i++) {
      const logDate = new Date();
      logDate.setDate(now.getDate() - Math.floor(Math.random() * 8));
      await prisma.aPIUsage.create({
        data: {
          provider: log.provider,
          endpoint: log.endpoint,
          status: log.status,
          processingTime: 100 + Math.random() * 900,
          createdAt: logDate
        }
      });
    }
  }

  // 5. Create some feedbacks
  await prisma.feedback.createMany({
    data: [
      { userId: demoUser.id, category: 'BUG', rating: 4, subject: 'Mobile layout shifts', message: 'The video timeline slides slightly on narrow iOS screens. Great tool otherwise!' },
      { userId: demoUser.id, category: 'FEATURE', rating: 5, subject: 'Add Bulk Uploads', message: 'I need to scan 100 images at once. A batch scanning feature would make this perfect.' }
    ]
  });

  logger.info('Database seeded successfully!');
}

seed()
  .catch((e) => {
    logger.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
