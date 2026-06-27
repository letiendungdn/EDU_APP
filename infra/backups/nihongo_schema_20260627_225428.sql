--
-- PostgreSQL database dump
--

\restrict 15QjO6bQnqzcFOiWvQKKOUiCZky6qn5SH4d55kaJqsuj15byqvRSOzY15it0PJM

-- Dumped from database version 16.14
-- Dumped by pg_dump version 16.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: ContentType; Type: TYPE; Schema: public; Owner: nihongo
--

CREATE TYPE public."ContentType" AS ENUM (
    'VOCABULARY',
    'GRAMMAR',
    'KANJI'
);


ALTER TYPE public."ContentType" OWNER TO nihongo;

--
-- Name: ExerciseType; Type: TYPE; Schema: public; Owner: nihongo
--

CREATE TYPE public."ExerciseType" AS ENUM (
    'MULTIPLE_CHOICE',
    'FILL_IN_BLANK',
    'LISTENING'
);


ALTER TYPE public."ExerciseType" OWNER TO nihongo;

--
-- Name: JlptLevel; Type: TYPE; Schema: public; Owner: nihongo
--

CREATE TYPE public."JlptLevel" AS ENUM (
    'N5',
    'N4',
    'N3',
    'N2',
    'N1'
);


ALTER TYPE public."JlptLevel" OWNER TO nihongo;

--
-- Name: JlptSessionStatus; Type: TYPE; Schema: public; Owner: nihongo
--

CREATE TYPE public."JlptSessionStatus" AS ENUM (
    'REGISTRATION_OPEN',
    'REGISTRATION_CLOSED',
    'UPCOMING',
    'PAST'
);


ALTER TYPE public."JlptSessionStatus" OWNER TO nihongo;

--
-- Name: KanaScript; Type: TYPE; Schema: public; Owner: nihongo
--

CREATE TYPE public."KanaScript" AS ENUM (
    'HIRAGANA',
    'KATAKANA'
);


ALTER TYPE public."KanaScript" OWNER TO nihongo;

--
-- Name: LearnerChatMemberRole; Type: TYPE; Schema: public; Owner: nihongo
--

CREATE TYPE public."LearnerChatMemberRole" AS ENUM (
    'MEMBER',
    'ADMIN'
);


ALTER TYPE public."LearnerChatMemberRole" OWNER TO nihongo;

--
-- Name: LearnerChatRoomType; Type: TYPE; Schema: public; Owner: nihongo
--

CREATE TYPE public."LearnerChatRoomType" AS ENUM (
    'DIRECT',
    'GROUP'
);


ALTER TYPE public."LearnerChatRoomType" OWNER TO nihongo;

--
-- Name: NotificationType; Type: TYPE; Schema: public; Owner: nihongo
--

CREATE TYPE public."NotificationType" AS ENUM (
    'PAYMENT_SUCCESS',
    'PAYMENT_FAILED',
    'SESSION_CONFIRMED',
    'SESSION_CANCELED',
    'SESSION_REMINDER',
    'COACH_MESSAGE',
    'SYSTEM',
    'SUPPORT_MESSAGE',
    'GROUP_MESSAGE'
);


ALTER TYPE public."NotificationType" OWNER TO nihongo;

--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: nihongo
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'SUCCEEDED',
    'FAILED',
    'REFUNDED',
    'PARTIALLY_REFUNDED'
);


ALTER TYPE public."PaymentStatus" OWNER TO nihongo;

--
-- Name: PayoutStatus; Type: TYPE; Schema: public; Owner: nihongo
--

CREATE TYPE public."PayoutStatus" AS ENUM (
    'PENDING',
    'PROCESSING',
    'PAID',
    'FAILED'
);


ALTER TYPE public."PayoutStatus" OWNER TO nihongo;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: nihongo
--

CREATE TYPE public."Role" AS ENUM (
    'USER',
    'ADMIN',
    'TEACHER'
);


ALTER TYPE public."Role" OWNER TO nihongo;

--
-- Name: SessionStatus; Type: TYPE; Schema: public; Owner: nihongo
--

CREATE TYPE public."SessionStatus" AS ENUM (
    'PENDING',
    'CONFIRMED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELED',
    'NO_SHOW'
);


ALTER TYPE public."SessionStatus" OWNER TO nihongo;

--
-- Name: SubscriptionPlan; Type: TYPE; Schema: public; Owner: nihongo
--

CREATE TYPE public."SubscriptionPlan" AS ENUM (
    'FREE',
    'BASIC',
    'PRO',
    'PRO_ANNUAL'
);


ALTER TYPE public."SubscriptionPlan" OWNER TO nihongo;

--
-- Name: SubscriptionStatus; Type: TYPE; Schema: public; Owner: nihongo
--

CREATE TYPE public."SubscriptionStatus" AS ENUM (
    'ACTIVE',
    'PAST_DUE',
    'CANCELED',
    'TRIALING',
    'PAUSED'
);


ALTER TYPE public."SubscriptionStatus" OWNER TO nihongo;

--
-- Name: WebhookEventStatus; Type: TYPE; Schema: public; Owner: nihongo
--

CREATE TYPE public."WebhookEventStatus" AS ENUM (
    'RECEIVED',
    'PROCESSED',
    'FAILED',
    'IGNORED'
);


