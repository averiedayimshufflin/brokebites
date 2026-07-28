import { NextResponse } from "next/server";

type OpenFoodFactsProduct = {
  product?: {
    product_name?: string;
    product_name_en?: string;
    generic_name?: string;
    brands?: string;
    categories_tags?: string[];
  };
  status?: string;
};

function inferPantryCategory(productName: string, categoryTags: string[] = []) {
  const searchableText = `${productName} ${categoryTags.join(" ")}`.toLowerCase();

  if (/cheese|milk|yogurt|dairy/.test(searchableText)) return "Dairy";
  if (/meat|chicken|beef|fish|egg|tofu|beans|protein/.test(searchableText)) return "Protein";
  if (/vegetable|tomato|lettuce|carrot|broccoli|corn|peas/.test(searchableText)) return "Vegetable";
  if (/fruit|apple|banana|berry|orange|grape/.test(searchableText)) return "Fruit";
  if (/sauce|salsa|dressing|condiment/.test(searchableText)) return "Sauce";
  if (/spice|seasoning|salt|pepper/.test(searchableText)) return "Seasoning";
  if (/snack|chips|crackers|cookies|popcorn/.test(searchableText)) return "Snack";
  if (/pasta|rice|noodle|cereal|bread|grain|macaroni/.test(searchableText)) return "Grain";

  return "Other";
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ barcode: string }> }
) {
  const { barcode } = await context.params;
  const cleanBarcode = barcode.trim();

  if (!/^\d{6,18}$/.test(cleanBarcode)) {
    return NextResponse.json(
      { error: "Enter a valid barcode number." },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v3/product/${cleanBarcode}?fields=product_name,product_name_en,generic_name,brands,categories_tags`,
      {
        headers: {
          "User-Agent": "BrokeBites/1.0 (https://github.com/averiedayimshufflin/brokebites)",
        },
        next: { revalidate: 86_400 },
      }
    );

    if (response.status === 404) {
      return NextResponse.json(
        { error: "OpenFoodFacts could not find that barcode." },
        { status: 404 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: "OpenFoodFacts did not respond. Try again in a moment." },
        { status: 502 }
      );
    }

    const data = (await response.json()) as OpenFoodFactsProduct;
    const product = data.product;
    const productName =
      product?.product_name_en || product?.product_name || product?.generic_name;

    if (!productName) {
      return NextResponse.json(
        { error: "That barcode exists, but it does not have a product name yet." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      barcode: cleanBarcode,
      name: productName.trim(),
      brand: product?.brands?.split(",")[0]?.trim() || "",
      category: inferPantryCategory(productName, product?.categories_tags),
    });
  } catch {
    return NextResponse.json(
      { error: "Could not reach OpenFoodFacts. Check your connection and try again." },
      { status: 502 }
    );
  }
}
