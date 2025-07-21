import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PostInterface } from './interfaces/post.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { PostEntity } from './entities/post.entity';
import { Repository } from 'typeorm';
import { UpdatePostDto } from './dto/update-post.dto';
import { UserEntity, UserRole } from 'src/auth/entities/user-entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { FindPostsQueryDTO } from './dto/find-posts-query.dto';
import { PaginatedResponse } from 'src/common/interfaces/paginated-response-interfaces';
import { Cache } from 'cache-manager';

@Injectable()
export class PostsService {
  private postListCacheKey: Set<string> = new Set();
  constructor(
    @InjectRepository(PostEntity)
    private postRepository: Repository<PostEntity>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
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

  private generatePostListCacheKey(query: FindPostsQueryDTO): string {
    const { page = 1, title, limit = 10 } = query;
    return `posts-list-page-${title || 'all'}-${page}-${limit}`;
  }

  // findAll(): PostInterface[] {
  async findAll(
    query: FindPostsQueryDTO,
  ): Promise<PaginatedResponse<PostEntity>> {
    // return this.postRepository.find({
    //   relations: ['authorName'], // Include authorName relation
    // });
    const cacheKey = this.generatePostListCacheKey(query);
    this.postListCacheKey.add(cacheKey);
    const getCachedData =
      await this.cacheManager.get<PaginatedResponse<PostEntity>>(cacheKey);

    if (getCachedData) {
      console.log(`Cache hit --> key: ${cacheKey} value:`, getCachedData);
      return getCachedData;
    }

    console.log(`Cache miss --> key: ${cacheKey} value:`, getCachedData);
    const { page = 1, title, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.authorName', 'authorName')
      .orderBy('post.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (title) {
      queryBuilder.andWhere('post.title ILIKE :title', { title: `%${title}%` });
    }

    console.log('SQL Query:', queryBuilder.getSql());
    const [items, totalItems] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(totalItems / limit);
    const responseResult: PaginatedResponse<PostEntity> = {
      items,
      meta: {
        currentPage: page,
        itemsPerPage: limit,
        totalPages,
        totalItems,
        hasPreviousPage: page > 1,
        hasNextPage: page < totalPages,
      },
    };
    await this.cacheManager.set(cacheKey, responseResult, 30000); // Cache for 5 minutes
    console.log(`Cache set --> key: ${cacheKey} value:`, responseResult);
    return responseResult;
  }

  // findOne(id: number): PostInterface {
  async findOne(id: number): Promise<PostEntity> {
    // const post = await this.postRepository.findOneBy({ id });
    const cacheKey = `single-post-${id}`;
    const singleCachePost = await this.cacheManager.get<PostEntity>(cacheKey);
    if (singleCachePost) {
      console.log(`Cache hit for single post --> key: ${cacheKey}`);
      return singleCachePost;
    }

    console.log(`Cache miss for single post --> key: ${cacheKey}`);

    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['authorName'], // Include authorName relation
    });

    if (!post) throw new NotFoundException(`Post with ID ${id} is not found`);

    await this.cacheManager.set(cacheKey, post, 30000); // Cache for 5 minutes
    console.log(`Cache set for single post --> key: ${cacheKey} value:`, post);
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
    await this.invalidateAllPostListCache();
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

    const updatedPost = await this.postRepository.save(findPost);

    await this.cacheManager.del(`single-post-${id}`);
    await this.invalidateAllPostListCache();

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

    await this.cacheManager.del(`single-post-${id}`);
    await this.invalidateAllPostListCache();

    await this.postRepository.remove(findPost);
  }

  private async invalidateAllPostListCache(): Promise<void> {
    console.log(
      `Invalidating all post list cache keys of size ${this.postListCacheKey.size}...`,
    );
    for (const cacheKey of this.postListCacheKey) {
      await this.cacheManager.del(cacheKey);
      console.log(`Cache invalidated --> key: ${cacheKey}`);
    }
    this.postListCacheKey.clear();
  }
}
