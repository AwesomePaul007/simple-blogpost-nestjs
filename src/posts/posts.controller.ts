import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  // NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  // Query,
  // UsePipes,
  // ValidationPipe,
} from '@nestjs/common';
import { PostsService } from './posts.service';
// import { PostInterface } from './interfaces/post.interface';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostExistsPipe } from './pipes/post-exists.pipe';
import { PostEntity } from './entities/post.entity';

@Controller('posts')
export class PostsController {
  constructor(private readonly postService: PostsService) {}

  @Get()
  // findAll(@Query('search') search?: string): PostInterface[] {
  //   const allPosts = this.postService.findAll();

  //   if (search) {
  //     return allPosts.filter((item) =>
  //       item.title.toLowerCase().includes(search.toLowerCase()),
  //     );
  //   }
  //   return allPosts;
  // }
  async findAll(): Promise<PostEntity[]> {
    return this.postService.findAll();
  }

  @Get(':id')
  // findOne(
  //   @Param('id', ParseIntPipe, PostExistsPipe) id: number,
  // ): PostInterface {
  //   const singlePost = this.postService.findOne(id);
  //   // .findAll()
  //   // .find((item) => item.id === id);

  //   if (!singlePost) {
  //     throw new NotFoundException(`Post with ID ${id} is not found`);
  //   }

  //   return singlePost;
  // }
  async findOne(
    @Param('id', ParseIntPipe, PostExistsPipe) id: number,
  ): Promise<PostEntity> {
    return this.postService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  // createPost(
  //   @Body() postData: Omit<PostInterface, 'id' | 'createdAt'>,
  // ): PostInterface {
  // @UsePipes(
  //   new ValidationPipe({
  //     whitelist: true,
  //     forbidNonWhitelisted: true,
  //     transform: true,
  //     disableErrorMessages: false,
  //   }),
  // )
  // createPost(@Body() postData: CreatePostDto): PostInterface {
  async createPost(@Body() postData: CreatePostDto): Promise<PostEntity> {
    return this.postService.create(postData);
  }

  @Put(':id')
  // updatePost(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Body() updateData: Partial<Omit<PostInterface, 'id' | 'createdAt'>>,
  // ): PostInterface {
  updatePost(
    @Param('id', ParseIntPipe, PostExistsPipe) id: number,
    @Body() updateData: UpdatePostDto,
  ): Promise<PostEntity> {
    return this.postService.updatePost(id, updateData);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(
    @Param('id', ParseIntPipe, PostExistsPipe) id: number,
  ): Promise<void> {
    await this.postService.removePost(id);
  }
}
