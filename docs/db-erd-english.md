# Sơ đồ ER — DB english_learning

> **Tự sinh** từ `packages/prisma-english/schema.prisma` bởi `npm run db:erd`.
> Đừng sửa tay — sửa schema (hoặc cách chia phân hệ trong `packages/prisma-nihongo/scripts/gen-erd.ts`) rồi chạy lại.

**23 bảng · 4 enum · 21 quan hệ khóa ngoại.**
Ký hiệu: `PK` khóa chính · `FK` khóa ngoại · `UK` duy nhất · `"null"` cho phép null · `_list` mảng (Postgres array).
Bảng thu gọn (`→ xem phân hệ khác`) thuộc phân hệ khác, chỉ vẽ để thấy liên kết.

## Mục lục

- [Từ vựng & ngữ pháp](#từ-vựng--ngữ-pháp) — 7 bảng
- [Đọc & nghe](#đọc--nghe) — 6 bảng
- [Người dùng & tiến độ](#người-dùng--tiến-độ) — 10 bảng

## Từ vựng & ngữ pháp

Chủ đề từ vựng (CEFR A1–C2), bài ngữ pháp kèm ví dụ và bài tập. (7 bảng; liên kết ngoài: `DictationAttempt`)

```mermaid
erDiagram
  VocabTopic {
    int id PK
    string name UK
    string icon "null"
    int sortOrder
  }
  Vocabulary {
    int id PK
    string word
    string phonetic "null"
    string meaningVi
    string meaningEn "null"
    PartOfSpeech partOfSpeech "null"
    EnglishLevel level
    string exampleEn "null"
    string exampleVi "null"
    string audioUrl "null"
    string imageUrl "null"
    int frequencyRank "null"
    int sortOrder
    int topicId FK "null"
    datetime createdAt
    datetime updatedAt
  }
  GrammarTopic {
    int id PK
    string title
    string description "null"
    EnglishLevel level
    int sortOrder
    datetime createdAt
    datetime updatedAt
  }
  GrammarLesson {
    int id PK
    int topicId FK
    string title
    string explanation
    EnglishLevel level
    int sortOrder
    datetime createdAt
    datetime updatedAt
  }
  GrammarExample {
    int id PK
    int lessonId FK
    string en
    string vi "null"
    string audioUrl "null"
    int sortOrder
  }
  GrammarExercise {
    int id PK
    int lessonId FK
    string question
    string answer
    string explanation "null"
    int sortOrder
    datetime createdAt
    datetime updatedAt
  }
  GrammarExOption {
    int id PK
    int exerciseId FK
    string text
    bool isCorrect
    int sortOrder
  }
  DictationAttempt {
    string ref "→ xem phân hệ khác"
  }
  VocabTopic o|--}o Vocabulary : topic
  GrammarTopic ||--}o GrammarLesson : topic
  GrammarLesson ||--}o GrammarExample : lesson
  GrammarLesson ||--}o GrammarExercise : lesson
  GrammarExercise ||--}o GrammarExOption : exercise
  Vocabulary ||--}o DictationAttempt : vocab
```

## Đọc & nghe

Bài đọc, bài nghe và câu hỏi trắc nghiệm. (6 bảng; liên kết ngoài: `ListeningAttempt`, `ReadingAttempt`)

```mermaid
erDiagram
  ReadingPassage {
    int id PK
    string title
    string content
    EnglishLevel level
    string source "null"
    int estimatedMin
    int sortOrder
    datetime createdAt
    datetime updatedAt
  }
  ReadingQuestion {
    int id PK
    int passageId FK
    string question
    string answer
    string explanation "null"
    int sortOrder
  }
  ReadingOption {
    int id PK
    int questionId FK
    string text
    int sortOrder
  }
  ListeningTrack {
    int id PK
    string title
    string youtubeUrl "null"
    string audioUrl "null"
    string transcript "null"
    EnglishLevel level
    int durationSec "null"
    int sortOrder
    datetime createdAt
    datetime updatedAt
  }
  ListeningQuestion {
    int id PK
    int trackId FK
    string question
    string answer
    string explanation "null"
    int sortOrder
  }
  ListeningOption {
    int id PK
    int questionId FK
    string text
    int sortOrder
  }
  ListeningAttempt {
    string ref "→ xem phân hệ khác"
  }
  ReadingAttempt {
    string ref "→ xem phân hệ khác"
  }
  ReadingPassage ||--}o ReadingQuestion : passage
  ReadingQuestion ||--}o ReadingOption : question
  ReadingPassage ||--}o ReadingAttempt : passage
  ListeningTrack ||--}o ListeningQuestion : track
  ListeningQuestion ||--}o ListeningOption : question
  ListeningTrack ||--}o ListeningAttempt : track
```

## Người dùng & tiến độ

Tài khoản, SRS, lượt làm bài (userId null = khách), phiên học, streak, nhật ký, mục tiêu ngày. (10 bảng; liên kết ngoài: `ListeningTrack`, `ReadingPassage`, `Vocabulary`)

```mermaid
erDiagram
  User {
    int id PK
    string email UK
    string passwordHash
    string name "null"
    Role role
    string nativeLanguage "null"
    EnglishLevel targetLevel "null"
    int studyGoalMin
    datetime lastActiveAt "null"
    datetime createdAt
    datetime updatedAt
  }
  SrsCard {
    int id PK
    int userId FK
    ContentType contentType
    int contentId
    float easeFactor
    int interval
    int repetitions
    datetime nextReviewAt
    datetime lastReviewAt "null"
    int correctCount
    int wrongCount
    int reviewStreak
    bool mastered
    datetime createdAt
    datetime updatedAt
  }
  ReadingAttempt {
    int id PK
    int userId FK "null"
    int passageId FK
    int correct
    int total
    float percent
    datetime submittedAt
  }
  ListeningAttempt {
    int id PK
    int userId FK "null"
    int trackId FK
    int correct
    int total
    float percent
    datetime submittedAt
  }
  DictationAttempt {
    int id PK
    int userId FK "null"
    int vocabId FK
    string userInput
    bool correct
    datetime createdAt
  }
  StudySession {
    int id PK
    int userId FK
    datetime date
    int seconds
    int cardsStudied
    datetime createdAt
    datetime updatedAt
  }
  StudyStreak {
    int id PK
    int userId FK, UK
    int currentStreak
    int longestStreak
    string lastStudyDate "null"
    datetime updatedAt
  }
  DailyNote {
    int id PK
    int userId FK
    string date
    string content
    datetime createdAt
    datetime updatedAt
  }
  DailyGoal {
    int id PK
    int userId FK
    string date
    datetime createdAt
    datetime updatedAt
  }
  DailyGoalItem {
    int id PK
    int goalId FK
    string text
    bool done
    int sortOrder
  }
  ListeningTrack {
    string ref "→ xem phân hệ khác"
  }
  ReadingPassage {
    string ref "→ xem phân hệ khác"
  }
  Vocabulary {
    string ref "→ xem phân hệ khác"
  }
  User ||--}o SrsCard : user
  ReadingPassage ||--}o ReadingAttempt : passage
  User o|--}o ReadingAttempt : user
  ListeningTrack ||--}o ListeningAttempt : track
  User o|--}o ListeningAttempt : user
  Vocabulary ||--}o DictationAttempt : vocab
  User o|--}o DictationAttempt : user
  User ||--}o StudySession : user
  User ||--|o StudyStreak : user
  User ||--}o DailyNote : user
  User ||--}o DailyGoal : user
  DailyGoal ||--}o DailyGoalItem : goal
```

## Enum

| Enum | Giá trị |
|------|---------|
| `Role` | `USER` · `ADMIN` |
| `EnglishLevel` | `A1` · `A2` · `B1` · `B2` · `C1` · `C2` |
| `PartOfSpeech` | `noun` · `verb` · `adjective` · `adverb` · `preposition` · `conjunction` · `pronoun` · `interjection` · `phrase` · `phrasal_verb` |
| `ContentType` | `VOCABULARY` · `GRAMMAR` |
