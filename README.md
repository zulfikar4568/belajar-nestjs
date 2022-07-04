<p align="center">
  <a href="https://github.com/zulfikar4568/" target="blank"><img src="https://www.pngarts.com/files/2/Letter-Z-PNG-Image-Transparent.png" width="200" alt="Nest Logo" /></a>
</p>

<p align="center">Belajar Nest js By Zulfikar Isnaen :)</p>

# Description
Ini adalah project sederhana authentication dan blog post, dimana tiap tiap user dapat membuat post. Disini authentication yang digunakan berupa jwt sederhana.
[Lihat Demo](https://blog-post-zulfikar.herokuapp.com/)

# Inisialisasi Project
Buat Project Aplikasi Blog Post menggunakan nest js
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
import { PrismaService } from "../prisma/prisma.service";
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

  @HttpCode(HttpStatus.OK)
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

# Buat Strategy Method untuk validasi token dan Nestjs Guard

### Buat file `src/auth/strategy/jwt.strategy.ts`
```ts
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService, private readonly prisma: PrismaService){
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_SECRET'),
    })
  }

  async validate(payload: {sub: number; email: string;}) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
    });
    delete user.password;
    return user
  }
}
```

### Buat file `src/auth/strategy/index.ts`
```ts
export * from './jwt.strategy'
```

### Import JwtStrategy di `auth.module.ts`
```ts
import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategy';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy]
})
export class AuthModule {}
```

### Buat file guard `src/auth/guards/jwt.guards.ts`
```ts
import { AuthGuard } from "@nestjs/passport";

export class JwtGuard extends AuthGuard('jwt') {
  constructor() {
    super();
  }
}
```

### Buat file guard `src/auth/guards/index.ts`
```ts
export * from './jwt.guard'
```

### Generate Controller user
```bash
nest g controller user --no-spec
```

### Edit file `user/user.controller.ts`
```ts
import { Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guards';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  @Get('me')
  getMe(@GetUser() user: User) {
    return user;
  }

  @Patch()
  editUser() {

  }
}
```

### Test User me menggunakan Curl
```bash
curl -X GET http://localhost:3000/users/me \
   -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjQsImVtYWlsIjoiaXNuYWVuQGJlbGFqYXIuY29tIiwiaWF0IjoxNjQ1ODI2MTEzLCJleHAiOjE2NDU4MjcwMTN9.bjtOiFtJVIr3lWIuJZoaRwr0TD2sffPgygzedAWDsmE Content-Type: application/json'
```

# E2E (End to End ) Testing

Buat database untuk Testing di Docker Compose
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
  test-db:
    image: postgres:13
    ports:
      - 5435:5432
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: 123
      POSTGRES_DB: nest
    networks:
      - belajar-nestjs
networks:
  belajar-nestjs:
```

Install Pactum
```bash
npm install -D pactum
```

Install Dotenv cli
```
npm install -D dotenv-cli
```

Buat file environment untuk testing `.env.test`
```
DATABASE_URL="postgresql://postgres:123@localhost:5435/nest?schema=public"
JWT_SECRET='ini-secret-untuk-jwt'
```

Edit file di `package.json`
```ts
"scripts": {
    "prisma:dev:studio": "prisma studio",
    "prisma:dev:deploy": "prisma migrate deploy",
    "db:dev:rm": "docker-compose rm -f -s -v dev-db",
    "db:dev:up": "docker-compose up -d dev-db",
    "db:dev:restart": "npm run db:dev:rm && npm run db:dev:up && sleep 2 && npm run prisma:dev:deploy",
    "prisma:test:studio": "dotenv -e .env.test -- prisma studio",
    "prisma:test:deploy": "dotenv -e .env.test -- prisma migrate deploy",
    "db:test:rm": "docker-compose rm -f -s -v test-db",
    "db:test:up": "docker-compose up -d test-db",
    "db:test:restart": "npm run db:test:rm && npm run db:test:up && sleep 2 && npm run prisma:test:deploy",
    "prebuild": "rimraf dist",
    "build": "nest build",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "pretest:e2e": "npm run db:test:restart",
    "test:e2e": "dotenv -e .env.test -- jest --watch --no-cache --config ./test/jest-e2e.json"
  }
```
Jalankan Testing
```
npm run test:e2e
```

Tambahkan script di `prisma.service.ts` untuk clean database
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

  cleanDB() {
    return this.$transaction([
      this.post.deleteMany(),
      this.user.deleteMany(),
    ])
  }
}
```
Buat API Edit User
```
nest g service user --no-spec
```

Buat Dto file `src/user/dto/edit-user.dto.ts` untuk Edit User
```ts
import { IsEmail, IsOptional, IsString } from "class-validator";

export class EditUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;
}
```

Export ke `src/user/dto/index.ts`
```ts
export * from './edit-user.dto'
```

Edit `src/user/user.controller.ts`
```ts
import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guards';
import { EditUserDto } from './dto';
import { UserService } from './user.service';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService){}

  @Get('me')
  getMe(@GetUser() user: User) {
    return user;
  }

  @Patch()
  editUser(@Body() dto: EditUserDto, @GetUser('id') userId: number) {
    return this.userService.editUser(userId, dto);
  }
}
```

Edit file `src/user/user.service.ts`
```ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EditUserDto } from './dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async editUser(userId: number, dto: EditUserDto) {
    const user = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...dto,
      },
    });

    delete user.password;

    return user;
  }
}
```

Edit file `app.e2e-spec.ts` untuk testing
```ts
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { PrismaService } from "../src/prisma/prisma.service";
import { AppModule } from "../src/app.module";
import * as pactum from "pactum";
import { AuthDto } from "../src/auth/dto";
import { EditUserDto } from "../src/user/dto";

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef =
      await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDB();
    pactum.request.setBaseUrl(
      'http://localhost:3333',
    );
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: "isnaen@gmail.com",
      password: "password123"
    }

    describe('Signup', () => {
      it('Signup akan Error jika email kosong!', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: dto.password
          })
          .expectStatus(400);
      });
      it('Signup akan Error jika Password kosong!', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: dto.email
          })
          .expectStatus(400);
      });
      it('Signup akan Error jika tanpa body!', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .expectStatus(400);
      });
      it('Berhasil Signup!', () =>{
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });
    });

    describe('Signin', () => {
      it('Signin akan Error jika email kosong!', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            password: dto.password
          })
          .expectStatus(400);
      });
      it('Signin akan Error jika Password kosong!', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: dto.email
          })
          .expectStatus(400);
      });
      it('Signin akan Error jika tanpa body!', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .expectStatus(400);
      });
      it('Berhasil Signin!', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAccessToken', 'access_token');
      });
    });
  });

  describe('User', () => {
    describe('Get me', () => {
      it('Berhasil mendapatkan user sekarang yang sedang login!', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: `Bearer $S{userAccessToken}`
          })
          .expectStatus(200);
      });
    });
    describe('Edit user', () => {
      it('Berhasil mengedit user!', () => {
        const dto: EditUserDto = {
          firstName: "Zulfikar",
          lastName: "Isnaen",
          email: 'isnaen70@gmail.com'
        }
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: `Bearer $S{userAccessToken}`
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.firstName)
          .expectBodyContains(dto.lastName)
          .expectBodyContains(dto.email);
      })
    })
  });
})
```

# Buat API untuk Post
Buat service dan controller
```
nest g service post --no-spec && nest g controller post --no-spec
```

Edit `src/post/dto/create-post.dto.ts`
```ts
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;
}
```

Edit `src/post/dto/edit-post.dto.ts`
```ts
import { IsOptional, IsString } from "class-validator";

export class EditPostDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
```

Edit `src/post/dto/index.ts`
```
export * from "./create-post.dto";
export * from "./edit-post.dto"
```

Edit `src/post/post.service.ts`
```ts
import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto, EditPostDto } from './dto';

@Injectable()
export class PostService {

  constructor(private readonly prisma: PrismaService){}

  async getPosts(userId: number) {
    return await this.prisma.post.findMany({
      where: {
        userId: userId
      }
    })
  }

  async getPostById(userId: number, postId: number) {
    return await this.prisma.post.findFirst({
      where: {
        userId: userId,
        id: postId
      }
    })
  }

  async createPost(userId: number, dto: CreatePostDto) {
    const post = await this.prisma.post.create({
      data: {
        userId,
        ...dto
      }
    });

    return post;
  }

  async editPostById(userId: number, postId: number, dto: EditPostDto) {
    //get post by id
    const post = await this.prisma.post.findUnique({
      where: {
        id: postId
      }
    });

    //cek jika user memiliki post ini
    if (!post || post.userId !== userId)
      throw new ForbiddenException(
        'Access to resource post denied!'
      );
    
    return this.prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        ...dto,
      }
    })
  }

  async deletePostById(userId: number, postId: number) {
    const post = await this.prisma.post.findUnique({
      where: {
        id: postId
      }
    });

    //cek jika user memiliki post ini
    if (!post || post.userId !== userId)
      throw new ForbiddenException(
        'Access to resource post denied!'
      );

    await this.prisma.post.delete({
      where: {
        id: postId,
      }
    })
  }
}
```

Edit `src/post/post.controller.ts`
```ts
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guards';
import { CreatePostDto, EditPostDto } from './dto';
import { PostService } from './post.service';

@UseGuards(JwtGuard)
@Controller('posts')
export class PostController {

  constructor(private readonly postService: PostService){}

  @Get()
  getPosts(@GetUser('id') userId: number) {
    return this.postService.getPosts(userId);
  }

  @Get(':id')
  getPostById(@GetUser('id') userId: number, @Param('id', ParseIntPipe) postId: number) {
    return this.postService.getPostById(userId, postId);
  }

  @Post()
  createPost(@GetUser('id') userId: number, @Body() dto: CreatePostDto) {
    return this.postService.createPost(userId, dto);
  }

  @Patch(':id')
  editPostById(@GetUser('id') userId: number,@Param('id', ParseIntPipe) postId: number,  @Body() dto: EditPostDto) {
    return this.postService.editPostById(userId, postId, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deletePostById(@GetUser('id') userId: number, @Param('id', ParseIntPipe) postId: number) {
    return this.postService.deletePostById(userId, postId);
  }
}
```

Edit testing file `test/app.e2e-spec.ts`
```ts
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { PrismaService } from "../src/prisma/prisma.service";
import { AppModule } from "../src/app.module";
import * as pactum from "pactum";
import { AuthDto } from "../src/auth/dto";
import { EditUserDto } from "../src/user/dto";
import { CreatePostDto } from "src/post/dto";

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef =
      await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDB();
    pactum.request.setBaseUrl(
      'http://localhost:3333',
    );
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: "isnaen@gmail.com",
      password: "password123"
    }

    describe('Signup', () => {
      it('Signup akan Error jika email kosong!', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: dto.password
          })
          .expectStatus(400);
      });
      it('Signup akan Error jika Password kosong!', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: dto.email
          })
          .expectStatus(400);
      });
      it('Signup akan Error jika tanpa body!', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .expectStatus(400);
      });
      it('Berhasil Signup!', () =>{
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });
    });

    describe('Signin', () => {
      it('Signin akan Error jika email kosong!', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            password: dto.password
          })
          .expectStatus(400);
      });
      it('Signin akan Error jika Password kosong!', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: dto.email
          })
          .expectStatus(400);
      });
      it('Signin akan Error jika tanpa body!', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .expectStatus(400);
      });
      it('Berhasil Signin!', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAccessToken', 'access_token');
      });
    });
  });

  describe('User', () => {
    describe('Get me', () => {
      it('Berhasil mendapatkan user sekarang yang sedang login!', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: `Bearer $S{userAccessToken}`
          })
          .expectStatus(200);
      });
    });
    describe('Edit user', () => {
      it('Berhasil mengedit user!', () => {
        const dto: EditUserDto = {
          firstName: "Zulfikar",
          lastName: "Isnaen",
          email: 'isnaen70@gmail.com'
        }
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: `Bearer $S{userAccessToken}`
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.firstName)
          .expectBodyContains(dto.lastName)
          .expectBodyContains(dto.email);
      })
    })
  });

  describe('Post', () => {
    describe('Get Empty Posts', () => {
      it('Berhasil mendapatkan Post kosong!', () => {
        return pactum
          .spec()
          .get('/posts')
          .withHeaders({
            Authorization: `Bearer $S{userAccessToken}`
          })
          .expectStatus(200)
          .expectBody([]);
      })
    });
    describe('Create Post', () => {
      const dto: CreatePostDto = {
        title: "Post Pertama",
        description:"Ini adalah Post pertama"
      }
      it('Berhasil membuat Post!', () => {
        return pactum
          .spec()
          .post('/posts')
          .withHeaders({
            Authorization: `Bearer $S{userAccessToken}`
          })
          .withBody(dto)
          .expectStatus(201)
          .stores('postId', 'id');
      })
    });
    describe('Get Posts', () => {
      it('Berhasil mendapatkan Semua Post!', () => {
        return pactum
          .spec()
          .get('/posts')
          .withHeaders({
            Authorization: `Bearer $S{userAccessToken}`
          })
          .expectStatus(200)
          .expectJsonLength(1);
      })
    });
    describe('Get Post By Id', () => {
      it('Berhasil mendapatkan Post by Id!', () => {
        return pactum
          .spec()
          .get('/posts/{id}')
          .withPathParams('id', `$S{postId}`)
          .withHeaders({
            Authorization: `Bearer $S{userAccessToken}`
          })
          .expectStatus(200)
          .expectBodyContains(`$S{postId}`);
      })
    });
    describe('Edit Post', () => {
      const dto: CreatePostDto = {
        title: "Post Pertama Hasil Edit",
        description:"Ini adalah Post pertama Hasil Edit"
      }
      it('Berhasil Mengedit Post by Id!', () => {
        return pactum
          .spec()
          .patch('/posts/{id}')
          .withPathParams('id', `$S{postId}`)
          .withBody(dto)
          .withHeaders({
            Authorization: `Bearer $S{userAccessToken}`
          })
          .expectStatus(200)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.description);
      })
    });
    describe('Delete Post', () => {
      it('Berhasil Menghapus Post by Id!', () => {
        return pactum
          .spec()
          .delete('/posts/{id}')
          .withPathParams('id', `$S{postId}`)
          .withHeaders({
            Authorization: `Bearer $S{userAccessToken}`
          })
          .expectStatus(204);
      });
      it('Berhasil Mendapatkan Post kosong!', () => {
        return pactum
          .spec()
          .get('/posts')
          .withHeaders({
            Authorization: `Bearer $S{userAccessToken}`
          })
          .expectStatus(200)
          .expectJsonLength(0);
      })
    });
  });
})
```

# Open API menggunakan Swagger UI
Install swagger
```bash
npm install --save @nestjs/swagger swagger-ui-express
```

Edit `main.ts`
```ts
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true
  }));

  const option = {
    customCss: `
    .topbar-wrapper img {content:url(\'https://www.pngarts.com/files/2/Letter-Z-PNG-Image-Transparent.png'); width:100px; height:auto;}
    .swagger-ui .topbar { background-color: #fafafa; }`,
    customfavIcon: 'https://www.pngarts.com/files/2/Letter-Z-PNG-Image-Transparent.png',
    customSiteTitle: 'Post API by Zulfikar'
  }

  const config = new DocumentBuilder()
    .setTitle('Post API')
    .setDescription('Ini adalah Post API dengan user Authentication sederhana by Zulfikar :)')
    .setVersion('1.0')
    .addBearerAuth(
      { 
        // I was also testing it without prefix 'Bearer ' before the JWT
        description: `[just text field] Please enter token in following format: Bearer <JWT>`,
        name: 'Authorization',
        bearerFormat: 'Bearer', // I`ve tested not to use this field, but the result was the same
        scheme: 'Bearer',
        type: 'http', // I`ve attempted type: 'apiKey' too
        in: 'Header'
      },
      'access-token', // This name here is important for matching up with @ApiBearerAuth() in your controller!
    )
    .build()

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/', app, document, option);

  await app.listen(3000);
}
bootstrap();
```

Edit Dto kalian misalkan `auth.dto.ts`
```ts
import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class AuthDto {
  @ApiProperty({ example: 'isnaen@gmail.com', description: 'Masukan email kamu di sini' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123', description: 'Masukan password kamu di sini' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
```

Lalu tambahkan di `auth.controller.ts`
```ts

import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { AuthDto } from "./dto";

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @ApiOperation({ summary: 'API ini digunakan untuk Signup' })
  @ApiResponse({ status: 201, description: '{ "access_token": "token kamu nanti ada di sini"}' })
  @Post('signup')
  signup(@Body() dto: AuthDto) {
    return this.authService.signup(dto)
  }
  
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'API ini digunakan untuk Signin' })
  @ApiResponse({ status: 200, description: '{ "access_token": "token kamu nanti ada di sini"}' })
  @Post('signin')
  signin(@Body() dto: AuthDto) {
    return this.authService.signin(dto)
  }
}
```

# Production to Heroku
Buka heroku lalu create aplikasi di heroku, lalu tambahkan heroku postgres di heroku app kamu.
Install terlebih dahulu Heroku CLI di komputer kamu
```
heroku git:remote -a <nama-aplikasi-kamu>
heroku config:set NPM_CONFIG_PRODUCTION=false
heroku config:set JWT_SECRET=poiasdkfwe87324osadsadasd23213ids9sdf09sdf723uywe8
git add .
git commit -m "add: production ready"
git push heroku master
```

# Serverless
```bash
yarn add aws-serverless-express aws-lambda
yarn add -D serverless-offline plugin
serverless --org=zulfikar4568
```

Buat file di src/serverless/lambda.ts
```ts
import { Handler, Context } from 'aws-lambda';
import { Server } from 'http';
import {
  createServer,
  proxy,
} from 'aws-serverless-express';
import { eventContext } from 'aws-serverless-express/middleware';
import { AppModule } from '../app.module';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';

