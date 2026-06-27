--
-- PostgreSQL database dump
--

\restrict y3Aud9JqKwkg8hNqcZNYE8DZG5N815IW6JnIW6c23GTg4Ce3JYwpNdaXalFIeku

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: nihongo
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO nihongo;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: nihongo
--

COMMENT ON SCHEMA public IS '';


--
-- Name: ContentType; Type: TYPE; Schema: public; Owner: nihongo
--

CREATE TYPE public."ContentType" AS ENUM (
    'VOCABULARY',
    'GRAMMAR'
);


ALTER TYPE public."ContentType" OWNER TO nihongo;

--
-- Name: EnglishLevel; Type: TYPE; Schema: public; Owner: nihongo
--

CREATE TYPE public."EnglishLevel" AS ENUM (
    'A1',
    'A2',
    'B1',
    'B2',
    'C1',
    'C2'
);


ALTER TYPE public."EnglishLevel" OWNER TO nihongo;

--
-- Name: PartOfSpeech; Type: TYPE; Schema: public; Owner: nihongo
--

CREATE TYPE public."PartOfSpeech" AS ENUM (
    'noun',
    'verb',
    'adjective',
    'adverb',
    'preposition',
    'conjunction',
    'pronoun',
    'interjection',
    'phrase',
    'phrasal_verb'
);


ALTER TYPE public."PartOfSpeech" OWNER TO nihongo;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: nihongo
--

CREATE TYPE public."Role" AS ENUM (
    'USER',
    'ADMIN'
);


ALTER TYPE public."Role" OWNER TO nihongo;

SET default_tablespace = '';

