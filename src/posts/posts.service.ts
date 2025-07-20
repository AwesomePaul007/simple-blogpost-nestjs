import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PostInterface } from './interfaces/post.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { PostEntity } from './entities/post.entity';
import { Repository } from 'typeorm';
import { UpdatePostDto } from './dto/update-post.dto';
import { UserEntity, UserRole } from 'src/auth/entities/user-entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostEntity)
    private postRepository: Repository<PostEntity>,
  ) {}

  private posts: PostInterface[] = [
    {
      id: 1,
      title: 'First postcontent',
      authorName: 'Paull',
      content: 'Posting 1',
      createdAt: new Date(),
    },
  ];

  // findAll(): PostInterface[] {
  async findAll(): Promise<PostEntity[]> {
    return this.postRepository.find({
      relations: ['authorName'], // Include authorName relation
    });
  }

  // findOne(id: number): PostInterface {
  async findOne(id: number): Promise<PostEntity> {
    // const post = await this.postRepository.findOneBy({ id });
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['authorName'], // Include authorName relation
    });

    if (!post) throw new NotFoundException(`Post with ID ${id} is not found`);
    return post;
  }

  // creaePost(postData: Omit<PostInterface, 'id' | 'createdAt'>): PostInterface {
  async create(
    postData: Omit<PostInterface, 'id' | 'createdAt'>,
    authorName: UserEntity,
  ): Promise<PostEntity> {
    // const newPost: PostInterface = {
    // id: this.getNextPostId(),
    // createdAt: new Date(),
    // ...postData,
    // };
    // this.posts.push(newPost);

    const newPost = this.postRepository.create({
      //  ...postData,
      title: postData.title,
      content: postData.content,
      authorName,
    });
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
    user: UserEntity,
  ): Promise<PostEntity> {
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

    if (findPost.authorName.id !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        `You are not authorized to update this post`,
      );
    }

    if (postUpdate.title) {
      findPost.title = postUpdate.title;
    }
    if (postUpdate.content) {
      findPost.content = postUpdate.content;
    }
    // if (postUpdate.authorName) {
    //   findPost.authorName = postUpdate.authorName;
    // }

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
