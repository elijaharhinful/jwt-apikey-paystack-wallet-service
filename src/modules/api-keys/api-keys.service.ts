import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { ApiKey } from './entities/api-key.entity';
import { User } from '../users/entities/user.entity';
import { ApiKeyResponse } from './interfaces/api-key-response.interface';

@Injectable()
export class ApiKeysService {
  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeyRepository: Repository<ApiKey>,
  ) {}

  async createApiKey(
    user: User,
    name: string,
    permissions: string[],
    expiryStr: string,
  ): Promise<ApiKeyResponse> {
    // Limit check: 5 active keys
    const count = await this.apiKeyRepository.count({
      where: { user: { id: user.id }, is_active: true },
    });
    if (count >= 5) {
      throw new InternalServerErrorException(
        'Maximum limit of 5 active API keys reached',
      );
    }

    const { key, hash } = this.generateKeyAndHash();
    const expiresAt = this.calculateExpiry(expiryStr);

    const apiKey = this.apiKeyRepository.create({
      user,
      key_hash: hash,
      preview_chars:
        key.substring(0, 7) + '...' + key.substring(key.length - 4),
      permissions,
      expires_at: expiresAt,
    });

    await this.apiKeyRepository.save(apiKey);

    return { id: apiKey.id, api_key: key, expires_at: expiresAt };
  }

  async rolloverApiKey(
    user: User,
    expiredKeyId: string,
    expiryStr: string,
  ): Promise<ApiKeyResponse> {
    const oldKey = await this.apiKeyRepository.findOne({
      where: { id: expiredKeyId, user: { id: user.id } },
    });

    if (!oldKey) {
      throw new InternalServerErrorException('Key not found');
    }

    // Check if truly expired
    if (oldKey.expires_at > new Date()) {
      throw new InternalServerErrorException('Key is not expired yet');
    }

    // Reuse permissions
    return this.createApiKey(user, 'Rollover', oldKey.permissions, expiryStr);
  }

  async revokeApiKey(user: User, keyId: string): Promise<void> {
    const key = await this.apiKeyRepository.findOne({
      where: { id: keyId, user: { id: user.id } },
    });
    if (!key) {
      throw new InternalServerErrorException('Key not found');
    }
    await this.apiKeyRepository.remove(key);
  }

  async validateApiKey(key: string): Promise<User | null> {
    const hash = crypto.createHash('sha256').update(key).digest('hex');

    const apiKey = await this.apiKeyRepository.findOne({
      where: { key_hash: hash, is_active: true },
      relations: ['user'],
    });

    if (apiKey && apiKey.expires_at > new Date()) {
      if (apiKey.user) {
        // Assign permissions to the user object (transient property)
        apiKey.user.permissions = apiKey.permissions;
        return apiKey.user;
      }
    }
    return null;
  }

  private generateKeyAndHash() {
    const random = crypto.randomBytes(32).toString('hex');
    const key = `sk_live_${random}`;
    const hash = crypto.createHash('sha256').update(key).digest('hex');
    return { key, hash };
  }

  private calculateExpiry(expiryStr: string): Date {
    const now = new Date();
    const match = expiryStr.match(/^(\d+)([HDMY])$/);
    if (!match) throw new Error('Invalid expiry format');
    const value = parseInt(match[1], 10);
    const unit = match[2];

    if (unit === 'H') now.setHours(now.getHours() + value);
    if (unit === 'D') now.setDate(now.getDate() + value);
    if (unit === 'M') now.setMonth(now.getMonth() + value);
    if (unit === 'Y') now.setFullYear(now.getFullYear() + value);

    return now;
  }
}
