import { PaymentProvider, PaymentStatus } from '@prisma/client'

export class PaymentHistoryResponseDto {
  id: number
  amount: number
  currency: string
  provider?: PaymentProvider
  status: PaymentStatus
  createdAt: Date
  paidAt?: Date
}
