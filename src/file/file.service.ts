import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class FileService {
  async readFile(filePath: string): Promise<Buffer> {
    return fs.promises.readFile(filePath);
  }
}
