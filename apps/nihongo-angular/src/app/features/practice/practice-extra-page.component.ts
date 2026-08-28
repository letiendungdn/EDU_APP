import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { buildHomophoneGroups } from '../../core/utils/homophones';
import { playJapanese } from '../../core/utils/speech.util';
import { KEIGO_ITEMS, KEIGO_LEVELS } from '../../core/data/keigo';
import { RADICALS } from '../../core/data/radicals';
import {
  loadGrammarSrs,
  reviewGrammar,
  unpinGrammar,
  type GrammarSrsCard,
} from '../../core/utils/grammarSrs';
import { JLPT_LISTENING_ITEMS, JLPT_LISTENING_TYPES, type JlptListeningType } from '../../core/data/jlpt-listening';
import type { JapaneseRoleplayPayload, RoleplayScene } from '../../core/models/reference.models';

type ExtraTab = 'homophones' | 'keigo' | 'radicals' | 'grammar-srs' | 'listening' | 'roleplay';

@Component({
  selector: 'app-practice-extra-page',
  standalone: true,
  imports: [RouterLink],
  styleUrl: './drills.scss',
  templateUrl: './practice-extra-page.component.html',
})
export class PracticeExtraPageComponent {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  readonly tab = signal<ExtraTab>('homophones');

  readonly vocabLoading = signal(true);
  readonly groups = signal(buildHomophoneGroups([]));
  readonly hpIndex = signal(0);
  readonly hpPicked = signal<number | null>(null);
  readonly hpGroup = computed(() => this.groups()[this.hpIndex()]);
  readonly hpTarget = computed(() => this.hpGroup()?.items[0] ?? null);

  readonly keigoKind = signal<'sonkei' | 'kenjō'>('sonkei');
  readonly keigoIndex = signal(0);
  readonly keigoPicked = signal<string | null>(null);
  readonly keigoItem = computed(() => KEIGO_ITEMS[this.keigoIndex()]);
  readonly keigoAnswer = computed(() => this.keigoItem()[this.keigoKind()]);
  readonly keigoLevels = KEIGO_LEVELS;
  readonly keigoOptions = computed(() => {
    const answer = this.keigoAnswer();
    const pool = [...new Set(KEIGO_ITEMS.flatMap((row) => [row.sonkei, row.kenjō, row.plain]))];
    const rest = pool.filter((p) => p !== answer).sort(() => Math.random() - 0.5).slice(0, 3);
    return [answer, ...rest].sort(() => Math.random() - 0.5);
  });

  readonly radicalIndex = signal(0);
  readonly radicalPicked = signal<string | null>(null);
  readonly radical = computed(() => RADICALS[this.radicalIndex()]);
  readonly radicalOptions = computed(() => {
    const current = this.radical();
    const rest = RADICALS.filter((r) => r.radical !== current.radical)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((r) => r.vi);
    return [current.vi, ...rest].sort(() => Math.random() - 0.5);
  });

  readonly grammarCards = signal<GrammarSrsCard[]>(loadGrammarSrs());
  readonly grammarDue = computed(() => this.grammarCards().filter((c) => c.due <= Date.now()));
  readonly grammarFlipped = signal(false);
  readonly grammarCurrent = computed(() => this.grammarDue()[0] ?? null);

  readonly listenKind = signal<JlptListeningType | 'all'>('all');
  readonly listenIndex = signal(0);
  readonly listenPicked = signal<string | null>(null);
  readonly listenTypes = JLPT_LISTENING_TYPES;
  readonly listenBank = computed(() =>
    this.listenKind() === 'all'
      ? JLPT_LISTENING_ITEMS
      : JLPT_LISTENING_ITEMS.filter((i) => i.type === this.listenKind()),
  );
  readonly listenCurrent = computed(() => this.listenBank()[this.listenIndex()]);

  readonly sceneId = signal('');
  readonly roleplayLoading = signal(true);
  readonly scenes = signal<RoleplayScene[]>([]);
  readonly lineIndex = signal(0);
  readonly hideJa = signal(true);
  readonly scene = computed(() => {
    const scenes = this.scenes();
    const id = this.sceneId() || scenes[0]?.id || '';
    return scenes.find((s) => s.id === id) ?? scenes[0] ?? null;
  });
  readonly line = computed(() => this.scene()?.lines[this.lineIndex()] ?? null);

  constructor() {
    const path = this.route.snapshot.routeConfig?.path ?? '';
    if (path === 'listening-types') this.tab.set('listening');
    else if (
      path === 'grammar-srs' ||
      path === 'homophones' ||
      path === 'keigo' ||
      path === 'radicals' ||
      path === 'roleplay'
    ) {
      this.tab.set(path);
    }
    void this.api.getVocabulariesRange(1, 50).then((rows) => {
      this.groups.set(buildHomophoneGroups(rows));
      this.vocabLoading.set(false);
    });
    void this.api.getJapaneseRoleplay().then((data: JapaneseRoleplayPayload) => {
      this.scenes.set(data.scenes);
      this.sceneId.set(data.scenes[0]?.id ?? '');
      this.roleplayLoading.set(false);
    });
  }

  setTab(tab: ExtraTab): void {
    this.tab.set(tab);
  }

  speak(text: string): void {
    playJapanese(text);
  }

  hpGrade(id: number): void {
    if (this.hpPicked() != null) return;
    this.hpPicked.set(id);
  }

  hpNext(): void {
    this.hpPicked.set(null);
    this.hpIndex.update((i) => (i + 1) % Math.max(this.groups().length, 1));
  }

  keigoGrade(opt: string): void {
    if (this.keigoPicked()) return;
    this.keigoPicked.set(opt);
  }

  keigoNext(): void {
    this.keigoPicked.set(null);
    this.keigoIndex.update((i) => (i + 1) % KEIGO_ITEMS.length);
  }

  radicalGrade(opt: string): void {
    if (this.radicalPicked()) return;
    this.radicalPicked.set(opt);
  }

  radicalNext(): void {
    this.radicalPicked.set(null);
    this.radicalIndex.update((i) => (i + 1) % RADICALS.length);
  }

  rateGrammar(q: number): void {
    const current = this.grammarCurrent();
    if (!current) return;
    this.grammarCards.set(reviewGrammar(current.id, q));
    this.grammarFlipped.set(false);
  }

  unpin(): void {
    const current = this.grammarCurrent();
    if (!current) return;
    this.grammarCards.set(unpinGrammar(current.id));
  }

  listenGrade(opt: string): void {
    if (this.listenPicked()) return;
    this.listenPicked.set(opt);
  }

  listenNext(): void {
    this.listenPicked.set(null);
    this.listenIndex.update((i) => (i + 1) % Math.max(this.listenBank().length, 1));
  }

  setScene(id: string): void {
    this.sceneId.set(id);
    this.lineIndex.set(0);
    this.hideJa.set(true);
  }
}
