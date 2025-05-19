/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from '../page';
import { savePrompt } from '../lib/storage/promptStorage';

// Mock the router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock the promptStorage utility
jest.mock('../../utils/promptStorage', () => ({
  savePrompt: jest.fn(),
}));

describe('Home Page', () => {
  beforeEach(() => {
    render(<Home />);
    jest.clearAllMocks();
  });

  it('renders the page title', () => {
    expect(screen.getByText('Daily Rooster Setup')).toBeInTheDocument();
  });

  it('renders the email input field', () => {
    const emailInput = screen.getByPlaceholderText('your@email.com');
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute('type', 'email');
  });

  it('renders the prompt textarea', () => {
    const promptTextarea = screen.getByPlaceholderText('Enter your prompt here...');
    expect(promptTextarea).toBeInTheDocument();
  });

  it('renders the frequency options', () => {
    expect(screen.getByText('Frequency')).toBeInTheDocument();
    
    // Check for all frequency options by their capitalized text
    expect(screen.getByText('Hourly')).toBeInTheDocument();
    expect(screen.getByText('Daily')).toBeInTheDocument();
    expect(screen.getByText('Bi-daily')).toBeInTheDocument();
    expect(screen.getByText('Weekly')).toBeInTheDocument();
    expect(screen.getByText('Monthly')).toBeInTheDocument();
  });

  it('renders the time inputs', () => {
    const startTimeLabel = screen.getByText('Start Time');
    const endTimeLabel = screen.getByText('End Time');
    expect(startTimeLabel).toBeInTheDocument();
    expect(endTimeLabel).toBeInTheDocument();
    
    // Find the inputs by their type and nearby label
    const startTimeInput = screen.getByLabelText('Start Time');
    const endTimeInput = screen.getByLabelText('End Time');
    expect(startTimeInput).toHaveAttribute('type', 'datetime-local');
    expect(endTimeInput).toHaveAttribute('type', 'datetime-local');
  });

  it('renders the submit button', () => {
    expect(screen.getByRole('button', { name: /Create Schedule/i })).toBeInTheDocument();
  });

  it('handles form submission with correct values', async () => {
    // Mock the getCurrentDateTime function
    const mockDate = '2023-01-01T10:00';
    const mockEndDate = '2023-01-01T18:00';
    
    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText('your@email.com'), {
      target: { value: 'test@example.com' },
    });
    
    fireEvent.change(screen.getByPlaceholderText('Enter your prompt here...'), {
      target: { value: 'Test prompt content' },
    });
    
    // Find and click the Weekly option
    const weeklyOption = screen.getByText('Weekly');
    fireEvent.click(weeklyOption);
    
    fireEvent.change(screen.getByLabelText('Start Time'), {
      target: { value: mockDate },
    });
    
    fireEvent.change(screen.getByLabelText('End Time'), {
      target: { value: mockEndDate },
    });
    
    // Submit the form - find button by text content that includes "Create Schedule"
    const submitButton = screen.getByText(/Create Schedule/i);
    fireEvent.click(submitButton);
    
    // Check if savePrompt was called with the correct values
    await waitFor(() => {
      expect(savePrompt).toHaveBeenCalledWith({
        email: 'test@example.com',
        prompt: 'Test prompt content',
        frequency: 'weekly',
        startTime: mockDate,
        endTime: mockEndDate,
        sliderValue: 0,
      });
    });
  });
  
  it('shows loading state when saving', async () => {
    // Fill required fields
    fireEvent.change(screen.getByPlaceholderText('your@email.com'), {
      target: { value: 'test@example.com' },
    });
    
    fireEvent.change(screen.getByPlaceholderText('Enter your prompt here...'), {
      target: { value: 'Test prompt content' },
    });
    
    // Mock savePrompt to delay resolution
    (savePrompt as jest.Mock).mockImplementationOnce(() => {
      return new Promise(resolve => {
        setTimeout(resolve, 100);
      });
    });
    
    // Submit the form
    fireEvent.click(screen.getByText(/Create Schedule/i));
    
    // Check for loading state
    expect(await screen.findByText('Saving...')).toBeInTheDocument();
  });
});