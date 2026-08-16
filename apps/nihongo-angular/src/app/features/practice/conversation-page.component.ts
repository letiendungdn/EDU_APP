import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  INTRO_SLOTS,
  PHRASE_GROUPS,
  SELF_INTRO_SCRIPT,
  allPhrases,
} from '../../core/data/conversation';
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
  readonly script = SELF_INTRO_SCRIPT;
  readonly slots = INTRO_SLOTS;
  readonly groups = PHRASE_GROUPS;

  readonly mode = signal<Mode>('intro');
  readonly lineIndex = signal(0);
  readonly hideJa = signal(false);
  readonly groupId = signal(PHRASE_GROUPS[0].id);
  readonly playingAll = signal(false);
  readonly qIndex = signal(0);
  readonly picked = signal<string | null>(null);
  readonly score = signal({ ok: 0, n: 0 });

  readonly group = computed(
    () => this.groups.find((g) => g.id === this.groupId()) ?? this.groups[0],
  );
  readonly line = computed(() => this.script[this.lineIndex()]);
  readonly bank = allPhrases();
  readonly quizDeck = shuffle(this.bank).slice(0, 16);
  readonly currentQ = computed(() => this.quizDeck[this.qIndex()]);
  readonly options = computed(() => {
    const current = this.currentQ();
    if (!current) return [];
    const rest = shuffle(this.bank.filter((p) => p.ja !== current.ja))
      .slice(0, 3)
      .map((p) => p.ja);
    return shuffle([current.ja, ...rest]);
  });

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
    void this.playAll(this.script.map((line) => line.ja));
  }

  playGroup(): void {
    void this.playAll(this.group().items.map((item) => item.ja));
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
      this.lineIndex.set(Math.min(i, this.script.length - 1));
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
    this.qIndex.update((i) => (i + 1) % this.quizDeck.length);
  }
}
