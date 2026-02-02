import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { User } from '@prisma/client'
import { hash, verify } from 'argon2'
import { Request, Response } from 'express'
import * as ms from 'ms'
import { StringValue } from 'ms'
import { isDev } from 'src/common/utils/is-dev.util'
import { PrismaService } from 'src/prisma/prisma.service'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import { JwtPayload } from './interfaces/jwt.interface'

@Injectable()
export class AuthService {
  private readonly JWT_ACCESS_TOKEN_TTL: StringValue
  private readonly JWT_REFRESH_TOKEN_TTL: StringValue
  private readonly COOKES_DOMAIN: string

  public constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.JWT_ACCESS_TOKEN_TTL = configService.getOrThrow<StringValue>(
      'JWT_ACCESS_TOKEN_TTL',
    )

    this.JWT_REFRESH_TOKEN_TTL = configService.getOrThrow<StringValue>(
      'JWT_REFRESH_TOKEN_TTL',
    )

    this.COOKES_DOMAIN = configService.getOrThrow<string>('COOKES_DOMAIN')
  }

  async login(res: Response, dto: LoginDto) {
    const { email, password } = dto
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    })

    if (!email) throw new NotFoundException('Не верный логин или пароль')

    const isValidPassword = await verify(user.password, password)

    if (!isValidPassword)
      throw new NotFoundException('Не верный логин или пароль')

    return this.auth(res, user)
  }

  async register(res: Response, dto: RegisterDto) {
    const { name, email, password } = dto

    const exists = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    })

    if (exists)
      throw new ConflictException('Пользователь с такой почтой уже существует')

    const hashedPass = await hash(password)

    const user = await this.prismaService.user.create({
      data: {
        name,
        email,
        password: hashedPass,
      },
    })

    return this.auth(res, user)
  }

  async auth(res: Response, user: User) {
    const { accessToken, refreshToken, refreshTokenExpires } =
      await this.generateTokens(user)

    this.setCookie(res, refreshToken, refreshTokenExpires)

    return { accessToken, refreshTokenExpires }
  }

  async refresh(req: Request, res: Response) {
    if (!req || !req.cookies)
      throw new UnauthorizedException('Не удалось получить куки авторизации')

    const refreshToken = req.cookies['refreshToken']

    if (refreshToken) {
      const payload: JwtPayload =
        await this.jwtService.verifyAsync(refreshToken)

      if (payload) {
        const user = await this.prismaService.user.findUnique({
          where: {
            id: payload.id,
          },
        })

        if (user) return this.auth(res, user)
      }
    }
  }

  async logout(res: Response) {
    await this.setCookie(res, '', new Date(0))
  }

  private async generateTokens(user: User) {
    const payload: JwtPayload = { id: user.id }

    const refreshTokenExpires = new Date(
      Date.now() + ms(this.JWT_REFRESH_TOKEN_TTL),
    )

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.JWT_ACCESS_TOKEN_TTL,
    })

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.JWT_REFRESH_TOKEN_TTL,
    })

    return {
      accessToken,
      refreshToken,
      refreshTokenExpires,
    }
  }

  private setCookie(res: Response, value: string, expires: Date) {
    res.cookie('refreshToken', value, {
      httpOnly: true,
      domain: this.COOKES_DOMAIN,
      expires,
      secure: !isDev(this.configService),
      sameSite: 'lax',
    })
  }
}
