import { Injectable, NotFoundException } from '@nestjs/common';
import { PostInterface } from './interfaces/post.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private postRepository: Repository<Post>,
  ) {}

  private posts: PostInterface[] = [
    {
      id: 1,
      title: 'First postcontent',
      authorName: 'Sangam',
      content: 'Posting 1',
      createdAt: new Date(),
    },
  ];

  // findAll(): PostInterface[] {
  async findAll(): Promise<Post[]> {
    return this.postRepository.find();
  }

  // findOne(id: number): PostInterface {
  async findOne(id: number): Promise<Post> {
    const post = await this.postRepository.findOneBy({ id });

    if (!post) throw new NotFoundException(`Post with ID ${id} is not found`);
    return post;
  }

  // creaePost(postData: Omit<PostInterface, 'id' | 'createdAt'>): PostInterface {
  async creaePost(
    postData: Omit<PostInterface, 'id' | 'createdAt'>,
  ): Promise<Post> {
    // const newPost: PostInterface = {
    // id: this.getNextPostId(),
    // createdAt: new Date(),
    // ...postData,
    // };
    // this.posts.push(newPost);

    const newPost = this.postRepository.create({ ...postData });
    return this.postRepository.save(newPost);
  }

  getNextPostId(): number {
    return this.posts.length > 0
      ? Math.max(...this.posts.map((post) => post.id + 1))
      : 1;
  }

  async updatePost(
    id: number,
    // postUpdate: Partial<Omit<PostInterface, 'id' | 'createdAt'>>,
    postUpdate: UpdatePostDto,
  ): Promise<Post> {
    // const currentPostIndex = this.posts.findIndex((post) => post.id === id);
    // // console.log('CCC', currentPostIndex)
    // if (currentPostIndex < 0)
    //   throw new NotFoundException(`The post id ${id} is not found`);

    // this.posts[currentPostIndex] = {
    //   ...this.posts[currentPostIndex],
    //   ...postUpdate,
    //   updatedAt: new Date(),
    // };

    // return this.posts[currentPostIndex];

    const findPost = await this.findOne(id);

    if (postUpdate.title) {
      findPost.title = postUpdate.title;
    }
    if (postUpdate.content) {
      findPost.content = postUpdate.content;
    }
    if (postUpdate.authorName) {
      findPost.authorName = postUpdate.authorName;
    }

    return this.postRepository.save(findPost);
  }

  async removePost(id: number): Promise<void> {
    // const postIndex = this.posts.findIndex((post) => post.id === id);

    // if (postIndex < 0)
    //   throw new NotFoundException(`The post id ${id} is not found`);

    // this.posts.splice(postIndex, 1);

    // return {
    //   message: `Post with ID ${id} has been deleted`,
    // };

    const findPost = await this.findOne(id);

    await this.postRepository.remove(findPost);
  }
}
