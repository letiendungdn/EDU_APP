import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import LessonSelector from '../LessonSelector';

const mockLessons = [
  {
    id: 1,
    lessonNumber: 1,
    title: 'Xin chào',
    _count: { vocabularies: 10, grammars: 5, exercises: 3 },
  },
  {
    id: 2,
    lessonNumber: 2,
    title: 'Đi mua sắm',
    _count: { vocabularies: 8, grammars: 4, exercises: 2 },
  },
];

vi.mock('../../hooks/queries', () => ({
  useLessonsQuery: vi.fn(),
}));

import { useLessonsQuery } from '../../hooks/queries';

describe('LessonSelector', () => {
  beforeEach(() => {
    vi.mocked(useLessonsQuery).mockReturnValue({
      data: mockLessons,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useLessonsQuery>);
  });

  it('renders lesson dropdown', () => {
    render(<LessonSelector value={1} onChange={() => {}} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('shows lesson options', () => {
    render(<LessonSelector value={1} onChange={() => {}} />);
    expect(screen.getByRole('option', { name: /Bài 1/ })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Bài 2/ })).toBeInTheDocument();
  });

  it('shows loading state', () => {
    vi.mocked(useLessonsQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as ReturnType<typeof useLessonsQuery>);

    render(<LessonSelector value={1} onChange={() => {}} />);
    expect(screen.getByText(/Đang tải/)).toBeInTheDocument();
  });
});
