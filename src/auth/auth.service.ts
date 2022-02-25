import { Injectable } from "@nestjs/common";


@Injectable({})
export class AuthService {
  signup() {
    return 'Saya sedang signup';
  }
  signin() {
    return 'Saya sedang signin';
  }
}