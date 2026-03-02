import { useState, useCallback } from 'react';
import type { Client, ClientLink } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface UseClienteLinksArgs {
  client: Client | null;
  setClient: React.Dispatch<React.SetStateAction<Client | null>>;
}

/**
 * Link management handlers for the client details page.
 * Handles adding and removing external links.
 */
export function useClienteLinks({ client: _client, setClient }: UseClienteLinksArgs) {
  const [newLink, setNewLink] = useState({ title: '', url: '' });

  const handleAddLink = useCallback(() => {
    if (!newLink.title.trim() || !newLink.url.trim()) return;
    try {
      new URL(newLink.url); // Simple validation
    } catch {
      alert('URL inválida. Certifique-se de incluir http:// ou https://');
      return;
    }

    const link: ClientLink = {
      id: uuidv4(),
      title: newLink.title,
      url: newLink.url,
    };

    setClient((prev) =>
      prev
        ? {
            ...prev,
            externalLinks: [...(prev.externalLinks || []), link],
          }
        : null,
    );

    setNewLink({ title: '', url: '' });
  }, [newLink, setClient]);

  const handleRemoveLink = useCallback(
    (id: string) => {
      setClient((prev) =>
        prev
          ? {
              ...prev,
              externalLinks: prev.externalLinks?.filter((l) => l.id !== id),
            }
          : null,
      );
    },
    [setClient],
  );

  return {
    newLink,
    setNewLink,
    handleAddLink,
    handleRemoveLink,
  };
}
