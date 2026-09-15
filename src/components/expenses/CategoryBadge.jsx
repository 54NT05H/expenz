import React from 'react';
import { CATEGORY_COLOR_MAP } from '../../utils/constants';

export const CategoryBadge = ({ category }) => {
  const color = CATEGORY_COLOR_MAP[category] || '#6b7280';

  return (
    <span
      className="badge"
      style={{
        backgroundColor: `${color}18`,
        color: color,
        border: `1px solid ${color}35`,
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: color,
        }}
      />
      {category}
    </span>
  );
};
