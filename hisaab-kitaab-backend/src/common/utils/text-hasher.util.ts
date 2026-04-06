import * as crypto from 'crypto';

export class TextHasher {
  /**
   * Generates a unique SHA-256 hash for an SMS to prevent duplicates.
   * Based on userId, original unformatted body, sender, and strict received time.
   */
  static generateSmsHash(userId: string, body: string, sender: string, receivedAt: Date): string {
    const payload = `${userId}|${body.trim()}|${sender.trim()}|${receivedAt.toISOString()}`;
    return crypto.createHash('sha256').update(payload).digest('hex');
  }
}
