import { Suspense } from 'react';
import { Metadata } from 'next';
import {
  FilterSidebar,
  FilterTagBar,
  SortingBar,
  ProductGrid,
  Pagination,
  MobileFilterDrawer,
  ProductGridSkeleton,
  FilterSidebarSkeleton,
  SortingBarSkeleton,
} from '@/components/layout/shop/listing';
import {
  getFilteredProducts,
  getFilterOptions,
  ProductFilters,
} from '@/lib/actions/listing.actions';

// Revalidate products page every 5 minutes
export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Products | Shop',
  description: 'Browse our collection of premium products with advanced filtering options.',
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Parse search params into ProductFilters
function parseSearchParams(params: { [key: string]: string | string[] | undefined }): ProductFilters {
  const getString = (key: string): string | undefined => {
    const value = params[key];
    return typeof value === 'string' ? value : undefined;
  };

  const getNumber = (key: string): number | undefined => {
    const value = getString(key);
    return value ? Number(value) : undefined;
  };

  const getBool = (key: string): boolean | undefined => {
    const value = getString(key);
    return value === 'true' ? true : undefined;
  };

  return {
    category: getString('category'),
    minPrice: getNumber('minPrice'),
    maxPrice: getNumber('maxPrice'),
    minWidth: getNumber('minWidth'),
    maxWidth: getNumber('maxWidth'),
    minHeight: getNumber('minHeight'),
    maxHeight: getNumber('maxHeight'),
    minDepth: getNumber('minDepth'),
    maxDepth: getNumber('maxDepth'),
    minReviews: getNumber('minReviews'),
    maxReviews: getNumber('maxReviews'),
    minRating: getNumber('minRating'),
    maxRating: getNumber('maxRating'),
    deals: getBool('deals'),
    search: getString('search'),
    sort: getString('sort'),
    page: getNumber('page') || 1,
    limit: 12,
  };
}

// Server component for product content
async function ProductContent({ filters }: { filters: ProductFilters }) {
  const { products, totalCount, totalPages } = await getFilteredProducts(filters);

  return (
    <>
      <SortingBar totalCount={totalCount} />
      <FilterTagBar className="mt-4" />
      <div className="mt-6">
        <ProductGrid products={products} />
      </div>
      <Pagination currentPage={filters.page || 1} totalPages={totalPages} />
    </>
  );
}

// Loading fallback
function ProductContentLoading() {
  return (
    <>
      <SortingBarSkeleton />
      <div className="flex gap-2 mt-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-8 w-24 rounded-full bg-stone-100 animate-pulse" />
        ))}
      </div>
      <div className="mt-6">
        <ProductGridSkeleton />
      </div>
    </>
  );
}

// Sidebar server component
async function SidebarContent() {
  const filterOptions = await getFilterOptions();

  return (
    <>
      <FilterSidebar filterOptions={filterOptions} className="hidden lg:block shrink-0 sticky top-30" />
      <div className="lg:hidden mb-4">
        <MobileFilterDrawer filterOptions={filterOptions} />
      </div>
    </>
  );
}

// Sidebar loading fallback
function SidebarLoading() {
  return <FilterSidebarSkeleton className="hidden lg:block shrink-0" />;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const filters = parseSearchParams(resolvedParams);

  // Determine page title
  let pageTitle = 'All Products';
  if (filters.deals) {
    pageTitle = 'Deals and Offers';
  } else if (filters.category) {
    pageTitle = filters.category;
  }

  return (
    <div className="min-h-screen bg-stone-50/50">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-stone-900 tracking-tight">{pageTitle}</h1>
          <p className="mt-2 text-stone-500">
            Discover our premium collection with advanced filters to find exactly what you need.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-72 shrink-0">
            <Suspense fallback={<SidebarLoading />}>
              <SidebarContent />
            </Suspense>
          </div>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <Suspense fallback={<ProductContentLoading />}>
              <ProductContent filters={filters} />
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}