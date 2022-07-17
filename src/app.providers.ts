import { ThrottlerGuard } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";

export const appProviders = [
  {
    provide: APP_GUARD,
    useClass: ThrottlerGuard
  },
];