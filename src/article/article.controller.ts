import {AuthGuard} from "@app/user/guards/auth.guard";
import {
    Body,
    Controller,
    Get,
    Post,
    UseGuards,
    Param,
    Delete,
    Put,
    UsePipes,
    Query
} from "@nestjs/common";
import {ArticleService} from "../article/article.service";
import {User} from "@app/user/decorators/user.decorator";
import {CreateArticleDto} from "@app/article/dto/createArticle.dto";
import {CreateCommentDto} from "@app/article/dto/createComment.dto";
import {UserEntity} from "@app/user/user.entity";
import {ArticleResponseInterface} from "@app/article/types/articleResponse.interface";
import {ArticlesResponseInterface} from "@app/article/types/articlesResponse.interface";
import {CommentResponseInterface} from "@app/article/types/commentResponse.interface";
import {DeleteResult} from "typeorm";
import {BackendValidationPipe} from "@app/shared/pipes/backendValidation.pipe";
import { Throttle } from "@nestjs/throttler";

@Controller('articles')
export class ArticleController {
    constructor(private readonly articlesService: ArticleService) {};

    @Get()
    @Throttle(10, 60)
    async findAll(
        @User('id') currentUserId: number,
        @Query() query: any): Promise<ArticlesResponseInterface> {
        return await this.articlesService.findAll(currentUserId, query);
    }

    @Get('feed')
    @Throttle(10, 60)
    @UseGuards(AuthGuard)
    async getFeed(
        @User('id') currentUserId: number,
        @Query() query: any): Promise<ArticlesResponseInterface> {
        return await this.articlesService.getFeed(currentUserId, query);
    }

    @Post()
    @UseGuards(AuthGuard)
    @UsePipes(new BackendValidationPipe())
    async create(
        @User() currentUser: UserEntity,
        @Body('article') createArticleDto: CreateArticleDto
    ): Promise<ArticleResponseInterface> {
        const article = await this.articlesService.createArticle(currentUser, createArticleDto);
        return this.articlesService.buildArticleResponse(article);
    };

    @Get(':slug')
    @Throttle(10, 60)
    async getSingleArticle(@Param('slug') slug: string): Promise<ArticleResponseInterface> {
        const article = await this.articlesService.findBySlug(slug);
        return this.articlesService.buildArticleResponse(article);
    };

    @Delete(':slug')
    @UseGuards(AuthGuard)
    async deleteArticle(
        @User('id') currentUserId: number,
        @Param('slug') slug: string): Promise<DeleteResult> {
        return await this.articlesService.deleteArticle(slug, currentUserId);
    };

    @Put(':slug')
    @UseGuards(AuthGuard)
    @UsePipes(new BackendValidationPipe())
    async updateArticle(
        @User('id') currentUserId: number,
        @Param('slug') slug: string,
        @Body('article') updateArticleDto: CreateArticleDto): Promise<ArticleResponseInterface> {
        const article = await this.articlesService.updateArticle(slug, updateArticleDto, currentUserId);
        return this.articlesService.buildArticleResponse(article);
    }

    @Post(':slug/favorite')
    @UseGuards(AuthGuard)
    async addArticleToFavourites(
        @User('id') currentUserId: number,
        @Param('slug') slug: string): Promise<ArticleResponseInterface> {
        const article = await this.articlesService.addArticleToFavourites(slug, currentUserId);
        return this.articlesService.buildArticleResponse(article);
    };

    @Get(':slug/comments')
    @Throttle(10, 60)
    async findComments(
        @Param('slug') slug: string): Promise<CommentResponseInterface> {
        return await this.articlesService.findComments(slug);
    }

    @Post(':slug/comments')
    @UseGuards(AuthGuard)
    @UsePipes(new BackendValidationPipe())
    async createComment(
        @User() currentUser: UserEntity,
        @Param('slug') slug: string,
        @Body('comment') createCommentDto: CreateCommentDto): Promise<ArticleResponseInterface> {
        return await this.articlesService.addComment(currentUser, slug, createCommentDto);
    }

    @Delete(':slug/comments/:id')
    @UseGuards(AuthGuard)
    @UsePipes(new BackendValidationPipe())
    async deleteComment(
        @Param() params,
        @User() currentUser: UserEntity): Promise<ArticleResponseInterface> {
        const {slug, id} = params;
        return await this.articlesService.deleteComment(slug, id);
    }

    @Delete(':slug/favorite')
    @UseGuards(AuthGuard)
    async deleteArticleFromFavourites(
        @User('id') currentUserId: number,
        @Param('slug') slug: string): Promise<ArticleResponseInterface> {
        const article = await this.articlesService.deleteArticleFromFavourites(slug, currentUserId);
        return this.articlesService.buildArticleResponse(article);
    };
}