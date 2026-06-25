import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, currentSessionId: string) {
    const sessions = await this.prisma.session.findMany({
      where: { userId },
      orderBy: { lastActiveAt: 'desc' },
      select: {
        id: true,
        device: true,
        browser: true,
        location: true,
        lastActiveAt: true,
      },
    });

    return {
      items: sessions.map((s) => ({
        ...s,
        isCurrent: s.id === currentSessionId,
      })),
    };
  }

  async deleteOne(userId: string, sessionId: string, currentSessionId: string) {
    const session = await this.prisma.session.findFirst({
      where: { id: sessionId },
    });

    if (!session) throw new NotFoundException('Session not found');
    if (session.userId !== userId) throw new ForbiddenException();
    if (session.id === currentSessionId)
      throw new ForbiddenException('Cannot delete current session');

    await this.prisma.session.delete({ where: { id: sessionId } });
    return null;
  }

  async deleteAllExceptCurrent(userId: string, currentSessionId: string) {
    await this.prisma.session.deleteMany({
      where: { userId, NOT: { id: currentSessionId } },
    });
    return null;
  }
}
