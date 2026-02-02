import { Metadata } from 'next';
import { fetchWidgetGroups, fetchHomeSliders, fetchFeaturedProducts } from '@/src/lib/api';
import { generateMetadata as generateSEOMetadata } from '@/src/utils/seo';
import HomeClient from './HomeClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vivi.ge';

export const metadata: Metadata = generateSEOMetadata({
  title: 'vivi.ge - თქვენი ონლაინ მაღაზია',
  description:
    'vivi.ge - თქვენი ონლაინ მაღაზია. იპოვეთ ყველაზე კარგი პროდუქტები საუკეთესო ფასებით. სწრაფი მიტანა და უსაფრთხო გადახდები.',
  url: siteUrl,
});

export default async function Home() {
  const [widgetGroupsRaw, ,] = await Promise.all([
    fetchWidgetGroups(),
    fetchHomeSliders(),
    fetchFeaturedProducts(),
  ]);
  const initialWidgetGroups = Array.isArray(widgetGroupsRaw)
    ? widgetGroupsRaw
    : [];

  return (
    <HomeClient
      initialWidgetGroups={initialWidgetGroups}
    />
  );
}
