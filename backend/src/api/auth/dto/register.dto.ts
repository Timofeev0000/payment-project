import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator'

export class RegisterDto {
  @ApiProperty({
    example: 'Алекс',
    description: 'Имя пользователя',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  name: string

  @ApiProperty({
    example: 'alex@mail.ru',
    description: 'Email пользователя',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string

  @ApiProperty({
    example: 'strongpass123',
    description: 'Пароль пользователя',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string
}
