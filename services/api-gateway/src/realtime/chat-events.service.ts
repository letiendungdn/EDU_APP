import { Injectable } from "@nestjs/common";
import { Observable, Subject } from "rxjs";
import { filter, map } from "rxjs/operators";

export type ChatEventType = "support" | "community" | "session";

export interface ChatEvent {
  type: ChatEventType;
  roomId: number;
  message: unknown;
}

@Injectable()
export class ChatEventsService {
  private readonly subject = new Subject<ChatEvent>();

  emit(event: ChatEvent) {
    this.subject.next(event);
  }

  observe(type: ChatEventType, roomId: number): Observable<MessageEvent> {
    return this.subject.asObservable().pipe(
      filter((e) => e.type === type && e.roomId === roomId),
      map((e) => ({ data: e.message }) as MessageEvent),
    );
  }
}
