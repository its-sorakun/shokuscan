# 🍱 ShokuScan

**Built on India's Sarvam AI 🇮🇳**

> ### **The FSSAI might be sleeping, but this app isn't.**

Ever wondered what all those complicated ingredients on the back of your food packaging actually mean? ShokuScan takes the mystery out of packaged foods. By simply scanning a barcode with your phone, ShokuScan instantly provides you with a plain-English breakdown of what you are about to eat.

This project was inspired by recurring concerns around India's food regulation, including delays in front-of-pack nutrition warnings, inconsistent enforcement, contamination controversies, regulatory loopholes, and limited consumer-facing nutritional guidance. Rather than replacing regulators, ShokuScan aims to complement them by giving consumers clearer, AI-powered nutritional insights at the point of purchase.

Powered by **OpenFoodFacts** and India's **Sarvam AI**, ShokuScan analyzes ingredients, explains hidden health risks, and provides recommendations based on strict **World Health Organization (WHO)** guidelines.

> [!WARNING]
> **Legal & Medical Disclaimer:** This app is provided for educational and informational purposes only and does not constitute medical or professional nutritional advice. The nutritional analysis is generated dynamically by AI (Sarvam AI) based on crowdsourced public data (OpenFoodFacts). AI models can make mistakes, so please do not take the results at face value. Always consult a healthcare professional for dietary advice and verify ingredients yourself. The creator of this open-source app assumes no liability for inaccuracies or decisions made based on its output.

---

## 📖 The Story Behind Creation

Since the FSSAI isn't doing enough to protect consumers, there is a massive lack of public awareness about what we are actually eating and which ingredients are truly harmful. 

As someone who lives alone, I frequently have to rely on packaged foods. Whenever I went to the supermarket, I would constantly struggle to figure out which packaged food was actually the healthier option for me. The ingredient lists were full of complex chemical names, and the packaging was always designed to be misleading. 

I realized that if I was struggling with this, millions of others were too. I built ShokuScan to take matters into our own hands. If regulatory bodies won't give us the clear, honest nutritional insights we deserve, this app will!

---

## ✨ Features

* 📷 **Instant Barcode Scanning**: Just point your phone's camera at any food product's barcode.
* 🤖 **AI Nutritional Breakdown**: Get an easy-to-understand analysis of your food.
* 🥗 **WHO Health Assessments**: See how the product stacks up against global health standards.
* 📊 **Practical Comparisons**: We translate complex nutrition facts into things you understand (e.g., *"35g sugar ≈ 7 teaspoons"*).
* ⚠️ **Harmful Ingredient Detection**: We highlight and explain potentially harmful chemicals or preservatives.
* 🌍 **Global Warnings**: See if ingredients in your food are restricted or banned in other countries.
* 🏷️ **Nutri-Score**: Instantly see the European Nutri-Score (A to E) when available.
* 🌗 **Beautiful Dark Mode**: A sleek, easy-on-the-eyes interface.

---

## 📱 How to Install (Android)

ShokuScan is currently available for Android devices.

1. **Download the App**: Go to the [Releases page](https://github.com/its-sorakun/ShokuScan/releases) and download the latest `app-release.apk` file to your phone.
2. **Install**: Tap the downloaded file to install it. (You may need to allow "Install from Unknown Sources" in your Android settings).
3. **Open**: Launch ShokuScan from your app drawer!

---

## 🔑 Setting Up Your AI Key (One-Time Setup)

To keep ShokuScan free and private, it uses a **"Bring Your Own Key" (BYOK)** system. This means you need a free API key from Sarvam AI to unlock the advanced nutritional analysis.

1. Go to the [Sarvam AI Platform](https://sarvam.ai/) and create a free account.
2. Generate an API Key in your Sarvam dashboard.
3. Open **ShokuScan** on your phone.
4. Tap the **Settings (⚙️)** button at the bottom of the screen.
5. Paste your API key into the text box and tap **Save**.

Your key is securely encrypted and stored locally on your device. It is never shared with anyone else. 

*(Note: If you don't enter an API key, ShokuScan will still work as a basic barcode scanner and show you raw ingredient data, but you will miss out on the AI-powered health insights!)*

---

## 💡 How to Use

1. **Launch ShokuScan** on your phone.
2. Tap **"📸 Scan Barcode"**.
3. Align the camera with the barcode on your food packaging.
4. Wait a few seconds for the AI to analyze the ingredients.
5. Read your personalized health report!

---

## 🛡️ Privacy First

ShokuScan respects your privacy. 
- **No Accounts**: You do not need to create an account with us.
- **Local Storage**: Your API key is encrypted and stored safely on your own device.
- **Direct Connection**: The app communicates directly with OpenFoodFacts and Sarvam AI. There are no middleman servers tracking your scans.

---

### Acknowledgements

* **[Sarvam AI](https://sarvam.ai/)** for powering the nutritional intelligence.
* **[OpenFoodFacts](https://world.openfoodfacts.org/)** for the open, crowdsourced food database.
