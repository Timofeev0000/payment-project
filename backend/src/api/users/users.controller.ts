import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Authorized } from 'src/common/decorators/authtorized.decorator'
import { Protected } from 'src/common/decorators/protected.decorator'
import { UsersService } from './users.service'

@ApiTags('Пользователи')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Protected()
  @Get('@me')
  async getMe(@Authorized('id') id: number) {
    return id
  }
}
