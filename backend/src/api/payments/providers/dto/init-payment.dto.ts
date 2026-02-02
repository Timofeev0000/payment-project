import { PaymentProvider } from '@prisma/client'
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator'

export class InitPaymentRequest {
  @IsInt()
  @Min(1)
  amount: number

  @IsEnum(PaymentProvider)
  @IsOptional()
  provider?: PaymentProvider

  @IsOptional()
  description?: string
}
