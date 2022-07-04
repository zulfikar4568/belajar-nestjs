import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @ApiOperation({
    summary: 'API ini digunakan untuk Signup',
  })
  @ApiResponse({
    status: 201,
    description:
      '{ "access_token": "token kamu nanti ada di sini"}',
  })
  @Post('signup')
  signup(@Body() dto: AuthDto) {
    return this.authService.signup(dto);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'API ini digunakan untuk Signin',
  })
  @ApiResponse({
    status: 200,
    description:
      '{ "access_token": "token kamu nanti ada di sini"}',
  })
  @Post('signin')
  signin(@Body() dto: AuthDto) {
    return this.authService.signin(dto);
  }
}
