import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import type {
  ConversationIntroLine,
  ConversationIntroSlot,
  ConversationPhraseGroup,
  ConversationPhraseItem,
  JapaneseConversationPayload,
} from '../../core/models/reference.models';
import { playJapanese, stopSpeech } from '../../core/utils/speech.util';

type Mode = 'intro' | 'phrases' | 'quiz';

function shuffle<T>(list: T[]): T[] {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

@Component({
  selector: 'app-conversation-page',
  standalone: true,
  imports: [RouterLink],
  styleUrl: './drills.scss',
  templateUrl: './conversation-page.component.html',
})
export class ConversationPageComponent {
  private readonly api = inject(ApiService);

  readonly loading = signal(true);
  readonly script = signal<ConversationIntroLine[]>([]);
  readonly slots = signal<ConversationIntroSlot[]>([]);
  readonly groups = signal<ConversationPhraseGroup[]>([]);

  readonly mode = signal<Mode>('intro');
  readonly lineIndex = signal(0);
  readonly hideJa = signal(false);
  readonly groupId = signal('');
  readonly playingAll = signal(false);
  readonly qIndex = signal(0);
  readonly picked = signal<string | null>(null);
  readonly score = signal({ ok: 0, n: 0 });
  readonly quizDeck = signal<ConversationPhraseItem[]>([]);

  readonly group = computed(() => {
    const groups = this.groups();
    const id = this.groupId() || groups[0]?.id || '';
    return groups.find((g) => g.id === id) ?? groups[0] ?? null;
  });
  readonly line = computed(() => this.script()[this.lineIndex()] ?? null);
  readonly bank = computed(() => this.groups().flatMap((g) => g.items));
  readonly currentQ = computed(() => this.quizDeck()[this.qIndex()] ?? null);
  readonly options = computed(() => {
    const current = this.currentQ();
    const bank = this.bank();
    if (!current) return [];
    const rest = shuffle(bank.filter((p) => p.ja !== current.ja))
      .slice(0, 3)
      .map((p) => p.ja);
    return shuffle([current.ja, ...rest]);
  });

  constructor() {
    void this.api.getJapaneseConversation().then((data: JapaneseConversationPayload) => {
      this.script.set(data.introScript);
      this.slots.set(data.introSlots);
      this.groups.set(data.phraseGroups);
      this.groupId.set(data.phraseGroups[0]?.id ?? '');
      this.quizDeck.set(shuffle(data.phraseGroups.flatMap((g) => g.items)).slice(0, 16));
      this.loading.set(false);
    });
  }

  setMode(mode: Mode): void {
    this.playingAll.set(false);
    stopSpeech();
    this.mode.set(mode);
    if (mode === 'quiz') this.picked.set(null);
  }

  setGroup(id: string): void {
    this.playingAll.set(false);
    stopSpeech();
    this.groupId.set(id);
  }

  speak(text: string): void {
    playJapanese(text);
  }

  playScript(): void {
    void this.playAll(this.script().map((line) => line.ja));
  }

  playGroup(): void {
    const group = this.group();
    if (!group) return;
    void this.playAll(group.items.map((item) => item.ja));
  }

  async playAll(items: string[]): Promise<void> {
    if (this.playingAll()) {
      this.playingAll.set(false);
      stopSpeech();
      return;
    }
    this.playingAll.set(true);
    for (let i = 0; i < items.length; i += 1) {
      if (!this.playingAll()) break;
      this.lineIndex.set(Math.min(i, Math.max(this.script().length - 1, 0)));
      playJapanese(items[i]);
      await new Promise((resolve) => window.setTimeout(resolve, 2200));
    }
    this.playingAll.set(false);
  }

  grade(opt: string): void {
    const q = this.currentQ();
    if (!q || this.picked()) return;
    this.picked.set(opt);
    this.score.update((s) => ({ ok: s.ok + (opt === q.ja ? 1 : 0), n: s.n + 1 }));
  }

  nextQ(): void {
    this.picked.set(null);
    const deck = this.quizDeck();
    if (!deck.length) return;
    this.qIndex.update((i) => (i + 1) % deck.length);
  }
}
