# Klang Valley Transit Pulse 🚄🏙️

## Spatio-Temporal Visualization & AI Trend Analysis

Welcome to the **Klang Valley Transit Pulse**! This is a modern, single-page web application designed to visualize transit flows and analyze trends across key locations in Kuala Lumpur and the Klang Valley. It combines interactive maps, real-time data simulation, and Generative AI to provide insights into urban mobility.

---

## 📚 Table of Contents
1. [Introduction](#introduction)
2. [Phase 1: Planning & Architecture](#phase-1-planning--architecture)
3. [Phase 2: Creation & Code Structure](#phase-2-creation--code-structure)
4. [Phase 3: Setup & Installation](#phase-3-setup--installation)
5. [How to Use](#how-to-use)

---

## Introduction

This project simulates a "Digital Twin" of the Klang Valley transit network. It allows users to:
*   **Visualize Traffic**: See passenger movements on both a schematic subway map and a real-world geographic map.
*   **Control Time**: Scrub through a 24-hour cycle to see how traffic peaks during rush hours and drops at night.
*   **Analyze Trends**: View charts for ridership, sentiment, and density heatmaps.
*   **AI Insights**: Ask Google's Gemini AI to analyze the current traffic snapshot and generate a city planner's report.

---

## Phase 1: Planning & Architecture

Before writing a single line of code, we designed the system based on three pillars:

### 1. The Concept
We needed a way to represent **Spatio-Temporal** data (Space + Time).
*   **Space**: Represented by nodes (stations/attractions) and links (transit lines).
*   **Time**: A global clock (00:00 - 23:00) that drives the simulation state.

### 2. The Tech Stack
*   **React 18**: For a responsive, component-based UI.
*   **TypeScript**: To ensure data consistency (strictly typing our Nodes and Links).
*   **Tailwind CSS**: For rapid, beautiful styling using a unified Design System (Oklch colors).
*   **D3.js**: For the custom, animated "Schematic Map" (subway style).
*   **Leaflet**: For the real-world "Geospatial Map".
*   **Recharts**: For statistical graphs (Area charts, Bar charts).
*   **Google Gemini API**: To act as the "Intelligence Layer", creating narrative reports from raw numbers.

### 3. Data Simulation Strategy
Since we don't have live API access to KL Rapid transit data, we built a **Simulation Engine**:
*   **Nodes**: Static locations (e.g., KL Sentral, Batu Caves) with `lat`, `lng`, and `basePopularity`.
*   **Traffic Function**: A mathematical formula using Bell Curves to simulate Morning Peak (8 AM) and Evening Peak (6 PM).
*   **Agent Animation**: Particles moving along lines to represent flow intensity.

---

## Phase 2: Creation & Code Structure

Here is how the project is built, file by file. This is useful if you want to modify it.

### 📂 Core Files

*   **`index.html`**: The entry point. It loads fonts (`DM Sans`), Tailwind CSS, and Leaflet styles. It defines the CSS variables for our theme.
*   **`index.tsx`**: The React mounter. It simply renders the `App` component into the DOM.
*   **`types.ts`**: The "Dictionary". It defines what a `MapNode`, `MapLink`, or `HourlyData` looks like. This ensures all components speak the same language.
*   **`constants.ts`**: The "Database". It contains the hardcoded list of stations (KL Sentral, KLCC, etc.) and the connections between them.

### 🧩 Components

#### 1. `App.tsx` (The Brain)
*   **Role**: Orchestrator.
*   **Function**: It holds the `currentTime` state. It calculates the traffic for *every* node based on that time and passes this data down to the maps and charts.
*   **Key Logic**: Contains the `setInterval` loop that makes the clock tick when "Play" is clicked.

#### 2. `components/SpatioMap.tsx` (The Artist)
*   **Role**: Visualizer (Schematic).
*   **Tech**: D3.js.
*   **Logic**: It draws an SVG. It calculates the `x/y` coordinates of stations. It creates the moving "dots" (agents) along the lines. The number of dots is directly tied to the `traffic` prop.

#### 3. `components/GeoMap.tsx` (The Navigator)
*   **Role**: Visualizer (Geographic).
*   **Tech**: Leaflet + OpenStreetMap.
*   **Logic**: Renders a real map tile layer. It draws `Polylines` for transit routes and places `Markers` at specific Lat/Lng coordinates.

#### 4. `components/TrendPanel.tsx` (The Analyst)
*   **Role**: Data Dashboard.
*   **Tech**: Recharts.
*   **Logic**:
    *   **Trend Tab**: Shows a 24-hour area chart of ridership.
    *   **Compare Tab**: A bar chart ranking the busiest stations at the current hour.
    *   **Density Tab**: A heatmap grid showing the entire day's schedule at a glance.

#### 5. `services/geminiService.ts` (The Intelligence)
*   **Role**: AI Client.
*   **Logic**: It constructs a text prompt: *"It is 8:00 AM, traffic is 85/100 at KL Sentral. Analyze this."* It sends this to Gemini 2.5 Flash and returns a structured JSON report.

---

## Phase 3: Setup & Installation

Follow these steps to get this running on your local machine.

### Prerequisites
1.  **Node.js**: Installed on your computer.
2.  **API Key**: A Google Gemini API Key. Get one at [aistudio.google.com](https://aistudio.google.com/).

### Installation Steps

1.  **Create Project Folder**:
    Create a new folder and place all the provided files (`App.tsx`, `index.html`, etc.) inside.

2.  **Install Dependencies**:
    Since this code is designed for a build-less environment (like the one you are viewing this in), it usually runs directly via ES Modules in the browser.
    
    *However, if you are setting up a standard React environment (Create React App or Vite):*
    ```bash
    npm create vite@latest klang-valley-pulse -- --template react-ts
    cd klang-valley-pulse
    npm install
    npm install @google/genai lucide-react recharts d3 leaflet @types/d3 @types/leaflet
    ```

3.  **Environment Variable**:
    Create a `.env` file in your root directory:
    ```env
    VITE_API_KEY=your_actual_gemini_api_key_here
    ```
    *(Note: In the code provided, `process.env.API_KEY` is used. In Vite, use `import.meta.env.VITE_API_KEY` and update the service file accordingly).*

4.  **Run the App**:
    ```bash
    npm run dev
    ```
    Open your browser to `http://localhost:5173`.

---

## How to Use

1.  **Explore the Map**:
    *   Toggle between **Schematic** (Abstract) and **Geospatial** (Real) views using the buttons on the top left of the map.
    *   Click on any station (e.g., "KLCC") to highlight it.

2.  **Time Travel**:
    *   Use the slider at the top right to change the time of day.
    *   Notice how the "Traffic Intensity" (Area Chart) and "Particle Speed" (Map) change. 8 AM and 6 PM are the busiest!

3.  **Analyze**:
    *   Look at the Right Panel. Switch between "Trend", "Compare", and "Density" tabs.
    *   Click the **"Generate Report"** button. Wait for Gemini to write a personalized analysis of the current traffic situation.

---

## Customization

Want to add your own city?
1.  Open `constants.ts`.
2.  Update `KLANG_VALLEY_NODES` with your city's stations and coordinates.
3.  Update `NETWORK_LINKS` to connect them.
4.  The rest of the app will automatically adapt to your new data!

Enjoy building your digital twin! 🚀
