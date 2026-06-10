import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

interface ServiceAccount {
  project_id: string;
  private_key: string;
  client_email: string;
}

function base64url(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

export async function getGoogleAccessToken(serviceAccount: ServiceAccount): Promise<string> {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 3600;

  const header = JSON.stringify({
    alg: 'RS256',
    typ: 'JWT',
  });

  const claim = JSON.stringify({
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/indexing',
    aud: 'https://oauth2.googleapis.com/token',
    exp,
    iat,
  });

  const headerBase64 = base64url(header);
  const claimBase64 = base64url(claim);
  const signatureInput = `${headerBase64}.${claimBase64}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signatureInput);
  const signature = signer.sign(serviceAccount.private_key, 'base64');
  const signatureBase64 = signature
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const jwt = `${signatureInput}.${signatureBase64}`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  if (!tokenRes.ok) {
    const errText = await tokenRes.text();
    throw new Error(`Google OAuth failed: ${errText}`);
  }

  const tokenJson = await tokenRes.json();
  return tokenJson.access_token;
}

export async function notifyGoogleIndexing(url: string, type: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED'): Promise<boolean> {
  try {
    const keyPath = path.join(process.cwd(), 'google-service-account.json');
    if (!fs.existsSync(keyPath)) {
      console.log(`[Google Indexing] google-service-account.json not found in project root. Skipping indexing ping.`);
      return false;
    }

    const keyData: ServiceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
    console.log(`[Google Indexing] Requesting access token for service account: ${keyData.client_email}`);
    
    const accessToken = await getGoogleAccessToken(keyData);
    
    console.log(`[Google Indexing] Notifying Google of ${type} for URL: ${url}`);
    
    const indexingRes = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        url,
        type,
      }),
    });

    if (!indexingRes.ok) {
      const errText = await indexingRes.text();
      console.error(`[Google Indexing] API call failed: ${errText}`);
      return false;
    }

    console.log(`[Google Indexing] Successfully notified Google of url publication!`);
    return true;
  } catch (error) {
    console.error(`[Google Indexing] Failed to execute indexing notification:`, error);
    return false;
  }
}
