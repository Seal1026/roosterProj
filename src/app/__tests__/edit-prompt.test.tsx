/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EditPromptPage from '../prompts/edit/[id]/page';
import { getPrompts, updatePrompt, Prompt } from '../../utils/promptStorage';

// Mock the router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock the promptStorage utility
jest.mock('../../utils/promptStorage', () => ({
  getPrompts: jest.fn(),
  updatePrompt: jest.fn(),
}));

describe('Edit Prompt Page', () => {
  const mockPrompt: Prompt = {
    id: 'test-id',
    email: 'test@example.com',
    prompt: 'Test prompt content',
    frequency: 'weekly',
    startTime: '10:00',
    endTime: '18:00',
    sliderValue: 75,
    createdAt: 1620000000000,
  };

  beforeEach(() => {
    (getPrompts as jest.Mock).mockReturnValue([mockPrompt]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the page title', () => {
    render(<EditPromptPage params={{ id: 'test-id' }} />);
    expect(screen.getByText('Edit Prompt')).toBeInTheDocument();
  });

  it('loads and displays the prompt data', async () => {
    render(<EditPromptPage params={{ id: 'test-id' }} />);
    
    await waitFor(() => {
      expect(getPrompts).toHaveBeenCalled();
    });
    
    // Check if form fields are populated with the correct values
    expect(screen.getByLabelText('Email Address')).toHaveValue('test@example.com');
    expect(screen.getByLabelText('Your Prompt')).toHaveValue('Test prompt content');
    expect(screen.getByLabelText('Weekly')).toBeChecked();
    expect(screen.getByLabelText('Start Time')).toHaveValue('10:00');
    expect(screen.getByLabelText('End Time')).toHaveValue('18:00');
  });

  it('shows not found message when prompt does not exist', async () => {
    (getPrompts as jest.Mock).mockReturnValue([]);
    render(<EditPromptPage params={{ id: 'non-existent-id' }} />);
    
    await waitFor(() => {
      expect(getPrompts).toHaveBeenCalled();
    });
    
    expect(screen.getByText('Prompt Not Found')).toBeInTheDocument();
    expect(screen.getByText("The prompt you're trying to edit doesn't exist.")).toBeInTheDocument();
  });

  it('updates the prompt when form is submitted', async () => {
    render(<EditPromptPage params={{ id: 'test-id' }} />);
    
    await waitFor(() => {
      expect(getPrompts).toHaveBeenCalled();
    });
    
    // Modify form values
    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'updated@example.com' },
    });
    
    fireEvent.change(screen.getByLabelText('Your Prompt'), {
      target: { value: 'Updated prompt content' },
    });
    
    fireEvent.click(screen.getByLabelText('Monthly'));
    
    // Submit the form
    fireEvent.submit(screen.getByText('Save Changes'));
    
    // Check if updatePrompt was called with the correct values
    expect(updatePrompt).toHaveBeenCalledWith('test-id', {
      email: 'updated@example.com',
      prompt: 'Updated prompt content',
      frequency: 'monthly',
      startTime: '10:00',
      endTime: '18:00',
      sliderValue: 75,
    });
  });
});