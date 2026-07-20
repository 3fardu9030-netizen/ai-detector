import axios from 'axios';
import { prisma } from './db';
import { logger } from './logger';

const API_URL = 'http://localhost:5000/api';

async function runTests() {
  logger.info('Starting automated backend API tests...');
  
  const testEmail = `tester-${Date.now()}@truthlens.ai`;
  const testPassword = 'testpassword123';
  const testName = 'API Tester User';
  
  let accessToken = '';

  try {
    // 1. Register User
    logger.info(`Step 1: Registering user ${testEmail}...`);
    const regRes = await axios.post(`${API_URL}/auth/register`, {
      name: testName,
      email: testEmail,
      password: testPassword
    });

    if (regRes.status !== 201) throw new Error('Registration status is not 201');
    logger.info('✔ User registered successfully. OTP dispatched.');

    // 2. Fetch OTP from DB (backdoor verification for test harness)
    logger.info('Step 2: Retrieving OTP from database...');
    const user = await prisma.user.findUnique({
      where: { email: testEmail },
      include: { otps: true }
    });

    if (!user || user.otps.length === 0) {
      throw new Error('Verification OTP record not found in database');
    }
    const verificationCode = user.otps[0].code;
    logger.info(`✔ Retrieved verification code: ${verificationCode}`);

    // 3. Verify Email with OTP
    logger.info('Step 3: Verifying email via OTP endpoint...');
    const verifyRes = await axios.post(`${API_URL}/auth/verify-otp`, {
      email: testEmail,
      code: verificationCode
    });

    if (!verifyRes.data.accessToken) throw new Error('AccessToken missing on verification');
    accessToken = verifyRes.data.accessToken;
    logger.info('✔ Email verified successfully. JWT issued.');

    // 4. Log in
    logger.info('Step 4: Logging in to retrieve fresh session...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: testEmail,
      password: testPassword
    });

    if (!loginRes.data.accessToken) throw new Error('Login failed to return accessToken');
    accessToken = loginRes.data.accessToken;
    logger.info('✔ Login successful.');

    // 5. Get Profile (Protected)
    logger.info('Step 5: Testing protected profile route...');
    const profileRes = await axios.get(`${API_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (profileRes.data.email !== testEmail) throw new Error('Profile details email mismatch');
    logger.info('✔ Profile data fetched successfully.');

    // 6. Test AI Text Detection
    logger.info('Step 6: Running test AI Text Scan...');
    const sampleText = 'This is a test block of text composition to verify that our statistical perplexity analysis calculation module runs without throwing internal server errors.';
    const scanRes = await axios.post(`${API_URL}/detect/text`, {
      text: sampleText,
      provider: 'MOCK'
    }, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!scanRes.data.result || typeof scanRes.data.confidence !== 'number') {
      throw new Error('Invalid AI scan results response structure');
    }
    logger.info(`✔ Text scan successful. Verdict: ${scanRes.data.result} | Confidence: ${scanRes.data.confidence}%`);

    // Clean up test user
    logger.info('Cleaning up test user data...');
    await prisma.user.delete({ where: { id: user.id } });
    logger.info('✔ Clean up complete.');
    
    logger.info('==============================================');
    logger.info('🎉 INTEGRATION TESTS COMPLETED SUCCESSFULLY!');
    logger.info('==============================================');

  } catch (error: any) {
    logger.error('❌ API Integration Test Failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Ensure server is running before executing this
runTests();
