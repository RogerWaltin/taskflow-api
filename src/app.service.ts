import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {

  test(): string {
  return "Wow test works!";
  }
}
