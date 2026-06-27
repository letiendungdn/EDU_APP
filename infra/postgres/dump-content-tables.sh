#!/bin/sh
# Dump chỉ bảng nội dung học (Minna + KLL + reference). Chạy trong container postgres.
set -euo pipefail

TABLES="
Lesson Vocabulary Grammar Example Exercise ExerciseOption
KanjiLesson KanjiEntry KanjiVocab
KanaSection KanaCell
CounterCategory CounterItem
ListeningConfig PodcastResource ListeningPreset
JlptOrganizer JlptExamFeeInfo JlptExamBriefing JlptExamSession JlptExamVenue JlptExamDaySlot
JlptRoadmapMeta StudyTip JlptRoadmapLevel JlptRoadmapExamSection JlptRoadmapMaterial JlptRoadmapPhase JlptRoadmapTask
ReadingPassage ReadingQuestion ReadingQuestionOption
"

CMD="pg_dump -U nihongo nihongo --data-only --column-inserts --disable-triggers"
for t in $TABLES; do
  CMD="$CMD --table='public.\"$t\"'"
done

eval "$CMD"
