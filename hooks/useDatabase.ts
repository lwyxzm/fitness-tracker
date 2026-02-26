// hooks/useDatabase.ts
import { useEffect, useState } from 'react';
import { initDatabase } from '@/lib/database';

export function useDatabase() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    initDatabase()
      .then(() => setIsReady(true))
      .catch((e) => setError(e));
  }, []);

  return { isReady, error };
}
