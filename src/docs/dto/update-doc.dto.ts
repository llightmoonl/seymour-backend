import { PartialType } from '@nestjs/mapped-types';
import { CreateDocDto } from './create-doc.dto.js';

export class UpdateDocDto extends PartialType(CreateDocDto) {}
