import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Category } from '../types/category';
import { ChevronRight } from 'lucide-react';

interface CategoryNavigationProps {
  categories: Category[];
  selectedCategorySlug: string | null;
}

export default function CategoryNavigation({ categories, selectedCategorySlug }: CategoryNavigationProps) {
  const router = useRouter();
  const [categoryPath, setCategoryPath] = useState<Category[]>([]);
  const [currentChildren, setCurrentChildren] = useState<Category[]>([]);

  // Find the full path of categories when selectedCategorySlug changes
  useEffect(() => {
    const findCategoryPath = (cats: Category[], targetSlug: string, path: Category[] = []): Category[] | null => {
      for (const cat of cats) {
        if (cat.slug === targetSlug) {
          return [...path, cat];
        }
        if (cat.children && cat.children.length > 0) {
          const found = findCategoryPath(cat.children, targetSlug, [...path, cat]);
          if (found) return found;
        }
      }
      return null;
    };

    if (selectedCategorySlug) {
      const path = findCategoryPath(categories, selectedCategorySlug);
      if (path) {
        setCategoryPath(path);
        setCurrentChildren(path[path.length - 1].children || []);
      }
    } else {
      setCategoryPath([]);
      setCurrentChildren(categories);
    }
  }, [selectedCategorySlug, categories]);

  const handleCategoryClick = (category: Category) => {
    router.push(`/products?category=${category.slug}`);
  };

  if (currentChildren.length === 0) {
    return null;
  }

  return (
    <div className="w-64 bg-white rounded-lg shadow-sm">
      {/* Categories list */}
      <div className="py-2">
        {currentChildren.map((category) => (
          <button
            key={category._id}
            onClick={() => handleCategoryClick(category)}
            className={`w-full text-left px-4 py-2 text-sm ${
              category.slug === selectedCategorySlug
                ? 'text-sky-600 font-medium'
                : 'text-gray-600 hover:text-sky-600'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
} 