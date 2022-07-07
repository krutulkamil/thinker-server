import { AuthGuard } from "@app/user/guards/auth.guard";
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
    ValidationPipe,
    Query
} from "@nestjs/common";
import { ArticleService } from "../article/article.service";
import { User } from "@app/user/decorators/user.decorator";
import { CreateArticleDto } from "@app/article/dto/createArticle.dto";
import { UserEntity } from "@app/user/user.entity";
import { ArticleResponseInterface } from "@app/article/types/articleResponse.interface";
import { ArticlesResponseInterface } from "@app/article/types/articlesResponse.interface";
import { DeleteResult } from "typeorm";
import { BackendValidationPipe } from "@app/shared/pipes/backendValidation.pipe";

@Controller('articles')
export class ArticleController {
    constructor(private readonly articlesService: ArticleService) {};

    @Get()
    async findAll(
        @User('id') currentUserId: number,
        @Query() query: any): Promise<ArticlesResponseInterface> {
        return await this.articlesService.findAll(currentUserId, query);
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
    @UsePipes(new ValidationPipe())
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

    @Delete(':slug/favorite')
    @UseGuards(AuthGuard)
    async deleteArticleFromFavourites(
        @User('id') currentUserId: number,
        @Param('slug') slug: string): Promise<ArticleResponseInterface> {
        const article = await this.articlesService.deleteArticleFromFavourites(slug, currentUserId);
        return this.articlesService.buildArticleResponse(article);
    };
}