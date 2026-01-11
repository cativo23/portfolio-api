import { Injectable } from '@nestjs/common';

/**
 * Application service
 */
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
