import { Controller, Get } from '@nestjs/common';
import { TagService } from '@app/tag/tag.service';
import { Throttle } from "@nestjs/throttler";

@Controller('tags')
export class TagController {
    constructor(private readonly tagService: TagService) {}

    @Get()
    @Throttle(10, 60)
    async findAll(): Promise<{tags: string[]}> {
        const tags = await this.tagService.findAll();
        return {
            tags: tags.map((tag) => tag.name)
        }
    }
}