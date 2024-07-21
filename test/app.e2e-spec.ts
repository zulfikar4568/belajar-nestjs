import {
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import * as pactum from 'pactum';
import { AuthDto } from '../src/auth/dto';
import { EditUserDto } from '../src/user/dto';
import { CreatePostDto } from 'src/post/dto';

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
      email: 'isnaen@gmail.com',
      password: 'password123',
    };

    describe('Signup', () => {
      it('Signup akan Error jika email kosong!', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });
      it('Signup akan Error jika Password kosong!', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });
      it('Signup akan Error jika tanpa body!', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .expectStatus(400);
      });
      it('Berhasil Signup!', () => {
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
            password: dto.password,
          })
          .expectStatus(400);
      });
      it('Signin akan Error jika Password kosong!', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: dto.email,
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
          .stores(
            'userAccessToken',
            'access_token',
          );
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
            Authorization: `Bearer $S{userAccessToken}`,
          })
          .expectStatus(200);
      });
    });
    describe('Edit user', () => {
      it('Berhasil mengedit user!', () => {
        const dto: EditUserDto = {
          firstName: 'Zulfikar',
          lastName: 'Isnaen',
          email: 'isnaen70@gmail.com',
        };
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: `Bearer $S{userAccessToken}`,
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.firstName)
          .expectBodyContains(dto.lastName)
          .expectBodyContains(dto.email);
      });
    });
  });

  describe('Post', () => {
    describe('Get Empty Posts', () => {
      it('Berhasil mendapatkan Post kosong!', () => {
        return pactum
          .spec()
          .get('/posts')
          .withHeaders({
            Authorization: `Bearer $S{userAccessToken}`,
          })
          .expectStatus(200)
          .expectBody([]);
      });
    });
    describe('Create Post', () => {
      const dto: CreatePostDto = {
        title: 'Post Pertama',
        description: 'Ini adalah Post pertama',
      };
      it('Berhasil membuat Post!', () => {
        return pactum
          .spec()
          .post('/posts')
          .withHeaders({
            Authorization: `Bearer $S{userAccessToken}`,
          })
          .withBody(dto)
          .expectStatus(201)
          .stores('postId', 'id');
      });
    });
    describe('Get Posts', () => {
      it('Berhasil mendapatkan Semua Post!', () => {
        return pactum
          .spec()
          .get('/posts')
          .withHeaders({
            Authorization: `Bearer $S{userAccessToken}`,
          })
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });
    describe('Get Post By Id', () => {
      it('Berhasil mendapatkan Post by Id!', () => {
        return pactum
          .spec()
          .get('/posts/{id}')
          .withPathParams('id', `$S{postId}`)
          .withHeaders({
            Authorization: `Bearer $S{userAccessToken}`,
          })
          .expectStatus(200)
          .expectBodyContains(`$S{postId}`);
      });
    });
    describe('Edit Post', () => {
      const dto: CreatePostDto = {
        title: 'Post Pertama Hasil Edit',
        description:
          'Ini adalah Post pertama Hasil Edit',
      };
      it('Berhasil Mengedit Post by Id!', () => {
        return pactum
          .spec()
          .patch('/posts/{id}')
          .withPathParams('id', `$S{postId}`)
          .withBody(dto)
          .withHeaders({
            Authorization: `Bearer $S{userAccessToken}`,
          })
          .expectStatus(200)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.description);
      });
    });
    describe('Delete Post', () => {
      it('Berhasil Menghapus Post by Id!', () => {
        return pactum
          .spec()
          .delete('/posts/{id}')
          .withPathParams('id', `$S{postId}`)
          .withHeaders({
            Authorization: `Bearer $S{userAccessToken}`,
          })
          .expectStatus(204);
      });
      it('Berhasil Mendapatkan Post kosong!', () => {
        return pactum
          .spec()
          .get('/posts')
          .withHeaders({
            Authorization: `Bearer $S{userAccessToken}`,
          })
          .expectStatus(200)
          .expectJsonLength(0);
      });
    });
  });
});
