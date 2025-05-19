/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import RootLayout from '../layout';

describe('Root Layout', () => {
  it('renders the navigation with correct links', () => {
    render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );
    
    // Check if navigation links are rendered correctly
    const dashboardLink = screen.getByText('Dashboard');
    const promptsLink = screen.getByText('Prompts');
    const reportsLink = screen.getByText('Reports');
    
    expect(dashboardLink).toBeInTheDocument();
    expect(promptsLink).toBeInTheDocument();
    expect(reportsLink).toBeInTheDocument();
    
    // Check if links have correct href attributes
    expect(dashboardLink.closest('a')).toHaveAttribute('href', '/');
    expect(promptsLink.closest('a')).toHaveAttribute('href', '/prompts');
    expect(reportsLink.closest('a')).toHaveAttribute('href', '/reports');
    
    // Verify that Logs link is not present
    expect(screen.queryByText('Logs')).not.toBeInTheDocument();
  });

  it('renders the children content', () => {
    render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );
    
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});