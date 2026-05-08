/**
 * Bio hooks
 */
import { useState } from 'react';

export function usebio() {
  const [data, setData] = useState(null);
  return { data, setData };
}

export default usebio;