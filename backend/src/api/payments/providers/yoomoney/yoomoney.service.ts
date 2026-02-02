import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  ConfirmationEnum,
  CurrencyEnum,
  YookassaService,
} from 'nestjs-yookassa'
import { CreatePaymentParams } from './dto/create-payment-params.dto'

@Injectable()
export class YoomoneyService {
  constructor(
    private readonly yookassaService: YookassaService,
    private readonly configService: ConfigService,
  ) {}

  async create(params: CreatePaymentParams) {
    const clientUrl = this.configService.get<string>('CLIENT_URL') || ''

    const paymentData = await this.yookassaService.payments.create({
      amount: {
        value: +params.amount,
        currency: CurrencyEnum.RUB,
      },
      description: params.description || 'Оплата услуг',
      confirmation: {
        type: ConfirmationEnum.REDIRECT,
        return_url: clientUrl
          ? `${clientUrl.replace(/\/$/, '')}/payment-success`
          : 'http://localhost:10016/payment-success',
      },
      capture: true,
      save_payment_method: true,
    })

    return paymentData
  }
}
