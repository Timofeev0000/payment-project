import { Body, Controller, Get, Post, Req } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { User } from '@prisma/client'
import { Authorized } from 'src/common/decorators/authtorized.decorator'
import { Protected } from 'src/common/decorators/protected.decorator'
import { PaymentHistoryResponseDto } from './dto/payment-history.dto'
import { PaymentsService } from './payments.service'
import { InitPaymentRequest } from './providers/dto/init-payment.dto'

@ApiTags('Платежи')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @ApiOperation({
    summary: 'История операций',
    description: 'Возвращает все операции пользователя',
  })
  @ApiOkResponse({
    type: [PaymentHistoryResponseDto],
  })
  @Protected()
  @Get()
  async getHistory(@Authorized() user: User) {
    return await this.paymentsService.getHistory(user)
  }

  @Protected()
  @Post()
  async сcreate(@Body() dto: InitPaymentRequest, @Authorized() user: User) {
    return await this.paymentsService.create(dto, user)
  }

  @Post('webhook')
  async webhook(@Req() req: Request) {
    await this.paymentsService.handleWebhook(req.body)
    return 'OK'
  }
}
