import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import ErrorBoundary from './ErrorBoundary';

function HealthyChild() {
  return <p style={{ padding: '1rem' }}>Nội dung bình thường</p>;
}

function BrokenChild(): ReactNode {
  throw new Error('Storybook demo error');
}

const meta: Meta<typeof ErrorBoundary> = {
  title: 'Components/ErrorBoundary',
  component: ErrorBoundary,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ErrorBoundary>;

export const NoError: Story = {
  render: () => (
    <ErrorBoundary>
      <HealthyChild />
    </ErrorBoundary>
  ),
};

export const WithError: Story = {
  render: () => (
    <ErrorBoundary>
      <BrokenChild />
    </ErrorBoundary>
  ),
};
