/**
 * Browser hooks
 */
import { useState } from 'react';

export function usebrowser() {
  const [data, setData] = useState(null);
  return { data, setData };
}

export default usebrowser;