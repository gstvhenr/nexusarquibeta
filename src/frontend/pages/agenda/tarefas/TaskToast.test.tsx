import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { TaskToast } from './TaskToast';

describe('TaskToast', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the given message text', () => {
    // Arrange
    render(<TaskToast message="Complete todas as subtarefas." />);

    // Assert
    expect(screen.getByText('Complete todas as subtarefas.')).toBeInTheDocument();
  });

  it('renders a warning icon alongside the message', () => {
    // Arrange
    const { container } = render(<TaskToast message="Aviso crítico." />);

    // Assert — SVG warning icon is rendered inside the toast
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('is positioned fixed at the bottom of the viewport', () => {
    // Arrange
    const { container } = render(<TaskToast message="Posicionamento fixo." />);

    // Assert — outermost wrapper should have fixed positioning
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.className).toMatch(/fixed/);
    expect(wrapper.className).toMatch(/bottom/);
  });

  it('renders correctly with an empty message string', () => {
    // Arrange
    render(<TaskToast message="" />);

    // Assert — component mounts without throwing
    expect(screen.queryByRole('alert')).not.toBeInTheDocument(); // no alert role expected
    expect(document.body).toBeTruthy(); // sanity check — no uncaught exception
  });

  it('renders correctly with a long message without truncation', () => {
    // Arrange
    const longMessage =
      'Esta é uma mensagem muito longa para ser exibida dentro do toast enquanto o usuário está interagindo com o kanban e tentou mover uma tarefa sem completar as subtarefas.';

    render(<TaskToast message={longMessage} />);

    // Assert — full message is accessible
    expect(screen.getByText(longMessage)).toBeInTheDocument();
  });

  it('renders two independent toasts when mounted twice', () => {
    // Arrange — simulate two toasts rendered simultaneously
    const { container: container1 } = render(
      <TaskToast message="Primeira mensagem de aviso." />,
    );
    const { container: container2 } = render(
      <TaskToast message="Segunda mensagem de aviso." />,
    );

    // Assert — each renders its own unique message
    expect(container1.textContent).toContain('Primeira mensagem de aviso.');
    expect(container2.textContent).toContain('Segunda mensagem de aviso.');
  });
});
