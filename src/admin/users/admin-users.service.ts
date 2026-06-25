import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { QueryUsersDto } from './dto/query-users.dto.js';
import { paginate } from '../../common/dto/pagination.dto.js';
import { hash } from 'argon2';
import { randomBytes } from 'crypto';
import { Prisma } from '../../../prisma/src/generated/prisma/client.js';
import type { Response } from 'express';

@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [total, newLastWeek, active, students, groups, teachersAndAdmins] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.user.count({ where: { createdAt: { gte: oneWeekAgo } } }),
        this.prisma.user.count({ where: { status: 'ACTIVE' } }),
        this.prisma.user.count({ where: { role: 'STUDENT' } }),
        this.prisma.user.findMany({
          where: { role: 'STUDENT', group: { not: null } },
          select: { group: true },
          distinct: ['group'],
        }),
        this.prisma.user.count({
          where: { role: { in: ['TEACHER', 'ADMIN'] } },
        }),
      ]);

    return {
      total,
      newLastWeek,
      active,
      students,
      studentGroups: groups.length,
      teachers: teachersAndAdmins,
    };
  }

  async findAll(dto: QueryUsersDto) {
    const {
      page = 1,
      limit = 20,
      search,
      role,
      status,
      sort = 'createdAt:desc',
    } = dto;
    const [field, direction] = sort.split(':') as [string, 'asc' | 'desc'];
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};
    if (role) where.role = { equals: role as Prisma.EnumRoleFilter['equals'] };
    if (status)
      where.status = {
        equals: status as Prisma.EnumUserStatusFilter['equals'],
      };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { group: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [rawItems, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [field]: direction },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          group: true,
          status: true,
          createdAt: true,
          lastActiveAt: true,
          _count: { select: { research: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    const items = rawItems.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      group: u.group,
      status: u.status,
      projectsCount: u._count.research,
      registeredAt: u.createdAt,
      lastActiveAt: u.lastActiveAt,
    }));

    return paginate(items, total, page, limit);
  }

  async create(dto: CreateUserDto) {
    const tempPassword = randomBytes(8).toString('hex');
    const passwordHash = await hash(tempPassword);

    try {
      const user = await this.prisma.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          passwordHash,
          role: dto.role as Prisma.EnumRoleFilter['equals'],
          group: dto.group,
          status: (dto.status ??
            'ACTIVE') as Prisma.EnumUserStatusFilter['equals'],
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
        },
      });
      console.log(`[DEV] Temporary password for ${dto.email}: ${tempPassword}`);
      return user;
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException('Email уже занят');
      }
      throw e;
    }
  }

  async update(id: string, dto: UpdateUserDto) {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: {
          name: dto.name,
          email: dto.email,
          role: dto.role as Prisma.EnumRoleFilter['equals'],
          group: dto.group,
          status: dto.status as Prisma.EnumUserStatusFilter['equals'],
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          group: true,
          status: true,
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2025')
          throw new NotFoundException('Пользователь не найден');
        if (e.code === 'P2002') throw new ConflictException('Email уже занят');
      }
      throw e;
    }
  }

  async remove(id: string, currentUserId: string) {
    if (id === currentUserId)
      throw new BadRequestException('Нельзя удалить свой аккаунт');
    try {
      await this.prisma.user.delete({ where: { id } });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        throw new NotFoundException('Пользователь не найден');
      }
      throw e;
    }
    return null;
  }

  async getUserResearch(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        research: {
          select: {
            id: true,
            title: true,
            type: true,
            status: true,
            updatedAt: true,
          },
          orderBy: { updatedAt: 'desc' },
        },
      },
    });

    if (!user) throw new NotFoundException('Пользователь не найден');

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        registeredAt: user.createdAt,
      },
      summary: {
        total: user.research.length,
        trained: user.research.filter((r) => r.status === 'TRAINED').length,
        inProgress: user.research.filter((r) => r.status === 'IN_PROGRESS')
          .length,
      },
      research: user.research,
    };
  }

  async exportUserResearchCsv(id: string, res: Response) {
    const data = await this.getUserResearch(id);
    const typeMap: Record<number, string> = {
      0: 'HEBBIAN',
      1: 'DELTA',
      2: 'BACKPROPAGATION',
    };
    const rows = data.research.map((r) =>
      [
        r.id,
        r.title,
        typeMap[r.type] ?? r.type,
        r.status,
        r.updatedAt.toISOString(),
      ].join(','),
    );
    const csv = ['id,title,type,status,updatedAt', ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="user-${id}-research.csv"`,
    );
    res.send(csv);
  }

  async exportAllCsv(dto: QueryUsersDto, res: Response) {
    const result = await this.findAll({ ...dto, page: 1, limit: 10000 });
    const items = result.items as Array<{
      id: string;
      name: string;
      email: string;
      role: string;
      group: string | null;
      status: string;
      projectsCount: number;
      registeredAt: Date;
    }>;
    const rows = items.map((u) =>
      [
        u.id,
        u.name,
        u.email,
        u.role,
        u.group ?? '',
        u.status,
        u.projectsCount,
        u.registeredAt.toISOString(),
      ].join(','),
    );
    const csv = [
      'id,name,email,role,group,status,projectsCount,registeredAt',
      ...rows,
    ].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="users.csv"');
    res.send(csv);
  }
}
