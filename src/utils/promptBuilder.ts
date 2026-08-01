/**
 * Constructs the WHO-standard-based LLM prompt for nutritional analysis.
 *
 * This is a direct port of the Python prompt from services.py.
 * It takes structured product information (JSON string) and wraps it
 * in the analysis instructions for Sarvam AI.
 */
export function buildPrompt(productInfo: string): string {
  return `"Review the provided product information carefully, and feel free to supplement your analysis with your existing knowledge base. Then, based on the details you find, do the following:

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
    food product information: ${productInfo}

    the product information is given to you in json format, understand the json file and then work in it like it should be done. 
    do not respond with 'no information available.' if the product information is not found, instead respond with 'no information available.'

    "`;
}
