import { ArgumentMetadata, HttpException, HttpStatus, Injectable, PipeTransform } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

@Injectable()
export class BackendValidationPipe implements PipeTransform {
    async transform(value: any, metadata: ArgumentMetadata) {
        const object = plainToInstance(metadata.metatype, value);
        const errors = await validate(object);

        if (errors.length === 0) {
            return value;
        }

        throw new HttpException({errors: {}}, HttpStatus.UNPROCESSABLE_ENTITY);
    }
}