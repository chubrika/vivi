import { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata } from '../../utils/seo';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vivi.ge';

export const productsMetadata: Metadata = generateSEOMetadata({
  title: 'პროდუქტები - vivi.ge',
  description: 'იპოვეთ ყველაზე კარგი პროდუქტები vivi.ge-ზე. ფართო არჩევანი, საუკეთესო ფასები და სწრაფი მიტანა.',
  url: `${siteUrl}/products`,
});

