import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreatePostDto,
  EditPostDto,
} from './dto';

@Injectable()
export class PostService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getPosts(userId: number) {
    return await this.prisma.post.findMany({
      where: {
        userId: userId,
      },
    });
  }

  async getPostById(
    userId: number,
    postId: number,
  ) {
    return await this.prisma.post.findFirst({
      where: {
        userId: userId,
        id: postId,
      },
    });
  }

  async createPost(
    userId: number,
    dto: CreatePostDto,
  ) {
    const post = await this.prisma.post.create({
      data: {
        userId,
        ...dto,
      },
    });

    return post;
  }

  async editPostById(
    userId: number,
    postId: number,
    dto: EditPostDto,
  ) {
    //get post by id
    const post =
      await this.prisma.post.findUnique({
        where: {
          id: postId,
        },
      });

    //cek jika user memiliki post ini
    if (!post || post.userId !== userId)
      throw new ForbiddenException(
        'Access to resource post denied!',
      );

    return this.prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        ...dto,
      },
    });
  }

  async deletePostById(
    userId: number,
    postId: number,
  ) {
    const post =
      await this.prisma.post.findUnique({
        where: {
          id: postId,
        },
      });

    //cek jika user memiliki post ini
    if (!post || post.userId !== userId)
      throw new ForbiddenException(
        'Access to resource post denied!',
      );

    await this.prisma.post.delete({
      where: {
        id: postId,
      },
    });
  }
}
