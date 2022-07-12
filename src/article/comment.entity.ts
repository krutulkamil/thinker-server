import {Entity, PrimaryGeneratedColumn, Column, ManyToOne} from 'typeorm';
import { ArticleEntity } from './article.entity';
import { UserEntity } from '../user/user.entity';

@Entity({ name: 'comments' })
export class CommentEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    body: string;

    @Column({ type: "timestamp", default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: "timestamp", default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @ManyToOne(() => UserEntity, {eager: true})
    author: UserEntity

    @ManyToOne(() => ArticleEntity, (article) => article.comments)
    article: ArticleEntity;
}