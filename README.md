# 🍱 ShokuScan

> AI-powered packaged food analyzer powered by India's Sarvam AI.

ShokuScan is a web application that analyzes packaged food products by scanning their barcodes. It retrieves product information from **OpenFoodFacts** and uses **Sarvam AI** to generate easy-to-understand nutritional insights, explain ingredient safety, and provide health assessments based on **World Health Organization (WHO)** guidelines.

---

## Features

* 📷 Scan packaged food barcodes using your device camera
* 🤖 AI-generated nutritional analysis powered by Sarvam AI
* 🥗 Health assessment based on WHO recommendations
* 📊 Nutrition facts explained in practical terms

  * Example: **35 g sugar ≈ 7 teaspoons**
* ⚠️ Detect potentially harmful ingredients
* 🌍 View regulatory warnings for ingredients restricted or banned in different countries
* 🏷️ Display Nutri-Score (A to E) when available
* 🌗 Dark and Light theme support

---

## Installation

Clone the repository:

```bash
git clone https://github.com/its-sorakun/ShokuScan.git
cd ShokuScan
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file:

```env
SARVAMAI_API_KEY=your_api_key_here
```

Run the application:

```bash
python foodscan.py
```

Open your browser:

```text
http://localhost:5000
```

---

## Usage

1. Launch the application.
2. Allow camera access.
3. Scan a packaged food barcode.
4. Wait for the product information to be retrieved.
5. View the generated nutritional analysis.

---

## Analysis Includes

* Overall health assessment
* Nutritional information
* Macronutrients and micronutrients
* Practical nutritional equivalents
* Harmful ingredient explanations
* Regulatory warnings
* Nutri-Score (when available)

---

## Acknowledgements

* **Sarvam AI** for nutritional analysis
* **OpenFoodFacts** for the open food database
* **ZXing** for barcode scanning
