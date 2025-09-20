import React from 'react';
import { useNavigate } from 'react-router-dom';

interface OldJournalBannerProps {
  planDate: string;
}

export const OldJournalBanner: React.FC<OldJournalBannerProps> = ({ planDate }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/ledger');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  // Format the plan date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if it's yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return "yesterday's";
    }

    // For older dates, show the formatted date
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const isYesterday = () => {
    const date = new Date(planDate);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return date.toDateString() === yesterday.toDateString();
  };

  const bannerText = isYesterday() 
    ? "You're viewing yesterday's journal. Plan tasks now to start today's session."
    : `You're viewing your ${formatDate(planDate)} journal. Plan tasks to start today's session.`;

  return (
    <div
      role="button"
      aria-label="Plan tasks for today"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="bg-amber-500/10 border border-amber-500/20 border-b-0 text-amber-500 rounded-t-xl p-2 text-xs cursor-pointer hover:bg-amber-500/20 transition-colors text-center"
    >
      {bannerText}
    </div>
  );
};
