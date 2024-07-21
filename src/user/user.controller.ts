import {
  Body,
  Controller,
  Get,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guards';
import { EditUserDto } from './dto';
import { UserService } from './user.service';

@ApiBearerAuth('access-token')
@ApiTags('users')
@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) {}

  @ApiOperation({
    summary:
      'API ini digunakan untuk mendapat identitas pemilik token',
  })
  @Get('me')
  getMe(@GetUser() user: User) {
    return user;
  }

  @Patch()
  @ApiOperation({
    summary:
      'API ini digunakan untuk mengubah identitas dari pemilik token',
  })
  editUser(
    @Body() dto: EditUserDto,
    @GetUser('id') userId: number,
  ) {
    return this.userService.editUser(userId, dto);
  }
}