import express from 'express';
import { INestApplication } from '@nestjs/common';
import {
  DocumentBuilder,
  SwaggerModule,
} from '@nestjs/swagger';

// NOTE: If you get ERR_CONTENT_DECODING_FAILED in your browser, this is likely
// due to a compressed response (e.g. gzip) which has not been handled correctly
// by aws-serverless-express and/or API Gateway. Add the necessary MIME types to
// binaryMimeTypes below
const binaryMimeTypes: string[] = [];

let cachedServer: Server;

function setupSwagger(app: INestApplication) {
  const option = {
    customCss: `
    .topbar-wrapper img {content:url(\'https://www.pngarts.com/files/2/Letter-Z-PNG-Image-Transparent.png'); width:100px; height:auto;}
    .swagger-ui .topbar { background-color: #fafafa; }`,
    customfavIcon:
      'https://www.pngarts.com/files/2/Letter-Z-PNG-Image-Transparent.png',
    customSiteTitle: 'Post API by Zulfikar',
  };

  const config = new DocumentBuilder()
    .setTitle('Blog Post API')
    .setDescription(
      'Ini adalah Post API dengan user Authentication sederhana by Zulfikar :)',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        // I was also testing it without prefix 'Bearer ' before the JWT
        description: `[just text field] Please enter token in following format: Bearer <JWT>`,
        name: 'Authorization',
        bearerFormat: 'Bearer', // I`ve tested not to use this field, but the result was the same
        scheme: 'Bearer',
        type: 'http', // I`ve attempted type: 'apiKey' too
        in: 'Header',
      },
      'access-token', // This name here is important for matching up with @ApiBearerAuth() in your controller!
    )
    .build();
  const document = SwaggerModule.createDocument(
    app,
    config,
  );
  SwaggerModule.setup(
    'api',
    app,
    document,
    option,
  );
}

