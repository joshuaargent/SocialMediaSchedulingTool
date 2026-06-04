'use client';

import { useEffect } from 'react';
import { usePlatformStore } from '@/stores/platformStore';

export function DatabaseSync() {
  const { connections, addConnection } = usePlatformStore();

  useEffect(() => {
    const syncFromDatabase = async () => {
      try {
        const response = await fetch('/api/platforms/connections');
        const data = await response.json();
        
        if (data.connections && data.connections.length > 0) {
          data.connections.forEach((conn: any) => {
            const exists = connections.some(c => c.platform === conn.platform);
            if (!exists) {
              addConnection({
                platform: conn.platform,
                accessToken: conn.accessToken,
                refreshToken: conn.refreshToken,
                platformUserId: conn.platformUserId,
                platformUsername: conn.displayName,
                platformProfileImage: conn.profileImage,
                organizationId: conn.organizationId,
              });
            }
          });
        }
      } catch (error) {
        console.error('Failed to sync connections from database:', error);
      }
    };

    syncFromDatabase();
  }, [connections, addConnection]);

  return null;
}
