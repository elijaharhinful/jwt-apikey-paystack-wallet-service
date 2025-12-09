export interface TransferDebitMetadata {
  type: 'debit';
  receiver_wallet: string;
}

export interface TransferCreditMetadata {
  type: 'credit';
  sender_wallet: string;
}

export type TransactionMetadata =
  | TransferDebitMetadata
  | TransferCreditMetadata
  | null;
