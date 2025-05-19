import { render, screen, fireEvent } from '@testing-library/react';
import ReportsPage from '../reports/page';
import * as reportStorage from '../../utils/reportStorage';
import * as promptStorage from '../../utils/promptStorage';

// Mock the next/navigation module
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock the reportStorage module
jest.mock('../../utils/reportStorage', () => ({
  getReports: jest.fn(),
  createReport: jest.fn(),
  updateReport: jest.fn(),
  deleteReport: jest.fn(),
  addPromptToReport: jest.fn(),
  removePromptFromReport: jest.fn(),
  reorderPromptsInReport: jest.fn(),
}));

// Mock the promptStorage module
jest.mock('../../utils/promptStorage', () => ({
  getPrompts: jest.fn(),
}));

// Mock the DnD libraries
jest.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  closestCenter: jest.fn(),
  KeyboardSensor: jest.fn(),
  PointerSensor: jest.fn(),
  useSensor: jest.fn(),
  useSensors: jest.fn(() => ({})),
}));

jest.mock('@dnd-kit/sortable', () => ({
  arrayMove: jest.fn(),
  SortableContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  sortableKeyboardCoordinates: jest.fn(),
  verticalListSortingStrategy: {},
}));

describe('ReportsPage', () => {
  const mockReports = [
    {
      id: 'report1',
      name: 'Daily News Report',
      description: 'News updates',
      promptIds: ['prompt1', 'prompt2'],
      createdAt: Date.now(),
    },
    {
      id: 'report2',
      name: 'Weekly Summary',
      description: 'Weekly summary of events',
      promptIds: ['prompt3'],
      createdAt: Date.now() - 86400000, // 1 day ago
    },
  ];

  const mockPrompts = [
    {
      id: 'prompt1',
      email: 'user1@example.com',
      prompt: 'Daily news summary',
      frequency: 'daily',
      startTime: '2023-01-01T09:00',
      endTime: '2023-01-01T17:00',
      sliderValue: 50,
      createdAt: Date.now(),
    },
    {
      id: 'prompt2',
      email: 'user2@example.com',
      prompt: 'Tech news updates',
      frequency: 'weekly',
      startTime: '2023-01-01T10:00',
      endTime: '2023-01-01T18:00',
      sliderValue: 75,
      createdAt: Date.now(),
    },
    {
      id: 'prompt3',
      email: 'user3@example.com',
      prompt: 'Financial summary',
      frequency: 'monthly',
      startTime: '2023-01-01T08:00',
      endTime: '2023-01-01T16:00',
      sliderValue: 25,
      createdAt: Date.now(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (reportStorage.getReports as jest.Mock).mockReturnValue(mockReports);
    (promptStorage.getPrompts as jest.Mock).mockReturnValue(mockPrompts);
  });

  test('renders the reports page with reports list', () => {
    render(<ReportsPage />);
    
    // Check if the page title is rendered
    expect(screen.getByText('Reports')).toBeInTheDocument();
    
    // Check if report names are rendered
    expect(screen.getByText('Daily News Report')).toBeInTheDocument();
    expect(screen.getByText('Weekly Summary')).toBeInTheDocument();
    
    // Check if create button is rendered
    expect(screen.getByText('Create New Report')).toBeInTheDocument();
  });

  test('allows creating a new report', () => {
    const mockNewReport = {
      id: 'new-report',
      name: 'New Test Report',
      description: 'Test description',
      promptIds: [],
      createdAt: Date.now(),
    };
    
    (reportStorage.createReport as jest.Mock).mockReturnValue(mockNewReport);
    
    render(<ReportsPage />);
    
    // Click create new report button
    fireEvent.click(screen.getByText('Create New Report'));
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText('Report Name'), {
      target: { value: 'New Test Report' },
    });
    
    fireEvent.change(screen.getByLabelText('Description (Optional)'), {
      target: { value: 'Test description' },
    });
    
    // Submit the form
    fireEvent.click(screen.getByText('Create'));
    
    // Check if createReport was called with correct params
    expect(reportStorage.createReport).toHaveBeenCalledWith({
      name: 'New Test Report',
      description: 'Test description',
    });
  });

  test('allows deleting a report', () => {
    render(<ReportsPage />);
    
    // Find and click the delete button for the first report
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    
    // Confirm deletion
    fireEvent.click(screen.getByText('Yes, Delete'));
    
    // Check if deleteReport was called with correct ID
    expect(reportStorage.deleteReport).toHaveBeenCalledWith('report1');
  });

  test('displays available prompts', () => {
    render(<ReportsPage />);
    
    // Check if prompt texts are rendered
    expect(screen.getByText('Daily news summary')).toBeInTheDocument();
    expect(screen.getByText('Tech news updates')).toBeInTheDocument();
    expect(screen.getByText('Financial summary')).toBeInTheDocument();
  });

  test('allows searching prompts', () => {
    render(<ReportsPage />);
    
    // Type in search box
    fireEvent.change(screen.getByPlaceholderText('Search prompts...'), {
      target: { value: 'tech' },
    });
    
    // The filtered list should now only show the tech news prompt
    expect(screen.getByText('Tech news updates')).toBeInTheDocument();
  });
});