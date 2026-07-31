import json
import requests
import os
# from openai import OpenAI
from utils import get_openai_client

def parse_barcode(barcode: str) -> str:
    """Fetch product info from OpenFoodFacts API and return structured product details."""
    url = f"https://world.openfoodfacts.org/api/v2/product/{barcode}.json"
    print(url)
    headers = {
        "User-Agent": "ShokuScan - Python - Version 1.0 (https://github.com/codih/shokuscan)"
    }
    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code != 200:
            return f"Error connecting to OpenFoodFacts API: Status code {response.status_code}"
        
        data = response.json()
        with open("data.json", "w") as f:
            json.dump(data, f, indent=2)
        
        # Verify if product exists
        status = str(data.get("status", ""))
        result_id = data.get("result", {}).get("id", "")
        if status not in ["1", "success"] and result_id != "product_found":
            return "Product not found in OpenFoodFacts database."
            
        product = data.get("product", {})
        if not product:
            return "No detailed product information available in the database."
            
        # Extract relevant fields for accurate nutritional analysis
        nutritive_data = product.get("nutriments") or product.get("nutrition", {}).get("aggregated_set", {}).get("nutrients") or product.get("nutrition", {})
        
        extracted_info = {
            "product_name": product.get("product_name") or product.get("product_name_en") or product.get("generic_name") or "Unknown Product",
            "brand": product.get("brands", "Not specified"),
            "quantity": product.get("quantity") or f"{product.get('product_quantity', '')} {product.get('product_quantity_unit', '')}".strip() or "Not specified",
            "serving_size": product.get("serving_size", "Not specified"),
            "nutriscore_grade": product.get("nutriscore_grade") or product.get("nutrition_grade_fr") or "Not available",
            "nova_group_processing_score": product.get("nova_group", "Not available"),
            "nutrient_levels": product.get("nutrient_levels", "Not available"),
            "ingredients_text": product.get("ingredients_text") or product.get("ingredients_text_en") or product.get("ingredients_text_fr") or "Not listed",
            "allergens": product.get("allergens") or product.get("allergens_from_user") or "None listed",
            "additives_tags": product.get("additives_tags", []),
            "categories": product.get("categories", "Not specified"),
            "countries_sold": product.get("countries", "Not specified"),
            "labels_and_certifications": product.get("labels", "None"),
            "nutritional_chart": nutritive_data
        }
        
        return json.dumps(extracted_info, indent=2, ensure_ascii=False)
    except Exception as e:
        return f"Exception occurred while fetching product info: {str(e)}"

def analyze_nutrition(product_info: str) -> str:
    """Send product info to OpenAI and return nutritional analysis."""
    client = get_openai_client()
    prompt = f"""
"Review the provided product information carefully, and feel free to supplement your analysis with your existing knowledge base. Then, based on the details you find, do the following:

Label the food product as 'healthy' or 'unhealthy.'

Provide a concise explanation for your decision, including any nutritional values mentioned. If a nutri-score (ranging from A to E) is provided, incorporate it into your analysis and justify how it influences your assessment.

Include the food product's name in your response.

If nutritional details are available:

Present the original nutritional chart as provided.

Provide a detailed nutritional analysis, converting the nutritional values proportionally according to the product's total weight (if mentioned) for better clarity along with the original nutritional chart.

Identify any harmful ingredients present in the product and explain their potential health impacts. Base this decision on the quantity of ingredients relative to the product's total weight, as specified in the nutrition chart. Avoid labeling a product as unhealthy solely due to the presence of an ingredient unless its quantity is significant. Also provide the result in more practical sense, for example if a product has 35g of sugar per 250ml serving, then how much sugar the person is consuming in real life like how much spoon of sugar, etc. This should be done based on the nutritional chart.

If the product has been banned in certain countries or conflicted with any country's laws, mention this along with the relevant details. Use your existing knowledge to identify this information if it's not provided.
                  
Use WHO standards to base your decision.

If no relevant product details are found, simply respond with 'no information available.'
    food product information: {product_info}

    the product information is given to you in json format, understand the json file and then work in it like it should be done. 
    do not respond with 'no information available.' if the product information is not found, instead respond with 'no information available.'

    """

    # ── DEBUG: print the product data and full prompt to console and file ──
    print("\n" + "="*60)
    print("DEBUG ► product_info being sent to LLM:")
    print("="*60)
    print(product_info)
    print("="*60)
    print("DEBUG ► Full prompt character count:", len(prompt))
    print("="*60 + "\n")

    with open("prompt_debug.txt", "w", encoding="utf-8") as f:
        f.write("=== PRODUCT INFO ===\n")
        f.write(product_info)
        f.write("\n\n=== FULL PROMPT ===\n")
        f.write(prompt)
    # ── END DEBUG ──

    response = client.chat.completions.create(
        model="sarvam-105b",
        messages=[{"role": "user", "content": prompt}]
    )
    content = response.choices[0].message.content if response.choices else None
    return content.strip() if content else "No analysis returned."
