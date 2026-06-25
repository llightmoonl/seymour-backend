import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateDocDto } from './dto/create-doc.dto.js';
import { UpdateDocDto } from './dto/update-doc.dto.js';
import { QueryDocsDto } from './dto/query-docs.dto.js';
import { paginate } from '../../common/dto/pagination.dto.js';
import { Prisma } from '../../../prisma/src/generated/prisma/client.js';
import type { Response } from 'express';

function countWords(text: string | null | undefined): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

@Injectable()
export class AdminDocsService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const twoMonthsAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

    const [
      total,
      sectionsRaw,
      published,
      inReview,
      drafts,
      viewsTotal,
      wordCountTotal,
      viewsThisMonth,
      viewsLastMonth,
    ] = await Promise.all([
      this.prisma.document.count(),
      this.prisma.document.findMany({
        distinct: ['section'],
        select: { section: true },
      }),
      this.prisma.document.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.document.count({ where: { status: 'REVIEW' } }),
      this.prisma.document.count({ where: { status: 'DRAFT' } }),
      this.prisma.document.aggregate({ _sum: { views: true } }),
      this.prisma.document.aggregate({ _sum: { wordCount: true } }),
      this.prisma.document.aggregate({
        where: { publishedAt: { gte: oneMonthAgo } },
        _sum: { views: true },
      }),
      this.prisma.document.aggregate({
        where: { publishedAt: { gte: twoMonthsAgo, lt: oneMonthAgo } },
        _sum: { views: true },
      }),
    ]);

    const totalViews = viewsTotal._sum.views ?? 0;
    const totalWords = wordCountTotal._sum.wordCount ?? 0;
    const thisMonth = viewsThisMonth._sum.views ?? 0;
    const lastMonth = viewsLastMonth._sum.views ?? 1;
    const viewsGrowthPct = Math.round(((thisMonth - lastMonth) / lastMonth) * 100);

    return {
      total,
      sections: sectionsRaw.length,
      published,
      inReview,
      drafts,
      totalViews,
      viewsGrowthPct,
      totalWords,
      approxPages: Math.round(totalWords / 250),
    };
  }

  async findAll(dto: QueryDocsDto) {
    const { page = 1, limit = 20, search, section, status, sort = 'updatedAt:desc' } = dto;
    const [field, direction] = sort.split(':') as [string, 'asc' | 'desc'];
    const skip = (page - 1) * limit;

    const where: Prisma.DocumentWhereInput = {};
    if (section) where.section = { equals: section as Prisma.EnumDocSectionFilter['equals'] };
    if (status) where.status = { equals: status as Prisma.EnumDocStatusFilter['equals'] };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
        { author: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [rawItems, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [field]: direction },
        select: {
          id: true,
          title: true,
          section: true,
          tags: true,
          status: true,
          views: true,
          wordCount: true,
          updatedAt: true,
          author: { select: { name: true } },
        },
      }),
      this.prisma.document.count({ where }),
    ]);

    const items = rawItems.map((d, i) => ({
      id: d.id,
      number: skip + i + 1,
      title: d.title,
      section: d.section,
      tags: d.tags,
      authorName: d.author?.name ?? null,
      status: d.status,
      updatedAt: d.updatedAt,
      views: d.views,
      wordCount: d.wordCount,
    }));

    return paginate(items, total, page, limit);
  }

  async create(dto: CreateDocDto, authorId: string) {
    const wordCount = countWords(dto.contentMd);
    return this.prisma.document.create({
      data: {
        title: dto.title,
        section: (dto.section ?? 'OTHER') as Prisma.EnumDocSectionFilter['equals'],
        status: (dto.status ?? 'DRAFT') as Prisma.EnumDocStatusFilter['equals'],
        visibility: (dto.visibility ?? 'ALL') as Prisma.EnumDocVisibilityFilter['equals'],
        contentMd: dto.contentMd,
        tags: dto.tags ?? [],
        wordCount,
        authorId,
      },
    });
  }

  async findOne(id: string) {
    const doc = await this.prisma.document.findUnique({
      where: { id },
      include: { author: { select: { id: true, name: true } } },
    });
    if (!doc) throw new NotFoundException('Документ не найден');
    return {
      ...doc,
      readingMinutes: Math.ceil(doc.wordCount / 200),
    };
  }

  async update(id: string, dto: UpdateDocDto) {
    const existing = await this.prisma.document.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Документ не найден');

    const data: Prisma.DocumentUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.section !== undefined) data.section = dto.section as Prisma.EnumDocSectionFilter['equals'];
    if (dto.status !== undefined) data.status = dto.status as Prisma.EnumDocStatusFilter['equals'];
    if (dto.visibility !== undefined) data.visibility = dto.visibility as Prisma.EnumDocVisibilityFilter['equals'];
    if (dto.tags !== undefined) data.tags = dto.tags;
    if (dto.contentMd !== undefined) {
      data.contentMd = dto.contentMd;
      data.wordCount = countWords(dto.contentMd);
      data.version = { increment: 1 };
    }

    return this.prisma.document.update({ where: { id }, data });
  }

  async publish(id: string) {
    return this.prisma.document.update({
      where: { id },
      data: { status: 'PUBLISHED', publishedAt: new Date() },
    });
  }

  async approve(id: string) {
    return this.prisma.document.update({
      where: { id },
      data: { status: 'PUBLISHED', publishedAt: new Date() },
    });
  }

  async unpublish(id: string) {
    return this.prisma.document.update({
      where: { id },
      data: { status: 'DRAFT' },
    });
  }

  async archive(id: string) {
    return this.prisma.document.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });
  }

  async remove(id: string) {
    await this.prisma.document.delete({ where: { id } });
    return null;
  }

  async incrementView(id: string) {
    await this.prisma.document.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
    return null;
  }

  async exportDoc(id: string, format: 'md' | 'pdf', res: Response) {
    const doc = await this.findOne(id);
    if (format === 'md') {
      res.setHeader('Content-Type', 'text/markdown');
      res.setHeader('Content-Disposition', `attachment; filename="${id}.md"`);
      res.send(doc.contentMd ?? '');
      return;
    }
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${id}.txt"`);
    res.send(`# ${doc.title}\n\n${doc.contentMd ?? ''}`);
  }

  async importDoc(fileContent: string, authorId: string) {
    const title = fileContent.split('\n')[0]?.replace(/^#\s*/, '') || 'Imported Document';
    const wordCount = countWords(fileContent);
    return this.prisma.document.create({
      data: {
        title,
        contentMd: fileContent,
        wordCount,
        authorId,
        tags: [],
      },
    });
  }
}
