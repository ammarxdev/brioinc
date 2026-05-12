import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 12 bytes is standard for GCM

// Fetch encryption secret from environment or use a secure fallback
const SECRET = process.env.ENCRYPTION_SECRET || 'brioinc-secure-payment-gateway-fiat-crypto-2026';

/**
 * Derives a 32-byte key from the SECRET using scrypt.
 */
function getEncryptionKey(): Buffer {
  // Use a static salt for key derivation consistency across server restarts
  return crypto.scryptSync(SECRET, 'brioinc-salt-system', 32);
}

/**
 * Encrypts cleartext string using AES-256-GCM.
 * Output format: iv_hex:encrypted_hex:auth_tag_hex
 */
export function encrypt(text: string): string {
  if (!text) return '';
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = getEncryptionKey();
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag().toString('hex');
    
    return `${iv.toString('hex')}:${encrypted}:${authTag}`;
  } catch (error) {

    throw new Error('Data encryption failure');
  }
}

/**
 * Decrypts a cipher text formatted as iv_hex:encrypted_hex:auth_tag_hex
 */
export function decrypt(cipherText: string): string {
  if (!cipherText) return '';
  try {
    // If it doesn't match the encrypted format (three colon-separated hex segments), return as is
    if (!cipherText.includes(':')) {
      return cipherText;
    }
    
    const parts = cipherText.split(':');
    if (parts.length !== 3) {
      return cipherText;
    }
    
    const [ivHex, encryptedHex, authTagHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const key = getEncryptionKey();
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {

    return 'Decryption Failure (Secret mismatch)';
  }
}
