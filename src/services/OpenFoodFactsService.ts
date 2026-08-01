/**
 * OpenFoodFacts API service.
 *
 * Direct port of parse_barcode() from services.py.
 * Fetches product data from the OpenFoodFacts v2 API and extracts
 * relevant nutritional fields into a structured interface.
 *
 * All field extraction is done in a single O(n) pass over the product object.
 */

export interface ProductInfo {
  product_name: string;
  brand: string;
  quantity: string;
  serving_size: string;
  nutriscore_grade: string;
  nova_group_processing_score: string | number;
  nutrient_levels: Record<string, string> | string;
  ingredients_text: string;
  allergens: string;
  additives_tags: string[];
  categories: string;
  countries_sold: string;
  labels_and_certifications: string;
  nutritional_chart: Record<string, unknown>;
}

const USER_AGENT =
  'ShokuScan - ReactNative - Version 1.0 (https://github.com/codih/shokuscan)';

/**
 * Fetch and parse product data from OpenFoodFacts.
 *
 * @param barcode - The EAN/UPC barcode string scanned from the product.
 * @returns An object containing either parsed `data` or an `error` message.
 */
export async function fetchProductData(
  barcode: string,
): Promise<{ data?: ProductInfo; error?: string }> {
  const url = `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'User-Agent': USER_AGENT },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return { error: `Product not found in the OpenFoodFacts database (Status 404). Please try scanning a different food item.` };
      }
      return { error: `OpenFoodFacts API returned status ${response.status}` };
    }

    const json = await response.json();

    // Verify if product exists
    const status = String(json.status ?? '');
    const resultId = json.result?.id ?? '';
    if (!['1', 'success'].includes(status) && resultId !== 'product_found') {
      return { error: 'Product not found in OpenFoodFacts database.' };
    }

    const product = json.product;
    if (!product) {
      return {
        error: 'No detailed product information available in the database.',
      };
    }

    // Extract relevant fields in a single O(n) traversal
    const nutritiveData =
      product.nutriments ??
      product.nutrition?.aggregated_set?.nutrients ??
      product.nutrition ??
      {};

    const quantityParts = [
      product.product_quantity ?? '',
      product.product_quantity_unit ?? '',
    ]
      .join(' ')
      .trim();

    const data: ProductInfo = {
      product_name:
        product.product_name ??
        product.product_name_en ??
        product.generic_name ??
        'Unknown Product',
      brand: product.brands ?? 'Not specified',
      quantity: (product.quantity ?? quantityParts) || 'Not specified',
      serving_size: product.serving_size ?? 'Not specified',
      nutriscore_grade:
        product.nutriscore_grade ??
        product.nutrition_grade_fr ??
        'Not available',
      nova_group_processing_score: product.nova_group ?? 'Not available',
      nutrient_levels: product.nutrient_levels ?? 'Not available',
      ingredients_text:
        product.ingredients_text ??
        product.ingredients_text_en ??
        product.ingredients_text_fr ??
        'Not listed',
      allergens:
        product.allergens ??
        product.allergens_from_user ??
        'None listed',
      additives_tags: product.additives_tags ?? [],
      categories: product.categories ?? 'Not specified',
      countries_sold: product.countries ?? 'Not specified',
      labels_and_certifications: product.labels ?? 'None',
      nutritional_chart: nutritiveData,
    };

    return { data };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return { error: `Exception occurred while fetching product info: ${message}` };
  }
}

/**
 * Serialize a ProductInfo object to a JSON string suitable for the LLM prompt.
 */
export function serializeProductInfo(info: ProductInfo): string {
  return JSON.stringify(info, null, 2);
}
