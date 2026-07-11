'use client';

import {
  hasOptionalBracketParts,
  parseOptionalBracketSegments,
} from '../utils/japanese';

type FlashcardJapaneseTextProps = {
  text: string;
  className?: string;
};

export default function FlashcardJapaneseText({ text, className = '' }: FlashcardJapaneseTextProps) {
  const segments = parseOptionalBracketSegments(text);
  const hasOptional = hasOptionalBracketParts(text);

  return (
    <span
      className={`flashcard-jp-text${hasOptional ? ' flashcard-jp-text--optional-mix' : ''}${
        className ? ` ${className}` : ''
      }`}
    >
      {segments.map((segment, index) =>
        segment.optional ? (
          <span key={index} className="flashcard-jp-optional">
            <span className="flashcard-jp-bracket">{segment.openBracket ?? '['}</span>
            {segment.text}
            <span className="flashcard-jp-bracket">{segment.closeBracket ?? ']'}</span>
          </span>
        ) : (
          <span key={index} className="flashcard-jp-core">
            {segment.text}
          </span>
        ),
      )}
    </span>
  );
}
