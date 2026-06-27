import type { Meta, StoryObj } from '@storybook/react';
import ListeningPlayer from './ListeningPlayer';

const meta: Meta<typeof ListeningPlayer> = {
  title: 'Components/ListeningPlayer',
  component: ListeningPlayer,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ListeningPlayer>;

export const Default: Story = {
  args: {
    audioText: 'こんにちは',
    autoPlay: false,
    showText: false,
  },
};

export const WithText: Story = {
  args: {
    audioText: 'ありがとうございます',
    autoPlay: false,
    showText: true,
  },
};

export const Unlimited: Story = {
  args: {
    audioText: 'おはようございます',
    autoPlay: false,
    unlimited: true,
  },
};
