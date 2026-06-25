import 'dotenv/config';
import { PrismaClient } from './src/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { hash } from 'argon2';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL as string,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // 1 Admin (Алексей Иванов), 2 Teachers, 9 Students
  const adminHash = await hash('admin123');
  const teacherHash = await hash('teacher123');
  const studentHash = await hash('student123');

  const admin = await prisma.user.upsert({
    where: { email: 'a.ivanov@niu.ru' },
    update: {},
    create: {
      name: 'Алексей Иванов',
      email: 'a.ivanov@niu.ru',
      passwordHash: adminHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      lastActiveAt: new Date(),
      createdAt: new Date('2023-09-01'),
    },
  });

  const teacher1 = await prisma.user.upsert({
    where: { email: 'e.zaitseva@niu.ru' },
    update: {},
    create: {
      name: 'Екатерина Зайцева',
      email: 'e.zaitseva@niu.ru',
      passwordHash: teacherHash,
      role: 'TEACHER',
      status: 'ACTIVE',
      lastActiveAt: new Date(),
      createdAt: new Date('2023-09-01'),
    },
  });

  const teacher2 = await prisma.user.upsert({
    where: { email: 'm.petrov@niu.ru' },
    update: {},
    create: {
      name: 'Михаил Петров',
      email: 'm.petrov@niu.ru',
      passwordHash: teacherHash,
      role: 'TEACHER',
      status: 'ACTIVE',
      lastActiveAt: new Date(),
      createdAt: new Date('2023-09-15'),
    },
  });

  // Main test user (dashboard owner — 10 projects, 3 sessions)
  const mainUser = await prisma.user.upsert({
    where: { email: 'skvortsov.oleg.am@gmail.com' },
    update: {},
    create: {
      name: 'Олег Скворцов',
      email: 'skvortsov.oleg.am@gmail.com',
      passwordHash: studentHash,
      role: 'STUDENT',
      status: 'ACTIVE',
      group: 'ИУ-401',
      lastActiveAt: new Date(),
      createdAt: new Date('2025-01-10'),
    },
  });

  // 8 more students (3 ИУ-401, 3 ИУ-402, 2 ИУ-403)
  const studentData = [
    { name: 'Анна Смирнова', email: 's.anna@niu.ru', group: 'ИУ-401' },
    { name: 'Дмитрий Козлов', email: 'k.dmitry@niu.ru', group: 'ИУ-401' },
    { name: 'Мария Новикова', email: 'n.maria@niu.ru', group: 'ИУ-402' },
    { name: 'Иван Морозов', email: 'm.ivan@niu.ru', group: 'ИУ-402' },
    { name: 'Ольга Волкова', email: 'v.olga@niu.ru', group: 'ИУ-402' },
    {
      name: 'Сергей Лебедев',
      email: 'l.sergey@niu.ru',
      group: 'ИУ-403',
      status: 'INACTIVE',
    },
    { name: 'Татьяна Федорова', email: 'f.tatyana@niu.ru', group: 'ИУ-403' },
    {
      name: 'Павел Соколов',
      email: 's.pavel@niu.ru',
      group: 'ИУ-401',
      status: 'BLOCKED',
    },
  ];

  for (const s of studentData) {
    await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        name: s.name,
        email: s.email,
        passwordHash: studentHash,
        role: 'STUDENT',
        status: (s.status ?? 'ACTIVE') as 'ACTIVE' | 'INACTIVE' | 'BLOCKED',
        group: s.group,
        lastActiveAt: new Date(),
        createdAt: new Date('2024-09-01'),
      },
    });
  }

  // Main user projects: 4 HEBBIAN, 3 DELTA, 3 BACKPROPAGATION; 7 TRAINED, 3 IN_PROGRESS
  const projectDefs = [
    {
      name: 'Ассоциативная память — буквы',
      rule: 'HEBBIAN',
      status: 'TRAINED',
      accuracy: 1.0,
      examples: 26,
      epochs: 1,
    },
    {
      name: 'Ассоциативная память — цифры',
      rule: 'HEBBIAN',
      status: 'TRAINED',
      accuracy: 0.96,
      examples: 20,
      epochs: 1,
    },
    {
      name: 'Распознавание паттернов Хебб',
      rule: 'HEBBIAN',
      status: 'TRAINED',
      accuracy: 1.0,
      examples: 16,
      epochs: 1,
    },
    {
      name: 'Хебб — эксперимент',
      rule: 'HEBBIAN',
      status: 'IN_PROGRESS',
      accuracy: null,
      examples: null,
      epochs: null,
    },
    {
      name: 'Классификатор дельта',
      rule: 'DELTA',
      status: 'TRAINED',
      accuracy: 0.98,
      examples: 50,
      epochs: 100,
    },
    {
      name: 'Дельта OR/AND',
      rule: 'DELTA',
      status: 'TRAINED',
      accuracy: 1.0,
      examples: 4,
      epochs: 50,
    },
    {
      name: 'Дельта — новый',
      rule: 'DELTA',
      status: 'IN_PROGRESS',
      accuracy: null,
      examples: null,
      epochs: null,
    },
    {
      name: 'Обратное распространение XOR',
      rule: 'BACKPROPAGATION',
      status: 'TRAINED',
      accuracy: 0.97,
      examples: 4,
      epochs: 500,
    },
    {
      name: 'Backprop — распознавание рукописных',
      rule: 'BACKPROPAGATION',
      status: 'TRAINED',
      accuracy: 0.92,
      examples: 100,
      epochs: 200,
    },
    {
      name: 'Backprop — эксперимент',
      rule: 'BACKPROPAGATION',
      status: 'IN_PROGRESS',
      accuracy: null,
      examples: null,
      epochs: null,
    },
  ] as const;

  const createdProjects = [];
  for (const p of projectDefs) {
    const project = await prisma.project.create({
      data: {
        name: p.name,
        rule: p.rule,
        status: p.status,
        accuracy: p.accuracy,
        examples: p.examples,
        epochs: p.epochs,
        userId: mainUser.id,
        updatedAt: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
        ),
      },
    });
    createdProjects.push(project);
  }

  // Activity
  for (const project of createdProjects.filter((p) => p.status === 'TRAINED')) {
    await prisma.activity.createMany({
      data: [
        {
          type: 'PROJECT_CREATED',
          projectId: project.id,
          userId: mainUser.id,
          createdAt: new Date(project.createdAt.getTime() - 60000),
        },
        {
          type: 'TRAINING_STARTED',
          projectId: project.id,
          userId: mainUser.id,
          createdAt: new Date(project.createdAt.getTime() - 30000),
        },
        {
          type: 'TRAINING_COMPLETED',
          projectId: project.id,
          userId: mainUser.id,
          createdAt: project.createdAt,
        },
      ],
    });
  }

  // Sessions for main user
  const sessionHash = await hash('dummytoken');
  await prisma.session.createMany({
    data: [
      {
        userId: mainUser.id,
        refreshTokenHash: sessionHash,
        device: 'MacBook Pro',
        browser: 'Safari 17',
        location: 'Москва, Россия',
        lastActiveAt: new Date(),
      },
      {
        userId: mainUser.id,
        refreshTokenHash: sessionHash,
        device: 'Windows',
        browser: 'Chrome 120',
        location: 'Санкт-Петербург',
        lastActiveAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        userId: mainUser.id,
        refreshTokenHash: sessionHash,
        device: 'iPhone 14',
        browser: 'Safari Mobile',
        location: 'Казань',
        lastActiveAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  // Admin projects (12)
  const adminProjects = [
    {
      name: 'Хебб — ассоциации',
      rule: 'HEBBIAN',
      status: 'TRAINED',
      accuracy: 1.0,
      examples: 16,
      epochs: 1,
    },
    {
      name: 'Хебб — память',
      rule: 'HEBBIAN',
      status: 'TRAINED',
      accuracy: 0.98,
      examples: 20,
      epochs: 1,
    },
    {
      name: 'Хебб — тест',
      rule: 'HEBBIAN',
      status: 'TRAINED',
      accuracy: 1.0,
      examples: 10,
      epochs: 1,
    },
    {
      name: 'Хебб — паттерны',
      rule: 'HEBBIAN',
      status: 'TRAINED',
      accuracy: 1.0,
      examples: 26,
      epochs: 1,
    },
    {
      name: 'Дельта XOR',
      rule: 'DELTA',
      status: 'TRAINED',
      accuracy: 1.0,
      examples: 4,
      epochs: 100,
    },
    {
      name: 'Дельта OR',
      rule: 'DELTA',
      status: 'TRAINED',
      accuracy: 1.0,
      examples: 4,
      epochs: 50,
    },
    {
      name: 'Дельта AND',
      rule: 'DELTA',
      status: 'TRAINED',
      accuracy: 1.0,
      examples: 4,
      epochs: 50,
    },
    {
      name: 'Дельта NAND',
      rule: 'DELTA',
      status: 'TRAINED',
      accuracy: 1.0,
      examples: 4,
      epochs: 50,
    },
    {
      name: 'Backprop XOR',
      rule: 'BACKPROPAGATION',
      status: 'TRAINED',
      accuracy: 0.99,
      examples: 4,
      epochs: 500,
    },
    {
      name: 'Backprop сигнал',
      rule: 'BACKPROPAGATION',
      status: 'TRAINED',
      accuracy: 0.95,
      examples: 100,
      epochs: 300,
    },
    {
      name: 'Backprop рукописные',
      rule: 'BACKPROPAGATION',
      status: 'TRAINED',
      accuracy: 0.92,
      examples: 200,
      epochs: 400,
    },
    {
      name: 'Backprop — новый',
      rule: 'BACKPROPAGATION',
      status: 'IN_PROGRESS',
      accuracy: null,
      examples: null,
      epochs: null,
    },
  ] as const;

  for (const p of adminProjects) {
    await prisma.project.create({
      data: {
        name: p.name,
        rule: p.rule,
        status: p.status,
        accuracy: p.accuracy,
        examples: p.examples,
        epochs: p.epochs,
        userId: admin.id,
      },
    });
  }

  // Teacher projects (24 for teacher1)
  for (let i = 1; i <= 24; i++) {
    const rules = ['HEBBIAN', 'DELTA', 'BACKPROPAGATION'] as const;
    const rule = rules[i % 3];
    await prisma.project.create({
      data: {
        name: `Проект ${rule} #${i}`,
        rule,
        status: i <= 20 ? 'TRAINED' : 'IN_PROGRESS',
        accuracy: i <= 20 ? 0.9 + Math.random() * 0.1 : null,
        userId: teacher1.id,
      },
    });
  }

  // Documents (9 docs: 5 PUBLISHED, 1 REVIEW, 2 DRAFT, 1 ARCHIVED)
  const docs = [
    {
      title: 'Введение в обучение нейронных сетей',
      section: 'BASICS',
      status: 'PUBLISHED',
      tags: ['введение', 'обзор'],
      views: 1200,
      wordCount: 320,
      authorId: teacher1.id,
    },
    {
      title: 'Правило Хебба: теория и практика',
      section: 'ALGORITHMS',
      status: 'PUBLISHED',
      tags: ['хебб', 'без учителя'],
      views: 980,
      wordCount: 450,
      authorId: teacher1.id,
    },
    {
      title: 'Дельта-правило и его применение',
      section: 'ALGORITHMS',
      status: 'PUBLISHED',
      tags: ['дельта', 'с учителем'],
      views: 870,
      wordCount: 410,
      authorId: teacher2.id,
    },
    {
      title: 'Алгоритм обратного распространения',
      section: 'ALGORITHMS',
      status: 'PUBLISHED',
      tags: ['backprop', 'градиент'],
      views: 1500,
      wordCount: 620,
      authorId: teacher1.id,
    },
    {
      title: 'Метрики качества нейросетей',
      section: 'ADVANCED',
      status: 'PUBLISHED',
      tags: ['точность', 'метрики'],
      views: 760,
      wordCount: 280,
      authorId: teacher2.id,
    },
    {
      title: 'Регуляризация в нейросетях',
      section: 'ADVANCED',
      status: 'REVIEW',
      tags: ['регуляризация', 'переобучение'],
      views: 120,
      wordCount: 390,
      authorId: teacher1.id,
    },
    {
      title: 'Оптимизация гиперпараметров',
      section: 'ADVANCED',
      status: 'DRAFT',
      tags: ['гиперпараметры'],
      views: 0,
      wordCount: 150,
      authorId: teacher2.id,
    },
    {
      title: 'История нейронных сетей',
      section: 'BASICS',
      status: 'DRAFT',
      tags: ['история', 'обзор'],
      views: 0,
      wordCount: 200,
      authorId: admin.id,
    },
    {
      title: 'Введение в глубокое обучение',
      section: 'ADVANCED',
      status: 'ARCHIVED',
      tags: ['deep learning'],
      views: 1470,
      wordCount: 680,
      authorId: teacher1.id,
    },
  ];

  for (const d of docs) {
    await prisma.document.create({
      data: {
        title: d.title,
        section: d.section as any,
        status: d.status as any,
        visibility: 'ALL',
        authorId: d.authorId,
        tags: d.tags,
        views: d.views,
        wordCount: d.wordCount,
        publishedAt:
          d.status === 'PUBLISHED'
            ? new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000)
            : null,
        contentMd: `# ${d.title}\n\nЭто ${d.title.toLowerCase()}. Содержание документа.\n\n## Раздел 1\n\nТекст раздела.\n\n## Раздел 2\n\nЕщё текст.`,
      },
    });
  }

  console.log('Seed completed successfully!');
  console.log(`Admin: a.ivanov@niu.ru / admin123`);
  console.log(`Test user: skvortsov.oleg.am@gmail.com / student123`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
