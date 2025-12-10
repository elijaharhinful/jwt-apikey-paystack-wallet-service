import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';
import { PaystackTransactionInitResponse } from './interfaces/paystack-transaction-init-response.interface';
import { PaystackWebhookEvent } from './interfaces/paystack-webhook-event.interface';

interface PaystackApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

@Injectable()
export class PaystackService {
  private readonly logger = new Logger(PaystackService.name);
  private readonly secretKey: string;

  constructor(private readonly configService: ConfigService) {
    this.secretKey = this.configService.get<string>('paystack.secretKey') || '';
  }

  async initializeTransaction(
    email: string,
    amount: number,
    reference: string,
  ): Promise<PaystackTransactionInitResponse> {
    try {
      const response = await axios.post<
        PaystackApiResponse<PaystackTransactionInitResponse>
      >(
        'https://api.paystack.co/transaction/initialize',
        {
          email,
          amount, // Amount is already in kobo
          reference,
          callback_url: this.configService.get<string>('paystack.callbackUrl'), // Optional
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        this.logger.error('Paystack Init Error', error.response?.data);
      } else {
        this.logger.error('Paystack Init Error', error);
      }
      throw new InternalServerErrorException('Paystack initialization failed');
    }
  }

  verifyWebhookSignature(
    signature: string,
    body: PaystackWebhookEvent,
  ): boolean {
    const hash = crypto
      .createHmac('sha512', this.secretKey)
      .update(JSON.stringify(body))
      .digest('hex');
    return hash === signature;
  }
}
