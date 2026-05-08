import { useState } from 'react';

export function usebook() {
  const [data, setData] = useState(null);
  return { data, setData };
}

export default usebook;