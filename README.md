# ShokuScan - Food Barcode Scanner with AI-Powered Nutrition Analysis

**ShokuScan** is a smart food scanner that helps you make healthier choices by analyzing food products through their barcodes. Simply scan any food product's barcode and get instant nutritional insights powered by India's own SarvamAI.

## What ShokuScan Does

- **Scan Food Barcodes**: Use your device camera to scan any food product barcode
- **Instant Health Analysis**: Get AI-powered assessment of whether a product is healthy or unhealthy
- **Detailed Nutrition Info**: View complete nutritional charts with practical explanations (e.g., "35g sugar = 7 teaspoons")
- **Harmful Ingredient Detection**: Learn about potentially harmful ingredients and their health impacts
- **Regulatory Warnings**: Get alerts if products are banned in certain countries
- **WHO-Based Standards**: All health assessments follow World Health Organization guidelines

## Features

- 📱 **Easy Barcode Scanning** - Works with any device camera
- 🤖 **AI-Powered Analysis** - Uses India's own SarvamAI for intelligent nutrition insights
- 🌙 **Dark/Light Theme** - Comfortable viewing in any lighting
- 📊 **Practical Context** - Nutritional values explained in real-world terms
- 🚨 **Health Alerts** - Warnings about banned products and harmful ingredients
- 🌍 **Global Database** - Access to millions of products via OpenFoodFacts

## Quick Start Guide

### Option 1: Using the Web Application

1. **Open the Application**
   - If you have the application running, open your web browser and go to the provided URL
   - Or if running locally, go to `http://localhost:5000`

2. **Scan a Barcode**
   - Click the "Scan Barcode" button
   - Allow camera access when prompted
   - Point your camera at any food product barcode
   - The app will automatically detect and scan the barcode

3. **View Results**
   - Get instant health assessment (Healthy/Unhealthy)
   - Read detailed nutritional analysis
   - Check for harmful ingredients and regulatory warnings

### Option 2: Running Locally (Windows)

1. **Install Python** (if not already installed)
   - Download from python.org

2. **Install Required Packages**
   ```bash
   pip install flask flask-cors flask-restx requests python-dotenv openai
   ```

3. **Set Up API Key**
   - Get your SarvamAI API key from sarvam.ai
   - Create a `.env` file in the project directory
   - Add your API key: `SERVAMAI_API_KEY=your_api_key_here`

4. **Run the Application**
   - Double-click `foodscanner.bat` to start
   - Or run manually:
     ```bash
     python foodscan.py
     ```

5. **Access the App**
   - Open your browser to `http://localhost:5000`

## How to Use

1. **Launch the App** - Open the web application
2. **Enable Camera** - Click "Scan Barcode" and allow camera access
3. **Align Barcode** - Position the product barcode within the camera frame
4. **Wait for Analysis** - The app will automatically scan and analyze the product
5. **Review Results** - Read the health assessment and nutritional information
6. **Toggle Theme** - Use the theme button (top-right) to switch between dark/light mode

## Understanding Your Results

- **Health Label**: Quick assessment showing if the product is healthy or unhealthy
- **Nutritional Chart**: Complete breakdown of calories, macronutrients, and micronutrients
- **Practical Equivalents**: Nutritional values converted to real-world measurements (e.g., teaspoons of sugar)
- **Harmful Ingredients**: List of concerning ingredients with health impact explanations
- **Regulatory Info**: Alerts if the product is banned or restricted in any countries
- **Nutri-Score**: Incorporates the official Nutri-Score rating (A-E) when available

## Tips for Best Results

- Ensure good lighting when scanning barcodes
- Hold the device steady and at an appropriate distance
- Make sure the barcode is fully visible in the camera frame
- Wait for the camera to focus before scanning
- If scanning fails, try adjusting the angle or distance

## Privacy & Data

- Your camera feed is processed locally on your device
- Scanned barcodes are sent to OpenFoodFacts API for product lookup
- Nutritional analysis is processed by SarvamAI
- No personal data is stored or shared

## Troubleshooting

**Camera not working?**
- Check that you've allowed camera access in your browser
- Try refreshing the page and granting permission again
- Ensure no other app is using your camera

**Barcode not scanning?**
- Improve lighting conditions
- Hold the device steady
- Try scanning from a different angle
- Ensure the barcode is not damaged or obscured

**No product information found?**
- The product might not be in the OpenFoodFacts database
- Try scanning a different product
- Some regional products may not be available

## Technology

- **Powered by SarvamAI** - India's own AI platform for intelligent nutritional analysis
- **OpenFoodFacts** - World's largest open food database
- **ZXing Library** - Industry-standard barcode scanning technology

## Support

For issues or questions, please visit the project repository or contact the development team.

---

**Made with ❤️ for healthier living**
