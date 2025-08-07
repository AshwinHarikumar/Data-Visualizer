# AI-Powered Data Visualizer from PDF

This is a web application that leverages Google's Gemini AI to extract structured data from a PDF document. The extracted data is then presented in an interactive dashboard with tables, pie charts, and bar charts for easy visualization and analysis.

![Data Visualizer Screenshot](<placeholder_for_screenshot.png>)

## Features

- **PDF Upload**: Easily upload a PDF document containing tabular data.
- **AI-Powered Data Extraction**: Uses Google Gemini to intelligently parse and structure data from the PDF.
- **Interactive Dashboard**: View the extracted data in multiple formats.
- **Multiple Views**:
  - **Table View**: See the raw, structured data in a clean table.
  - **Chart View**: Visualize data distributions with interactive charts.
- **Dynamic Charting**:
  - Switch between **Pie Charts** and **Bar Charts**.
  - Select different data categories to visualize.
- **Responsive Design**: A clean, modern UI that works on all screen sizes, built with Tailwind CSS.
- **Dark Mode**: Toggles automatically based on your system preference.

## Tech Stack

- **Frontend**: [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **AI Model**: [Google Gemini](https://ai.google.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Charting**: [Recharts](https://recharts.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- A Google Gemini API Key. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Installation & Setup

1.  **Clone the repository** (if you are using git):
    ```bash
    git clone <your-repository-url>
    cd data-visualizer-from-image
    ```

2.  **Install dependencies**:
    Navigate to the project directory and run:
    ```bash
    npm install
    ```

3.  **Set up environment variables**:
    Create a new file named `.env.local` in the root of your project directory. Add your Google Gemini API key to this file:
    ```env
    # Make sure to use the VITE_ prefix for environment variables exposed to the client
    VITE_GEMINI_API_KEY=YOUR_API_KEY_HERE
    ```

4.  **Run the development server**:
    ```bash
    npm run dev
    ```
    The application should now be running on `http://localhost:5173` (or another port if 5173 is busy).

## How It Works

1.  The user uploads a PDF file through the UI.
2.  The file is sent to a backend service (or a serverless function) that uses the Google Gemini API.
3.  A specific prompt instructs Gemini to act as a data extraction tool, read the PDF, and return the data in a structured JSON format.
4.  The frontend receives the JSON data and stores it in its state.
5.  The application dynamically renders the data in a table or passes it to the Recharts components to generate interactive pie and bar charts.
