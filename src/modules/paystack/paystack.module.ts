import { Module } from '@nestjs/common';
import { PaystackService } from './paystack.service';
import { PaystackController } from './paystack.controller';

@Module({
  providers: [PaystackService],
  controllers: [PaystackController],
  exports: [PaystackService],
})
export class PaystackModule {}
