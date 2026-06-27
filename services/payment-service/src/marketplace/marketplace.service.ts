import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { CoachReview, Prisma, SessionStatus } from "@prisma/client";
import { PrismaService } from "@app/prisma";

export interface SearchCoachesQuery {
  language?: string;
  specialization?: string;
  minRate?: number;
  maxRate?: number;
  page?: number;
  limit?: number;
}

export interface AvailabilitySlot {
  start: string;
  end: string;
  available: boolean;
}

@Injectable()
export class MarketplaceService {
  constructor(private readonly prisma: PrismaService) {}

  async searchCoaches(query: SearchCoachesQuery) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.CoachProfileWhereInput = {
      isActive: true,
      ...(query.language ? { languages: { has: query.language } } : {}),
      ...(query.specialization
        ? { specializations: { has: query.specialization } }
        : {}),
      ...(query.minRate != null || query.maxRate != null
        ? {
            hourlyRateUsd: {
              ...(query.minRate != null ? { gte: query.minRate } : {}),
              ...(query.maxRate != null ? { lte: query.maxRate } : {}),
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.coachProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ avgRating: "desc" }, { totalSessions: "desc" }],
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.coachProfile.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getCoach(id: number) {
    return this.prisma.coachProfile.findUniqueOrThrow({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        availability: true,
        reviews: {
          take: 10,
          orderBy: { createdAt: "desc" },
          include: {
            learner: { select: { id: true, name: true } },
          },
        },
      },
    });
  }

  async getAvailability(
    coachId: number,
    date: string,
  ): Promise<AvailabilitySlot[]> {
    const coach = await this.prisma.coachProfile.findUniqueOrThrow({
      where: { id: coachId },
      include: { availability: true },
    });

    if (!coach.isActive) return [];

    const parsedDate = new Date(`${date}T00:00:00`);
    if (Number.isNaN(parsedDate.getTime())) {
      throw new BadRequestException("Invalid date format, expected YYYY-MM-DD");
    }

    const dayOfWeek = parsedDate.getDay();
    const dayAvailability = coach.availability.filter(
      (slot) => slot.dayOfWeek === dayOfWeek,
    );
    if (dayAvailability.length === 0) return [];

    const dayStart = new Date(`${date}T00:00:00.000Z`);
    const dayEnd = new Date(`${date}T23:59:59.999Z`);

    const bookedSessions = await this.prisma.coachingSession.findMany({
      where: {
        coachId,
        scheduledAt: { gte: dayStart, lte: dayEnd },
        status: { notIn: [SessionStatus.CANCELED, SessionStatus.NO_SHOW] },
      },
      select: { scheduledAt: true, durationMin: true },
    });

    const bookedTimes = new Set(
      bookedSessions.map((session) => session.scheduledAt.getTime()),
    );
    const slots: AvailabilitySlot[] = [];

    for (const availability of dayAvailability) {
      let hour = availability.startHour;
      let minute = availability.startMinute;
      const endTotalMinutes =
        availability.endHour * 60 + availability.endMinute;

      while (hour * 60 + minute + 60 <= endTotalMinutes) {
        const slotStart = new Date(
          `${date}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`,
        );
        const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000);
        const isBooked = bookedTimes.has(slotStart.getTime());

        slots.push({
          start: slotStart.toISOString(),
          end: slotEnd.toISOString(),
          available: !isBooked,
        });

        hour += 1;
        minute = 0;
      }
    }

    return slots.sort((a, b) => a.start.localeCompare(b.start));
  }

  async createReview(
    sessionId: number,
    learnerId: number,
    rating: number,
    comment?: string,
  ): Promise<CoachReview> {
    if (rating < 1 || rating > 5) {
      throw new BadRequestException("Rating must be between 1 and 5");
    }

    const session = await this.prisma.coachingSession.findUniqueOrThrow({
      where: { id: sessionId },
      include: { review: true },
    });

    if (session.learnerId !== learnerId) {
      throw new ForbiddenException("You can only review your own sessions");
    }
    if (session.status !== SessionStatus.COMPLETED) {
      throw new BadRequestException(
        "Session must be completed before reviewing",
      );
    }
    if (session.review) {
      throw new ConflictException("Session already has a review");
    }

    return this.prisma.$transaction(async (tx) => {
      const review = await tx.coachReview.create({
        data: {
          sessionId,
          learnerId,
          coachId: session.coachId,
          rating,
          comment,
        },
      });

      const stats = await tx.coachReview.aggregate({
        where: { coachId: session.coachId },
        _avg: { rating: true },
        _count: { id: true },
      });

      await tx.coachProfile.update({
        where: { id: session.coachId },
        data: {
          avgRating: stats._avg.rating,
          reviewCount: stats._count.id,
        },
      });

      return review;
    });
  }
}
