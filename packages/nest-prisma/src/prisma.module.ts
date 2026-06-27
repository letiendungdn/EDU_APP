import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { SrsCardRepository } from './srs-card.repository';

@Global()
@Module({
  providers: [PrismaService, SrsCardRepository],
  exports: [PrismaService, SrsCardRepository],
})
export class PrismaModule {}
