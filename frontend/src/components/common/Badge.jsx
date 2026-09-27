import React from 'react';

export function Badge({ status, text }) {
  if (!status) return null;

  const normalized = String(status).toLowerCase();
  const displayText = text || status.replace(/_/g, ' ');

  let badgeClass = `badge badge-${normalized}`;

  return <span className={badgeClass}>{displayText}</span>;
}
