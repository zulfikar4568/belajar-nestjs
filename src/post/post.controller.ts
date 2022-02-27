import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guards';
import { CreatePostDto, EditPostDto } from './dto';
import { PostService } from './post.service';

@ApiBearerAuth('access-token')
@ApiTags('posts')
@UseGuards(JwtGuard)
@Controller('posts')
export class PostController {

  constructor(private readonly postService: PostService){}

  @Get()
  @ApiOperation({ summary: 'API ini digunakan untuk mendapat semua post dari pemilik token' })
  getPosts(@GetUser('id') userId: number) {
    return this.postService.getPosts(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'API ini digunakan untuk mendapat post berdasarkan ID dari pemilik token' })
  getPostById(@GetUser('id') userId: number, @Param('id', ParseIntPipe) postId: number) {
    return this.postService.getPostById(userId, postId);
  }

  @Post()
  @ApiOperation({ summary: 'API ini digunakan untuk membuat post' })
  createPost(@GetUser('id') userId: number, @Body() dto: CreatePostDto) {
    return this.postService.createPost(userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'API ini digunakan untuk mengubah post berdasarkan ID' })
  editPostById(@GetUser('id') userId: number,@Param('id', ParseIntPipe) postId: number,  @Body() dto: EditPostDto) {
    return this.postService.editPostById(userId, postId, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  @ApiOperation({ summary: 'API ini digunakan untuk menghapus post berdasarkan ID' })
  deletePostById(@GetUser('id') userId: number, @Param('id', ParseIntPipe) postId: number) {
    return this.postService.deletePostById(userId, postId);
  }
}
