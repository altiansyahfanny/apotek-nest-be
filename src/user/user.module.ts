import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { CommonModule } from 'src/common/common.module';
import { FileModule } from 'src/file/file.module';

@Module({
  imports: [CommonModule, FileModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
