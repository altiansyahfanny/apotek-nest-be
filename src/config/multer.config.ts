import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';

export const multerConfig: MulterOptions = {
  storage: diskStorage({
    destination: 'uploads',
    filename: (req, file, cb) => {
      cb(null, uuidv4() + '.' + file.originalname.split('.')[1]);
    },
  }),
};
