import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetResultsQuery } from "./get-results.query";
import { MockExamsService } from "../mock-exams.service";

@QueryHandler(GetResultsQuery)
export class GetResultsHandler implements IQueryHandler<GetResultsQuery> {
  constructor(private readonly mockExamsService: MockExamsService) {}

  execute(query: GetResultsQuery) {
    return this.mockExamsService.getHistory(query.userId);
  }
}
