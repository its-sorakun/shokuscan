# Comprehensive AI Prompt for ShokuScan Mobile App Development

**Objective:**
Develop the ShokuScan mobile application using **React Native CLI (TypeScript)**. This app must be production-ready, fully open-source (compatible with F-Droid's build requirements), and act as the frontend interface for barcode scanning, nutritional analysis, and LLM text generation via Sarvam AI.

**Core Directives for the AI Agent:**
Read the following architecture, functionality, and algorithmic optimization requirements carefully. Implement the solution flawlessly with no omissions.

## 1. System Architecture & Data Flow
Implement a local-first logic flow where the app communicates directly with third-party APIs instead of a centralized backend.

```mermaid
sequenceDiagram
    participant User
    participant App as React Native App
    participant Cache as Local Storage (LRU Cache)
    participant OFF as OpenFoodFacts API
    participant Sarvam as Sarvam AI (LLM)

    User->>App: Opens Camera & Scans Barcode
    App->>App: Throttle/Debounce Scanner Event
    App->>Cache: Check if barcode analysis exists in O(1) time
    alt Cache Hit
        Cache-->>App: Return cached analysis
    else Cache Miss
        App->>OFF: Fetch Product Data (GET /api/v2/product/{barcode}.json)
        OFF-->>App: Return JSON Payload
        App->>App: Extract & structure data, generate LLM prompt
        App->>Cache: Retrieve User's saved Sarvam API Key
        App->>Sarvam: POST /v1/chat/completions (with Prompt + API Key)
        Sarvam-->>App: Return Nutritional Analysis Text
        App->>Cache: Save final analysis to Cache
    end
    App-->>User: Display Analysis Results
```

## 2. Key Features & Implementation Details

### A. Environment & Repository Setup
- **Framework:** React Native CLI (TypeScript). Do not use Expo's EAS cloud builder, as the project must support pure local Android compilation (Gradle) for F-Droid publishing.
- **Gitignore:** Generate a robust `.gitignore` for React Native, Node, Android (e.g., `node_modules/`, `android/app/build/`, `.gradle/`, `*.keystore`, `.env`).

### B. User Settings & API Key Management
- **Context:** The app's developer cannot sponsor API usage for all users. Users must bring their own API keys.
- **Task:** Create a Settings Screen where the user inputs their `Sarvam AI API Key`.
- **Optimization/Security:** Store the API key locally on the device using `react-native-encrypted-storage` or `AsyncStorage`. Ensure it is loaded into memory securely when making API calls.

### C. Barcode Scanning
- Use a highly optimized, native-backed barcode scanning library (e.g., `react-native-camera` or `react-native-vision-camera` with a barcode plugin).
- **Algorithmic Constraint (DAA):** Camera frames fire 30-60 times a second. Implement a **Debounce or Throttle algorithm** to ensure a single barcode is processed only once per session and does not trigger massive concurrent API calls.

### D. Algorithmic Optimizations (DSA)
- **LRU Cache (Least Recently Used):** Implement an in-memory hash map combined with a doubly linked list (or a robust `Map` wrapper) to cache previous barcode scans. If a user scans the same product twice, fetch the result from the local cache in **O(1)** time complexity instead of incurring latency and API costs.
- **Data Parsing:** When parsing the OpenFoodFacts JSON, use O(n) traversals to extract ingredients and macros cleanly without nested loops.

### E. LLM Prompt Construction (Business Logic)
- Replicate the core logic: take the parsed OpenFoodFacts data (Product Name, Brand, Nutriments, Ingredients, Nutri-score, Nova Group).
- Formulate the WHO-standard-based prompt requesting classification (Healthy/Unhealthy), practical sugar/salt consumption analogs, and highlight harmful ingredients.
- Hit `https://api.sarvam.ai/v1/chat/completions` directly via `fetch()` using the user's injected `api-subscription-key`. Set a timeout of `120000ms` and `max_tokens: 1500`.

## 3. Execution Instructions for the AI
1. Initialize the React Native CLI project.
2. Build the navigation structure (Home/Scanner Screen, Settings Screen, Results Screen).
3. Implement the `LRUCache` class for caching responses.
4. Implement the Scanner component with the debounce wrapper.
5. Implement the API integration layers (`OpenFoodFactsService`, `SarvamService`).
6. Apply robust Error Handling (Timeout handling, invalid API key handling, missing product fallbacks).
7. Execute the final commit.

## 4. Final Git Commit Message Requirement
At the end of your implementation, write a git commit message with the following exact style:

```text
feat: implement native ShokuScan RN mobile client with BYOK support

- Integrate native barcode scanner with event debouncing and O(1) LRU caching to minimize API latency.
- Implement 'Bring Your Own Key' (BYOK) secure local storage for Sarvam AI to eliminate centralized API costs.
- Bridge OpenFoodFacts data extraction directly to Sarvam REST completions with F-Droid compliant local build configurations.
```

DO NOT EXECUTE ANY GIT COMMAND AND MAKE NO MISTAKE.
