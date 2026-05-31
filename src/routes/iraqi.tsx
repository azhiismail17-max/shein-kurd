import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import IraqiApp from '@/iraqi/IraqiApp';

export const Route = createFileRoute('/iraqi')({
  ssr: false,
  head: () => ({
    meta: [
      { title: 'Shein Iraqi' },
      { name: 'description', content: 'Shein Iraqi system' },
    ],
  }),
  component: IraqiPage,
});

function IraqiPage() {
  const [iraqiRole, setIraqiRole] = useState<string | null>(null);

  useEffect(() => {
    // Bounce non-owner Kurdistani users who poke /iraqi directly.
    const kurdRole = localStorage.getItem('auth_role');
    if (kurdRole && kurdRole !== 'owner') {
      window.location.href = '/';
      return;
    }
    if (kurdRole === 'owner' && !localStorage.getItem('iraqi_auth_role')) {
      localStorage.setItem('iraqi_auth_role', 'owner');
      localStorage.setItem('iraqi_auth_username', localStorage.getItem('auth_username') || 'owner');
    }
    setIraqiRole(localStorage.getItem('iraqi_auth_role'));
    const onStorage = () => setIraqiRole(localStorage.getItem('iraqi_auth_role'));
    window.addEventListener('storage', onStorage);
    const interval = setInterval(onStorage, 1000);
    return () => { window.removeEventListener('storage', onStorage); clearInterval(interval); };
  }, []);

  return (
    <div className="iraqi-theme min-h-screen">
      <IraqiApp />
    </div>
  );
}
