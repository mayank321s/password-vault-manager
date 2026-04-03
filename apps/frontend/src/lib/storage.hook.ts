import { useEffect, useState } from 'react';
import { getUserKeys, UserKeyData } from './storage';

export const useUserStore = () => {
  const [state, setState] = useState<UserKeyData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getUserKeys();
        setState(data);
      } catch (error) {
        console.error('Error fetching data from storage:', error);
      }
    };
    fetchData();
  }, []);

  return state;
};
