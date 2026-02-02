import { Injectable } from '@nestjs/common'
import { User } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { v4 as uuid } from 'uuid'
import { InitPaymentRequest } from './providers/dto/init-payment.dto'
import { YoomoneyService } from './providers/yoomoney/yoomoney.service'

@Injectable()
export class PaymentsService {
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly yoomoneyService: YoomoneyService,
  ) {}

  async getHistory(user: User) {
    return await this.prismaService.payment.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  async create(dto: InitPaymentRequest, user: User) {
    const { amount, description } = dto

    const paymentData = await this.yoomoneyService.create({
      amount,
      description,
    })

    await this.prismaService.payment.create({
      data: {
        amount,
        description,
        provider: 'YOOKASSA',
        idempotencyKey: uuid(),
        providerPaymentId: paymentData.id,
        status: 'PENDING',
        userId: user.id,
      },
    })

    if (paymentData.confirmation?.type === 'redirect') {
      return paymentData.confirmation.confirmation_url
    }
  }

  async handleWebhook(body: any) {
    const paymentId = body.object.id
    const status = body.object.status

    const payment = await this.prismaService.payment.findUnique({
      where: { providerPaymentId: paymentId },
    })

    if (!payment) return

    let newStatus:
      | 'SUCCEEDED'
      | 'CANCELED'
      | 'PENDING'
      | 'WAITING_FOR_CAPTURE' = 'PENDING'

    switch (status) {
      case 'succeeded':
        newStatus = 'SUCCEEDED'
        break
      case 'canceled':
        newStatus = 'CANCELED'
        break
      case 'pending':
        newStatus = 'WAITING_FOR_CAPTURE'
        break
    }

    await this.prismaService.payment.update({
      where: { id: payment.id },
      data: { status: newStatus, paidAt: new Date() },
    })
  }
}
