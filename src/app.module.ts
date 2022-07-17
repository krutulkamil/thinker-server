import { Module, MiddlewareConsumer, RequestMethod } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TagModule } from "@app/tag/tag.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import ormconfig from "@app/ormconfig";
import { UserModule } from "@app/user/user.module";
import { AuthMiddleware } from "./user/middlewares/auth.middleware";
import { ArticleModule } from "./article/article.module";
import { ProfileModule } from "./profile/profile.module";
import { ThrottlerModule } from "@nestjs/throttler";
import { appProviders } from "./app.providers";

@Module({
  imports: [
    TypeOrmModule.forRoot(ormconfig),
    ThrottlerModule.forRoot({ ttl: 60, limit: 5 }),
    TagModule,
    UserModule,
    ArticleModule,
    ProfileModule
  ],
  controllers: [AppController],
  providers: [AppService, ...appProviders]
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes({
        path: "*",
        method: RequestMethod.ALL
      });
  }
}