async function bootstrapServer(): Promise<Server> {
  if (!cachedServer) {
    try {
      const expressApp = express();
      const nestApp = await NestFactory.create(
        AppModule,
        new ExpressAdapter(expressApp),
      );
      nestApp.use(eventContext());
      setupSwagger(nestApp);
      await nestApp.init();
      cachedServer = createServer(
        expressApp,
        undefined,
        binaryMimeTypes,
      );
    } catch (error) {
      return Promise.reject(error);
    }
  }
  return cachedServer;
}

export const handler: Handler = async (
  event: any,
  context: Context,
) => {
  if (event.path === '/api') {
    event.path = '/api/';
  }
  event.path = event.path.includes('swagger-ui')
    ? `/api${event.path}`
    : event.path;
  cachedServer = await bootstrapServer();
  return proxy(
    cachedServer,
    event,
    context,
    'PROMISE',
  ).promise;
};
```

Buat file `serverless.yaml` di root
```yaml
org: zulfikar4568
app: blog-post-serverless
service: blog-post-serverless

useDotenv: true

frameworkVersion: '3'

plugins:
  - serverless-plugin-typescript
  - serverless-plugin-optimize
  - serverless-offline

provider:
  name: aws
  runtime: nodejs14.x
  environment:
    JWT_SECRET: ${env:JWT_SECRET}
    DATABASE_URL: ${env:DATABASE_URL}

functions:
  main:
    handler: src/serverless/lambda.handler
    events:
      - http:
          path: /{any+}
          method: any

custom:
  optimize:
    external: ['swagger-ui-dist']
```

### Running Serverless Locally
```bash
serverless offline start --noPrependStageInUrl
```