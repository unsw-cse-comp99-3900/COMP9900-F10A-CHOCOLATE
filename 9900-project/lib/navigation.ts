import { useRouter } from 'next/navigation';

export async function handleRedirectAfterAuth(user: any, router: any) {
  if (user.role === 'CUSTOMER') {
    router.push('/');
  } else if (user.role === 'FARMER') {
    try {
      const res = await fetch('http://localhost:5001/api/stores');
      const stores = await res.json();
      const hasStore = stores.some((store: any) => store.ownerId === user.id);

      if (hasStore) {
        router.push('/landing_famer_store');
      } else {
        router.push('/landing_famer_nostore');
      }
    } catch (error) {
      console.error('Store fetch failed:', error);
      router.push('/landing_famer_nostore');
    }
  } else {
    router.push('/');
  }
}
