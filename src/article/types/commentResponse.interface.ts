import {CommentInterface} from "@app/article/types/comment.interface";
import {CommentType} from "@app/article/types/comment.type"

export interface CommentResponseInterface {
    comments: CommentType[]
}