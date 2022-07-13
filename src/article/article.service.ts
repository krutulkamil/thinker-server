import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DeleteResult, getRepository, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateArticleDto } from "@app/article/dto/createArticle.dto";
import { ArticleEntity } from "@app/article/article.entity";
import { UserEntity } from "@app/user/user.entity";
import { ArticleResponseInterface } from "@app/article/types/articleResponse.interface";
import { ArticlesResponseInterface } from "@app/article/types/articlesResponse.interface";
import slugify from "slugify";
import { FollowEntity } from "@app/profile/follow.entity";
import { CommentEntity } from "@app/article/comment.entity";
import {CommentResponseInterface} from "@app/article/types/commentResponse.interface";

@Injectable()
export class ArticleService {
    constructor(
        @InjectRepository(ArticleEntity)
        private readonly articleRepository: Repository<ArticleEntity>,
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        @InjectRepository(FollowEntity)
        private readonly followRepository: Repository<FollowEntity>,
        @InjectRepository(CommentEntity)
        private readonly commentRepository: Repository<CommentEntity>
    ) {};

    async findAll(currentUserId: number, query: any): Promise<ArticlesResponseInterface> {
        const queryBuilder = getRepository(ArticleEntity)
            .createQueryBuilder('articles')
            .leftJoinAndSelect('articles.author', 'author');

        if (query.tag) {
            queryBuilder
                .andWhere('articles.tagList LIKE :tag', {tag: `%${query.tag}%`});
        }

        if (query.author) {
            queryBuilder
                .andWhere("author.username = :username", {username: query.author});
        }

        if (query.favorited) {
            const author = await this.userRepository.findOne(
                {
                    username: query.favorited
                },
                { relations: ['favorites'] }
            );
            const ids = author.favorites.map(el => el.id);

            if (ids.length > 0) {
                queryBuilder.andWhere('articles.id IN (:...ids)', { ids });
            } else {
                queryBuilder.andWhere('1=0');
            }

        }

        queryBuilder.orderBy('articles.createdAt', 'DESC');

        const articlesCount = await queryBuilder.getCount();

        if (query.limit) {
            queryBuilder.limit(query.limit);
        }

        if (query.offset) {
            queryBuilder.offset(query.offset);
        }

        let favoriteIds: number[] = [];

        if (currentUserId) {
            const currentUser = await this.userRepository.findOne(currentUserId, { relations: ['favorites'] });
            favoriteIds = currentUser.favorites.map(favorite => favorite.id);
        }

        const articles = await queryBuilder.getMany();
        const articlesWithFavorited = articles.map(article => {
            const favorited = favoriteIds.includes(article.id);
            return {...article, favorited};
        })

        return {articles: articlesWithFavorited, articlesCount};
    };

    async getFeed(currentUserId: number, query: any): Promise<ArticlesResponseInterface> {
        const follows = await this.followRepository.find({
            followerId: currentUserId
        });

        if (follows.length === 0) {
            return {articles: [], articlesCount: 0};
        }

        const followingUserIds = follows.map(follow => follow.followingId);

        const queryBuilder = getRepository(ArticleEntity)
            .createQueryBuilder('articles')
            .leftJoinAndSelect('articles.author', 'author')
            .where('articles.authorId IN (:...ids)', { ids: followingUserIds });

        queryBuilder.orderBy('articles.createdAt', 'DESC');

        const articlesCount = await queryBuilder.getCount();

        if (query.limit) {
            queryBuilder.limit(query.limit);
        }

        if (query.offset) {
            queryBuilder.offset(query.offset);
        }

        const articles = await queryBuilder.getMany();

        return {articles, articlesCount};
    };

    async createArticle(
        currentUser: UserEntity,
        createArticleDto: CreateArticleDto
    ): Promise<ArticleEntity> {
        const article = new ArticleEntity();
        Object.assign(article, createArticleDto);

        if (!article.tagList) {
            article.tagList = [];
        }

        article.slug = this.getSlug(createArticleDto.title);
        article.author = currentUser;
        article.comments = [];

        return await this.articleRepository.save(article);
    }

    async deleteArticle(slug: string, currentUserId: number): Promise<DeleteResult> {
        const article = await this.findBySlug(slug);

        if (!article) {
            throw new HttpException('Article does not exist', HttpStatus.NOT_FOUND);
        }

        if (article.author.id !== currentUserId) {
            throw new HttpException('You are not an author', HttpStatus.FORBIDDEN);
        }

        article.comments = [];

        await this.articleRepository.save(article);
        return await this.articleRepository.delete({slug});
    };

    async updateArticle(slug: string, updateArticleDto: CreateArticleDto, currentUserId: number): Promise<ArticleEntity> {
        const article = await this.findBySlug(slug);

        if (!article) {
            throw new HttpException('Article does not exist', HttpStatus.NOT_FOUND);
        }

        if (article.author.id !== currentUserId) {
            throw new HttpException('You are not an author', HttpStatus.FORBIDDEN);
        }

        Object.assign(article, updateArticleDto);

        return await this.articleRepository.save(article);
    };

    async findBySlug(slug: string): Promise<ArticleEntity> {
        return await this.articleRepository.findOne({slug});
    };

    async findComments(slug: string): Promise<CommentResponseInterface> {
        const article = await this.articleRepository.findOne({slug});
        return {comments: article.comments};
    };

    async addComment(currentUser: UserEntity, slug: string, createArticleDto): Promise<ArticleResponseInterface> {
        let article = await this.articleRepository.findOne({slug});

        const comment = new CommentEntity();
        Object.assign(comment, createArticleDto);

        comment.author = currentUser;
        article.comments.push(comment);

        await this.commentRepository.save(comment);
        article = await this.articleRepository.save(article);

        return {article};
    };

    async deleteComment(slug: string, id: string): Promise<ArticleResponseInterface> {
        let article = await this.articleRepository.findOne({slug});

        const comment = await this.commentRepository.findOne(id);
        const deleteIndex = article.comments.findIndex(_comment => _comment.id === comment.id);

        if (deleteIndex >= 0) {
            const deleteComment = article.comments.splice(deleteIndex, 1);
            await this.commentRepository.delete(deleteComment[0].id);
            article = await this.articleRepository.save(article);
            return {article};
        } else {
            return {article};
        }
    }

    async addArticleToFavourites(slug: string, userId: number): Promise<ArticleEntity> {
        const article = await this.findBySlug(slug);
        const user = await this.userRepository.findOne(userId, {relations: ['favorites']});

        const isNotFavorite =
            user.favorites.findIndex((articleFavorites) => articleFavorites.id === article.id) === -1;

        if (isNotFavorite) {
            user.favorites.push(article);
            article.favouritesCount++;
            await this.userRepository.save(user);
            await this.articleRepository.save(article);
        }

        return article;
    };

    async deleteArticleFromFavourites(slug: string, userId: number): Promise<ArticleEntity> {
        const article = await this.findBySlug(slug);
        const user = await this.userRepository.findOne(userId, {relations: ['favorites']});

        const articleIndex =
            user.favorites.findIndex((articleFavorites) => articleFavorites.id === article.id);

        if (articleIndex >= 0) {
            user.favorites.splice(articleIndex, 1);
            article.favouritesCount--;
            await this.userRepository.save(user);
            await this.articleRepository.save(article);
        }

        return article;
    }

    buildArticleResponse(article: ArticleEntity): ArticleResponseInterface {
        return {article};
    };

    private getSlug(title: string): string {
        return (
            slugify(title, {lower: true}) +
            "-" +
            ((Math.random() * Math.pow(36, 6)) | 0).toString(36)
        );
    };
}
