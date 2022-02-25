# Inisialisasi Project
```bash
nest new belajar-nestjs
```

Hapus file berikut: 
`app.controller.spec.ts`
`app.controller.ts`
`app.service.ts`

edit `app.module.ts`
```ts
import { Module } from '@nestjs/common';

@Module({
  imports: [],
})
export class AppModule {}

```

Buat file di `auth/auth.module.ts`
```ts
import { Module } from '@nestjs/common'

@Module({})
export class AuthModule {

}
```

Edit file di `app.module.ts`
```ts
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [AuthModule],
})
export class AppModule {}
```
Testing APP
```
npm run start:dev
```

Buat module User
```
nest g module user
nest g module post
nest g controller auth
nest g service auth
```

Service digunakan untuk menyimpan bisnis logic kita
Edit file `auth/auth.service.ts`
```ts
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
```

Controller digunakan untuk menghandle request
Edit file `auth/auth.controller.ts`
```ts
import { Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('signup')
  signup() {
    return this.authService.signup()
  }

  @Post('signin')
  signin() {
    return this.authService.signin()
  }
}
```

Test Request kita menggunakan postman
`POST http://localhost:3000/auth/signin`
`POST http://localhost:3000/auth/signup`

# Inisialisasi Database Postgres dengan docker
Pastikan install terlebih dahulu docker compose dan docker
Buat file `docker-compose.yml`

```yml
version: '3.8'
services:
  dev-db:
    image: postgres:13
    ports:
      - 5434:5432
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: 123
      POSTGRES_DB: nest
    networks:
      - belajar-nestjs

networks:
  belajar-nestjs
```

Jalankan database dengan docker compose
```bash
docker-compose up -d dev-db
# Cek container sudah jalan
docker ps
```

Install ORM Prisma
```
npm install -D prisma
npm install @prisma/client
```

Inisialisasi prisma
```
npx prisma init
```

Edit file `prisma/schema.prisma`
```ts
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt


  email    String
  password String

  firstName String?
  lastName  String?
}

model Post {
  id        Int      @id @default(autoincrement())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  title       String
  description String
}

```

Edit `.env` file
```
DATABASE_URL="postgresql://postgres:123@localhost:5434/nest?schema=public"
```

Migrate database jalankan dan beri nama `init`
```bash
npx prisma migrate dev
```

Jalankan prisma studio
```
npx prisma studio
```