ALTER TYPE public."WebhookEventStatus" OWNER TO nihongo;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ChatMessage; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."ChatMessage" (
    id integer NOT NULL,
    "sessionId" integer NOT NULL,
    "senderId" integer NOT NULL,
    content text NOT NULL,
    "readAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ChatMessage" OWNER TO nihongo;

--
-- Name: ChatMessage_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."ChatMessage_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ChatMessage_id_seq" OWNER TO nihongo;

--
-- Name: ChatMessage_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."ChatMessage_id_seq" OWNED BY public."ChatMessage".id;


--
-- Name: CoachAvailability; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."CoachAvailability" (
    id integer NOT NULL,
    "coachId" integer NOT NULL,
    "dayOfWeek" integer NOT NULL,
    "startHour" integer NOT NULL,
    "startMinute" integer DEFAULT 0 NOT NULL,
    "endHour" integer NOT NULL,
    "endMinute" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."CoachAvailability" OWNER TO nihongo;

--
-- Name: CoachAvailability_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."CoachAvailability_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."CoachAvailability_id_seq" OWNER TO nihongo;

--
-- Name: CoachAvailability_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."CoachAvailability_id_seq" OWNED BY public."CoachAvailability".id;


--
-- Name: CoachProfile; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."CoachProfile" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    bio text,
    languages text[],
    specializations text[],
    "hourlyRateUsd" integer NOT NULL,
    currency text DEFAULT 'USD'::text NOT NULL,
    timezone text DEFAULT 'Asia/Ho_Chi_Minh'::text NOT NULL,
    "isActive" boolean DEFAULT false NOT NULL,
    "isVerified" boolean DEFAULT false NOT NULL,
    "featuredUntil" timestamp(3) without time zone,
    "totalSessions" integer DEFAULT 0 NOT NULL,
    "avgRating" double precision,
    "reviewCount" integer DEFAULT 0 NOT NULL,
    "stripeAccountId" text,
    "payoutEnabled" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CoachProfile" OWNER TO nihongo;

--
-- Name: CoachProfile_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."CoachProfile_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."CoachProfile_id_seq" OWNER TO nihongo;

--
-- Name: CoachProfile_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."CoachProfile_id_seq" OWNED BY public."CoachProfile".id;


--
-- Name: CoachReview; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."CoachReview" (
    id integer NOT NULL,
    "sessionId" integer NOT NULL,
    "learnerId" integer NOT NULL,
    "coachId" integer NOT NULL,
    rating integer NOT NULL,
    comment text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CoachReview" OWNER TO nihongo;

--
-- Name: CoachReview_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."CoachReview_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."CoachReview_id_seq" OWNER TO nihongo;

--
-- Name: CoachReview_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."CoachReview_id_seq" OWNED BY public."CoachReview".id;


--
-- Name: CoachingSession; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."CoachingSession" (
    id integer NOT NULL,
    "learnerId" integer NOT NULL,
    "coachId" integer NOT NULL,
    status public."SessionStatus" DEFAULT 'PENDING'::public."SessionStatus" NOT NULL,
    "scheduledAt" timestamp(3) without time zone NOT NULL,
    "durationMin" integer DEFAULT 60 NOT NULL,
    topic text,
    notes text,
    "priceUsdCents" integer NOT NULL,
    "platformFeePercent" integer DEFAULT 20 NOT NULL,
    "canceledAt" timestamp(3) without time zone,
    "canceledBy" text,
    "cancelReason" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CoachingSession" OWNER TO nihongo;

--
-- Name: CoachingSession_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."CoachingSession_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."CoachingSession_id_seq" OWNER TO nihongo;

--
-- Name: CoachingSession_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."CoachingSession_id_seq" OWNED BY public."CoachingSession".id;


--
-- Name: CounterCategory; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."CounterCategory" (
    id integer NOT NULL,
    slug text NOT NULL,
    label text NOT NULL,
    hint text NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CounterCategory" OWNER TO nihongo;

--
-- Name: CounterCategory_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."CounterCategory_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."CounterCategory_id_seq" OWNER TO nihongo;

--
-- Name: CounterCategory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."CounterCategory_id_seq" OWNED BY public."CounterCategory".id;


--
-- Name: CounterItem; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."CounterItem" (
    id integer NOT NULL,
    "categoryId" integer NOT NULL,
    "displayNumber" text NOT NULL,
    kanji text,
    kana text NOT NULL,
    romaji text NOT NULL,
    "meaningVi" text NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."CounterItem" OWNER TO nihongo;

--
-- Name: CounterItem_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."CounterItem_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."CounterItem_id_seq" OWNER TO nihongo;

--
-- Name: CounterItem_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."CounterItem_id_seq" OWNED BY public."CounterItem".id;


--
-- Name: DailyGoal; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."DailyGoal" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    date text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."DailyGoal" OWNER TO nihongo;

--
-- Name: DailyGoalItem; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."DailyGoalItem" (
    id integer NOT NULL,
    "goalId" integer NOT NULL,
    text text NOT NULL,
    done boolean DEFAULT false NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."DailyGoalItem" OWNER TO nihongo;

--
-- Name: DailyGoalItem_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."DailyGoalItem_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."DailyGoalItem_id_seq" OWNER TO nihongo;

--
-- Name: DailyGoalItem_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."DailyGoalItem_id_seq" OWNED BY public."DailyGoalItem".id;


--
-- Name: DailyGoal_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."DailyGoal_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."DailyGoal_id_seq" OWNER TO nihongo;

--
-- Name: DailyGoal_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."DailyGoal_id_seq" OWNED BY public."DailyGoal".id;


--
-- Name: DailyNote; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."DailyNote" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    date text NOT NULL,
    content text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."DailyNote" OWNER TO nihongo;

--
-- Name: DailyNote_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."DailyNote_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."DailyNote_id_seq" OWNER TO nihongo;

--
-- Name: DailyNote_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."DailyNote_id_seq" OWNED BY public."DailyNote".id;


--
-- Name: DictationAttempt; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."DictationAttempt" (
    id integer NOT NULL,
    "userId" integer,
    "vocabId" integer NOT NULL,
    "userInput" text NOT NULL,
    correct boolean NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."DictationAttempt" OWNER TO nihongo;

--
-- Name: DictationAttempt_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."DictationAttempt_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."DictationAttempt_id_seq" OWNER TO nihongo;

--
-- Name: DictationAttempt_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."DictationAttempt_id_seq" OWNED BY public."DictationAttempt".id;


--
-- Name: ExamResult; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."ExamResult" (
    id integer NOT NULL,
    "userId" integer,
    "examId" text NOT NULL,
    level text NOT NULL,
    title text NOT NULL,
    "correctCount" integer NOT NULL,
    total integer NOT NULL,
    percent double precision NOT NULL,
    passed boolean NOT NULL,
    "submittedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ExamResult" OWNER TO nihongo;

--
-- Name: ExamResult_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."ExamResult_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ExamResult_id_seq" OWNER TO nihongo;

--
-- Name: ExamResult_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."ExamResult_id_seq" OWNED BY public."ExamResult".id;


--
-- Name: ExamSectionResult; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."ExamSectionResult" (
    id integer NOT NULL,
    "examResultId" integer NOT NULL,
    section text NOT NULL,
    correct integer NOT NULL,
    total integer NOT NULL,
    percent double precision NOT NULL
);


ALTER TABLE public."ExamSectionResult" OWNER TO nihongo;

--
-- Name: ExamSectionResult_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."ExamSectionResult_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ExamSectionResult_id_seq" OWNER TO nihongo;

--
-- Name: ExamSectionResult_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."ExamSectionResult_id_seq" OWNED BY public."ExamSectionResult".id;


--
-- Name: Example; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."Example" (
    id integer NOT NULL,
    jp text NOT NULL,
    romaji text NOT NULL,
    en text,
    vi text,
    "grammarId" integer NOT NULL,
    "audioUrl" text,
    "sortOrder" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."Example" OWNER TO nihongo;

--
-- Name: Example_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."Example_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Example_id_seq" OWNER TO nihongo;

--
-- Name: Example_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."Example_id_seq" OWNED BY public."Example".id;


--
-- Name: Exercise; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."Exercise" (
    id integer NOT NULL,
    question text NOT NULL,
    answer text NOT NULL,
    "lessonId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    type public."ExerciseType" NOT NULL,
    explanation text,
    "audioUrl" text,
    difficulty integer DEFAULT 1 NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."Exercise" OWNER TO nihongo;

--
-- Name: ExerciseOption; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."ExerciseOption" (
    id integer NOT NULL,
    "exerciseId" integer NOT NULL,
    text text NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "isCorrect" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."ExerciseOption" OWNER TO nihongo;

--
-- Name: ExerciseOption_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."ExerciseOption_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ExerciseOption_id_seq" OWNER TO nihongo;

--
-- Name: ExerciseOption_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."ExerciseOption_id_seq" OWNED BY public."ExerciseOption".id;


--
-- Name: Exercise_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."Exercise_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Exercise_id_seq" OWNER TO nihongo;

--
-- Name: Exercise_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."Exercise_id_seq" OWNED BY public."Exercise".id;


--
-- Name: Grammar; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."Grammar" (
    id integer NOT NULL,
    pattern text NOT NULL,
    meaning text NOT NULL,
    explanation text,
    "lessonId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "jlptLevel" public."JlptLevel",
    "formalityLevel" text,
    "sortOrder" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."Grammar" OWNER TO nihongo;

--
-- Name: Grammar_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."Grammar_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Grammar_id_seq" OWNER TO nihongo;

--
-- Name: Grammar_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."Grammar_id_seq" OWNED BY public."Grammar".id;


--
-- Name: JlptExamBriefing; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."JlptExamBriefing" (
    id integer DEFAULT 1 NOT NULL,
    text text NOT NULL
);


ALTER TABLE public."JlptExamBriefing" OWNER TO nihongo;

--
-- Name: JlptExamDaySlot; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."JlptExamDaySlot" (
    id integer NOT NULL,
    levels text NOT NULL,
    "arriveAt" text NOT NULL,
    "startAt" text NOT NULL,
    venue text NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."JlptExamDaySlot" OWNER TO nihongo;

--
-- Name: JlptExamDaySlot_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."JlptExamDaySlot_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."JlptExamDaySlot_id_seq" OWNER TO nihongo;

--
-- Name: JlptExamDaySlot_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."JlptExamDaySlot_id_seq" OWNED BY public."JlptExamDaySlot".id;


--
-- Name: JlptExamFeeInfo; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."JlptExamFeeInfo" (
    id integer DEFAULT 1 NOT NULL,
    "formFee" text NOT NULL,
    "examFee" text NOT NULL,
    note text NOT NULL
);


ALTER TABLE public."JlptExamFeeInfo" OWNER TO nihongo;

--
-- Name: JlptExamSession; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."JlptExamSession" (
    id integer NOT NULL,
    "externalKey" text NOT NULL,
    label text NOT NULL,
    "examDate" text NOT NULL,
    "registrationPeriod" text NOT NULL,
    status public."JlptSessionStatus" NOT NULL,
    "statusLabel" text NOT NULL,
    "announcementUrl" text,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."JlptExamSession" OWNER TO nihongo;

--
-- Name: JlptExamSession_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."JlptExamSession_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."JlptExamSession_id_seq" OWNER TO nihongo;

--
-- Name: JlptExamSession_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."JlptExamSession_id_seq" OWNED BY public."JlptExamSession".id;


--
-- Name: JlptExamVenue; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."JlptExamVenue" (
    id integer NOT NULL,
    address text NOT NULL,
    district text NOT NULL,
    levels text NOT NULL,
    note text,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."JlptExamVenue" OWNER TO nihongo;

--
-- Name: JlptExamVenue_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."JlptExamVenue_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."JlptExamVenue_id_seq" OWNER TO nihongo;

--
-- Name: JlptExamVenue_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."JlptExamVenue_id_seq" OWNED BY public."JlptExamVenue".id;


--
-- Name: JlptOrganizer; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."JlptOrganizer" (
    id integer DEFAULT 1 NOT NULL,
    name text NOT NULL,
    "shortName" text NOT NULL,
    address text NOT NULL,
    phone text NOT NULL,
    email text NOT NULL,
    website text NOT NULL,
    "announcementsUrl" text NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."JlptOrganizer" OWNER TO nihongo;

--
-- Name: JlptRoadmapExamSection; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."JlptRoadmapExamSection" (
    id integer NOT NULL,
    "levelId" integer NOT NULL,
    name text NOT NULL,
    points integer NOT NULL,
    "time" text NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."JlptRoadmapExamSection" OWNER TO nihongo;

--
-- Name: JlptRoadmapExamSection_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."JlptRoadmapExamSection_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."JlptRoadmapExamSection_id_seq" OWNER TO nihongo;

--
-- Name: JlptRoadmapExamSection_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."JlptRoadmapExamSection_id_seq" OWNED BY public."JlptRoadmapExamSection".id;


--
-- Name: JlptRoadmapLevel; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."JlptRoadmapLevel" (
    id integer NOT NULL,
    "externalKey" text NOT NULL,
    label text NOT NULL,
    badge text NOT NULL,
    color text NOT NULL,
    duration text NOT NULL,
    "vocabTarget" text NOT NULL,
    "kanjiTarget" text NOT NULL,
    "passScore" text NOT NULL,
    summary text NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."JlptRoadmapLevel" OWNER TO nihongo;

--
-- Name: JlptRoadmapLevel_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."JlptRoadmapLevel_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."JlptRoadmapLevel_id_seq" OWNER TO nihongo;

--
-- Name: JlptRoadmapLevel_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."JlptRoadmapLevel_id_seq" OWNED BY public."JlptRoadmapLevel".id;


--
-- Name: JlptRoadmapMaterial; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."JlptRoadmapMaterial" (
    id integer NOT NULL,
    "levelId" integer NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    scope text NOT NULL,
    "inAppPath" text,
    "inAppLabel" text,
    "externalUrl" text,
    "externalLabel" text,
    "sortOrder" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."JlptRoadmapMaterial" OWNER TO nihongo;

--
-- Name: JlptRoadmapMaterial_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."JlptRoadmapMaterial_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."JlptRoadmapMaterial_id_seq" OWNER TO nihongo;

--
-- Name: JlptRoadmapMaterial_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."JlptRoadmapMaterial_id_seq" OWNED BY public."JlptRoadmapMaterial".id;


--
-- Name: JlptRoadmapMeta; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."JlptRoadmapMeta" (
    id integer DEFAULT 1 NOT NULL,
    "examScheduleNote" text NOT NULL
);


ALTER TABLE public."JlptRoadmapMeta" OWNER TO nihongo;

--
-- Name: JlptRoadmapPhase; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."JlptRoadmapPhase" (
    id integer NOT NULL,
    "levelId" integer NOT NULL,
    "externalKey" text NOT NULL,
    title text NOT NULL,
    subtitle text NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."JlptRoadmapPhase" OWNER TO nihongo;

--
-- Name: JlptRoadmapPhase_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."JlptRoadmapPhase_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."JlptRoadmapPhase_id_seq" OWNER TO nihongo;

--
-- Name: JlptRoadmapPhase_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."JlptRoadmapPhase_id_seq" OWNED BY public."JlptRoadmapPhase".id;


--
-- Name: JlptRoadmapTask; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."JlptRoadmapTask" (
    id integer NOT NULL,
    "phaseId" integer NOT NULL,
    "externalKey" text NOT NULL,
    text text NOT NULL,
    "inAppPath" text,
    "inAppLabel" text,
    "externalUrl" text,
    "externalLabel" text,
    "sortOrder" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."JlptRoadmapTask" OWNER TO nihongo;

--
-- Name: JlptRoadmapTask_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."JlptRoadmapTask_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."JlptRoadmapTask_id_seq" OWNER TO nihongo;

--
-- Name: JlptRoadmapTask_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."JlptRoadmapTask_id_seq" OWNED BY public."JlptRoadmapTask".id;


--
-- Name: KanaCell; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."KanaCell" (
    id integer NOT NULL,
    "sectionId" integer NOT NULL,
    "rowIndex" integer NOT NULL,
    "colIndex" integer NOT NULL,
    kana text DEFAULT ''::text NOT NULL,
    romaji text DEFAULT ''::text NOT NULL
);


ALTER TABLE public."KanaCell" OWNER TO nihongo;

--
-- Name: KanaCell_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."KanaCell_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."KanaCell_id_seq" OWNER TO nihongo;

--
-- Name: KanaCell_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."KanaCell_id_seq" OWNED BY public."KanaCell".id;


--
-- Name: KanaSection; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."KanaSection" (
    id integer NOT NULL,
    script public."KanaScript" NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    subtitle text,
    columns integer DEFAULT 5 NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."KanaSection" OWNER TO nihongo;

--
-- Name: KanaSection_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."KanaSection_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."KanaSection_id_seq" OWNER TO nihongo;

--
-- Name: KanaSection_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."KanaSection_id_seq" OWNED BY public."KanaSection".id;


--
-- Name: KanjiEntry; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."KanjiEntry" (
    id integer NOT NULL,
    "character" text NOT NULL,
    "hanViet" text,
    onyomi text,
    kunyomi text,
    "meaningVi" text NOT NULL,
    "mnemonicJp" text,
    "mnemonicVi" text,
    "imageUrl" text,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "lessonId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "meaningEn" text,
    "jlptLevel" public."JlptLevel",
    "strokeCount" integer,
    frequency integer,
    grade integer
);


ALTER TABLE public."KanjiEntry" OWNER TO nihongo;

--
-- Name: KanjiEntry_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."KanjiEntry_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."KanjiEntry_id_seq" OWNER TO nihongo;

--
-- Name: KanjiEntry_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."KanjiEntry_id_seq" OWNED BY public."KanjiEntry".id;


--
-- Name: KanjiLesson; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."KanjiLesson" (
    id integer NOT NULL,
    "lessonNumber" integer NOT NULL,
    title text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "jlptLevel" public."JlptLevel",
    "sortOrder" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."KanjiLesson" OWNER TO nihongo;

--
-- Name: KanjiLesson_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."KanjiLesson_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."KanjiLesson_id_seq" OWNER TO nihongo;

--
-- Name: KanjiLesson_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."KanjiLesson_id_seq" OWNED BY public."KanjiLesson".id;


--
-- Name: KanjiVocab; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."KanjiVocab" (
    id integer NOT NULL,
    word text NOT NULL,
    reading text NOT NULL,
    "meaningVi" text NOT NULL,
    "kanjiEntryId" integer NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."KanjiVocab" OWNER TO nihongo;

--
-- Name: KanjiVocab_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."KanjiVocab_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."KanjiVocab_id_seq" OWNER TO nihongo;

--
-- Name: KanjiVocab_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."KanjiVocab_id_seq" OWNED BY public."KanjiVocab".id;


--
-- Name: LearnerChatMember; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."LearnerChatMember" (
    id integer NOT NULL,
    "roomId" integer NOT NULL,
    "userId" integer NOT NULL,
    role public."LearnerChatMemberRole" DEFAULT 'MEMBER'::public."LearnerChatMemberRole" NOT NULL,
    "joinedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."LearnerChatMember" OWNER TO nihongo;

--
-- Name: LearnerChatMember_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."LearnerChatMember_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."LearnerChatMember_id_seq" OWNER TO nihongo;

--
-- Name: LearnerChatMember_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."LearnerChatMember_id_seq" OWNED BY public."LearnerChatMember".id;


--
-- Name: LearnerChatMessage; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."LearnerChatMessage" (
    id integer NOT NULL,
    "roomId" integer NOT NULL,
    "senderId" integer NOT NULL,
    content text NOT NULL,
    "readAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."LearnerChatMessage" OWNER TO nihongo;

--
-- Name: LearnerChatMessage_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."LearnerChatMessage_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."LearnerChatMessage_id_seq" OWNER TO nihongo;

--
-- Name: LearnerChatMessage_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."LearnerChatMessage_id_seq" OWNED BY public."LearnerChatMessage".id;


--
-- Name: LearnerChatRoom; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."LearnerChatRoom" (
    id integer NOT NULL,
    name text,
    type public."LearnerChatRoomType" DEFAULT 'GROUP'::public."LearnerChatRoomType" NOT NULL,
    "createdById" integer NOT NULL,
    "lastMessageAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."LearnerChatRoom" OWNER TO nihongo;

--
-- Name: LearnerChatRoom_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."LearnerChatRoom_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."LearnerChatRoom_id_seq" OWNER TO nihongo;

--
-- Name: LearnerChatRoom_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."LearnerChatRoom_id_seq" OWNED BY public."LearnerChatRoom".id;


--
-- Name: Lesson; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."Lesson" (
    id integer NOT NULL,
    "lessonNumber" integer NOT NULL,
    title text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    description text,
    "jlptLevel" public."JlptLevel",
    "thumbnailUrl" text,
    "sortOrder" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."Lesson" OWNER TO nihongo;

--
-- Name: Lesson_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."Lesson_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Lesson_id_seq" OWNER TO nihongo;

--
-- Name: Lesson_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."Lesson_id_seq" OWNED BY public."Lesson".id;


--
-- Name: ListeningConfig; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."ListeningConfig" (
    id integer DEFAULT 1 NOT NULL,
    "goalMinutes" integer DEFAULT 15 NOT NULL
);


ALTER TABLE public."ListeningConfig" OWNER TO nihongo;

--
-- Name: ListeningLog; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."ListeningLog" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    seconds integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    date date NOT NULL,
    "lessonFrom" integer,
    "lessonTo" integer
);


ALTER TABLE public."ListeningLog" OWNER TO nihongo;

--
-- Name: ListeningLog_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."ListeningLog_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ListeningLog_id_seq" OWNER TO nihongo;

--
-- Name: ListeningLog_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."ListeningLog_id_seq" OWNED BY public."ListeningLog".id;


--
-- Name: ListeningPreset; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."ListeningPreset" (
    id integer NOT NULL,
    "externalKey" text NOT NULL,
    label text NOT NULL,
    "lessonFrom" integer NOT NULL,
    "lessonTo" integer NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ListeningPreset" OWNER TO nihongo;

--
-- Name: ListeningPreset_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."ListeningPreset_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ListeningPreset_id_seq" OWNER TO nihongo;

--
-- Name: ListeningPreset_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."ListeningPreset_id_seq" OWNED BY public."ListeningPreset".id;


--
-- Name: Notification; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."Notification" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    type public."NotificationType" NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    metadata jsonb,
    "readAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Notification" OWNER TO nihongo;

--
-- Name: Notification_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."Notification_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Notification_id_seq" OWNER TO nihongo;

--
-- Name: Notification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."Notification_id_seq" OWNED BY public."Notification".id;


--
-- Name: Payment; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."Payment" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "amountCents" integer NOT NULL,
    currency text DEFAULT 'USD'::text NOT NULL,
    status public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    "stripePaymentIntentId" text,
    "stripeChargeId" text,
    "stripeReceiptUrl" text,
    "subscriptionId" integer,
    "sessionId" integer,
    "refundedAt" timestamp(3) without time zone,
    "refundAmountCents" integer,
    "refundReason" text,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Payment" OWNER TO nihongo;

--
-- Name: Payment_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."Payment_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Payment_id_seq" OWNER TO nihongo;

--
-- Name: Payment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."Payment_id_seq" OWNED BY public."Payment".id;


--
-- Name: Payout; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."Payout" (
    id integer NOT NULL,
    "coachId" integer NOT NULL,
    "amountCents" integer NOT NULL,
    currency text DEFAULT 'USD'::text NOT NULL,
    status public."PayoutStatus" DEFAULT 'PENDING'::public."PayoutStatus" NOT NULL,
    "stripeTransferId" text,
    "stripePayoutId" text,
    "periodStart" timestamp(3) without time zone NOT NULL,
    "periodEnd" timestamp(3) without time zone NOT NULL,
    "sessionCount" integer DEFAULT 0 NOT NULL,
    "grossAmountCents" integer NOT NULL,
    "feeAmountCents" integer NOT NULL,
    "processedAt" timestamp(3) without time zone,
    "failReason" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Payout" OWNER TO nihongo;

--
-- Name: Payout_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."Payout_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Payout_id_seq" OWNER TO nihongo;

--
-- Name: Payout_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."Payout_id_seq" OWNED BY public."Payout".id;


--
-- Name: PodcastResource; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."PodcastResource" (
    id integer NOT NULL,
    "externalKey" text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    url text NOT NULL,
    level text NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."PodcastResource" OWNER TO nihongo;

--
-- Name: PodcastResource_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."PodcastResource_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."PodcastResource_id_seq" OWNER TO nihongo;

--
-- Name: PodcastResource_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."PodcastResource_id_seq" OWNED BY public."PodcastResource".id;


--
-- Name: ReadingAttempt; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."ReadingAttempt" (
    id integer NOT NULL,
    "userId" integer,
    "passageId" integer NOT NULL,
    correct integer NOT NULL,
    total integer NOT NULL,
    percent double precision NOT NULL,
    "submittedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ReadingAttempt" OWNER TO nihongo;

--
-- Name: ReadingAttempt_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."ReadingAttempt_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ReadingAttempt_id_seq" OWNER TO nihongo;

--
-- Name: ReadingAttempt_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."ReadingAttempt_id_seq" OWNED BY public."ReadingAttempt".id;


--
-- Name: ReadingPassage; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."ReadingPassage" (
    id integer NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    "jlptLevel" public."JlptLevel",
    source text,
    "estimatedMin" integer DEFAULT 3 NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ReadingPassage" OWNER TO nihongo;

--
-- Name: ReadingPassage_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."ReadingPassage_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ReadingPassage_id_seq" OWNER TO nihongo;

--
-- Name: ReadingPassage_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."ReadingPassage_id_seq" OWNED BY public."ReadingPassage".id;


--
-- Name: ReadingQuestion; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."ReadingQuestion" (
    id integer NOT NULL,
    "passageId" integer NOT NULL,
    question text NOT NULL,
    answer text NOT NULL,
    explanation text,
    "sortOrder" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."ReadingQuestion" OWNER TO nihongo;

--
-- Name: ReadingQuestionOption; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."ReadingQuestionOption" (
    id integer NOT NULL,
    "questionId" integer NOT NULL,
    text text NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."ReadingQuestionOption" OWNER TO nihongo;

--
-- Name: ReadingQuestionOption_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."ReadingQuestionOption_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ReadingQuestionOption_id_seq" OWNER TO nihongo;

--
-- Name: ReadingQuestionOption_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."ReadingQuestionOption_id_seq" OWNED BY public."ReadingQuestionOption".id;


--
-- Name: ReadingQuestion_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."ReadingQuestion_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ReadingQuestion_id_seq" OWNER TO nihongo;

--
-- Name: ReadingQuestion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."ReadingQuestion_id_seq" OWNED BY public."ReadingQuestion".id;


--
-- Name: RefreshToken; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."RefreshToken" (
    id text NOT NULL,
    token text NOT NULL,
    "userId" integer NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    revoked boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."RefreshToken" OWNER TO nihongo;

--
-- Name: SrsCard; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."SrsCard" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "contentType" public."ContentType" NOT NULL,
    "contentId" integer NOT NULL,
    "easeFactor" double precision DEFAULT 2.5 NOT NULL,
    "interval" integer DEFAULT 0 NOT NULL,
    repetitions integer DEFAULT 0 NOT NULL,
    "nextReviewAt" timestamp(3) without time zone,
    "lastReviewedAt" timestamp(3) without time zone,
    "wrongCount" integer DEFAULT 0 NOT NULL,
    "correctCount" integer DEFAULT 0 NOT NULL,
    "reviewStreak" integer DEFAULT 0 NOT NULL,
    mastered boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."SrsCard" OWNER TO nihongo;

--
-- Name: SrsCard_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."SrsCard_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."SrsCard_id_seq" OWNER TO nihongo;

--
-- Name: SrsCard_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."SrsCard_id_seq" OWNED BY public."SrsCard".id;


--
-- Name: StudySession; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."StudySession" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    date date NOT NULL,
    seconds integer DEFAULT 0 NOT NULL,
    "cardsReviewed" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."StudySession" OWNER TO nihongo;

--
-- Name: StudySession_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."StudySession_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."StudySession_id_seq" OWNER TO nihongo;

--
-- Name: StudySession_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."StudySession_id_seq" OWNED BY public."StudySession".id;


--
-- Name: StudyStreak; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."StudyStreak" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "currentStreak" integer DEFAULT 0 NOT NULL,
    "longestStreak" integer DEFAULT 0 NOT NULL,
    "lastStudyDate" text,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."StudyStreak" OWNER TO nihongo;

--
-- Name: StudyStreak_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."StudyStreak_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."StudyStreak_id_seq" OWNER TO nihongo;

--
-- Name: StudyStreak_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."StudyStreak_id_seq" OWNED BY public."StudyStreak".id;


--
-- Name: StudyTip; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."StudyTip" (
    id integer NOT NULL,
    text text NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."StudyTip" OWNER TO nihongo;

--
-- Name: StudyTip_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."StudyTip_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."StudyTip_id_seq" OWNER TO nihongo;

--
-- Name: StudyTip_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."StudyTip_id_seq" OWNED BY public."StudyTip".id;


--
-- Name: Subscription; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."Subscription" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    plan public."SubscriptionPlan" DEFAULT 'FREE'::public."SubscriptionPlan" NOT NULL,
    status public."SubscriptionStatus" DEFAULT 'ACTIVE'::public."SubscriptionStatus" NOT NULL,
    "stripeCustomerId" text,
    "stripeSubscriptionId" text,
    "stripePriceId" text,
    "currentPeriodStart" timestamp(3) without time zone,
    "currentPeriodEnd" timestamp(3) without time zone,
    "trialEnd" timestamp(3) without time zone,
    "canceledAt" timestamp(3) without time zone,
    "cancelAtPeriodEnd" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Subscription" OWNER TO nihongo;

--
-- Name: SubscriptionPlanConfig; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."SubscriptionPlanConfig" (
    id integer NOT NULL,
    plan public."SubscriptionPlan" NOT NULL,
    "displayName" text NOT NULL,
    "priceUsdCents" integer NOT NULL,
    "intervalMonths" integer DEFAULT 1 NOT NULL,
    "trialDays" integer DEFAULT 0 NOT NULL,
    features jsonb NOT NULL,
    "stripePriceId" text,
    active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."SubscriptionPlanConfig" OWNER TO nihongo;

--
-- Name: SubscriptionPlanConfig_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."SubscriptionPlanConfig_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."SubscriptionPlanConfig_id_seq" OWNER TO nihongo;

--
-- Name: SubscriptionPlanConfig_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."SubscriptionPlanConfig_id_seq" OWNED BY public."SubscriptionPlanConfig".id;


--
-- Name: Subscription_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."Subscription_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Subscription_id_seq" OWNER TO nihongo;

--
-- Name: Subscription_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."Subscription_id_seq" OWNED BY public."Subscription".id;


--
-- Name: SupportMessage; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."SupportMessage" (
    id integer NOT NULL,
    "threadId" integer NOT NULL,
    "senderId" integer NOT NULL,
    content text NOT NULL,
    "readAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."SupportMessage" OWNER TO nihongo;

--
-- Name: SupportMessage_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."SupportMessage_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."SupportMessage_id_seq" OWNER TO nihongo;

--
-- Name: SupportMessage_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."SupportMessage_id_seq" OWNED BY public."SupportMessage".id;


--
-- Name: SupportThread; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."SupportThread" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "lastMessageAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."SupportThread" OWNER TO nihongo;

--
-- Name: SupportThread_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."SupportThread_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."SupportThread_id_seq" OWNER TO nihongo;

--
-- Name: SupportThread_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."SupportThread_id_seq" OWNED BY public."SupportThread".id;


--
-- Name: User; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."User" (
    id integer NOT NULL,
    email text NOT NULL,
    "passwordHash" text,
    role public."Role" DEFAULT 'USER'::public."Role" NOT NULL,
    name text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "avatarUrl" text,
    "nativeLanguage" text DEFAULT 'vi'::text,
    "targetJlptLevel" public."JlptLevel",
    "studyGoalMinutes" integer DEFAULT 30,
    "lastActiveAt" timestamp(3) without time zone,
    "googleId" text
);


ALTER TABLE public."User" OWNER TO nihongo;

--
-- Name: User_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."User_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."User_id_seq" OWNER TO nihongo;

--
-- Name: User_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;


--
-- Name: Vocabulary; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."Vocabulary" (
    id integer NOT NULL,
    kanji text,
    kana text NOT NULL,
    romaji text NOT NULL,
    meaning text NOT NULL,
    "lessonId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "meaningEn" text,
    "partOfSpeech" text,
    "jlptLevel" public."JlptLevel",
    "pitchAccent" text,
    "audioUrl" text,
    "frequencyRank" integer,
    "imageUrl" text,
    "sortOrder" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."Vocabulary" OWNER TO nihongo;

--
-- Name: Vocabulary_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."Vocabulary_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Vocabulary_id_seq" OWNER TO nihongo;

--
-- Name: Vocabulary_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."Vocabulary_id_seq" OWNED BY public."Vocabulary".id;


--
-- Name: WebhookEvent; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."WebhookEvent" (
    id integer NOT NULL,
    provider text NOT NULL,
    "eventId" text NOT NULL,
    "eventType" text NOT NULL,
    payload jsonb NOT NULL,
    status public."WebhookEventStatus" DEFAULT 'RECEIVED'::public."WebhookEventStatus" NOT NULL,
    "processedAt" timestamp(3) without time zone,
    "errorMessage" text,
    "retryCount" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."WebhookEvent" OWNER TO nihongo;

--
-- Name: WebhookEvent_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."WebhookEvent_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."WebhookEvent_id_seq" OWNER TO nihongo;

--
-- Name: WebhookEvent_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."WebhookEvent_id_seq" OWNED BY public."WebhookEvent".id;


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO nihongo;

--
-- Name: ChatMessage id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."ChatMessage" ALTER COLUMN id SET DEFAULT nextval('public."ChatMessage_id_seq"'::regclass);


--
-- Name: CoachAvailability id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."CoachAvailability" ALTER COLUMN id SET DEFAULT nextval('public."CoachAvailability_id_seq"'::regclass);


--
-- Name: CoachProfile id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."CoachProfile" ALTER COLUMN id SET DEFAULT nextval('public."CoachProfile_id_seq"'::regclass);


--
-- Name: CoachReview id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."CoachReview" ALTER COLUMN id SET DEFAULT nextval('public."CoachReview_id_seq"'::regclass);


--
-- Name: CoachingSession id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."CoachingSession" ALTER COLUMN id SET DEFAULT nextval('public."CoachingSession_id_seq"'::regclass);


--
-- Name: CounterCategory id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."CounterCategory" ALTER COLUMN id SET DEFAULT nextval('public."CounterCategory_id_seq"'::regclass);


--
-- Name: CounterItem id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."CounterItem" ALTER COLUMN id SET DEFAULT nextval('public."CounterItem_id_seq"'::regclass);


--
-- Name: DailyGoal id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."DailyGoal" ALTER COLUMN id SET DEFAULT nextval('public."DailyGoal_id_seq"'::regclass);


--
-- Name: DailyGoalItem id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."DailyGoalItem" ALTER COLUMN id SET DEFAULT nextval('public."DailyGoalItem_id_seq"'::regclass);


--
-- Name: DailyNote id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."DailyNote" ALTER COLUMN id SET DEFAULT nextval('public."DailyNote_id_seq"'::regclass);


--
-- Name: DictationAttempt id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."DictationAttempt" ALTER COLUMN id SET DEFAULT nextval('public."DictationAttempt_id_seq"'::regclass);


--
-- Name: ExamResult id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."ExamResult" ALTER COLUMN id SET DEFAULT nextval('public."ExamResult_id_seq"'::regclass);


--
-- Name: ExamSectionResult id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."ExamSectionResult" ALTER COLUMN id SET DEFAULT nextval('public."ExamSectionResult_id_seq"'::regclass);


--
-- Name: Example id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."Example" ALTER COLUMN id SET DEFAULT nextval('public."Example_id_seq"'::regclass);


--
-- Name: Exercise id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."Exercise" ALTER COLUMN id SET DEFAULT nextval('public."Exercise_id_seq"'::regclass);


--
-- Name: ExerciseOption id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."ExerciseOption" ALTER COLUMN id SET DEFAULT nextval('public."ExerciseOption_id_seq"'::regclass);


--
-- Name: Grammar id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."Grammar" ALTER COLUMN id SET DEFAULT nextval('public."Grammar_id_seq"'::regclass);


--
-- Name: JlptExamDaySlot id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."JlptExamDaySlot" ALTER COLUMN id SET DEFAULT nextval('public."JlptExamDaySlot_id_seq"'::regclass);


--
-- Name: JlptExamSession id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."JlptExamSession" ALTER COLUMN id SET DEFAULT nextval('public."JlptExamSession_id_seq"'::regclass);


--
-- Name: JlptExamVenue id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."JlptExamVenue" ALTER COLUMN id SET DEFAULT nextval('public."JlptExamVenue_id_seq"'::regclass);


--
-- Name: JlptRoadmapExamSection id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."JlptRoadmapExamSection" ALTER COLUMN id SET DEFAULT nextval('public."JlptRoadmapExamSection_id_seq"'::regclass);


--
-- Name: JlptRoadmapLevel id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."JlptRoadmapLevel" ALTER COLUMN id SET DEFAULT nextval('public."JlptRoadmapLevel_id_seq"'::regclass);


--
-- Name: JlptRoadmapMaterial id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."JlptRoadmapMaterial" ALTER COLUMN id SET DEFAULT nextval('public."JlptRoadmapMaterial_id_seq"'::regclass);


--
-- Name: JlptRoadmapPhase id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."JlptRoadmapPhase" ALTER COLUMN id SET DEFAULT nextval('public."JlptRoadmapPhase_id_seq"'::regclass);


--
-- Name: JlptRoadmapTask id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."JlptRoadmapTask" ALTER COLUMN id SET DEFAULT nextval('public."JlptRoadmapTask_id_seq"'::regclass);


--
-- Name: KanaCell id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."KanaCell" ALTER COLUMN id SET DEFAULT nextval('public."KanaCell_id_seq"'::regclass);


--
-- Name: KanaSection id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."KanaSection" ALTER COLUMN id SET DEFAULT nextval('public."KanaSection_id_seq"'::regclass);


--
-- Name: KanjiEntry id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."KanjiEntry" ALTER COLUMN id SET DEFAULT nextval('public."KanjiEntry_id_seq"'::regclass);


--
-- Name: KanjiLesson id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."KanjiLesson" ALTER COLUMN id SET DEFAULT nextval('public."KanjiLesson_id_seq"'::regclass);


--
-- Name: KanjiVocab id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."KanjiVocab" ALTER COLUMN id SET DEFAULT nextval('public."KanjiVocab_id_seq"'::regclass);


--
-- Name: LearnerChatMember id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."LearnerChatMember" ALTER COLUMN id SET DEFAULT nextval('public."LearnerChatMember_id_seq"'::regclass);


--
-- Name: LearnerChatMessage id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."LearnerChatMessage" ALTER COLUMN id SET DEFAULT nextval('public."LearnerChatMessage_id_seq"'::regclass);


--
-- Name: LearnerChatRoom id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."LearnerChatRoom" ALTER COLUMN id SET DEFAULT nextval('public."LearnerChatRoom_id_seq"'::regclass);


--
-- Name: Lesson id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."Lesson" ALTER COLUMN id SET DEFAULT nextval('public."Lesson_id_seq"'::regclass);


--
-- Name: ListeningLog id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."ListeningLog" ALTER COLUMN id SET DEFAULT nextval('public."ListeningLog_id_seq"'::regclass);


--
-- Name: ListeningPreset id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."ListeningPreset" ALTER COLUMN id SET DEFAULT nextval('public."ListeningPreset_id_seq"'::regclass);


--
-- Name: Notification id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."Notification" ALTER COLUMN id SET DEFAULT nextval('public."Notification_id_seq"'::regclass);


--
-- Name: Payment id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."Payment" ALTER COLUMN id SET DEFAULT nextval('public."Payment_id_seq"'::regclass);


--
-- Name: Payout id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."Payout" ALTER COLUMN id SET DEFAULT nextval('public."Payout_id_seq"'::regclass);


--
-- Name: PodcastResource id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."PodcastResource" ALTER COLUMN id SET DEFAULT nextval('public."PodcastResource_id_seq"'::regclass);


--
-- Name: ReadingAttempt id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."ReadingAttempt" ALTER COLUMN id SET DEFAULT nextval('public."ReadingAttempt_id_seq"'::regclass);


--
-- Name: ReadingPassage id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."ReadingPassage" ALTER COLUMN id SET DEFAULT nextval('public."ReadingPassage_id_seq"'::regclass);


--
-- Name: ReadingQuestion id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."ReadingQuestion" ALTER COLUMN id SET DEFAULT nextval('public."ReadingQuestion_id_seq"'::regclass);


--
-- Name: ReadingQuestionOption id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."ReadingQuestionOption" ALTER COLUMN id SET DEFAULT nextval('public."ReadingQuestionOption_id_seq"'::regclass);


--
-- Name: SrsCard id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."SrsCard" ALTER COLUMN id SET DEFAULT nextval('public."SrsCard_id_seq"'::regclass);


--
-- Name: StudySession id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."StudySession" ALTER COLUMN id SET DEFAULT nextval('public."StudySession_id_seq"'::regclass);


--
-- Name: StudyStreak id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."StudyStreak" ALTER COLUMN id SET DEFAULT nextval('public."StudyStreak_id_seq"'::regclass);


--
-- Name: StudyTip id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."StudyTip" ALTER COLUMN id SET DEFAULT nextval('public."StudyTip_id_seq"'::regclass);


--
-- Name: Subscription id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."Subscription" ALTER COLUMN id SET DEFAULT nextval('public."Subscription_id_seq"'::regclass);


--
-- Name: SubscriptionPlanConfig id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."SubscriptionPlanConfig" ALTER COLUMN id SET DEFAULT nextval('public."SubscriptionPlanConfig_id_seq"'::regclass);


--
-- Name: SupportMessage id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."SupportMessage" ALTER COLUMN id SET DEFAULT nextval('public."SupportMessage_id_seq"'::regclass);


--
-- Name: SupportThread id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."SupportThread" ALTER COLUMN id SET DEFAULT nextval('public."SupportThread_id_seq"'::regclass);


--
-- Name: User id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);


--
-- Name: Vocabulary id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."Vocabulary" ALTER COLUMN id SET DEFAULT nextval('public."Vocabulary_id_seq"'::regclass);


--
-- Name: WebhookEvent id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."WebhookEvent" ALTER COLUMN id SET DEFAULT nextval('public."WebhookEvent_id_seq"'::regclass);


--
-- Name: ChatMessage ChatMessage_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."ChatMessage"
    ADD CONSTRAINT "ChatMessage_pkey" PRIMARY KEY (id);


--
-- Name: CoachAvailability CoachAvailability_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."CoachAvailability"
    ADD CONSTRAINT "CoachAvailability_pkey" PRIMARY KEY (id);


--
-- Name: CoachProfile CoachProfile_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."CoachProfile"
    ADD CONSTRAINT "CoachProfile_pkey" PRIMARY KEY (id);


--
-- Name: CoachReview CoachReview_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."CoachReview"
    ADD CONSTRAINT "CoachReview_pkey" PRIMARY KEY (id);


--
-- Name: CoachingSession CoachingSession_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."CoachingSession"
    ADD CONSTRAINT "CoachingSession_pkey" PRIMARY KEY (id);


--
-- Name: CounterCategory CounterCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."CounterCategory"
    ADD CONSTRAINT "CounterCategory_pkey" PRIMARY KEY (id);


--
-- Name: CounterItem CounterItem_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."CounterItem"
    ADD CONSTRAINT "CounterItem_pkey" PRIMARY KEY (id);


--
-- Name: DailyGoalItem DailyGoalItem_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."DailyGoalItem"
    ADD CONSTRAINT "DailyGoalItem_pkey" PRIMARY KEY (id);


--
-- Name: DailyGoal DailyGoal_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."DailyGoal"
    ADD CONSTRAINT "DailyGoal_pkey" PRIMARY KEY (id);


--
-- Name: DailyNote DailyNote_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."DailyNote"
    ADD CONSTRAINT "DailyNote_pkey" PRIMARY KEY (id);


--
-- Name: DictationAttempt DictationAttempt_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."DictationAttempt"
    ADD CONSTRAINT "DictationAttempt_pkey" PRIMARY KEY (id);


--
-- Name: ExamResult ExamResult_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."ExamResult"
    ADD CONSTRAINT "ExamResult_pkey" PRIMARY KEY (id);


--
-- Name: ExamSectionResult ExamSectionResult_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."ExamSectionResult"
    ADD CONSTRAINT "ExamSectionResult_pkey" PRIMARY KEY (id);


--
-- Name: Example Example_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."Example"
    ADD CONSTRAINT "Example_pkey" PRIMARY KEY (id);


--
-- Name: ExerciseOption ExerciseOption_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."ExerciseOption"
    ADD CONSTRAINT "ExerciseOption_pkey" PRIMARY KEY (id);


--
-- Name: Exercise Exercise_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."Exercise"
    ADD CONSTRAINT "Exercise_pkey" PRIMARY KEY (id);


--
-- Name: Grammar Grammar_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."Grammar"
    ADD CONSTRAINT "Grammar_pkey" PRIMARY KEY (id);


--
-- Name: JlptExamBriefing JlptExamBriefing_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."JlptExamBriefing"
    ADD CONSTRAINT "JlptExamBriefing_pkey" PRIMARY KEY (id);


--
-- Name: JlptExamDaySlot JlptExamDaySlot_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."JlptExamDaySlot"
    ADD CONSTRAINT "JlptExamDaySlot_pkey" PRIMARY KEY (id);


--
-- Name: JlptExamFeeInfo JlptExamFeeInfo_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."JlptExamFeeInfo"
    ADD CONSTRAINT "JlptExamFeeInfo_pkey" PRIMARY KEY (id);


--
-- Name: JlptExamSession JlptExamSession_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."JlptExamSession"
    ADD CONSTRAINT "JlptExamSession_pkey" PRIMARY KEY (id);


--
-- Name: JlptExamVenue JlptExamVenue_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."JlptExamVenue"
    ADD CONSTRAINT "JlptExamVenue_pkey" PRIMARY KEY (id);


--
-- Name: JlptOrganizer JlptOrganizer_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."JlptOrganizer"
    ADD CONSTRAINT "JlptOrganizer_pkey" PRIMARY KEY (id);


--
-- Name: JlptRoadmapExamSection JlptRoadmapExamSection_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."JlptRoadmapExamSection"
    ADD CONSTRAINT "JlptRoadmapExamSection_pkey" PRIMARY KEY (id);


--
-- Name: JlptRoadmapLevel JlptRoadmapLevel_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."JlptRoadmapLevel"
    ADD CONSTRAINT "JlptRoadmapLevel_pkey" PRIMARY KEY (id);


--
-- Name: JlptRoadmapMaterial JlptRoadmapMaterial_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."JlptRoadmapMaterial"
    ADD CONSTRAINT "JlptRoadmapMaterial_pkey" PRIMARY KEY (id);


--
-- Name: JlptRoadmapMeta JlptRoadmapMeta_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."JlptRoadmapMeta"
    ADD CONSTRAINT "JlptRoadmapMeta_pkey" PRIMARY KEY (id);


--
-- Name: JlptRoadmapPhase JlptRoadmapPhase_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."JlptRoadmapPhase"
    ADD CONSTRAINT "JlptRoadmapPhase_pkey" PRIMARY KEY (id);


--
-- Name: JlptRoadmapTask JlptRoadmapTask_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."JlptRoadmapTask"
    ADD CONSTRAINT "JlptRoadmapTask_pkey" PRIMARY KEY (id);


--
-- Name: KanaCell KanaCell_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."KanaCell"
    ADD CONSTRAINT "KanaCell_pkey" PRIMARY KEY (id);


--
-- Name: KanaSection KanaSection_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."KanaSection"
    ADD CONSTRAINT "KanaSection_pkey" PRIMARY KEY (id);


--
-- Name: KanjiEntry KanjiEntry_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."KanjiEntry"
    ADD CONSTRAINT "KanjiEntry_pkey" PRIMARY KEY (id);


--
-- Name: KanjiLesson KanjiLesson_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."KanjiLesson"
    ADD CONSTRAINT "KanjiLesson_pkey" PRIMARY KEY (id);


--
-- Name: KanjiVocab KanjiVocab_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."KanjiVocab"
    ADD CONSTRAINT "KanjiVocab_pkey" PRIMARY KEY (id);


--
-- Name: LearnerChatMember LearnerChatMember_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."LearnerChatMember"
    ADD CONSTRAINT "LearnerChatMember_pkey" PRIMARY KEY (id);


--
-- Name: LearnerChatMessage LearnerChatMessage_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."LearnerChatMessage"
    ADD CONSTRAINT "LearnerChatMessage_pkey" PRIMARY KEY (id);


--
-- Name: LearnerChatRoom LearnerChatRoom_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."LearnerChatRoom"
    ADD CONSTRAINT "LearnerChatRoom_pkey" PRIMARY KEY (id);


--
-- Name: Lesson Lesson_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."Lesson"
    ADD CONSTRAINT "Lesson_pkey" PRIMARY KEY (id);


--
-- Name: ListeningConfig ListeningConfig_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."ListeningConfig"
    ADD CONSTRAINT "ListeningConfig_pkey" PRIMARY KEY (id);


--
-- Name: ListeningLog ListeningLog_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."ListeningLog"
    ADD CONSTRAINT "ListeningLog_pkey" PRIMARY KEY (id);


--
-- Name: ListeningLog ListeningLog_userId_date_key; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."ListeningLog"
    ADD CONSTRAINT "ListeningLog_userId_date_key" UNIQUE ("userId", date);


--
-- Name: ListeningPreset ListeningPreset_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."ListeningPreset"
    ADD CONSTRAINT "ListeningPreset_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: Payment Payment_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_pkey" PRIMARY KEY (id);


--
-- Name: Payout Payout_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."Payout"
    ADD CONSTRAINT "Payout_pkey" PRIMARY KEY (id);


--
-- Name: PodcastResource PodcastResource_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."PodcastResource"
    ADD CONSTRAINT "PodcastResource_pkey" PRIMARY KEY (id);


--
-- Name: ReadingAttempt ReadingAttempt_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."ReadingAttempt"
    ADD CONSTRAINT "ReadingAttempt_pkey" PRIMARY KEY (id);


--
-- Name: ReadingPassage ReadingPassage_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."ReadingPassage"
    ADD CONSTRAINT "ReadingPassage_pkey" PRIMARY KEY (id);


--
-- Name: ReadingQuestionOption ReadingQuestionOption_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."ReadingQuestionOption"
    ADD CONSTRAINT "ReadingQuestionOption_pkey" PRIMARY KEY (id);


--
-- Name: ReadingQuestion ReadingQuestion_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."ReadingQuestion"
    ADD CONSTRAINT "ReadingQuestion_pkey" PRIMARY KEY (id);


--
-- Name: RefreshToken RefreshToken_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."RefreshToken"
    ADD CONSTRAINT "RefreshToken_pkey" PRIMARY KEY (id);


--
-- Name: SrsCard SrsCard_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."SrsCard"
    ADD CONSTRAINT "SrsCard_pkey" PRIMARY KEY (id);


--
-- Name: StudySession StudySession_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."StudySession"
    ADD CONSTRAINT "StudySession_pkey" PRIMARY KEY (id);


--
-- Name: StudyStreak StudyStreak_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."StudyStreak"
    ADD CONSTRAINT "StudyStreak_pkey" PRIMARY KEY (id);


--
-- Name: StudyTip StudyTip_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."StudyTip"
    ADD CONSTRAINT "StudyTip_pkey" PRIMARY KEY (id);


--
-- Name: SubscriptionPlanConfig SubscriptionPlanConfig_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."SubscriptionPlanConfig"
    ADD CONSTRAINT "SubscriptionPlanConfig_pkey" PRIMARY KEY (id);


--
-- Name: Subscription Subscription_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_pkey" PRIMARY KEY (id);


--
-- Name: SupportMessage SupportMessage_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."SupportMessage"
    ADD CONSTRAINT "SupportMessage_pkey" PRIMARY KEY (id);


--
-- Name: SupportThread SupportThread_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."SupportThread"
    ADD CONSTRAINT "SupportThread_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: Vocabulary Vocabulary_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."Vocabulary"
    ADD CONSTRAINT "Vocabulary_pkey" PRIMARY KEY (id);


--
-- Name: WebhookEvent WebhookEvent_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."WebhookEvent"
    ADD CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: ChatMessage_sessionId_createdAt_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "ChatMessage_sessionId_createdAt_idx" ON public."ChatMessage" USING btree ("sessionId", "createdAt");


--
-- Name: CoachAvailability_coachId_dayOfWeek_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "CoachAvailability_coachId_dayOfWeek_idx" ON public."CoachAvailability" USING btree ("coachId", "dayOfWeek");


--
-- Name: CoachProfile_isActive_avgRating_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "CoachProfile_isActive_avgRating_idx" ON public."CoachProfile" USING btree ("isActive", "avgRating");


--
-- Name: CoachProfile_isActive_hourlyRateUsd_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "CoachProfile_isActive_hourlyRateUsd_idx" ON public."CoachProfile" USING btree ("isActive", "hourlyRateUsd");


--
-- Name: CoachProfile_stripeAccountId_key; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE UNIQUE INDEX "CoachProfile_stripeAccountId_key" ON public."CoachProfile" USING btree ("stripeAccountId");


--
-- Name: CoachProfile_userId_key; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE UNIQUE INDEX "CoachProfile_userId_key" ON public."CoachProfile" USING btree ("userId");


--
-- Name: CoachReview_coachId_rating_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "CoachReview_coachId_rating_idx" ON public."CoachReview" USING btree ("coachId", rating);


--
-- Name: CoachReview_sessionId_key; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE UNIQUE INDEX "CoachReview_sessionId_key" ON public."CoachReview" USING btree ("sessionId");


--
-- Name: CoachingSession_coachId_scheduledAt_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "CoachingSession_coachId_scheduledAt_idx" ON public."CoachingSession" USING btree ("coachId", "scheduledAt");


--
-- Name: CoachingSession_learnerId_scheduledAt_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "CoachingSession_learnerId_scheduledAt_idx" ON public."CoachingSession" USING btree ("learnerId", "scheduledAt");


--
-- Name: CoachingSession_status_scheduledAt_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "CoachingSession_status_scheduledAt_idx" ON public."CoachingSession" USING btree (status, "scheduledAt");


--
-- Name: CounterCategory_slug_key; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE UNIQUE INDEX "CounterCategory_slug_key" ON public."CounterCategory" USING btree (slug);


--
-- Name: CounterItem_categoryId_sortOrder_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "CounterItem_categoryId_sortOrder_idx" ON public."CounterItem" USING btree ("categoryId", "sortOrder");


--
-- Name: DailyGoalItem_goalId_sortOrder_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "DailyGoalItem_goalId_sortOrder_idx" ON public."DailyGoalItem" USING btree ("goalId", "sortOrder");


--
-- Name: DailyGoal_userId_date_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "DailyGoal_userId_date_idx" ON public."DailyGoal" USING btree ("userId", date);


--
-- Name: DailyGoal_userId_date_key; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE UNIQUE INDEX "DailyGoal_userId_date_key" ON public."DailyGoal" USING btree ("userId", date);


--
-- Name: DailyNote_userId_date_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "DailyNote_userId_date_idx" ON public."DailyNote" USING btree ("userId", date);


--
-- Name: DailyNote_userId_date_key; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE UNIQUE INDEX "DailyNote_userId_date_key" ON public."DailyNote" USING btree ("userId", date);


--
-- Name: DictationAttempt_userId_createdAt_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "DictationAttempt_userId_createdAt_idx" ON public."DictationAttempt" USING btree ("userId", "createdAt");


--
-- Name: DictationAttempt_vocabId_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "DictationAttempt_vocabId_idx" ON public."DictationAttempt" USING btree ("vocabId");


--
-- Name: ExamResult_level_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "ExamResult_level_idx" ON public."ExamResult" USING btree (level);


--
-- Name: ExamResult_userId_submittedAt_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "ExamResult_userId_submittedAt_idx" ON public."ExamResult" USING btree ("userId", "submittedAt");


--
-- Name: ExamSectionResult_examResultId_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "ExamSectionResult_examResultId_idx" ON public."ExamSectionResult" USING btree ("examResultId");


--
-- Name: ExerciseOption_exerciseId_sortOrder_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "ExerciseOption_exerciseId_sortOrder_idx" ON public."ExerciseOption" USING btree ("exerciseId", "sortOrder");


--
-- Name: Exercise_lessonId_sortOrder_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "Exercise_lessonId_sortOrder_idx" ON public."Exercise" USING btree ("lessonId", "sortOrder");


--
-- Name: Grammar_jlptLevel_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "Grammar_jlptLevel_idx" ON public."Grammar" USING btree ("jlptLevel");


--
-- Name: Grammar_lessonId_sortOrder_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "Grammar_lessonId_sortOrder_idx" ON public."Grammar" USING btree ("lessonId", "sortOrder");


--
-- Name: JlptExamSession_externalKey_key; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE UNIQUE INDEX "JlptExamSession_externalKey_key" ON public."JlptExamSession" USING btree ("externalKey");


--
-- Name: JlptRoadmapExamSection_levelId_sortOrder_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "JlptRoadmapExamSection_levelId_sortOrder_idx" ON public."JlptRoadmapExamSection" USING btree ("levelId", "sortOrder");


--
-- Name: JlptRoadmapLevel_externalKey_key; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE UNIQUE INDEX "JlptRoadmapLevel_externalKey_key" ON public."JlptRoadmapLevel" USING btree ("externalKey");


--
-- Name: JlptRoadmapMaterial_levelId_sortOrder_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "JlptRoadmapMaterial_levelId_sortOrder_idx" ON public."JlptRoadmapMaterial" USING btree ("levelId", "sortOrder");


--
-- Name: JlptRoadmapPhase_levelId_externalKey_key; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE UNIQUE INDEX "JlptRoadmapPhase_levelId_externalKey_key" ON public."JlptRoadmapPhase" USING btree ("levelId", "externalKey");


--
-- Name: JlptRoadmapPhase_levelId_sortOrder_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "JlptRoadmapPhase_levelId_sortOrder_idx" ON public."JlptRoadmapPhase" USING btree ("levelId", "sortOrder");


--
-- Name: JlptRoadmapTask_phaseId_externalKey_key; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE UNIQUE INDEX "JlptRoadmapTask_phaseId_externalKey_key" ON public."JlptRoadmapTask" USING btree ("phaseId", "externalKey");


--
-- Name: JlptRoadmapTask_phaseId_sortOrder_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "JlptRoadmapTask_phaseId_sortOrder_idx" ON public."JlptRoadmapTask" USING btree ("phaseId", "sortOrder");


--
-- Name: KanaCell_sectionId_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "KanaCell_sectionId_idx" ON public."KanaCell" USING btree ("sectionId");


--
-- Name: KanaCell_sectionId_rowIndex_colIndex_key; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE UNIQUE INDEX "KanaCell_sectionId_rowIndex_colIndex_key" ON public."KanaCell" USING btree ("sectionId", "rowIndex", "colIndex");


--
-- Name: KanaSection_script_slug_key; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE UNIQUE INDEX "KanaSection_script_slug_key" ON public."KanaSection" USING btree (script, slug);


--
-- Name: KanaSection_script_sortOrder_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "KanaSection_script_sortOrder_idx" ON public."KanaSection" USING btree (script, "sortOrder");


--
-- Name: KanjiEntry_character_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "KanjiEntry_character_idx" ON public."KanjiEntry" USING btree ("character");


--
-- Name: KanjiEntry_jlptLevel_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "KanjiEntry_jlptLevel_idx" ON public."KanjiEntry" USING btree ("jlptLevel");


--
-- Name: KanjiEntry_lessonId_sortOrder_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "KanjiEntry_lessonId_sortOrder_idx" ON public."KanjiEntry" USING btree ("lessonId", "sortOrder");


--
-- Name: KanjiLesson_jlptLevel_sortOrder_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "KanjiLesson_jlptLevel_sortOrder_idx" ON public."KanjiLesson" USING btree ("jlptLevel", "sortOrder");


--
-- Name: KanjiLesson_lessonNumber_key; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE UNIQUE INDEX "KanjiLesson_lessonNumber_key" ON public."KanjiLesson" USING btree ("lessonNumber");


--
-- Name: KanjiVocab_kanjiEntryId_sortOrder_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "KanjiVocab_kanjiEntryId_sortOrder_idx" ON public."KanjiVocab" USING btree ("kanjiEntryId", "sortOrder");


--
-- Name: LearnerChatMember_roomId_userId_key; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE UNIQUE INDEX "LearnerChatMember_roomId_userId_key" ON public."LearnerChatMember" USING btree ("roomId", "userId");


--
-- Name: LearnerChatMember_userId_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "LearnerChatMember_userId_idx" ON public."LearnerChatMember" USING btree ("userId");


--
-- Name: LearnerChatMessage_roomId_createdAt_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "LearnerChatMessage_roomId_createdAt_idx" ON public."LearnerChatMessage" USING btree ("roomId", "createdAt");


--
-- Name: LearnerChatRoom_lastMessageAt_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "LearnerChatRoom_lastMessageAt_idx" ON public."LearnerChatRoom" USING btree ("lastMessageAt");


--
-- Name: LearnerChatRoom_type_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "LearnerChatRoom_type_idx" ON public."LearnerChatRoom" USING btree (type);


--
-- Name: Lesson_jlptLevel_sortOrder_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "Lesson_jlptLevel_sortOrder_idx" ON public."Lesson" USING btree ("jlptLevel", "sortOrder");


--
-- Name: Lesson_lessonNumber_key; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE UNIQUE INDEX "Lesson_lessonNumber_key" ON public."Lesson" USING btree ("lessonNumber");


--
-- Name: ListeningLog_userId_date_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "ListeningLog_userId_date_idx" ON public."ListeningLog" USING btree ("userId", date);


--
-- Name: ListeningPreset_externalKey_key; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE UNIQUE INDEX "ListeningPreset_externalKey_key" ON public."ListeningPreset" USING btree ("externalKey");


--
-- Name: Notification_userId_readAt_createdAt_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "Notification_userId_readAt_createdAt_idx" ON public."Notification" USING btree ("userId", "readAt", "createdAt");


--
-- Name: Payment_sessionId_key; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE UNIQUE INDEX "Payment_sessionId_key" ON public."Payment" USING btree ("sessionId");


--
-- Name: Payment_status_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "Payment_status_idx" ON public."Payment" USING btree (status);


--
-- Name: Payment_stripePaymentIntentId_key; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE UNIQUE INDEX "Payment_stripePaymentIntentId_key" ON public."Payment" USING btree ("stripePaymentIntentId");


--
-- Name: Payment_userId_createdAt_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "Payment_userId_createdAt_idx" ON public."Payment" USING btree ("userId", "createdAt");


--
-- Name: Payout_coachId_status_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "Payout_coachId_status_idx" ON public."Payout" USING btree ("coachId", status);


--
-- Name: Payout_periodStart_periodEnd_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "Payout_periodStart_periodEnd_idx" ON public."Payout" USING btree ("periodStart", "periodEnd");


--
-- Name: Payout_stripeTransferId_key; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE UNIQUE INDEX "Payout_stripeTransferId_key" ON public."Payout" USING btree ("stripeTransferId");


--
-- Name: PodcastResource_externalKey_key; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE UNIQUE INDEX "PodcastResource_externalKey_key" ON public."PodcastResource" USING btree ("externalKey");


--
-- Name: ReadingAttempt_passageId_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "ReadingAttempt_passageId_idx" ON public."ReadingAttempt" USING btree ("passageId");


--
-- Name: ReadingAttempt_userId_submittedAt_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "ReadingAttempt_userId_submittedAt_idx" ON public."ReadingAttempt" USING btree ("userId", "submittedAt");


--
-- Name: ReadingPassage_jlptLevel_sortOrder_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "ReadingPassage_jlptLevel_sortOrder_idx" ON public."ReadingPassage" USING btree ("jlptLevel", "sortOrder");


--
-- Name: ReadingQuestionOption_questionId_sortOrder_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "ReadingQuestionOption_questionId_sortOrder_idx" ON public."ReadingQuestionOption" USING btree ("questionId", "sortOrder");


--
-- Name: ReadingQuestion_passageId_sortOrder_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "ReadingQuestion_passageId_sortOrder_idx" ON public."ReadingQuestion" USING btree ("passageId", "sortOrder");


--
-- Name: RefreshToken_token_key; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE UNIQUE INDEX "RefreshToken_token_key" ON public."RefreshToken" USING btree (token);


--
-- Name: RefreshToken_userId_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "RefreshToken_userId_idx" ON public."RefreshToken" USING btree ("userId");


--
-- Name: SrsCard_userId_contentType_contentId_key; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE UNIQUE INDEX "SrsCard_userId_contentType_contentId_key" ON public."SrsCard" USING btree ("userId", "contentType", "contentId");


--
-- Name: SrsCard_userId_contentType_mastered_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "SrsCard_userId_contentType_mastered_idx" ON public."SrsCard" USING btree ("userId", "contentType", mastered);


--
-- Name: SrsCard_userId_nextReviewAt_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "SrsCard_userId_nextReviewAt_idx" ON public."SrsCard" USING btree ("userId", "nextReviewAt");


--
-- Name: StudySession_userId_date_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "StudySession_userId_date_idx" ON public."StudySession" USING btree ("userId", date);


--
-- Name: StudySession_userId_date_key; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE UNIQUE INDEX "StudySession_userId_date_key" ON public."StudySession" USING btree ("userId", date);


--
-- Name: StudyStreak_userId_key; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE UNIQUE INDEX "StudyStreak_userId_key" ON public."StudyStreak" USING btree ("userId");


--
-- Name: SubscriptionPlanConfig_plan_key; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE UNIQUE INDEX "SubscriptionPlanConfig_plan_key" ON public."SubscriptionPlanConfig" USING btree (plan);


--
-- Name: Subscription_status_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "Subscription_status_idx" ON public."Subscription" USING btree (status);


--
-- Name: Subscription_stripeCustomerId_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "Subscription_stripeCustomerId_idx" ON public."Subscription" USING btree ("stripeCustomerId");


--
-- Name: Subscription_stripeSubscriptionId_key; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON public."Subscription" USING btree ("stripeSubscriptionId");


--
-- Name: Subscription_userId_key; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE UNIQUE INDEX "Subscription_userId_key" ON public."Subscription" USING btree ("userId");


--
-- Name: SupportMessage_threadId_createdAt_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "SupportMessage_threadId_createdAt_idx" ON public."SupportMessage" USING btree ("threadId", "createdAt");


--
-- Name: SupportThread_lastMessageAt_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "SupportThread_lastMessageAt_idx" ON public."SupportThread" USING btree ("lastMessageAt");


--
-- Name: SupportThread_userId_key; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE UNIQUE INDEX "SupportThread_userId_key" ON public."SupportThread" USING btree ("userId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_googleId_key; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE UNIQUE INDEX "User_googleId_key" ON public."User" USING btree ("googleId");


--
-- Name: User_role_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "User_role_idx" ON public."User" USING btree (role);


--
-- Name: Vocabulary_jlptLevel_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "Vocabulary_jlptLevel_idx" ON public."Vocabulary" USING btree ("jlptLevel");


--
-- Name: Vocabulary_lessonId_sortOrder_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "Vocabulary_lessonId_sortOrder_idx" ON public."Vocabulary" USING btree ("lessonId", "sortOrder");


--
-- Name: WebhookEvent_eventId_key; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE UNIQUE INDEX "WebhookEvent_eventId_key" ON public."WebhookEvent" USING btree ("eventId");


--
-- Name: WebhookEvent_eventType_status_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "WebhookEvent_eventType_status_idx" ON public."WebhookEvent" USING btree ("eventType", status);


--
-- Name: WebhookEvent_provider_status_createdAt_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "WebhookEvent_provider_status_createdAt_idx" ON public."WebhookEvent" USING btree (provider, status, "createdAt");


--
-- Name: ChatMessage ChatMessage_senderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."ChatMessage"
    ADD CONSTRAINT "ChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ChatMessage ChatMessage_sessionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."ChatMessage"
    ADD CONSTRAINT "ChatMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES public."CoachingSession"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CoachAvailability CoachAvailability_coachId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."CoachAvailability"
    ADD CONSTRAINT "CoachAvailability_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES public."CoachProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CoachProfile CoachProfile_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."CoachProfile"
    ADD CONSTRAINT "CoachProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CoachReview CoachReview_coachId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."CoachReview"
    ADD CONSTRAINT "CoachReview_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES public."CoachProfile"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CoachReview CoachReview_learnerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."CoachReview"
    ADD CONSTRAINT "CoachReview_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CoachReview CoachReview_sessionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."CoachReview"
    ADD CONSTRAINT "CoachReview_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES public."CoachingSession"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CoachingSession CoachingSession_coachId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."CoachingSession"
    ADD CONSTRAINT "CoachingSession_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES public."CoachProfile"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CoachingSession CoachingSession_learnerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."CoachingSession"
    ADD CONSTRAINT "CoachingSession_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CounterItem CounterItem_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."CounterItem"
    ADD CONSTRAINT "CounterItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."CounterCategory"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DailyGoalItem DailyGoalItem_goalId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."DailyGoalItem"
    ADD CONSTRAINT "DailyGoalItem_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES public."DailyGoal"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DailyGoal DailyGoal_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."DailyGoal"
    ADD CONSTRAINT "DailyGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DailyNote DailyNote_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."DailyNote"
    ADD CONSTRAINT "DailyNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DictationAttempt DictationAttempt_vocabId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."DictationAttempt"
    ADD CONSTRAINT "DictationAttempt_vocabId_fkey" FOREIGN KEY ("vocabId") REFERENCES public."Vocabulary"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ExamResult ExamResult_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."ExamResult"
    ADD CONSTRAINT "ExamResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ExamSectionResult ExamSectionResult_examResultId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."ExamSectionResult"
    ADD CONSTRAINT "ExamSectionResult_examResultId_fkey" FOREIGN KEY ("examResultId") REFERENCES public."ExamResult"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Example Example_grammarId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."Example"
    ADD CONSTRAINT "Example_grammarId_fkey" FOREIGN KEY ("grammarId") REFERENCES public."Grammar"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ExerciseOption ExerciseOption_exerciseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."ExerciseOption"
    ADD CONSTRAINT "ExerciseOption_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES public."Exercise"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Exercise Exercise_lessonId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."Exercise"
    ADD CONSTRAINT "Exercise_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES public."Lesson"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Grammar Grammar_lessonId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."Grammar"
    ADD CONSTRAINT "Grammar_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES public."Lesson"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: JlptRoadmapExamSection JlptRoadmapExamSection_levelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."JlptRoadmapExamSection"
    ADD CONSTRAINT "JlptRoadmapExamSection_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES public."JlptRoadmapLevel"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: JlptRoadmapMaterial JlptRoadmapMaterial_levelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."JlptRoadmapMaterial"
    ADD CONSTRAINT "JlptRoadmapMaterial_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES public."JlptRoadmapLevel"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: JlptRoadmapPhase JlptRoadmapPhase_levelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."JlptRoadmapPhase"
    ADD CONSTRAINT "JlptRoadmapPhase_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES public."JlptRoadmapLevel"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: JlptRoadmapTask JlptRoadmapTask_phaseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."JlptRoadmapTask"
    ADD CONSTRAINT "JlptRoadmapTask_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES public."JlptRoadmapPhase"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: KanaCell KanaCell_sectionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."KanaCell"
    ADD CONSTRAINT "KanaCell_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES public."KanaSection"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: KanjiEntry KanjiEntry_lessonId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."KanjiEntry"
    ADD CONSTRAINT "KanjiEntry_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES public."KanjiLesson"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: KanjiVocab KanjiVocab_kanjiEntryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."KanjiVocab"
    ADD CONSTRAINT "KanjiVocab_kanjiEntryId_fkey" FOREIGN KEY ("kanjiEntryId") REFERENCES public."KanjiEntry"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LearnerChatMember LearnerChatMember_roomId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."LearnerChatMember"
    ADD CONSTRAINT "LearnerChatMember_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES public."LearnerChatRoom"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LearnerChatMember LearnerChatMember_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."LearnerChatMember"
    ADD CONSTRAINT "LearnerChatMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LearnerChatMessage LearnerChatMessage_roomId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."LearnerChatMessage"
    ADD CONSTRAINT "LearnerChatMessage_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES public."LearnerChatRoom"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LearnerChatMessage LearnerChatMessage_senderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."LearnerChatMessage"
    ADD CONSTRAINT "LearnerChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: LearnerChatRoom LearnerChatRoom_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."LearnerChatRoom"
    ADD CONSTRAINT "LearnerChatRoom_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ListeningLog ListeningLog_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."ListeningLog"
    ADD CONSTRAINT "ListeningLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Notification Notification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Payment Payment_sessionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES public."CoachingSession"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Payment Payment_subscriptionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES public."Subscription"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Payment Payment_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Payout Payout_coachId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."Payout"
    ADD CONSTRAINT "Payout_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES public."CoachProfile"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ReadingAttempt ReadingAttempt_passageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."ReadingAttempt"
    ADD CONSTRAINT "ReadingAttempt_passageId_fkey" FOREIGN KEY ("passageId") REFERENCES public."ReadingPassage"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ReadingQuestionOption ReadingQuestionOption_questionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."ReadingQuestionOption"
    ADD CONSTRAINT "ReadingQuestionOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES public."ReadingQuestion"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ReadingQuestion ReadingQuestion_passageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."ReadingQuestion"
    ADD CONSTRAINT "ReadingQuestion_passageId_fkey" FOREIGN KEY ("passageId") REFERENCES public."ReadingPassage"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RefreshToken RefreshToken_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."RefreshToken"
    ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SrsCard SrsCard_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."SrsCard"
    ADD CONSTRAINT "SrsCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StudySession StudySession_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."StudySession"
    ADD CONSTRAINT "StudySession_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StudyStreak StudyStreak_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."StudyStreak"
    ADD CONSTRAINT "StudyStreak_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Subscription Subscription_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SupportMessage SupportMessage_senderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."SupportMessage"
    ADD CONSTRAINT "SupportMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SupportMessage SupportMessage_threadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."SupportMessage"
    ADD CONSTRAINT "SupportMessage_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES public."SupportThread"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SupportThread SupportThread_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."SupportThread"
    ADD CONSTRAINT "SupportThread_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Vocabulary Vocabulary_lessonId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."Vocabulary"
    ADD CONSTRAINT "Vocabulary_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES public."Lesson"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict 15QjO6bQnqzcFOiWvQKKOUiCZky6qn5SH4d55kaJqsuj15byqvRSOzY15it0PJM

