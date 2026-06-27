export class SubmitExamCommand {
  constructor(
    public readonly examId: string,
    public readonly answers: Record<string, string>,
    public readonly userId?: number,
  ) {}
}
