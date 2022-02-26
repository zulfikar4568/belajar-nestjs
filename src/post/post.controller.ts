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
