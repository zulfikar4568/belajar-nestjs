import { Get, Controller } from '@nestjs/common';

@Controller('test')
export class AppController {
  @Get('/')
  getTest() {
    return 'API sudah running!';
  }
}
