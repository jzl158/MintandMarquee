import { Product } from './types';

// Product image files from ProductImages folder
const productImageFiles = [
  '420_Grinder.png',
  '420_Grinder_a.png',
  'Ancient_Gems.png',
  'Ancient_Pyramids.png',
  'Collectible_LabubuBuddha.png',
  'Collectible_Luffy.png',
  'Collectible_MechaPikachu.png',
  'Custom_1.png',
  'Geometrics_GeometryCube.png',
  'Household_PhoneStand.png',
  'Household_Vase.png',
  'Hypebeast_AstronauntKaws.png',
  'Hypebeast_Bearbrick.png',
  'Hypebeast_Biggie.png',
  'Hypebeast_ChromeHeartsKeychain.png',
  'Hypebeast_KawKeychain.png',
  'Hypebeast_KawsSitting.png',
  'Hypebeast_NikeKaws.png',
  'Jewelry_Crown.png',
  'Sculptures_Nefertiti.png',
  'Web3_BitcoinChain.png',
  'Web3_BitcoinSign.png',
  'Web3_BoredApe.png',
  'Web3_SatoshiStatue.png',
];

// Parse image filename to extract subcategory and product name
function parseImageFilename(filename: string): { subCategory: string; productName: string; isAdditional: boolean; baseKey: string } {
  const nameWithoutExt = filename.replace('.png', '');
  const parts = nameWithoutExt.split('_');

  // Check if last part is a single letter (additional image)
  const lastPart = parts[parts.length - 1];
  const isAdditional = lastPart.length === 1 && /^[a-z]$/i.test(lastPart);

  if (isAdditional) {
    // Remove the letter suffix
    const subCategory = parts[0];
    const productName = parts.slice(1, -1).join('_');
    const baseKey = `${subCategory}_${productName}`;
    return { subCategory, productName, isAdditional, baseKey };
  } else {
    const subCategory = parts[0];
    const productName = parts.slice(1).join('_');
    const baseKey = `${subCategory}_${productName}`;
    return { subCategory, productName, isAdditional, baseKey };
  }
}

// Convert camelCase or compound names to readable display names
function formatDisplayName(name: string): string {
  // Handle cases like "LabubuBuddha" -> "Labubu Buddha"
  // Or "PhoneStand" -> "Phone Stand"
  // Or "GeometryCube" -> "Geometry Cube"
  return name
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space before capital letters
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2') // Handle acronyms
    .trim();
}

// Group images by product
interface ProductGroup {
  subCategory: string;
  productName: string;
  images: string[];
}

function groupProductImages(): Map<string, ProductGroup> {
  const productMap = new Map<string, ProductGroup>();

  for (const filename of productImageFiles) {
    const parsed = parseImageFilename(filename);
    const { baseKey, subCategory, productName } = parsed;

    if (!productMap.has(baseKey)) {
      productMap.set(baseKey, {
        subCategory,
        productName,
        images: [],
      });
    }

    productMap.get(baseKey)!.images.push(`/ProductImages/${filename}`);
  }

  return productMap;
}

// Generate product descriptions based on subcategory and name
function generateDescription(subCategory: string, productName: string): string {
  const displayName = formatDisplayName(productName);

  const descriptions: Record<string, string> = {
    '420': `Premium 3D-printed ${displayName}. Perfect for enthusiasts.`,
    'Ancient': `A beautiful 3D-printed replica of ${displayName}. Bring ancient history to life.`,
    'Collectible': `Highly detailed 3D-printed ${displayName} collectible figure. A must-have for collectors.`,
    'Custom': `Custom 3D-printed design. Unique and one-of-a-kind.`,
    'Geometrics': `Precision 3D-printed ${displayName}. Modern geometric design.`,
    'Household': `Functional 3D-printed ${displayName}. Practical and stylish.`,
    'Hypebeast': `Exclusive 3D-printed ${displayName}. Street culture meets 3D printing.`,
    'Jewelry': `Elegant 3D-printed ${displayName}. Statement piece for any collection.`,
    'Sculptures': `Artistic 3D-printed ${displayName} sculpture. Museum-quality design.`,
    'Web3': `3D-printed ${displayName} celebrating blockchain culture. For crypto enthusiasts.`,
  };

  return descriptions[subCategory] || `Premium 3D-printed ${displayName}.`;
}

// Generate pricing based on subcategory (can be customized)
function generatePrice(subCategory: string): number {
  const basePrices: Record<string, number> = {
    '420': 29.99,
    'Ancient': 39.99,
    'Collectible': 49.99,
    'Custom': 79.99,
    'Geometrics': 34.99,
    'Household': 24.99,
    'Hypebeast': 59.99,
    'Jewelry': 44.99,
    'Sculptures': 54.99,
    'Web3': 49.99,
  };

  return basePrices[subCategory] || 39.99;
}

// Generate all products
function generateProducts(): Product[] {
  const productGroups = groupProductImages();
  const products: Product[] = [];

  for (const [baseKey, group] of productGroups) {
    const { subCategory, productName, images } = group;
    const displayName = formatDisplayName(productName);

    const product: Product = {
      id: baseKey.toLowerCase().replace(/_/g, '-'),
      name: productName,
      displayName,
      subCategory,
      price: generatePrice(subCategory),
      description: generateDescription(subCategory, productName),
      images,
      mainImage: images[0], // First image is the main image
    };

    products.push(product);
  }

  // Sort by subcategory, then by name
  return products.sort((a, b) => {
    if (a.subCategory !== b.subCategory) {
      return a.subCategory.localeCompare(b.subCategory);
    }
    return a.displayName.localeCompare(b.displayName);
  });
}

// Export all products
export const ALL_PRODUCTS = generateProducts();

// Export products by subcategory
export const PRODUCTS_BY_SUBCATEGORY = ALL_PRODUCTS.reduce((acc, product) => {
  if (!acc[product.subCategory]) {
    acc[product.subCategory] = [];
  }
  acc[product.subCategory].push(product);
  return acc;
}, {} as Record<string, Product[]>);

// Get product by ID
export function getProductById(id: string): Product | undefined {
  return ALL_PRODUCTS.find(p => p.id === id);
}

// Get all subcategories
export const ALL_SUBCATEGORIES = Array.from(new Set(ALL_PRODUCTS.map(p => p.subCategory))).sort();
