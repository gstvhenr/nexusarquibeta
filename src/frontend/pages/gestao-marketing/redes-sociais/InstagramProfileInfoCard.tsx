import React from 'react';
import { LinkIcon } from '../../../components/ui/icons';

type InstagramProfileInfoCardProps = {
  profileUrl: string;
  profileHandle: string;
};

export const InstagramProfileInfoCard: (
  props: InstagramProfileInfoCardProps,
) => React.ReactNode = ({ profileUrl, profileHandle }) => {
  return (
    <div className="bg-surface rounded-xl shadow-soft p-5 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Link</p>
          <div className="flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-text-secondary" />
            {profileUrl ? (
              <a
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline break-all"
              >
                {profileUrl}
              </a>
            ) : (
              <span className="text-sm text-text-secondary italic">Nenhum link cadastrado</span>
            )}
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Perfil
          </p>
          <p className="text-lg font-bold text-secondary">{profileHandle || '—'}</p>
        </div>
      </div>
    </div>
  );
};
