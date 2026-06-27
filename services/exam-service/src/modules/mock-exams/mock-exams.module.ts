import { Module } from '@nestjs/common';
import { MockExamsService } from './mock-exams.service';

@Module({
  providers: [MockExamsService],
  exports: [MockExamsService],
})
export class MockExamsModule {}
