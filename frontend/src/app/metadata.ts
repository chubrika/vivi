import { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata } from '../utils/seo';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vivi.ge';

export const homeMetadata: Metadata = generateSEOMetadata({
  title: 'vivi.ge - თქვენი ონლაინ მაღაზია',
  description: 'vivi.ge - თქვენი ონლაინ მაღაზია. იპოვეთ ყველაზე კარგი პროდუქტები საუკეთესო ფასებით. სწრაფი მიტანა და უსაფრთხო გადახდები.',
  url: siteUrl,
});

