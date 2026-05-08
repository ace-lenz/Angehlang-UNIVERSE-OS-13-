/**
 * Bio Studio Component
 * Placeholder for BioStudio component
 */
import React from 'react';

export const BioStudio: React.FC<{ data?: any }> = ({ data }) => {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Bio Studio</h1>
      <p>Synthetic Biology Engine</p>
    </div>
  );
};

export default BioStudio;