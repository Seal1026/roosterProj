/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PromptsPage from '../../components/prompts/page';
import { getPrompts, deletePrompt, Prompt } from '../lib/storage/promptStorage';

// Mock the router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock the promptStorage utility
jest.mock('../../utils/promptStorage', () => ({
  getPrompts: jest.fn(),
  deletePrompt: jest.fn(),
}));

describe('Prompts Page', () => {
  const mockPrompts: Prompt[] = [
    {
      id: 'prompt1',
      email: 'test1@example.com',
      prompt: 'Test prompt 1',
      frequency: 'daily',
      startTime: '09:00',
      endTime: '17:00',
      sliderValue: 50,
      createdAt: 1620000000000,
    },
    {
      id: 'prompt2',
      email: 'test2@example.com',
      prompt: 'Test prompt 2',
      frequency: 'weekly',
      startTime: '10:00',
      endTime: '18:00',
      sliderValue: 75,
      createdAt: 1620100000000,
    },
  ];

  beforeEach(() => {
    (getPrompts as jest.Mock).mockReturnValue(mockPrompts);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the page title', () => {
    render(<PromptsPage />);
    expect(screen.getByText('Your Prompts')).toBeInTheDocument();
  });

  it('renders the create new prompt button', () => {
    render(<PromptsPage />);
    expect(screen.getByText('Create New Prompt')).toBeInTheDocument();
  });

  it('renders a list of prompts', async () => {
    render(<PromptsPage />);
    
    // Wait for the prompts to load
    await waitFor(() => {
      expect(getPrompts).toHaveBeenCalled();
    });
    
    // Check if both prompts are rendered
    expect(screen.getByText('Test prompt 1')).toBeInTheDocument();
    expect(screen.getByText('Test prompt 2')).toBeInTheDocument();
    
    // Check if email is displayed
    expect(screen.getByText('test1@example.com')).toBeInTheDocument();
    expect(screen.getByText('test2@example.com')).toBeInTheDocument();
    
    // Check if frequency is displayed with proper formatting
    expect(screen.getByText(/Daily, 09:00 - 17:00/)).toBeInTheDocument();
    expect(screen.getByText(/Weekly, 10:00 - 18:00/)).toBeInTheDocument();
  });

  it('shows empty state when no prompts exist', async () => {
    (getPrompts as jest.Mock).mockReturnValue([]);
    render(<PromptsPage />);
    
    await waitFor(() => {
      expect(getPrompts).toHaveBeenCalled();
    });
    
    expect(screen.getByText("You don't have any prompts yet.")).toBeInTheDocument();
    expect(screen.getByText('Create Your First Prompt')).toBeInTheDocument();
  });

  it('deletes a prompt when delete is confirmed', async () => {
    render(<PromptsPage />);
    
    await waitFor(() => {
      expect(getPrompts).toHaveBeenCalled();
    });
    
    // Find and click the delete button for the first prompt
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    
    // Confirm deletion
    const confirmButton = screen.getByText('Yes, Delete');
    fireEvent.click(confirmButton);
    
    // Check if deletePrompt was called with the correct ID
    expect(deletePrompt).toHaveBeenCalledWith('prompt1');
  });

  it('cancels deletion when cancel is clicked', async () => {
    render(<PromptsPage />);
    
    await waitFor(() => {
      expect(getPrompts).toHaveBeenCalled();
    });
    
    // Find and click the delete button for the first prompt
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    
    // Cancel deletion
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    // Check that deletePrompt was not called
    expect(deletePrompt).not.toHaveBeenCalled();
  });
});