import type { Meta, StoryObj } from '@storybook/react';
import VocabCard from './VocabCard';

const meta: Meta<typeof VocabCard> = {
  title: 'Components/VocabCard',
  component: VocabCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof VocabCard>;

const sampleVocab = {
  kanji: '食べる',
  kana: 'たべる',
  romaji: 'taberu',
  meaning: 'ăn',
};

export const Front: Story = {
  args: {
    vocab: sampleVocab,
    flipped: false,
    onFlip: () => {},
    onPlay: () => {},
  },
};

export const Back: Story = {
  args: {
    vocab: sampleVocab,
    flipped: true,
    onPlay: () => {},
  },
};

export const KanaOnly: Story = {
  args: {
    vocab: { kanji: null, kana: 'ねこ', romaji: 'neko', meaning: 'mèo' },
    flipped: false,
  },
};
