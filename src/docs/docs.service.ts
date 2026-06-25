import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class DocsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.document.findMany({
      where: { status: 'PUBLISHED' },
      select: { id: true, title: true, section: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const doc = await this.prisma.document.findUnique({
      where: { id },
      select: { id: true, title: true, contentMd: true, status: true, updatedAt: true },
    });
    if (!doc || doc.status !== 'PUBLISHED') throw new NotFoundException('Document not found');
    return doc;
  }
}
