import { Module } from '@nestjs/common'
import { PaymentsController } from './payments.controller'
import { PaymentsService } from './payments.service'
import { YoomoneyModule } from './providers/yoomoney/yoomoney.module'

@Module({
  imports: [YoomoneyModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
