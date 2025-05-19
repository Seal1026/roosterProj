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
    const homeLink = screen.getByText('Home');
    const promptsLink = screen.getByText('Prompts');
    
    expect(homeLink).toBeInTheDocument();
    expect(promptsLink).toBeInTheDocument();
    
    // Check if links have correct href attributes
    expect(homeLink.closest('a')).toHaveAttribute('href', '/');
    expect(promptsLink.closest('a')).toHaveAttribute('href', '/prompts');
    
    // Verify that Reports link is not present (removed during cleanup)
    expect(screen.queryByText('Reports')).not.toBeInTheDocument();
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