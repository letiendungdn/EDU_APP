import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { RpcException } from "@nestjs/microservices";
import { GetExamQuery } from "./get-exam.query";
import { MockExamsService } from "../mock-exams.service";

@QueryHandler(GetExamQuery)
export class GetExamHandler implements IQueryHandler<GetExamQuery> {
  constructor(private readonly mockExamsService: MockExamsService) {}

  async execute(query: GetExamQuery) {
    const session = await this.mockExamsService.getSession(query.examId);
    if (!session) {
      throw new RpcException({
        statusCode: 404,
        message: "Phiên thi không tồn tại hoặc đã hết hạn.",
      });
    }
    return session;
  }
}
