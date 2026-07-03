import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

export function useOnline(): boolean {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      setOnline(state.isConnected ?? false);
    });
    NetInfo.fetch().then((state) => setOnline(state.isConnected ?? false));
    return () => unsub();
  }, []);

  return online;
}
