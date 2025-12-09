export interface PaystackWebhookEvent {
  event: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message: string | null;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: Record<string, any>;
    log: Record<string, any>;
    fees: number | null;
    authorization: Record<string, any>;
    customer: Record<string, any>;
    plan: Record<string, any>;
  };
}
