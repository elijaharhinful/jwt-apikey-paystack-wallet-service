import {
  TransactionType,
  TransactionStatus,
} from '../entities/transaction.entity';
import { TransactionMetadata } from './transaction-metadata.interface';

export interface TransactionHistoryResponse {
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  reference: string;
  created_at: Date;
  metadata?: TransactionMetadata;
}
