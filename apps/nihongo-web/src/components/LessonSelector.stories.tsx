import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LessonSelector from './LessonSelector';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const meta: Meta<typeof LessonSelector> = {
  title: 'Components/LessonSelector',
  component: LessonSelector,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof LessonSelector>;

export const Default: Story = {
  args: {
    value: 1,
    onChange: () => {},
  },
};

export const AllLessons: Story = {
  args: {
    value: 5,
    onChange: () => {},
    filterWithContent: false,
  },
};
