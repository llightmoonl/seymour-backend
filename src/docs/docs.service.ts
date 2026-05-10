import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../prisma/src/generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateDocDto } from './dto/create-doc.dto.js';
import { UpdateDocDto } from './dto/update-doc.dto.js';

@Injectable()
export class DocsService {
  constructor(private prisma: PrismaService) {}

  findAll(includeUnpublished = false) {
    return this.prisma.doc.findMany({
      where: includeUnpublished ? {} : { published: true },
      select: {
        slug: true,
        title: true,
        order: true,
        updatedAt: true,
      },
      orderBy: [{ order: 'asc' }, { title: 'asc' }],
    });
  }

  async findOne(slug: string, includeUnpublished = false) {
    const doc = await this.prisma.doc.findUnique({
      where: { slug },
      select: {
        slug: true,
        title: true,
        description: true,
        content: true,
        published: true,
        updatedAt: true,
      },
    });

    if (!doc || (!doc.published && !includeUnpublished)) {
      throw new NotFoundException(`Doc "${slug}" not found`);
    }
    return doc;
  }

  async create(dto: CreateDocDto) {
    try {
      return await this.prisma.doc.create({
        data: {
          slug: dto.slug,
          title: dto.title,
          description: dto.description,
          content: dto.content,
          order: dto.order,
          published: dto.published ?? false,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(`slug "${dto.slug}" already exists`);
      }
      throw error;
    }
  }

  async update(slug: string, dto: UpdateDocDto) {
    try {
      return await this.prisma.doc.update({
        where: { slug },
        data: {
          slug: dto.slug,
          title: dto.title,
          description: dto.description,
          content: dto.content,
          order: dto.order,
          published: dto.published,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Doc "${slug}" not found`);
        }
        if (error.code === 'P2002') {
          throw new ConflictException(`slug "${dto.slug}" already exists`);
        }
      }
      throw error;
    }
  }

  async remove(slug: string) {
    try {
      return await this.prisma.doc.delete({
        where: { slug },
        select: { id: true },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Doc "${slug}" not found`);
      }
      throw error;
    }
  }
}
