import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/home/home-page.component').then((m) => m.HomePageComponent),
      },
      {
        path: 'kana',
        loadComponent: () =>
          import('./features/kana/kana-page.component').then((m) => m.KanaPageComponent),
      },
      {
        path: 'pronunciation',
        loadComponent: () =>
          import('./features/pronunciation/pronunciation-page.component').then(
            (m) => m.PronunciationPageComponent,
          ),
      },
      {
        path: 'pronunciation-rules',
        loadComponent: () =>
          import('./features/pronunciation-rules/pronunciation-rules-page.component').then(
            (m) => m.PronunciationRulesPageComponent,
          ),
      },
      {
        path: 'tts',
        loadComponent: () =>
          import('./features/text-to-speech/text-to-speech-page.component').then(
            (m) => m.TextToSpeechPageComponent,
          ),
      },
      {
        path: 'stt',
        loadComponent: () =>
          import('./features/speech-to-text/speech-to-text-page.component').then(
            (m) => m.SpeechToTextPageComponent,
          ),
      },
      {
        path: 'english-katakana',
        loadComponent: () =>
          import('./features/english-katakana/english-katakana-page.component').then(
            (m) => m.EnglishKatakanaPageComponent,
          ),
      },
      {
        path: 'daily-listening',
        loadComponent: () =>
          import('./features/daily-listening/daily-listening-page.component').then(
            (m) => m.DailyListeningPageComponent,
          ),
      },
      {
        path: 'book-audio',
        loadComponent: () =>
          import('./features/book-audio/book-audio-page.component').then(
            (m) => m.BookAudioPageComponent,
          ),
      },
      {
        path: 'notes',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/notes/notes-page.component').then((m) => m.NotesPageComponent),
      },
      {
        path: 'vocab',
        loadComponent: () =>
          import('./features/vocab/vocab-page.component').then((m) => m.VocabPageComponent),
      },
      {
        path: 'vocab/picture',
        loadComponent: () =>
          import('./features/picture-dictionary/picture-dictionary-page.component').then(
            (m) => m.PictureDictionaryPageComponent,
          ),
      },
      {
        path: 'vocab-review',
        loadComponent: () =>
          import('./features/vocab-review/vocab-review-page.component').then(
            (m) => m.VocabReviewPageComponent,
          ),
      },
      {
        path: 'grammar',
        loadComponent: () =>
          import('./features/grammar/grammar-page.component').then((m) => m.GrammarPageComponent),
      },
      {
        path: 'kanji',
        loadComponent: () =>
          import('./features/kanji/kanji-page.component').then((m) => m.KanjiPageComponent),
      },
      {
        path: 'strokes',
        loadComponent: () =>
          import('./features/strokes/strokes-page.component').then((m) => m.StrokesPageComponent),
      },
      {
        path: 'kanji/list',
        loadComponent: () =>
          import('./features/kanji/kanji-list-page.component').then((m) => m.KanjiListPageComponent),
      },
      {
        path: 'counters',
        loadComponent: () =>
          import('./features/counters/counters-page.component').then((m) => m.CountersPageComponent),
      },
      {
        path: 'suffixes',
        loadComponent: () =>
          import('./features/suffixes/suffixes-page.component').then((m) => m.SuffixesPageComponent),
      },
      {
        path: 'word-classes',
        loadComponent: () =>
          import('./features/word-classes/word-classes-page.component').then(
            (m) => m.WordClassesPageComponent,
          ),
      },
      {
        path: 'jlpt',
        loadComponent: () =>
          import('./features/jlpt/jlpt-page.component').then((m) => m.JlptPageComponent),
      },
      {
        path: 'mock-exam',
        loadComponent: () =>
          import('./features/mock-exam/mock-exam-list-page.component').then(
            (m) => m.MockExamListPageComponent,
          ),
      },
      {
        path: 'mock-exam/:level/answers',
        loadComponent: () =>
          import('./features/mock-exam/mock-exam-answers-page.component').then(
            (m) => m.MockExamAnswersPageComponent,
          ),
      },
      {
        path: 'mock-exam/:level',
        loadComponent: () =>
          import('./features/mock-exam/mock-exam-take-page.component').then(
            (m) => m.MockExamTakePageComponent,
          ),
      },
      {
        path: 'quiz',
        loadComponent: () =>
          import('./features/quiz/quiz-page.component').then((m) => m.QuizPageComponent),
      },
      {
        path: 'reading',
        loadComponent: () =>
          import('./features/reading/reading-list-page.component').then(
            (m) => m.ReadingListPageComponent,
          ),
      },
      {
        path: 'reading/:id',
        loadComponent: () =>
          import('./features/reading/reading-detail-page.component').then(
            (m) => m.ReadingDetailPageComponent,
          ),
      },
      {
        path: 'dictation',
        loadComponent: () =>
          import('./features/dictation/dictation-page.component').then((m) => m.DictationPageComponent),
      },
      {
        path: 'practice',
        loadComponent: () =>
          import('./features/practice/practice-hub-page.component').then((m) => m.PracticeHubPageComponent),
      },
      {
        path: 'conjugation',
        loadComponent: () =>
          import('./features/practice/conjugation-page.component').then((m) => m.ConjugationPageComponent),
      },
      {
        path: 'particles',
        loadComponent: () =>
          import('./features/practice/particles-page.component').then((m) => m.ParticlesPageComponent),
      },
      {
        path: 'kanji-readings',
        loadComponent: () =>
          import('./features/practice/kanji-readings-page.component').then((m) => m.KanjiReadingsPageComponent),
      },
      {
        path: 'homophones',
        loadComponent: () =>
          import('./features/practice/practice-extra-page.component').then((m) => m.PracticeExtraPageComponent),
      },
      {
        path: 'keigo',
        loadComponent: () =>
          import('./features/practice/practice-extra-page.component').then((m) => m.PracticeExtraPageComponent),
      },
      {
        path: 'radicals',
        loadComponent: () =>
          import('./features/practice/practice-extra-page.component').then((m) => m.PracticeExtraPageComponent),
      },
      {
        path: 'grammar-srs',
        loadComponent: () =>
          import('./features/practice/practice-extra-page.component').then((m) => m.PracticeExtraPageComponent),
      },
      {
        path: 'listening-types',
        loadComponent: () =>
          import('./features/practice/practice-extra-page.component').then((m) => m.PracticeExtraPageComponent),
      },
      {
        path: 'conversation',
        loadComponent: () =>
          import('./features/practice/conversation-page.component').then(
            (m) => m.ConversationPageComponent,
          ),
      },
      {
        path: 'roleplay',
        loadComponent: () =>
          import('./features/practice/practice-extra-page.component').then((m) => m.PracticeExtraPageComponent),
      },
      {
        path: 'srs',
        loadComponent: () =>
          import('./features/srs/srs-page.component').then((m) => m.SrsPageComponent),
      },
      {
        path: 'sentence-practice',
        loadComponent: () =>
          import('./features/sentence-practice/sentence-practice-page.component').then(
            (m) => m.SentencePracticePageComponent,
          ),
      },
      {
        path: 'analytics',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/analytics/analytics-page.component').then((m) => m.AnalyticsPageComponent),
      },
      {
        path: 'pricing',
        loadComponent: () =>
          import('./features/pricing/pricing-page.component').then((m) => m.PricingPageComponent),
      },
      {
        path: 'subscribe',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/pricing/subscribe-page.component').then((m) => m.SubscribePageComponent),
      },
      {
        path: 'payments',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/payments/payments-page.component').then((m) => m.PaymentsPageComponent),
      },
      {
        path: 'community',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/community/community-page.component').then((m) => m.CommunityPageComponent),
      },
      {
        path: 'support',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/support/support-page.component').then((m) => m.SupportPageComponent),
      },
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login-page.component').then((m) => m.LoginPageComponent),
      },
      {
        path: 'auth/callback',
        loadComponent: () =>
          import('./features/auth/auth-callback-page.component').then(
            (m) => m.AuthCallbackPageComponent,
          ),
      },
      {
        path: 'profile',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/auth/profile-page.component').then((m) => m.ProfilePageComponent),
      },
    ],
  },
  {
    path: 'session/:id/call',
    loadComponent: () =>
      import('./features/call/call-page.component').then((m) => m.CallPageComponent),
  },
  {
    path: 'admin/login',
    loadComponent: () =>
      import('./features/admin/admin-login-page.component').then((m) => m.AdminLoginPageComponent),
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./features/admin/admin-layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/admin/admin-dashboard-page.component').then(
            (m) => m.AdminDashboardPageComponent,
          ),
      },
      {
        path: 'payments',
        loadComponent: () =>
          import('./features/admin/admin-payments-page.component').then(
            (m) => m.AdminPaymentsPageComponent,
          ),
      },
      {
        path: 'messages',
        loadComponent: () =>
          import('./features/admin/admin-messages-page.component').then(
            (m) => m.AdminMessagesPageComponent,
          ),
      },
      {
        path: 'import',
        loadComponent: () =>
          import('./features/admin/admin-import-page.component').then(
            (m) => m.AdminImportPageComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
