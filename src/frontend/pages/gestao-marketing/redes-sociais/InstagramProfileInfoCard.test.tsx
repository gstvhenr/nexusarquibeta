import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { InstagramProfileInfoCard } from './InstagramProfileInfoCard';

describe('InstagramProfileInfoCard', () => {
  it('renders profile url as external link and handle', () => {
    render(
      <InstagramProfileInfoCard
        profileUrl="https://www.instagram.com/rafaelmunaro.arq/"
        profileHandle="@rafaelmunaro.arq"
      />,
    );

    const link = screen.getByRole('link', { name: 'https://www.instagram.com/rafaelmunaro.arq/' });
    expect(link).toHaveAttribute('href', 'https://www.instagram.com/rafaelmunaro.arq/');
    expect(screen.getByText('@rafaelmunaro.arq')).toBeInTheDocument();
  });

  it('renders fallback states when profile information is missing', () => {
    render(<InstagramProfileInfoCard profileUrl="" profileHandle="" />);

    expect(screen.getByText('Nenhum link cadastrado')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});
