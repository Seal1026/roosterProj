/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProcessPromptsPage from '../prompts/process/page';
import { getPrompts, Prompt } from '../../utils/promptStorage';

// Mock fetch
global.fetch = jest.fn();

// Mock the router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock the promptStorage utility
jest.mock('../../utils/promptStorage', () => ({
  getPrompts: jest.fn(),
}));

describe('Process Prompts Page', () => {
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
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ processedCount: 1, errors: [] }),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the page title', () => {
    render(<ProcessPromptsPage />);
    expect(screen.getByText('Process Prompts')).toBeInTheDocument();
  });

  it('renders the process all button', () => {
    render(<ProcessPromptsPage />);
    expect(screen.getByText('Process All Scheduled')).toBeInTheDocument();
  });

  it('renders the process selected button', () => {
    render(<ProcessPromptsPage />);
    expect(screen.getByText('Process Selected')).toBeInTheDocument();
  });

  it('processes all prompts when process all button is clicked', async () => {
    render(<ProcessPromptsPage />);
    
    const processAllButton = screen.getByText('Process All Scheduled');
    fireEvent.click(processAllButton);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/process-prompts', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });
  });

  it('processes selected prompt when process selected button is clicked', async () => {
    render(<ProcessPromptsPage />);
    
    // Select a prompt
    const selectElement = screen.getByLabelText('Select Prompt');
    fireEvent.change(selectElement, { target: { value: 'prompt1' } });
    
    // Click the process selected button
    const processSelectedButton = screen.getByText('Process Selected');
    fireEvent.click(processSelectedButton);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/process-prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ promptId: 'prompt1' }),
      });
    });
  });

  it('shows an error message when processing fails', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));
    
    render(<ProcessPromptsPage />);
    
    const processAllButton = screen.getByText('Process All Scheduled');
    fireEvent.click(processAllButton);
    
    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });
  });

  it('shows the result when processing succeeds', async () => {
    render(<ProcessPromptsPage />);
    
    const processAllButton = screen.getByText('Process All Scheduled');
    fireEvent.click(processAllButton);
    
    await waitFor(() => {
      expect(screen.getByText('Result:')).toBeInTheDocument();
    });
  });
});