# Inisialisasi Project
Buat Project Aplikasi Post menggunakan nest js
```bash
nest new belajar-nestjs
```

### Hapus file berikut: 
`app.controller.spec.ts`
`app.controller.ts`
`app.service.ts`

### Edit `app.module.ts`
```ts
import { Module } from '@nestjs/common';

@Module({
  imports: [],
})
export class AppModule {}

```

### Buat file di `auth/auth.module.ts`
```ts
import { Module } from '@nestjs/common'

@Module({})
export class AuthModule {

}
```

### Edit file di `app.module.ts`
```ts
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [AuthModule],
})
export class AppModule {}
```
### Testing APP
```
### npm run start:dev
```

### Buat module user dan post
```
nest g module user
nest g module post
nest g controller auth
nest g service auth
```

### Service digunakan untuk menyimpan bisnis logic kita lalu edit file `auth/auth.service.ts`
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

### Controller digunakan untuk menghandle request
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

### Test Request menggunakan Curl
```bash
sudo apt-get install curl

curl -X POST -H "Content-Type: application/json" \
  http://localhost:3000/auth/signin
curl -X POST -H "Content-Type: application/json" \
  http://localhost:3000/auth/signup
```

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

### Jalankan database dengan docker compose
```bash
docker-compose up -d dev-db
# Cek container sudah jalan
docker ps
```

### Install ORM Prisma
```
npm install -D prisma
npm install @prisma/client
```

### Inisialisasi prisma
```
npx prisma init
```

### Edit file `prisma/schema.prisma`
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

### Edit `.env` file
```
DATABASE_URL="postgresql://postgres:123@localhost:5434/nest?schema=public"
```

### Migrate database jalankan dan beri nama `init`
```bash
npx prisma migrate dev
```

### Jalankan prisma studio
```
npx prisma studio
```

### Buat prisma module agar dapat di pakai di tiap module
```
nest g module prisma
nest g service prisma --no-spec
```

### Edit file `src/prisma/prisma.module.ts`
```ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService]
})
export class PrismaModule {}
```

### Edit file `src/prisma/prisma.service.ts`
```ts
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    super({
      datasources: {
        db: {
          url: 'postgresql://postgres:123@localhost:5434/nest?schema=public'
        },
      },
    });
  }
}
```

### Edit file `src/auth/auth.module.ts`
```ts
import { Module } from '@nestjs/common'
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [PrismaModule],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
```

### Edit file `src/auth/auth.service.ts`
```ts
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
```

# Mulai membuat Authentication

### Install class validator dan class transformer untuk validasi
```
npm install class-validator class-transformer
```
### Install Argon2 untuk membuat password menjadi data ecrypt
```
npm install argon2
```
### Install Nestjs config
```
npm install @nestjs/config
```
### Install jwt dan passport js
```
npm install @nestjs/passport passport passport-local
npm install -D @types/passport-local

npm install @nestjs/jwt passport-jwt
npm install -D @types/passport-jwt
```

### Edit `prisma/schema.prisma`
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


  email    String @unique
  password String

  firstName String?
  lastName  String?

  @@map("users")
  posts Post[]
}

model Post {
  id        Int      @id @default(autoincrement())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  title       String
  description String?

  userId Int
  user User @relation(fields: [userId], references: [id])

  @@map("posts")
}
```

### Jalankan Migration
```
npx prisma migrate dev
```

### Tambahkan Script di `package.json` bagian "script " untuk restart database
```json
"prisma:dev:deploy": "prisma migrate deploy",
"db:dev:rm": "docker-compose rm -f -s -v dev-db",
"db:dev:up": "docker-compose up -d dev-db",
"db:dev:restart": "npm run db:dev:rm && npm run db:dev:up && sleep 2 && npm run prisma:dev:deploy",
```

### Edit `.env` file untuk configurasi config JWT
```
DATABASE_URL="postgresql://postgres:123@localhost:5434/nest?schema=public"
JWT_SECRET='ini-secret-untuk-jwt'
```

### Tambahkan validation pipe di `main.ts`
```ts
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true
  }))
  await app.listen(3000);
}
bootstrap();
```

### Tambahkan Config Nest js di file `app.module.ts`
```ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PostModule } from './post/post.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [ConfigModule.forRoot({isGlobal: true}), AuthModule, UserModule, PostModule, PrismaModule],
})
export class AppModule {}
```

### Ganti config prisma dengan config nest js
```ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(config: ConfigService) {
    super({
      datasources: {
        db: {
          url: config.get('DATABASE_URL')
        },
      },
    });
  }
}
```

### Tambahkan file dto *(data transfer object)* di auth folder `src/auth/dto/auth.dto.ts` yang akan digunakan sebagai request validator
```ts
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class AuthDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
```

### Export `auth.dto.ts` ke `src/auth/dto/index.ts`
```ts
export * from "./auth.dto"
```

### Tambahkan logic login ke dalam service `src/auth/auth.service.ts`
```ts
import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDto } from "./dto";
import * as argon from "argon2";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";


@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService, private readonly config: ConfigService) { }

  async signup(dto: AuthDto) {
    //Generate Password
    const hash = await argon.hash(dto.password);
    //Save user baru ke database
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hash
        }
      })

      ///kembalikan token
      return this.signToken(user.id, user.email);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') { //kode error duplicate
          throw new ForbiddenException("Credentials has already taken!")
        }
      }
      throw error;
    }
  }

  async signin(dto: AuthDto) {
    // Cari user dengan email
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    })
    // Jika user tidak ada maka throw exception
    if (!user) throw new ForbiddenException('Credentials incorrect');
    

    // compare password
    const pwMatches = await argon.verify(user.password, dto.password);
    // Jika password salah maka throw exception 
    if (!pwMatches) throw new ForbiddenException('Credentials incorrect');

    //kembalikan token
    return this.signToken(user.id, user.email);
  }

  async signToken(userId: number, email: string,): Promise<{access_token: string}> {
    const payload = {
      sub: userId,
      email
    }

    const secret = this.config.get('JWT_SECRET')

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: secret
    })

    return {
      access_token: token,
    }
  }
}
```

### Register kan jwt ke dalam module `src/auth/auth.module.ts`
```ts
import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
```

### Tambahkan DTO ke dalam controller `src/auth/auth.controller.ts`
```ts
import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthDto } from "./dto";

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('signup')
  signup(@Body() dto: AuthDto) {
    return this.authService.signup(dto)
  }

  @Post('signin')
  signin(@Body() dto: AuthDto) {
    return this.authService.signin(dto)
  }
}
```

### Test Auth menggunakan Curl
```bash
curl -X POST http://localhost:3000/auth/signup \
   -H 'Content-Type: application/json' \
   -d '{"email": "isnaen@belajar.com", "password": "123"}'

curl -X POST http://localhost:3000/auth/signin \
   -H 'Content-Type: application/json' \
   -d '{"email": "isnaen@belajar.com", "password": "123"}'
```