-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'TEACHER', 'ADMIN');

-- CreateEnum
CREATE TYPE "JlptLevel" AS ENUM ('N5', 'N4', 'N3', 'N2', 'N1');

-- CreateEnum
CREATE TYPE "ExerciseType" AS ENUM ('MULTIPLE_CHOICE', 'FILL_IN_BLANK', 'LISTENING');

-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('VOCABULARY', 'GRAMMAR', 'KANJI');

-- CreateEnum
CREATE TYPE "KanaScript" AS ENUM ('HIRAGANA', 'KATAKANA');

-- CreateEnum
CREATE TYPE "JlptSessionStatus" AS ENUM ('REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'UPCOMING', 'PAST');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELED', 'TRIALING', 'PAUSED');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE', 'BASIC', 'PRO', 'PRO_ANNUAL');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'PROCESSING', 'PAID', 'FAILED');

-- CreateEnum
CREATE TYPE "WebhookEventStatus" AS ENUM ('RECEIVED', 'PROCESSED', 'FAILED', 'IGNORED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'SESSION_CONFIRMED', 'SESSION_CANCELED', 'SESSION_REMINDER', 'COACH_MESSAGE', 'SUPPORT_MESSAGE', 'GROUP_MESSAGE', 'SYSTEM');

-- CreateEnum
CREATE TYPE "LearnerChatRoomType" AS ENUM ('DIRECT', 'GROUP');

-- CreateEnum
CREATE TYPE "LearnerChatMemberRole" AS ENUM ('MEMBER', 'ADMIN');

-- CreateEnum
CREATE TYPE "MindMapKind" AS ENUM ('GRAMMAR', 'VOCAB', 'KANJI');

-- CreateTable
CREATE TABLE "Lesson" (
    "id" SERIAL NOT NULL,
    "lessonNumber" INTEGER NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "jlptLevel" "JlptLevel",
    "thumbnailUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vocabulary" (
    "id" SERIAL NOT NULL,
    "kanji" TEXT,
    "kana" TEXT NOT NULL,
    "romaji" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "meaningEn" TEXT,
    "partOfSpeech" TEXT,
    "jlptLevel" "JlptLevel",
    "pitchAccent" TEXT,
    "audioUrl" TEXT,
    "imageUrl" TEXT,
    "exampleJa" TEXT,
    "exampleKana" TEXT,
    "exampleVi" TEXT,
    "frequencyRank" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "lessonId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vocabulary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Grammar" (
    "id" SERIAL NOT NULL,
    "pattern" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "explanation" TEXT,
    "jlptLevel" "JlptLevel",
    "formalityLevel" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "lessonId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Grammar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Example" (
    "id" SERIAL NOT NULL,
    "jp" TEXT NOT NULL,
    "romaji" TEXT NOT NULL,
    "en" TEXT,
    "vi" TEXT,
    "audioUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "grammarId" INTEGER NOT NULL,

    CONSTRAINT "Example_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" SERIAL NOT NULL,
    "type" "ExerciseType" NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "explanation" TEXT,
    "audioUrl" TEXT,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "lessonId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseOption" (
    "id" SERIAL NOT NULL,
    "exerciseId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ExerciseOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KanaSection" (
    "id" SERIAL NOT NULL,
    "script" "KanaScript" NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "columns" INTEGER NOT NULL DEFAULT 5,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KanaSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KanaCell" (
    "id" SERIAL NOT NULL,
    "sectionId" INTEGER NOT NULL,
    "rowIndex" INTEGER NOT NULL,
    "colIndex" INTEGER NOT NULL,
    "kana" TEXT NOT NULL DEFAULT '',
    "romaji" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "KanaCell_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KanaRomaji" (
    "id" SERIAL NOT NULL,
    "kana" TEXT NOT NULL,
    "romaji" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KanaRomaji_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CounterCategory" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "hint" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CounterCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CounterItem" (
    "id" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "displayNumber" TEXT NOT NULL,
    "kanji" TEXT,
    "kana" TEXT NOT NULL,
    "romaji" TEXT NOT NULL,
    "meaningVi" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CounterItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CountryRegion" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CountryRegion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CountryNameItem" (
    "id" SERIAL NOT NULL,
    "regionId" INTEGER NOT NULL,
    "nameJa" TEXT NOT NULL,
    "kana" TEXT NOT NULL,
    "romaji" TEXT NOT NULL,
    "meaningVi" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CountryNameItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VocabSuffixGroup" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "labelJa" TEXT NOT NULL DEFAULT '',
    "hint" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VocabSuffixGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VocabSuffixItem" (
    "id" SERIAL NOT NULL,
    "groupId" INTEGER NOT NULL,
    "suffix" TEXT NOT NULL,
    "forms" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "kana" TEXT NOT NULL,
    "romaji" TEXT NOT NULL,
    "meaningVi" TEXT NOT NULL,
    "attachesTo" TEXT NOT NULL,
    "pos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "exampleJa" TEXT NOT NULL,
    "exampleVi" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VocabSuffixItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeStat" (
    "id" SERIAL NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "suffix" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeFeatureSection" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeFeatureSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeFeatureItem" (
    "id" SERIAL NOT NULL,
    "sectionId" INTEGER NOT NULL,
    "href" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeFeatureItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationIntroLine" (
    "id" SERIAL NOT NULL,
    "ja" TEXT NOT NULL,
    "kana" TEXT NOT NULL,
    "romaji" TEXT NOT NULL,
    "vi" TEXT NOT NULL,
    "tip" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConversationIntroLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationIntroSlot" (
    "id" SERIAL NOT NULL,
    "slot" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConversationIntroSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationIntroExample" (
    "id" SERIAL NOT NULL,
    "slotId" INTEGER NOT NULL,
    "ja" TEXT NOT NULL,
    "kana" TEXT NOT NULL,
    "romaji" TEXT NOT NULL,
    "vi" TEXT NOT NULL,
    "note" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConversationIntroExample_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationPhraseGroup" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "hint" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConversationPhraseGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationPhraseItem" (
    "id" SERIAL NOT NULL,
    "groupId" INTEGER NOT NULL,
    "ja" TEXT NOT NULL,
    "kana" TEXT NOT NULL,
    "romaji" TEXT NOT NULL,
    "vi" TEXT NOT NULL,
    "note" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConversationPhraseItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoleplayScene" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleJa" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoleplayScene_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoleplayLine" (
    "id" SERIAL NOT NULL,
    "sceneId" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "ja" TEXT NOT NULL,
    "vi" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoleplayLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PronunciationRulesMeta" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "intro" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PronunciationRulesMeta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PronunciationRuleTip" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PronunciationRuleTip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PronunciationRuleSection" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PronunciationRuleSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PronunciationRulePoint" (
    "id" SERIAL NOT NULL,
    "sectionId" INTEGER NOT NULL,
    "label" TEXT,
    "japanese" TEXT,
    "romaji" TEXT,
    "explanation" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PronunciationRulePoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PronunciationRuleExample" (
    "id" SERIAL NOT NULL,
    "sectionId" INTEGER NOT NULL,
    "japanese" TEXT NOT NULL,
    "romaji" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "note" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PronunciationRuleExample_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnglishKatakanaMeta" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "intro" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnglishKatakanaMeta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnglishKatakanaTip" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnglishKatakanaTip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnglishKatakanaSection" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnglishKatakanaSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnglishKatakanaPoint" (
    "id" SERIAL NOT NULL,
    "sectionId" INTEGER NOT NULL,
    "explanation" TEXT NOT NULL,
    "english" TEXT,
    "katakana" TEXT,
    "romaji" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "EnglishKatakanaPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnglishKatakanaMapping" (
    "id" SERIAL NOT NULL,
    "sectionId" INTEGER NOT NULL,
    "english" TEXT NOT NULL,
    "katakana" TEXT NOT NULL,
    "romaji" TEXT NOT NULL,
    "note" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "EnglishKatakanaMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnglishKatakanaExample" (
    "id" SERIAL NOT NULL,
    "sectionId" INTEGER NOT NULL,
    "english" TEXT NOT NULL,
    "katakana" TEXT NOT NULL,
    "romaji" TEXT NOT NULL,
    "meaningVi" TEXT NOT NULL,
    "note" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "EnglishKatakanaExample_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListeningConfig" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "goalMinutes" INTEGER NOT NULL DEFAULT 15,

    CONSTRAINT "ListeningConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PodcastResource" (
    "id" SERIAL NOT NULL,
    "externalKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PodcastResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListeningPreset" (
    "id" SERIAL NOT NULL,
    "externalKey" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "lessonFrom" INTEGER NOT NULL,
    "lessonTo" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ListeningPreset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookAudioMeta" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "sourceUrl" TEXT NOT NULL,
    "publisher" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookAudioMeta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookAudioItem" (
    "id" SERIAL NOT NULL,
    "externalKey" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "note" TEXT,
    "listNo" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "driveId" TEXT,
    "driveKind" TEXT,
    "folderId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookAudioItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookAudioDriveFolder" (
    "id" SERIAL NOT NULL,
    "driveId" TEXT NOT NULL,
    "title" TEXT,
    "localPath" TEXT,
    "fileCount" INTEGER NOT NULL DEFAULT 0,
    "downloadedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookAudioDriveFolder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookAudioFile" (
    "id" SERIAL NOT NULL,
    "folderId" INTEGER,
    "itemId" INTEGER,
    "driveFileId" TEXT,
    "fileName" TEXT NOT NULL,
    "localPath" TEXT NOT NULL,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookAudioFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JlptOrganizer" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "announcementsUrl" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JlptOrganizer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JlptExamFeeInfo" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "formFee" TEXT NOT NULL,
    "examFee" TEXT NOT NULL,
    "note" TEXT NOT NULL,

    CONSTRAINT "JlptExamFeeInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JlptExamBriefing" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "text" TEXT NOT NULL,

    CONSTRAINT "JlptExamBriefing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JlptExamSession" (
    "id" SERIAL NOT NULL,
    "externalKey" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "examDate" TEXT NOT NULL,
    "registrationPeriod" TEXT NOT NULL,
    "status" "JlptSessionStatus" NOT NULL,
    "statusLabel" TEXT NOT NULL,
    "announcementUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JlptExamSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JlptExamVenue" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "levels" TEXT NOT NULL,
    "note" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JlptExamVenue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JlptExamDaySlot" (
    "id" SERIAL NOT NULL,
    "levels" TEXT NOT NULL,
    "arriveAt" TEXT NOT NULL,
    "startAt" TEXT NOT NULL,
    "venue" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JlptExamDaySlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JlptRoadmapMeta" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "examScheduleNote" TEXT NOT NULL,

    CONSTRAINT "JlptRoadmapMeta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyTip" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyTip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JlptRoadmapLevel" (
    "id" SERIAL NOT NULL,
    "externalKey" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "badge" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "vocabTarget" TEXT NOT NULL,
    "kanjiTarget" TEXT NOT NULL,
    "grammarTarget" TEXT NOT NULL DEFAULT '',
    "vocabIncrement" TEXT NOT NULL DEFAULT '',
    "kanjiIncrement" TEXT NOT NULL DEFAULT '',
    "grammarIncrement" TEXT NOT NULL DEFAULT '',
    "passScore" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JlptRoadmapLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JlptRoadmapExamSection" (
    "id" SERIAL NOT NULL,
    "levelId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "time" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "JlptRoadmapExamSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JlptRoadmapMaterial" (
    "id" SERIAL NOT NULL,
    "levelId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "inAppPath" TEXT,
    "inAppLabel" TEXT,
    "externalUrl" TEXT,
    "externalLabel" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "JlptRoadmapMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JlptRoadmapPhase" (
    "id" SERIAL NOT NULL,
    "levelId" INTEGER NOT NULL,
    "externalKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "JlptRoadmapPhase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JlptRoadmapTask" (
    "id" SERIAL NOT NULL,
    "phaseId" INTEGER NOT NULL,
    "externalKey" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "inAppPath" TEXT,
    "inAppLabel" TEXT,
    "externalUrl" TEXT,
    "externalLabel" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "JlptRoadmapTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KanjiLesson" (
    "id" SERIAL NOT NULL,
    "lessonNumber" INTEGER NOT NULL,
    "title" TEXT,
    "jlptLevel" "JlptLevel",
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KanjiLesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KanjiEntry" (
    "id" SERIAL NOT NULL,
    "character" TEXT NOT NULL,
    "hanViet" TEXT,
    "onyomi" TEXT,
    "kunyomi" TEXT,
    "meaningVi" TEXT NOT NULL,
    "meaningEn" TEXT,
    "mnemonicJp" TEXT,
    "mnemonicVi" TEXT,
    "imageUrl" TEXT,
    "jlptLevel" "JlptLevel",
    "strokeCount" INTEGER,
    "frequency" INTEGER,
    "grade" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "lessonId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KanjiEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KanjiVocab" (
    "id" SERIAL NOT NULL,
    "word" TEXT NOT NULL,
    "reading" TEXT NOT NULL,
    "meaningVi" TEXT NOT NULL,
    "exampleJa" TEXT,
    "exampleKana" TEXT,
    "exampleVi" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "kanjiEntryId" INTEGER NOT NULL,
    "vocabularyId" INTEGER,

    CONSTRAINT "KanjiVocab_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VocabularyKanjiLink" (
    "id" SERIAL NOT NULL,
    "vocabularyId" INTEGER NOT NULL,
    "kanjiEntryId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VocabularyKanjiLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "googleId" TEXT,
    "keycloakId" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "name" TEXT,
    "avatarUrl" TEXT,
    "nativeLanguage" TEXT DEFAULT 'vi',
    "targetJlptLevel" "JlptLevel",
    "studyGoalMinutes" INTEGER DEFAULT 30,
    "lastActiveAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "emailVerifiedAt" TIMESTAMP(3),
    "emailBounced" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiveSession" (
    "id" SERIAL NOT NULL,
    "roomName" TEXT NOT NULL,
    "coachId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'LIVE',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "LiveSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SrsCard" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "contentType" "ContentType" NOT NULL,
    "contentId" INTEGER NOT NULL,
    "easeFactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "interval" INTEGER NOT NULL DEFAULT 0,
    "repetitions" INTEGER NOT NULL DEFAULT 0,
    "nextReviewAt" TIMESTAMP(3),
    "lastReviewedAt" TIMESTAMP(3),
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "wrongCount" INTEGER NOT NULL DEFAULT 0,
    "reviewStreak" INTEGER NOT NULL DEFAULT 0,
    "mastered" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SrsCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamResult" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "examId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "correctCount" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "percent" DOUBLE PRECISION NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExamResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamSectionResult" (
    "id" SERIAL NOT NULL,
    "examResultId" INTEGER NOT NULL,
    "section" TEXT NOT NULL,
    "correct" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "percent" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ExamSectionResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MockExamTemplate" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "sourceMode" TEXT NOT NULL DEFAULT 'GENERATED',
    "durationMinutes" INTEGER NOT NULL,
    "lessonFrom" INTEGER NOT NULL DEFAULT 1,
    "lessonTo" INTEGER NOT NULL DEFAULT 1,
    "kanjiLessonFrom" INTEGER NOT NULL DEFAULT 1,
    "kanjiLessonTo" INTEGER NOT NULL DEFAULT 1,
    "vocabCount" INTEGER NOT NULL DEFAULT 12,
    "grammarCount" INTEGER NOT NULL DEFAULT 10,
    "kanjiCount" INTEGER NOT NULL DEFAULT 5,
    "listeningWordCount" INTEGER NOT NULL DEFAULT 4,
    "listeningSentenceCount" INTEGER NOT NULL DEFAULT 4,
    "passThreshold" INTEGER NOT NULL DEFAULT 65,
    "scope" TEXT NOT NULL DEFAULT '',
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MockExamTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MockExamQuestion" (
    "id" SERIAL NOT NULL,
    "templateId" INTEGER NOT NULL,
    "sectionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "correctAnswer" TEXT NOT NULL,
    "imageUrl" TEXT,
    "audioText" TEXT,
    "audioUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MockExamQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MockExamQuestionOption" (
    "id" SERIAL NOT NULL,
    "questionId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "imageUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MockExamQuestionOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListeningLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "seconds" INTEGER NOT NULL DEFAULT 0,
    "lessonFrom" INTEGER,
    "lessonTo" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ListeningLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudySession" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "seconds" INTEGER NOT NULL DEFAULT 0,
    "cardsReviewed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudySession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyStreak" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastStudyDate" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyStreak_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyActivity" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReadingPassage" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "jlptLevel" "JlptLevel",
    "source" TEXT,
    "estimatedMin" INTEGER NOT NULL DEFAULT 3,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReadingPassage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReadingQuestion" (
    "id" SERIAL NOT NULL,
    "passageId" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "explanation" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ReadingQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReadingQuestionOption" (
    "id" SERIAL NOT NULL,
    "questionId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ReadingQuestionOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReadingAttempt" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "passageId" INTEGER NOT NULL,
    "correct" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "percent" DOUBLE PRECISION NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReadingAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DictationAttempt" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "vocabId" INTEGER NOT NULL,
    "userInput" TEXT NOT NULL,
    "correct" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DictationAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyNote" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyGoal" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyGoalItem" (
    "id" SERIAL NOT NULL,
    "goalId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DailyGoalItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionPlanConfig" (
    "id" SERIAL NOT NULL,
    "plan" "SubscriptionPlan" NOT NULL,
    "displayName" TEXT NOT NULL,
    "priceUsdCents" INTEGER NOT NULL,
    "intervalMonths" INTEGER NOT NULL DEFAULT 1,
    "trialDays" INTEGER NOT NULL DEFAULT 0,
    "features" JSONB NOT NULL,
    "stripePriceId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionPlanConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "plan" "SubscriptionPlan" NOT NULL DEFAULT 'FREE',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "stripePriceId" TEXT,
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "trialEnd" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoachProfile" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "bio" TEXT,
    "languages" TEXT[],
    "specializations" TEXT[],
    "hourlyRateUsd" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "featuredUntil" TIMESTAMP(3),
    "totalSessions" INTEGER NOT NULL DEFAULT 0,
    "avgRating" DOUBLE PRECISION,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "stripeAccountId" TEXT,
    "payoutEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoachProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoachAvailability" (
    "id" SERIAL NOT NULL,
    "coachId" INTEGER NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startHour" INTEGER NOT NULL,
    "startMinute" INTEGER NOT NULL DEFAULT 0,
    "endHour" INTEGER NOT NULL,
    "endMinute" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CoachAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoachingSession" (
    "id" SERIAL NOT NULL,
    "learnerId" INTEGER NOT NULL,
    "coachId" INTEGER NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "durationMin" INTEGER NOT NULL DEFAULT 60,
    "topic" TEXT,
    "notes" TEXT,
    "priceUsdCents" INTEGER NOT NULL,
    "platformFeePercent" INTEGER NOT NULL DEFAULT 20,
    "canceledAt" TIMESTAMP(3),
    "canceledBy" TEXT,
    "cancelReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoachingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "stripePaymentIntentId" TEXT,
    "stripeChargeId" TEXT,
    "stripeReceiptUrl" TEXT,
    "subscriptionId" INTEGER,
    "sessionId" INTEGER,
    "refundedAt" TIMESTAMP(3),
    "refundAmountCents" INTEGER,
    "refundReason" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payout" (
    "id" SERIAL NOT NULL,
    "coachId" INTEGER NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "stripeTransferId" TEXT,
    "stripePayoutId" TEXT,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "sessionCount" INTEGER NOT NULL DEFAULT 0,
    "grossAmountCents" INTEGER NOT NULL,
    "feeAmountCents" INTEGER NOT NULL,
    "processedAt" TIMESTAMP(3),
    "failReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookEvent" (
    "id" SERIAL NOT NULL,
    "provider" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "WebhookEventStatus" NOT NULL DEFAULT 'RECEIVED',
    "processedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoachReview" (
    "id" SERIAL NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "learnerId" INTEGER NOT NULL,
    "coachId" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoachReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" SERIAL NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "senderId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "fileUrl" TEXT,
    "fileType" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "metadata" JSONB,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportThread" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportMessage" (
    "id" SERIAL NOT NULL,
    "threadId" INTEGER NOT NULL,
    "senderId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "fileUrl" TEXT,
    "fileType" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupportMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearnerChatRoom" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "type" "LearnerChatRoomType" NOT NULL DEFAULT 'GROUP',
    "createdById" INTEGER NOT NULL,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearnerChatRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearnerChatMember" (
    "id" SERIAL NOT NULL,
    "roomId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "role" "LearnerChatMemberRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LearnerChatMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearnerChatMessage" (
    "id" SERIAL NOT NULL,
    "roomId" INTEGER NOT NULL,
    "senderId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "fileUrl" TEXT,
    "fileType" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LearnerChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailBroadcast" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'template',
    "templateName" TEXT,
    "subject" TEXT NOT NULL,
    "filter" JSONB NOT NULL DEFAULT '{}',
    "totalCount" INTEGER NOT NULL DEFAULT 0,
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailBroadcast_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailTemplate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "subject" TEXT NOT NULL,
    "htmlBody" TEXT NOT NULL,
    "textBody" TEXT NOT NULL,
    "variables" TEXT[],
    "attachments" JSONB NOT NULL DEFAULT '[]',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "updatedById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailVerificationToken" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailVerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailPrefs" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "receiveProgress" BOOLEAN NOT NULL DEFAULT true,
    "receiveStreak" BOOLEAN NOT NULL DEFAULT true,
    "lastMilestoneNotified" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailPrefs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PushDeviceToken" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'ios',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PushDeviceToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageBanner" (
    "id" SERIAL NOT NULL,
    "path" TEXT NOT NULL,
    "imageData" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageBanner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MindMapLevel" (
    "id" SERIAL NOT NULL,
    "kind" "MindMapKind" NOT NULL,
    "level" "JlptLevel" NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "accent" TEXT NOT NULL DEFAULT '#3b82f6',
    "branches" JSONB NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MindMapLevel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lesson_lessonNumber_key" ON "Lesson"("lessonNumber");

-- CreateIndex
CREATE INDEX "Lesson_jlptLevel_sortOrder_idx" ON "Lesson"("jlptLevel", "sortOrder");

-- CreateIndex
CREATE INDEX "Vocabulary_lessonId_sortOrder_idx" ON "Vocabulary"("lessonId", "sortOrder");

-- CreateIndex
CREATE INDEX "Vocabulary_jlptLevel_idx" ON "Vocabulary"("jlptLevel");

-- CreateIndex
CREATE INDEX "Grammar_lessonId_sortOrder_idx" ON "Grammar"("lessonId", "sortOrder");

-- CreateIndex
CREATE INDEX "Grammar_jlptLevel_idx" ON "Grammar"("jlptLevel");

-- CreateIndex
CREATE INDEX "Exercise_lessonId_sortOrder_idx" ON "Exercise"("lessonId", "sortOrder");

-- CreateIndex
CREATE INDEX "ExerciseOption_exerciseId_sortOrder_idx" ON "ExerciseOption"("exerciseId", "sortOrder");

-- CreateIndex
CREATE INDEX "KanaSection_script_sortOrder_idx" ON "KanaSection"("script", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "KanaSection_script_slug_key" ON "KanaSection"("script", "slug");

-- CreateIndex
CREATE INDEX "KanaCell_sectionId_idx" ON "KanaCell"("sectionId");

-- CreateIndex
CREATE UNIQUE INDEX "KanaCell_sectionId_rowIndex_colIndex_key" ON "KanaCell"("sectionId", "rowIndex", "colIndex");

-- CreateIndex
CREATE UNIQUE INDEX "KanaRomaji_kana_key" ON "KanaRomaji"("kana");

-- CreateIndex
CREATE UNIQUE INDEX "CounterCategory_slug_key" ON "CounterCategory"("slug");

-- CreateIndex
CREATE INDEX "CounterItem_categoryId_sortOrder_idx" ON "CounterItem"("categoryId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "CountryRegion_slug_key" ON "CountryRegion"("slug");

-- CreateIndex
CREATE INDEX "CountryRegion_sortOrder_idx" ON "CountryRegion"("sortOrder");

-- CreateIndex
CREATE INDEX "CountryNameItem_regionId_sortOrder_idx" ON "CountryNameItem"("regionId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "VocabSuffixGroup_slug_key" ON "VocabSuffixGroup"("slug");

-- CreateIndex
CREATE INDEX "VocabSuffixGroup_sortOrder_idx" ON "VocabSuffixGroup"("sortOrder");

-- CreateIndex
CREATE INDEX "VocabSuffixItem_groupId_sortOrder_idx" ON "VocabSuffixItem"("groupId", "sortOrder");

-- CreateIndex
CREATE INDEX "HomeStat_sortOrder_idx" ON "HomeStat"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "HomeFeatureSection_slug_key" ON "HomeFeatureSection"("slug");

-- CreateIndex
CREATE INDEX "HomeFeatureSection_sortOrder_idx" ON "HomeFeatureSection"("sortOrder");

-- CreateIndex
CREATE INDEX "HomeFeatureItem_sectionId_sortOrder_idx" ON "HomeFeatureItem"("sectionId", "sortOrder");

-- CreateIndex
CREATE INDEX "ConversationIntroLine_sortOrder_idx" ON "ConversationIntroLine"("sortOrder");

-- CreateIndex
CREATE INDEX "ConversationIntroSlot_sortOrder_idx" ON "ConversationIntroSlot"("sortOrder");

-- CreateIndex
CREATE INDEX "ConversationIntroExample_slotId_sortOrder_idx" ON "ConversationIntroExample"("slotId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationPhraseGroup_slug_key" ON "ConversationPhraseGroup"("slug");

-- CreateIndex
CREATE INDEX "ConversationPhraseGroup_sortOrder_idx" ON "ConversationPhraseGroup"("sortOrder");

-- CreateIndex
CREATE INDEX "ConversationPhraseItem_groupId_sortOrder_idx" ON "ConversationPhraseItem"("groupId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "RoleplayScene_slug_key" ON "RoleplayScene"("slug");

-- CreateIndex
CREATE INDEX "RoleplayScene_sortOrder_idx" ON "RoleplayScene"("sortOrder");

-- CreateIndex
CREATE INDEX "RoleplayLine_sceneId_sortOrder_idx" ON "RoleplayLine"("sceneId", "sortOrder");

-- CreateIndex
CREATE INDEX "PronunciationRuleTip_sortOrder_idx" ON "PronunciationRuleTip"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "PronunciationRuleSection_slug_key" ON "PronunciationRuleSection"("slug");

-- CreateIndex
CREATE INDEX "PronunciationRuleSection_sortOrder_idx" ON "PronunciationRuleSection"("sortOrder");

-- CreateIndex
CREATE INDEX "PronunciationRulePoint_sectionId_sortOrder_idx" ON "PronunciationRulePoint"("sectionId", "sortOrder");

-- CreateIndex
CREATE INDEX "PronunciationRuleExample_sectionId_sortOrder_idx" ON "PronunciationRuleExample"("sectionId", "sortOrder");

-- CreateIndex
CREATE INDEX "EnglishKatakanaTip_sortOrder_idx" ON "EnglishKatakanaTip"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "EnglishKatakanaSection_slug_key" ON "EnglishKatakanaSection"("slug");

-- CreateIndex
CREATE INDEX "EnglishKatakanaSection_sortOrder_idx" ON "EnglishKatakanaSection"("sortOrder");

-- CreateIndex
CREATE INDEX "EnglishKatakanaPoint_sectionId_sortOrder_idx" ON "EnglishKatakanaPoint"("sectionId", "sortOrder");

-- CreateIndex
CREATE INDEX "EnglishKatakanaMapping_sectionId_sortOrder_idx" ON "EnglishKatakanaMapping"("sectionId", "sortOrder");

-- CreateIndex
CREATE INDEX "EnglishKatakanaExample_sectionId_sortOrder_idx" ON "EnglishKatakanaExample"("sectionId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "PodcastResource_externalKey_key" ON "PodcastResource"("externalKey");

-- CreateIndex
CREATE UNIQUE INDEX "ListeningPreset_externalKey_key" ON "ListeningPreset"("externalKey");

-- CreateIndex
CREATE UNIQUE INDEX "BookAudioItem_externalKey_key" ON "BookAudioItem"("externalKey");

-- CreateIndex
CREATE INDEX "BookAudioItem_level_sortOrder_idx" ON "BookAudioItem"("level", "sortOrder");

-- CreateIndex
CREATE INDEX "BookAudioItem_folderId_idx" ON "BookAudioItem"("folderId");

-- CreateIndex
CREATE INDEX "BookAudioItem_driveId_idx" ON "BookAudioItem"("driveId");

-- CreateIndex
CREATE UNIQUE INDEX "BookAudioDriveFolder_driveId_key" ON "BookAudioDriveFolder"("driveId");

-- CreateIndex
CREATE INDEX "BookAudioFile_folderId_sortOrder_idx" ON "BookAudioFile"("folderId", "sortOrder");

-- CreateIndex
CREATE INDEX "BookAudioFile_itemId_sortOrder_idx" ON "BookAudioFile"("itemId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "JlptExamSession_externalKey_key" ON "JlptExamSession"("externalKey");

-- CreateIndex
CREATE UNIQUE INDEX "JlptRoadmapLevel_externalKey_key" ON "JlptRoadmapLevel"("externalKey");

-- CreateIndex
CREATE INDEX "JlptRoadmapExamSection_levelId_sortOrder_idx" ON "JlptRoadmapExamSection"("levelId", "sortOrder");

-- CreateIndex
CREATE INDEX "JlptRoadmapMaterial_levelId_sortOrder_idx" ON "JlptRoadmapMaterial"("levelId", "sortOrder");

-- CreateIndex
CREATE INDEX "JlptRoadmapPhase_levelId_sortOrder_idx" ON "JlptRoadmapPhase"("levelId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "JlptRoadmapPhase_levelId_externalKey_key" ON "JlptRoadmapPhase"("levelId", "externalKey");

-- CreateIndex
CREATE INDEX "JlptRoadmapTask_phaseId_sortOrder_idx" ON "JlptRoadmapTask"("phaseId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "JlptRoadmapTask_phaseId_externalKey_key" ON "JlptRoadmapTask"("phaseId", "externalKey");

-- CreateIndex
CREATE UNIQUE INDEX "KanjiLesson_lessonNumber_key" ON "KanjiLesson"("lessonNumber");

-- CreateIndex
CREATE INDEX "KanjiLesson_jlptLevel_sortOrder_idx" ON "KanjiLesson"("jlptLevel", "sortOrder");

-- CreateIndex
CREATE INDEX "KanjiEntry_lessonId_sortOrder_idx" ON "KanjiEntry"("lessonId", "sortOrder");

-- CreateIndex
CREATE INDEX "KanjiEntry_character_idx" ON "KanjiEntry"("character");

-- CreateIndex
CREATE INDEX "KanjiEntry_jlptLevel_idx" ON "KanjiEntry"("jlptLevel");

-- CreateIndex
CREATE INDEX "KanjiVocab_kanjiEntryId_sortOrder_idx" ON "KanjiVocab"("kanjiEntryId", "sortOrder");

-- CreateIndex
CREATE INDEX "KanjiVocab_vocabularyId_idx" ON "KanjiVocab"("vocabularyId");

-- CreateIndex
CREATE INDEX "VocabularyKanjiLink_kanjiEntryId_idx" ON "VocabularyKanjiLink"("kanjiEntryId");

-- CreateIndex
CREATE UNIQUE INDEX "VocabularyKanjiLink_vocabularyId_kanjiEntryId_key" ON "VocabularyKanjiLink"("vocabularyId", "kanjiEntryId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "User_keycloakId_key" ON "User"("keycloakId");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "LiveSession_roomName_key" ON "LiveSession"("roomName");

-- CreateIndex
CREATE INDEX "LiveSession_status_idx" ON "LiveSession"("status");

-- CreateIndex
CREATE INDEX "LiveSession_coachId_idx" ON "LiveSession"("coachId");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");

-- CreateIndex
CREATE INDEX "PasswordResetToken_expiresAt_idx" ON "PasswordResetToken"("expiresAt");

-- CreateIndex
CREATE INDEX "SrsCard_userId_nextReviewAt_idx" ON "SrsCard"("userId", "nextReviewAt");

-- CreateIndex
CREATE INDEX "SrsCard_userId_contentType_mastered_idx" ON "SrsCard"("userId", "contentType", "mastered");

-- CreateIndex
CREATE UNIQUE INDEX "SrsCard_userId_contentType_contentId_key" ON "SrsCard"("userId", "contentType", "contentId");

-- CreateIndex
CREATE INDEX "ExamResult_userId_submittedAt_idx" ON "ExamResult"("userId", "submittedAt");

-- CreateIndex
CREATE INDEX "ExamResult_level_idx" ON "ExamResult"("level");

-- CreateIndex
CREATE INDEX "ExamSectionResult_examResultId_idx" ON "ExamSectionResult"("examResultId");

-- CreateIndex
CREATE UNIQUE INDEX "MockExamTemplate_slug_key" ON "MockExamTemplate"("slug");

-- CreateIndex
CREATE INDEX "MockExamTemplate_level_sortOrder_idx" ON "MockExamTemplate"("level", "sortOrder");

-- CreateIndex
CREATE INDEX "MockExamTemplate_isPublished_sortOrder_idx" ON "MockExamTemplate"("isPublished", "sortOrder");

-- CreateIndex
CREATE INDEX "MockExamQuestion_templateId_sortOrder_idx" ON "MockExamQuestion"("templateId", "sortOrder");

-- CreateIndex
CREATE INDEX "MockExamQuestionOption_questionId_sortOrder_idx" ON "MockExamQuestionOption"("questionId", "sortOrder");

-- CreateIndex
CREATE INDEX "ListeningLog_userId_date_idx" ON "ListeningLog"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "ListeningLog_userId_date_key" ON "ListeningLog"("userId", "date");

-- CreateIndex
CREATE INDEX "StudySession_userId_date_idx" ON "StudySession"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "StudySession_userId_date_key" ON "StudySession"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "StudyStreak_userId_key" ON "StudyStreak"("userId");

-- CreateIndex
CREATE INDEX "DailyActivity_userId_date_idx" ON "DailyActivity"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyActivity_userId_date_kind_key" ON "DailyActivity"("userId", "date", "kind");

-- CreateIndex
CREATE INDEX "ReadingPassage_jlptLevel_sortOrder_idx" ON "ReadingPassage"("jlptLevel", "sortOrder");

-- CreateIndex
CREATE INDEX "ReadingQuestion_passageId_sortOrder_idx" ON "ReadingQuestion"("passageId", "sortOrder");

-- CreateIndex
CREATE INDEX "ReadingQuestionOption_questionId_sortOrder_idx" ON "ReadingQuestionOption"("questionId", "sortOrder");

-- CreateIndex
CREATE INDEX "ReadingAttempt_userId_submittedAt_idx" ON "ReadingAttempt"("userId", "submittedAt");

-- CreateIndex
CREATE INDEX "ReadingAttempt_passageId_idx" ON "ReadingAttempt"("passageId");

-- CreateIndex
CREATE INDEX "DictationAttempt_userId_createdAt_idx" ON "DictationAttempt"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "DictationAttempt_vocabId_idx" ON "DictationAttempt"("vocabId");

-- CreateIndex
CREATE INDEX "DailyNote_userId_date_idx" ON "DailyNote"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyNote_userId_date_key" ON "DailyNote"("userId", "date");

-- CreateIndex
CREATE INDEX "DailyGoal_userId_date_idx" ON "DailyGoal"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyGoal_userId_date_key" ON "DailyGoal"("userId", "date");

-- CreateIndex
CREATE INDEX "DailyGoalItem_goalId_sortOrder_idx" ON "DailyGoalItem"("goalId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlanConfig_plan_key" ON "SubscriptionPlanConfig"("plan");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "Subscription_stripeCustomerId_idx" ON "Subscription"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE UNIQUE INDEX "CoachProfile_userId_key" ON "CoachProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CoachProfile_stripeAccountId_key" ON "CoachProfile"("stripeAccountId");

-- CreateIndex
CREATE INDEX "CoachProfile_isActive_avgRating_idx" ON "CoachProfile"("isActive", "avgRating");

-- CreateIndex
CREATE INDEX "CoachProfile_isActive_hourlyRateUsd_idx" ON "CoachProfile"("isActive", "hourlyRateUsd");

-- CreateIndex
CREATE INDEX "CoachAvailability_coachId_dayOfWeek_idx" ON "CoachAvailability"("coachId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "CoachingSession_learnerId_scheduledAt_idx" ON "CoachingSession"("learnerId", "scheduledAt");

-- CreateIndex
CREATE INDEX "CoachingSession_coachId_scheduledAt_idx" ON "CoachingSession"("coachId", "scheduledAt");

-- CreateIndex
CREATE INDEX "CoachingSession_status_scheduledAt_idx" ON "CoachingSession"("status", "scheduledAt");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_stripePaymentIntentId_key" ON "Payment"("stripePaymentIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_sessionId_key" ON "Payment"("sessionId");

-- CreateIndex
CREATE INDEX "Payment_userId_createdAt_idx" ON "Payment"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Payout_stripeTransferId_key" ON "Payout"("stripeTransferId");

-- CreateIndex
CREATE INDEX "Payout_coachId_status_idx" ON "Payout"("coachId", "status");

-- CreateIndex
CREATE INDEX "Payout_periodStart_periodEnd_idx" ON "Payout"("periodStart", "periodEnd");

-- CreateIndex
CREATE UNIQUE INDEX "WebhookEvent_eventId_key" ON "WebhookEvent"("eventId");

-- CreateIndex
CREATE INDEX "WebhookEvent_eventType_status_idx" ON "WebhookEvent"("eventType", "status");

-- CreateIndex
CREATE INDEX "WebhookEvent_provider_status_createdAt_idx" ON "WebhookEvent"("provider", "status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CoachReview_sessionId_key" ON "CoachReview"("sessionId");

-- CreateIndex
CREATE INDEX "CoachReview_coachId_rating_idx" ON "CoachReview"("coachId", "rating");

-- CreateIndex
CREATE INDEX "ChatMessage_sessionId_createdAt_idx" ON "ChatMessage"("sessionId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_createdAt_idx" ON "Notification"("userId", "readAt", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SupportThread_userId_key" ON "SupportThread"("userId");

-- CreateIndex
CREATE INDEX "SupportThread_lastMessageAt_idx" ON "SupportThread"("lastMessageAt");

-- CreateIndex
CREATE INDEX "SupportMessage_threadId_createdAt_idx" ON "SupportMessage"("threadId", "createdAt");

-- CreateIndex
CREATE INDEX "LearnerChatRoom_lastMessageAt_idx" ON "LearnerChatRoom"("lastMessageAt");

-- CreateIndex
CREATE INDEX "LearnerChatRoom_type_idx" ON "LearnerChatRoom"("type");

-- CreateIndex
CREATE INDEX "LearnerChatMember_userId_idx" ON "LearnerChatMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LearnerChatMember_roomId_userId_key" ON "LearnerChatMember"("roomId", "userId");

-- CreateIndex
CREATE INDEX "LearnerChatMessage_roomId_createdAt_idx" ON "LearnerChatMessage"("roomId", "createdAt");

-- CreateIndex
CREATE INDEX "EmailBroadcast_status_idx" ON "EmailBroadcast"("status");

-- CreateIndex
CREATE INDEX "EmailBroadcast_createdById_idx" ON "EmailBroadcast"("createdById");

-- CreateIndex
CREATE UNIQUE INDEX "EmailTemplate_name_key" ON "EmailTemplate"("name");

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerificationToken_tokenHash_key" ON "EmailVerificationToken"("tokenHash");

-- CreateIndex
CREATE INDEX "EmailVerificationToken_userId_idx" ON "EmailVerificationToken"("userId");

-- CreateIndex
CREATE INDEX "EmailVerificationToken_expiresAt_idx" ON "EmailVerificationToken"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "EmailPrefs_userId_key" ON "EmailPrefs"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PushDeviceToken_token_key" ON "PushDeviceToken"("token");

-- CreateIndex
CREATE INDEX "PushDeviceToken_userId_idx" ON "PushDeviceToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PageBanner_path_key" ON "PageBanner"("path");

-- CreateIndex
CREATE INDEX "MindMapLevel_kind_sortOrder_idx" ON "MindMapLevel"("kind", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "MindMapLevel_kind_level_key" ON "MindMapLevel"("kind", "level");

-- AddForeignKey
ALTER TABLE "Vocabulary" ADD CONSTRAINT "Vocabulary_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grammar" ADD CONSTRAINT "Grammar_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Example" ADD CONSTRAINT "Example_grammarId_fkey" FOREIGN KEY ("grammarId") REFERENCES "Grammar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseOption" ADD CONSTRAINT "ExerciseOption_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KanaCell" ADD CONSTRAINT "KanaCell_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "KanaSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CounterItem" ADD CONSTRAINT "CounterItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CounterCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CountryNameItem" ADD CONSTRAINT "CountryNameItem_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "CountryRegion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VocabSuffixItem" ADD CONSTRAINT "VocabSuffixItem_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "VocabSuffixGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeFeatureItem" ADD CONSTRAINT "HomeFeatureItem_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "HomeFeatureSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationIntroExample" ADD CONSTRAINT "ConversationIntroExample_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "ConversationIntroSlot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationPhraseItem" ADD CONSTRAINT "ConversationPhraseItem_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ConversationPhraseGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleplayLine" ADD CONSTRAINT "RoleplayLine_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "RoleplayScene"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PronunciationRulePoint" ADD CONSTRAINT "PronunciationRulePoint_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "PronunciationRuleSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PronunciationRuleExample" ADD CONSTRAINT "PronunciationRuleExample_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "PronunciationRuleSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnglishKatakanaPoint" ADD CONSTRAINT "EnglishKatakanaPoint_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "EnglishKatakanaSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnglishKatakanaMapping" ADD CONSTRAINT "EnglishKatakanaMapping_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "EnglishKatakanaSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnglishKatakanaExample" ADD CONSTRAINT "EnglishKatakanaExample_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "EnglishKatakanaSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookAudioItem" ADD CONSTRAINT "BookAudioItem_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "BookAudioDriveFolder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookAudioFile" ADD CONSTRAINT "BookAudioFile_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "BookAudioDriveFolder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookAudioFile" ADD CONSTRAINT "BookAudioFile_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "BookAudioItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JlptRoadmapExamSection" ADD CONSTRAINT "JlptRoadmapExamSection_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "JlptRoadmapLevel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JlptRoadmapMaterial" ADD CONSTRAINT "JlptRoadmapMaterial_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "JlptRoadmapLevel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JlptRoadmapPhase" ADD CONSTRAINT "JlptRoadmapPhase_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "JlptRoadmapLevel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JlptRoadmapTask" ADD CONSTRAINT "JlptRoadmapTask_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "JlptRoadmapPhase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KanjiEntry" ADD CONSTRAINT "KanjiEntry_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "KanjiLesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KanjiVocab" ADD CONSTRAINT "KanjiVocab_kanjiEntryId_fkey" FOREIGN KEY ("kanjiEntryId") REFERENCES "KanjiEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KanjiVocab" ADD CONSTRAINT "KanjiVocab_vocabularyId_fkey" FOREIGN KEY ("vocabularyId") REFERENCES "Vocabulary"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VocabularyKanjiLink" ADD CONSTRAINT "VocabularyKanjiLink_vocabularyId_fkey" FOREIGN KEY ("vocabularyId") REFERENCES "Vocabulary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VocabularyKanjiLink" ADD CONSTRAINT "VocabularyKanjiLink_kanjiEntryId_fkey" FOREIGN KEY ("kanjiEntryId") REFERENCES "KanjiEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveSession" ADD CONSTRAINT "LiveSession_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SrsCard" ADD CONSTRAINT "SrsCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamResult" ADD CONSTRAINT "ExamResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamSectionResult" ADD CONSTRAINT "ExamSectionResult_examResultId_fkey" FOREIGN KEY ("examResultId") REFERENCES "ExamResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MockExamQuestion" ADD CONSTRAINT "MockExamQuestion_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "MockExamTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MockExamQuestionOption" ADD CONSTRAINT "MockExamQuestionOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "MockExamQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListeningLog" ADD CONSTRAINT "ListeningLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudySession" ADD CONSTRAINT "StudySession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyStreak" ADD CONSTRAINT "StudyStreak_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyActivity" ADD CONSTRAINT "DailyActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadingQuestion" ADD CONSTRAINT "ReadingQuestion_passageId_fkey" FOREIGN KEY ("passageId") REFERENCES "ReadingPassage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadingQuestionOption" ADD CONSTRAINT "ReadingQuestionOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ReadingQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadingAttempt" ADD CONSTRAINT "ReadingAttempt_passageId_fkey" FOREIGN KEY ("passageId") REFERENCES "ReadingPassage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DictationAttempt" ADD CONSTRAINT "DictationAttempt_vocabId_fkey" FOREIGN KEY ("vocabId") REFERENCES "Vocabulary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyNote" ADD CONSTRAINT "DailyNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyGoal" ADD CONSTRAINT "DailyGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyGoalItem" ADD CONSTRAINT "DailyGoalItem_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "DailyGoal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachProfile" ADD CONSTRAINT "CoachProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachAvailability" ADD CONSTRAINT "CoachAvailability_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "CoachProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachingSession" ADD CONSTRAINT "CoachingSession_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachingSession" ADD CONSTRAINT "CoachingSession_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "CoachProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "CoachingSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "CoachProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachReview" ADD CONSTRAINT "CoachReview_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "CoachingSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachReview" ADD CONSTRAINT "CoachReview_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachReview" ADD CONSTRAINT "CoachReview_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "CoachProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "CoachingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportThread" ADD CONSTRAINT "SupportThread_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportMessage" ADD CONSTRAINT "SupportMessage_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "SupportThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportMessage" ADD CONSTRAINT "SupportMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearnerChatRoom" ADD CONSTRAINT "LearnerChatRoom_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearnerChatMember" ADD CONSTRAINT "LearnerChatMember_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "LearnerChatRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearnerChatMember" ADD CONSTRAINT "LearnerChatMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearnerChatMessage" ADD CONSTRAINT "LearnerChatMessage_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "LearnerChatRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearnerChatMessage" ADD CONSTRAINT "LearnerChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailVerificationToken" ADD CONSTRAINT "EmailVerificationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailPrefs" ADD CONSTRAINT "EmailPrefs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PushDeviceToken" ADD CONSTRAINT "PushDeviceToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

