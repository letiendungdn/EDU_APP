import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AuditLog } from './audit-log.schema';
import { AuditService } from './audit.service';

describe('AuditService', () => {
  let service: AuditService;
  let auditModel: {
    create: jest.Mock;
    find: jest.Mock;
    aggregate: jest.Mock;
  };

  beforeEach(async () => {
    const chain = {
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
    };

    auditModel = {
      create: jest.fn().mockResolvedValue({}),
      find: jest.fn().mockReturnValue(chain),
      aggregate: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: getModelToken(AuditLog.name), useValue: auditModel },
      ],
    }).compile();

    service = module.get(AuditService);
    jest.clearAllMocks();
  });

  describe('log', () => {
    it('creates audit log document with provided params', async () => {
      const params = {
        userId: 1,
        action: 'LOGIN',
        resource: 'auth',
        metadata: { method: 'password' },
        ip: '127.0.0.1',
        success: true,
        durationMs: 42,
      };

      await service.log(params);

      expect(auditModel.create).toHaveBeenCalledWith(params);
    });

    it('does not throw when MongoDB save fails (fire-and-forget)', async () => {
      auditModel.create.mockReturnValue(
        Promise.reject(new Error('MongoDB connection lost')),
      );

      await expect(
        service.log({
          userId: 1,
          action: 'LOGIN',
          resource: 'auth',
        }),
      ).resolves.toBeUndefined();
    });
  });

  describe('getStats', () => {
    it('aggregates action counts for N days', async () => {
      const userId = 5;
      const days = 14;
      auditModel.aggregate.mockResolvedValue([
        { _id: 'LOGIN', count: 10, avgDuration: 50, failCount: 1 },
      ]);

      const result = await service.getStats(userId, days);

      expect(auditModel.aggregate).toHaveBeenCalledWith([
        {
          $match: {
            userId,
            createdAt: { $gte: expect.any(Date) },
          },
        },
        expect.objectContaining({
          $group: expect.objectContaining({
            _id: '$action',
            count: { $sum: 1 },
          }),
        }),
        { $sort: { count: -1 } },
      ]);
      expect(result).toEqual([
        { _id: 'LOGIN', count: 10, avgDuration: 50, failCount: 1 },
      ]);
    });

    it('computes avgDuration per action in aggregation', async () => {
      auditModel.aggregate.mockResolvedValue([]);

      await service.getStats(1, 7);

      expect(auditModel.aggregate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            $group: expect.objectContaining({
              avgDuration: { $avg: '$durationMs' },
              failCount: {
                $sum: { $cond: [{ $eq: ['$success', false] }, 1, 0] },
              },
            }),
          }),
        ]),
      );
    });
  });
});
