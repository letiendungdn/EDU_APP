import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { SrsCardRepository } from './srs-card.repository';
import { SrsService } from './srs.service';

@Global()
@Module({
  providers: [PrismaService, SrsCardRepository, SrsService],
  exports: [PrismaService, SrsCardRepository, SrsService],
})
export class PrismaModule {}
