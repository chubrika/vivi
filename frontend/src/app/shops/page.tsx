import { fetchSellersPublic } from '@/src/lib/api';
import ShopsListClient from './ShopsListClient';

export default async function ShopsPage() {
  const sellers = await fetchSellersPublic();
  return <ShopsListClient initialSellers={sellers} />;
}
