import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Proposal } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { IconButton, TrashIcon, ArchiveIcon, UnarchiveIcon } from '../ui';
import { PROPOSAL_STATUS_CLASSES } from '../../constants';

export const ProposalListItem: (props: {
  proposal: Proposal;
  onDelete: (proposal: Proposal) => void;
  onArchive: (proposal: Proposal) => void;
  onUnarchive: (proposal: Proposal) => void;
  isArchived?: boolean;
  hasProject: boolean;
  linkedProjectCode?: string;
}) => React.ReactNode = React.memo(
  ({ proposal, onDelete, onArchive, onUnarchive, isArchived, hasProject, linkedProjectCode }) => {
    const navigate = useNavigate();
    const statusClass = PROPOSAL_STATUS_CLASSES[proposal.status];

    const handleNavigate = () => {
      navigate(`/propostas/${proposal.id}`);
    };

    return (
      <div
        onClick={handleNavigate}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleNavigate();
          }
        }}
        role="button"
        tabIndex={0}
        className={`bg-surface rounded-xl shadow-soft transition-all duration-300 ease-in-out group ${isArchived ? 'opacity-70 bg-background dark:bg-surface/50' : ''} hover:shadow-lg hover:-translate-y-px cursor-pointer`}
      >
        <div className="p-5 flex justify-between items-center">
          <div className="flex items-center gap-4 flex-1 truncate">
            <div className="truncate">
              <p className="font-serif text-2xl font-semibold text-secondary truncate group-hover:underline">
                {proposal.name}
              </p>
              <div className="flex items-center gap-2">
                <p className="text-sm text-text-secondary">
                  {proposal.code} &bull; {proposal.date}
                </p>
                {linkedProjectCode && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.06a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.34 8.636"
                      />
                    </svg>
                    {linkedProjectCode}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 ml-4">
            <div className="text-right hidden sm:block">
              <p className="font-sans font-bold text-lg text-text-primary">
                {formatCurrency(proposal.total)}
              </p>
            </div>
            <span
              className={`px-3 py-1 text-xs font-bold rounded-full min-w-[90px] text-center ${statusClass.bg} ${statusClass.text}`}
            >
              {proposal.status}
            </span>
            <div className="flex items-center gap-1 transition-opacity">
              {isArchived ? (
                <IconButton
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUnarchive(proposal);
                  }}
                  aria-label="Desarquivar"
                  title="Desarquivar"
                >
                  <UnarchiveIcon className="w-5 h-5" />
                </IconButton>
              ) : (
                <IconButton
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchive(proposal);
                  }}
                  aria-label="Arquivar"
                  title="Arquivar"
                >
                  <ArchiveIcon className="w-5 h-5" />
                </IconButton>
              )}
              {!hasProject && (
                <IconButton
                  variant="danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(proposal);
                  }}
                  aria-label="Excluir"
                  title="Excluir"
                >
                  <TrashIcon className="w-5 h-5" />
                </IconButton>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
);
