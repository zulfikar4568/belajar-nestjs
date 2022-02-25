import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";


@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService){}

  signup() {
    return 'Saya sedang signup';
  }
  signin() {
    return 'Saya sedang signin';
  }
}