SET default_table_access_method = heap;

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
-- Name: GrammarExOption; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."GrammarExOption" (
    id integer NOT NULL,
    "exerciseId" integer NOT NULL,
    text text NOT NULL,
    "isCorrect" boolean DEFAULT false NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."GrammarExOption" OWNER TO nihongo;

--
-- Name: GrammarExOption_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."GrammarExOption_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."GrammarExOption_id_seq" OWNER TO nihongo;

--
-- Name: GrammarExOption_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."GrammarExOption_id_seq" OWNED BY public."GrammarExOption".id;


--
-- Name: GrammarExample; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."GrammarExample" (
    id integer NOT NULL,
    "lessonId" integer NOT NULL,
    en text NOT NULL,
    vi text,
    "audioUrl" text,
    "sortOrder" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."GrammarExample" OWNER TO nihongo;

--
-- Name: GrammarExample_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."GrammarExample_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."GrammarExample_id_seq" OWNER TO nihongo;

--
-- Name: GrammarExample_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."GrammarExample_id_seq" OWNED BY public."GrammarExample".id;


--
-- Name: GrammarExercise; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."GrammarExercise" (
    id integer NOT NULL,
    "lessonId" integer NOT NULL,
    question text NOT NULL,
    answer text NOT NULL,
    explanation text,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."GrammarExercise" OWNER TO nihongo;

--
-- Name: GrammarExercise_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."GrammarExercise_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."GrammarExercise_id_seq" OWNER TO nihongo;

--
-- Name: GrammarExercise_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."GrammarExercise_id_seq" OWNED BY public."GrammarExercise".id;


--
-- Name: GrammarLesson; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."GrammarLesson" (
    id integer NOT NULL,
    "topicId" integer NOT NULL,
    title text NOT NULL,
    explanation text NOT NULL,
    level public."EnglishLevel" NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."GrammarLesson" OWNER TO nihongo;

--
-- Name: GrammarLesson_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."GrammarLesson_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."GrammarLesson_id_seq" OWNER TO nihongo;

--
-- Name: GrammarLesson_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."GrammarLesson_id_seq" OWNED BY public."GrammarLesson".id;


--
-- Name: GrammarTopic; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."GrammarTopic" (
    id integer NOT NULL,
    title text NOT NULL,
    description text,
    level public."EnglishLevel" NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."GrammarTopic" OWNER TO nihongo;

--
-- Name: GrammarTopic_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."GrammarTopic_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."GrammarTopic_id_seq" OWNER TO nihongo;

--
-- Name: GrammarTopic_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."GrammarTopic_id_seq" OWNED BY public."GrammarTopic".id;


--
-- Name: ListeningAttempt; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."ListeningAttempt" (
    id integer NOT NULL,
    "userId" integer,
    "trackId" integer NOT NULL,
    correct integer NOT NULL,
    total integer NOT NULL,
    percent double precision NOT NULL,
    "submittedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ListeningAttempt" OWNER TO nihongo;

--
-- Name: ListeningAttempt_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."ListeningAttempt_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ListeningAttempt_id_seq" OWNER TO nihongo;

--
-- Name: ListeningAttempt_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."ListeningAttempt_id_seq" OWNED BY public."ListeningAttempt".id;


--
-- Name: ListeningOption; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."ListeningOption" (
    id integer NOT NULL,
    "questionId" integer NOT NULL,
    text text NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."ListeningOption" OWNER TO nihongo;

--
-- Name: ListeningOption_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."ListeningOption_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ListeningOption_id_seq" OWNER TO nihongo;

--
-- Name: ListeningOption_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."ListeningOption_id_seq" OWNED BY public."ListeningOption".id;


--
-- Name: ListeningQuestion; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."ListeningQuestion" (
    id integer NOT NULL,
    "trackId" integer NOT NULL,
    question text NOT NULL,
    answer text NOT NULL,
    explanation text,
    "sortOrder" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."ListeningQuestion" OWNER TO nihongo;

--
-- Name: ListeningQuestion_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."ListeningQuestion_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ListeningQuestion_id_seq" OWNER TO nihongo;

--
-- Name: ListeningQuestion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."ListeningQuestion_id_seq" OWNED BY public."ListeningQuestion".id;


--
-- Name: ListeningTrack; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."ListeningTrack" (
    id integer NOT NULL,
    title text NOT NULL,
    "youtubeUrl" text,
    "audioUrl" text,
    transcript text,
    level public."EnglishLevel" NOT NULL,
    "durationSec" integer,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ListeningTrack" OWNER TO nihongo;

--
-- Name: ListeningTrack_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."ListeningTrack_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ListeningTrack_id_seq" OWNER TO nihongo;

--
-- Name: ListeningTrack_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."ListeningTrack_id_seq" OWNED BY public."ListeningTrack".id;


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
-- Name: ReadingOption; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."ReadingOption" (
    id integer NOT NULL,
    "questionId" integer NOT NULL,
    text text NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."ReadingOption" OWNER TO nihongo;

--
-- Name: ReadingOption_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."ReadingOption_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ReadingOption_id_seq" OWNER TO nihongo;

--
-- Name: ReadingOption_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."ReadingOption_id_seq" OWNED BY public."ReadingOption".id;


--
-- Name: ReadingPassage; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."ReadingPassage" (
    id integer NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    level public."EnglishLevel" NOT NULL,
    source text,
    "estimatedMin" integer DEFAULT 5 NOT NULL,
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
    "nextReviewAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "lastReviewAt" timestamp(3) without time zone,
    "correctCount" integer DEFAULT 0 NOT NULL,
    "wrongCount" integer DEFAULT 0 NOT NULL,
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
    "cardsStudied" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
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
-- Name: User; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."User" (
    id integer NOT NULL,
    email text NOT NULL,
    "passwordHash" text NOT NULL,
    name text,
    role public."Role" DEFAULT 'USER'::public."Role" NOT NULL,
    "nativeLanguage" text DEFAULT 'vi'::text,
    "targetLevel" public."EnglishLevel",
    "studyGoalMin" integer DEFAULT 30 NOT NULL,
    "lastActiveAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
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
-- Name: VocabTopic; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."VocabTopic" (
    id integer NOT NULL,
    name text NOT NULL,
    icon text,
    "sortOrder" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."VocabTopic" OWNER TO nihongo;

--
-- Name: VocabTopic_id_seq; Type: SEQUENCE; Schema: public; Owner: nihongo
--

CREATE SEQUENCE public."VocabTopic_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."VocabTopic_id_seq" OWNER TO nihongo;

--
-- Name: VocabTopic_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nihongo
--

ALTER SEQUENCE public."VocabTopic_id_seq" OWNED BY public."VocabTopic".id;


--
-- Name: Vocabulary; Type: TABLE; Schema: public; Owner: nihongo
--

CREATE TABLE public."Vocabulary" (
    id integer NOT NULL,
    word text NOT NULL,
    phonetic text,
    "meaningVi" text NOT NULL,
    "meaningEn" text,
    "partOfSpeech" public."PartOfSpeech",
    level public."EnglishLevel" NOT NULL,
    "exampleEn" text,
    "exampleVi" text,
    "audioUrl" text,
    "imageUrl" text,
    "frequencyRank" integer,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "topicId" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
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
-- Name: GrammarExOption id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."GrammarExOption" ALTER COLUMN id SET DEFAULT nextval('public."GrammarExOption_id_seq"'::regclass);


--
-- Name: GrammarExample id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."GrammarExample" ALTER COLUMN id SET DEFAULT nextval('public."GrammarExample_id_seq"'::regclass);


--
-- Name: GrammarExercise id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."GrammarExercise" ALTER COLUMN id SET DEFAULT nextval('public."GrammarExercise_id_seq"'::regclass);


--
-- Name: GrammarLesson id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."GrammarLesson" ALTER COLUMN id SET DEFAULT nextval('public."GrammarLesson_id_seq"'::regclass);


--
-- Name: GrammarTopic id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."GrammarTopic" ALTER COLUMN id SET DEFAULT nextval('public."GrammarTopic_id_seq"'::regclass);


--
-- Name: ListeningAttempt id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."ListeningAttempt" ALTER COLUMN id SET DEFAULT nextval('public."ListeningAttempt_id_seq"'::regclass);


--
-- Name: ListeningOption id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."ListeningOption" ALTER COLUMN id SET DEFAULT nextval('public."ListeningOption_id_seq"'::regclass);


--
-- Name: ListeningQuestion id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."ListeningQuestion" ALTER COLUMN id SET DEFAULT nextval('public."ListeningQuestion_id_seq"'::regclass);


--
-- Name: ListeningTrack id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."ListeningTrack" ALTER COLUMN id SET DEFAULT nextval('public."ListeningTrack_id_seq"'::regclass);


--
-- Name: ReadingAttempt id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."ReadingAttempt" ALTER COLUMN id SET DEFAULT nextval('public."ReadingAttempt_id_seq"'::regclass);


--
-- Name: ReadingOption id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."ReadingOption" ALTER COLUMN id SET DEFAULT nextval('public."ReadingOption_id_seq"'::regclass);


--
-- Name: ReadingPassage id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."ReadingPassage" ALTER COLUMN id SET DEFAULT nextval('public."ReadingPassage_id_seq"'::regclass);


--
-- Name: ReadingQuestion id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."ReadingQuestion" ALTER COLUMN id SET DEFAULT nextval('public."ReadingQuestion_id_seq"'::regclass);


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
-- Name: User id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);


--
-- Name: VocabTopic id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."VocabTopic" ALTER COLUMN id SET DEFAULT nextval('public."VocabTopic_id_seq"'::regclass);


--
-- Name: Vocabulary id; Type: DEFAULT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."Vocabulary" ALTER COLUMN id SET DEFAULT nextval('public."Vocabulary_id_seq"'::regclass);


--
-- Data for Name: DailyGoal; Type: TABLE DATA; Schema: public; Owner: nihongo
--

COPY public."DailyGoal" (id, "userId", date, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: DailyGoalItem; Type: TABLE DATA; Schema: public; Owner: nihongo
--

COPY public."DailyGoalItem" (id, "goalId", text, done, "sortOrder") FROM stdin;
\.


--
-- Data for Name: DailyNote; Type: TABLE DATA; Schema: public; Owner: nihongo
--

COPY public."DailyNote" (id, "userId", date, content, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: DictationAttempt; Type: TABLE DATA; Schema: public; Owner: nihongo
--

COPY public."DictationAttempt" (id, "userId", "vocabId", "userInput", correct, "createdAt") FROM stdin;
\.


--
-- Data for Name: GrammarExOption; Type: TABLE DATA; Schema: public; Owner: nihongo
--

COPY public."GrammarExOption" (id, "exerciseId", text, "isCorrect", "sortOrder") FROM stdin;
\.


--
-- Data for Name: GrammarExample; Type: TABLE DATA; Schema: public; Owner: nihongo
--

COPY public."GrammarExample" (id, "lessonId", en, vi, "audioUrl", "sortOrder") FROM stdin;
\.


--
-- Data for Name: GrammarExercise; Type: TABLE DATA; Schema: public; Owner: nihongo
--

COPY public."GrammarExercise" (id, "lessonId", question, answer, explanation, "sortOrder", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: GrammarLesson; Type: TABLE DATA; Schema: public; Owner: nihongo
--

COPY public."GrammarLesson" (id, "topicId", title, explanation, level, "sortOrder", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: GrammarTopic; Type: TABLE DATA; Schema: public; Owner: nihongo
--

COPY public."GrammarTopic" (id, title, description, level, "sortOrder", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ListeningAttempt; Type: TABLE DATA; Schema: public; Owner: nihongo
--

COPY public."ListeningAttempt" (id, "userId", "trackId", correct, total, percent, "submittedAt") FROM stdin;
\.


--
-- Data for Name: ListeningOption; Type: TABLE DATA; Schema: public; Owner: nihongo
--

COPY public."ListeningOption" (id, "questionId", text, "sortOrder") FROM stdin;
\.


--
-- Data for Name: ListeningQuestion; Type: TABLE DATA; Schema: public; Owner: nihongo
--

COPY public."ListeningQuestion" (id, "trackId", question, answer, explanation, "sortOrder") FROM stdin;
\.


--
-- Data for Name: ListeningTrack; Type: TABLE DATA; Schema: public; Owner: nihongo
--

COPY public."ListeningTrack" (id, title, "youtubeUrl", "audioUrl", transcript, level, "durationSec", "sortOrder", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ReadingAttempt; Type: TABLE DATA; Schema: public; Owner: nihongo
--

COPY public."ReadingAttempt" (id, "userId", "passageId", correct, total, percent, "submittedAt") FROM stdin;
\.


--
-- Data for Name: ReadingOption; Type: TABLE DATA; Schema: public; Owner: nihongo
--

COPY public."ReadingOption" (id, "questionId", text, "sortOrder") FROM stdin;
\.


--
-- Data for Name: ReadingPassage; Type: TABLE DATA; Schema: public; Owner: nihongo
--

COPY public."ReadingPassage" (id, title, content, level, source, "estimatedMin", "sortOrder", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ReadingQuestion; Type: TABLE DATA; Schema: public; Owner: nihongo
--

COPY public."ReadingQuestion" (id, "passageId", question, answer, explanation, "sortOrder") FROM stdin;
\.


--
-- Data for Name: SrsCard; Type: TABLE DATA; Schema: public; Owner: nihongo
--

COPY public."SrsCard" (id, "userId", "contentType", "contentId", "easeFactor", "interval", repetitions, "nextReviewAt", "lastReviewAt", "correctCount", "wrongCount", "reviewStreak", mastered, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: StudySession; Type: TABLE DATA; Schema: public; Owner: nihongo
--

COPY public."StudySession" (id, "userId", date, seconds, "cardsStudied", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: StudyStreak; Type: TABLE DATA; Schema: public; Owner: nihongo
--

COPY public."StudyStreak" (id, "userId", "currentStreak", "longestStreak", "lastStudyDate", "updatedAt") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: nihongo
--

COPY public."User" (id, email, "passwordHash", name, role, "nativeLanguage", "targetLevel", "studyGoalMin", "lastActiveAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: VocabTopic; Type: TABLE DATA; Schema: public; Owner: nihongo
--

COPY public."VocabTopic" (id, name, icon, "sortOrder") FROM stdin;
\.


--
-- Data for Name: Vocabulary; Type: TABLE DATA; Schema: public; Owner: nihongo
--

COPY public."Vocabulary" (id, word, phonetic, "meaningVi", "meaningEn", "partOfSpeech", level, "exampleEn", "exampleVi", "audioUrl", "imageUrl", "frequencyRank", "sortOrder", "topicId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: DailyGoalItem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: nihongo
--

SELECT pg_catalog.setval('public."DailyGoalItem_id_seq"', 1, false);


--
-- Name: DailyGoal_id_seq; Type: SEQUENCE SET; Schema: public; Owner: nihongo
--

SELECT pg_catalog.setval('public."DailyGoal_id_seq"', 1, false);


--
-- Name: DailyNote_id_seq; Type: SEQUENCE SET; Schema: public; Owner: nihongo
--

SELECT pg_catalog.setval('public."DailyNote_id_seq"', 1, false);


--
-- Name: DictationAttempt_id_seq; Type: SEQUENCE SET; Schema: public; Owner: nihongo
--

SELECT pg_catalog.setval('public."DictationAttempt_id_seq"', 1, false);


--
-- Name: GrammarExOption_id_seq; Type: SEQUENCE SET; Schema: public; Owner: nihongo
--

SELECT pg_catalog.setval('public."GrammarExOption_id_seq"', 1, false);


--
-- Name: GrammarExample_id_seq; Type: SEQUENCE SET; Schema: public; Owner: nihongo
--

SELECT pg_catalog.setval('public."GrammarExample_id_seq"', 1, false);


--
-- Name: GrammarExercise_id_seq; Type: SEQUENCE SET; Schema: public; Owner: nihongo
--

SELECT pg_catalog.setval('public."GrammarExercise_id_seq"', 1, false);


--
-- Name: GrammarLesson_id_seq; Type: SEQUENCE SET; Schema: public; Owner: nihongo
--

SELECT pg_catalog.setval('public."GrammarLesson_id_seq"', 1, false);


--
-- Name: GrammarTopic_id_seq; Type: SEQUENCE SET; Schema: public; Owner: nihongo
--

SELECT pg_catalog.setval('public."GrammarTopic_id_seq"', 1, false);


--
-- Name: ListeningAttempt_id_seq; Type: SEQUENCE SET; Schema: public; Owner: nihongo
--

SELECT pg_catalog.setval('public."ListeningAttempt_id_seq"', 1, false);


--
-- Name: ListeningOption_id_seq; Type: SEQUENCE SET; Schema: public; Owner: nihongo
--

SELECT pg_catalog.setval('public."ListeningOption_id_seq"', 1, false);


--
-- Name: ListeningQuestion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: nihongo
--

SELECT pg_catalog.setval('public."ListeningQuestion_id_seq"', 1, false);


--
-- Name: ListeningTrack_id_seq; Type: SEQUENCE SET; Schema: public; Owner: nihongo
--

SELECT pg_catalog.setval('public."ListeningTrack_id_seq"', 1, false);


--
-- Name: ReadingAttempt_id_seq; Type: SEQUENCE SET; Schema: public; Owner: nihongo
--

SELECT pg_catalog.setval('public."ReadingAttempt_id_seq"', 1, false);


--
-- Name: ReadingOption_id_seq; Type: SEQUENCE SET; Schema: public; Owner: nihongo
--

SELECT pg_catalog.setval('public."ReadingOption_id_seq"', 1, false);


--
-- Name: ReadingPassage_id_seq; Type: SEQUENCE SET; Schema: public; Owner: nihongo
--

SELECT pg_catalog.setval('public."ReadingPassage_id_seq"', 1, false);


--
-- Name: ReadingQuestion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: nihongo
--

SELECT pg_catalog.setval('public."ReadingQuestion_id_seq"', 1, false);


--
-- Name: SrsCard_id_seq; Type: SEQUENCE SET; Schema: public; Owner: nihongo
--

SELECT pg_catalog.setval('public."SrsCard_id_seq"', 1, false);


--
-- Name: StudySession_id_seq; Type: SEQUENCE SET; Schema: public; Owner: nihongo
--

SELECT pg_catalog.setval('public."StudySession_id_seq"', 1, false);


--
-- Name: StudyStreak_id_seq; Type: SEQUENCE SET; Schema: public; Owner: nihongo
--

SELECT pg_catalog.setval('public."StudyStreak_id_seq"', 1, false);


--
-- Name: User_id_seq; Type: SEQUENCE SET; Schema: public; Owner: nihongo
--

SELECT pg_catalog.setval('public."User_id_seq"', 1, false);


--
-- Name: VocabTopic_id_seq; Type: SEQUENCE SET; Schema: public; Owner: nihongo
--

SELECT pg_catalog.setval('public."VocabTopic_id_seq"', 1, false);


--
-- Name: Vocabulary_id_seq; Type: SEQUENCE SET; Schema: public; Owner: nihongo
--

SELECT pg_catalog.setval('public."Vocabulary_id_seq"', 1, false);


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
-- Name: GrammarExOption GrammarExOption_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."GrammarExOption"
    ADD CONSTRAINT "GrammarExOption_pkey" PRIMARY KEY (id);


--
-- Name: GrammarExample GrammarExample_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."GrammarExample"
    ADD CONSTRAINT "GrammarExample_pkey" PRIMARY KEY (id);


--
-- Name: GrammarExercise GrammarExercise_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."GrammarExercise"
    ADD CONSTRAINT "GrammarExercise_pkey" PRIMARY KEY (id);


--
-- Name: GrammarLesson GrammarLesson_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."GrammarLesson"
    ADD CONSTRAINT "GrammarLesson_pkey" PRIMARY KEY (id);


--
-- Name: GrammarTopic GrammarTopic_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."GrammarTopic"
    ADD CONSTRAINT "GrammarTopic_pkey" PRIMARY KEY (id);


--
-- Name: ListeningAttempt ListeningAttempt_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."ListeningAttempt"
    ADD CONSTRAINT "ListeningAttempt_pkey" PRIMARY KEY (id);


--
-- Name: ListeningOption ListeningOption_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."ListeningOption"
    ADD CONSTRAINT "ListeningOption_pkey" PRIMARY KEY (id);


--
-- Name: ListeningQuestion ListeningQuestion_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."ListeningQuestion"
    ADD CONSTRAINT "ListeningQuestion_pkey" PRIMARY KEY (id);


--
-- Name: ListeningTrack ListeningTrack_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."ListeningTrack"
    ADD CONSTRAINT "ListeningTrack_pkey" PRIMARY KEY (id);


--
-- Name: ReadingAttempt ReadingAttempt_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."ReadingAttempt"
    ADD CONSTRAINT "ReadingAttempt_pkey" PRIMARY KEY (id);


--
-- Name: ReadingOption ReadingOption_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."ReadingOption"
    ADD CONSTRAINT "ReadingOption_pkey" PRIMARY KEY (id);


--
-- Name: ReadingPassage ReadingPassage_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."ReadingPassage"
    ADD CONSTRAINT "ReadingPassage_pkey" PRIMARY KEY (id);


--
-- Name: ReadingQuestion ReadingQuestion_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."ReadingQuestion"
    ADD CONSTRAINT "ReadingQuestion_pkey" PRIMARY KEY (id);


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
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: VocabTopic VocabTopic_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."VocabTopic"
    ADD CONSTRAINT "VocabTopic_pkey" PRIMARY KEY (id);


--
-- Name: Vocabulary Vocabulary_pkey; Type: CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."Vocabulary"
    ADD CONSTRAINT "Vocabulary_pkey" PRIMARY KEY (id);


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
-- Name: GrammarExOption_exerciseId_sortOrder_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "GrammarExOption_exerciseId_sortOrder_idx" ON public."GrammarExOption" USING btree ("exerciseId", "sortOrder");


--
-- Name: GrammarExample_lessonId_sortOrder_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "GrammarExample_lessonId_sortOrder_idx" ON public."GrammarExample" USING btree ("lessonId", "sortOrder");


--
-- Name: GrammarExercise_lessonId_sortOrder_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "GrammarExercise_lessonId_sortOrder_idx" ON public."GrammarExercise" USING btree ("lessonId", "sortOrder");


--
-- Name: GrammarLesson_level_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "GrammarLesson_level_idx" ON public."GrammarLesson" USING btree (level);


--
-- Name: GrammarLesson_topicId_sortOrder_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "GrammarLesson_topicId_sortOrder_idx" ON public."GrammarLesson" USING btree ("topicId", "sortOrder");


--
-- Name: GrammarTopic_level_sortOrder_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "GrammarTopic_level_sortOrder_idx" ON public."GrammarTopic" USING btree (level, "sortOrder");


--
-- Name: ListeningAttempt_trackId_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "ListeningAttempt_trackId_idx" ON public."ListeningAttempt" USING btree ("trackId");


--
-- Name: ListeningAttempt_userId_submittedAt_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "ListeningAttempt_userId_submittedAt_idx" ON public."ListeningAttempt" USING btree ("userId", "submittedAt");


--
-- Name: ListeningOption_questionId_sortOrder_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "ListeningOption_questionId_sortOrder_idx" ON public."ListeningOption" USING btree ("questionId", "sortOrder");


--
-- Name: ListeningQuestion_trackId_sortOrder_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "ListeningQuestion_trackId_sortOrder_idx" ON public."ListeningQuestion" USING btree ("trackId", "sortOrder");


--
-- Name: ListeningTrack_level_sortOrder_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "ListeningTrack_level_sortOrder_idx" ON public."ListeningTrack" USING btree (level, "sortOrder");


--
-- Name: ReadingAttempt_passageId_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "ReadingAttempt_passageId_idx" ON public."ReadingAttempt" USING btree ("passageId");


--
-- Name: ReadingAttempt_userId_submittedAt_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "ReadingAttempt_userId_submittedAt_idx" ON public."ReadingAttempt" USING btree ("userId", "submittedAt");


--
-- Name: ReadingOption_questionId_sortOrder_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "ReadingOption_questionId_sortOrder_idx" ON public."ReadingOption" USING btree ("questionId", "sortOrder");


--
-- Name: ReadingPassage_level_sortOrder_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "ReadingPassage_level_sortOrder_idx" ON public."ReadingPassage" USING btree (level, "sortOrder");


--
-- Name: ReadingQuestion_passageId_sortOrder_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "ReadingQuestion_passageId_sortOrder_idx" ON public."ReadingQuestion" USING btree ("passageId", "sortOrder");


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
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_role_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "User_role_idx" ON public."User" USING btree (role);


--
-- Name: VocabTopic_name_key; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE UNIQUE INDEX "VocabTopic_name_key" ON public."VocabTopic" USING btree (name);


--
-- Name: Vocabulary_level_sortOrder_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "Vocabulary_level_sortOrder_idx" ON public."Vocabulary" USING btree (level, "sortOrder");


--
-- Name: Vocabulary_topicId_sortOrder_idx; Type: INDEX; Schema: public; Owner: nihongo
--

CREATE INDEX "Vocabulary_topicId_sortOrder_idx" ON public."Vocabulary" USING btree ("topicId", "sortOrder");


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
-- Name: DictationAttempt DictationAttempt_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."DictationAttempt"
    ADD CONSTRAINT "DictationAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: DictationAttempt DictationAttempt_vocabId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."DictationAttempt"
    ADD CONSTRAINT "DictationAttempt_vocabId_fkey" FOREIGN KEY ("vocabId") REFERENCES public."Vocabulary"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: GrammarExOption GrammarExOption_exerciseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."GrammarExOption"
    ADD CONSTRAINT "GrammarExOption_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES public."GrammarExercise"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: GrammarExample GrammarExample_lessonId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."GrammarExample"
    ADD CONSTRAINT "GrammarExample_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES public."GrammarLesson"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: GrammarExercise GrammarExercise_lessonId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."GrammarExercise"
    ADD CONSTRAINT "GrammarExercise_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES public."GrammarLesson"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: GrammarLesson GrammarLesson_topicId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."GrammarLesson"
    ADD CONSTRAINT "GrammarLesson_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES public."GrammarTopic"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ListeningAttempt ListeningAttempt_trackId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."ListeningAttempt"
    ADD CONSTRAINT "ListeningAttempt_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES public."ListeningTrack"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ListeningAttempt ListeningAttempt_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."ListeningAttempt"
    ADD CONSTRAINT "ListeningAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ListeningOption ListeningOption_questionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."ListeningOption"
    ADD CONSTRAINT "ListeningOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES public."ListeningQuestion"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ListeningQuestion ListeningQuestion_trackId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."ListeningQuestion"
    ADD CONSTRAINT "ListeningQuestion_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES public."ListeningTrack"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ReadingAttempt ReadingAttempt_passageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."ReadingAttempt"
    ADD CONSTRAINT "ReadingAttempt_passageId_fkey" FOREIGN KEY ("passageId") REFERENCES public."ReadingPassage"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ReadingAttempt ReadingAttempt_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."ReadingAttempt"
    ADD CONSTRAINT "ReadingAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ReadingOption ReadingOption_questionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."ReadingOption"
    ADD CONSTRAINT "ReadingOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES public."ReadingQuestion"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ReadingQuestion ReadingQuestion_passageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."ReadingQuestion"
    ADD CONSTRAINT "ReadingQuestion_passageId_fkey" FOREIGN KEY ("passageId") REFERENCES public."ReadingPassage"(id) ON UPDATE CASCADE ON DELETE CASCADE;


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
-- Name: Vocabulary Vocabulary_topicId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nihongo
--

ALTER TABLE ONLY public."Vocabulary"
    ADD CONSTRAINT "Vocabulary_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES public."VocabTopic"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: nihongo
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict y3Aud9JqKwkg8hNqcZNYE8DZG5N815IW6JnIW6c23GTg4Ce3JYwpNdaXalFIeku

