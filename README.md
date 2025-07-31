# Project Summary

The server leverages LangChain for document loading, text splitting, embeddings, and question answering. It uses Google Generative AI for embeddings and supports two LLMs: Google Gemini 2.5 Flash and OpenAI’s GPT (configurable via environment variables). Express.js handles HTTP requests, and the API processes questions about a PDF stored in the pdfs directory.

# Project Setup Guide

This guide provides step-by-step instructions to set up and run the project locally.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 14.x or higher
- **Yarn**: Package manager for Node.js
- **Git**: For cloning the repository
- A valid **Google API Key** for the project

## Project Structure

```
├── pdfs/
│   └── resume-1.pdf           # Sample PDF file (e.g., resume)
├── .env                      # Environment variables (GOOGLE_API_KEY, OPENAI_API_KEY, LLM_PROVIDER, PORT)
├── index.ts                  # Main application code (Express server, LangChain logic)
├── package.json              # Project dependencies and scripts
├── README.md                 # Project documentation
└── tsconfig.json             # TypeScript configuration (if using TypeScript)

```

## Installation Steps

### Step 1: Clone the Project

Clone the repository to your local machine using the following command:

```bash
git clone <repository-url>
```

Replace `<repository-url>` with the actual URL of the repository.

### Step 2: Set Up the Environment File

1. Navigate to the project directory:
   ```bash
   cd <project-folder>
   ```
2. Create a `.env` file in the root of the project folder.
3. Add the following environment variables to the `.env` file:
   ```env
   GOOGLE_API_KEY=<your-google-api-key>
   PORT=<desired-port-number>
   ```
   - Replace `<your-google-api-key>` with your actual Google API key.
   - Replace `<desired-port-number>` with the port number you want the server to run on (e.g., `3000`).

### Step 3: Install Dependencies

1. Ensure you are inside the project folder.
2. Run the following command to install the project dependencies using Yarn:
   ```bash
   yarn
   ```

### Step 4: Start the Project

Once the dependencies are installed successfully, start the development server using:

```bash
yarn dev
```

This will start the server on the port specified in the `.env` file (e.g., `http://localhost:3000`).

### Step 5: Test the API

After the server starts, you can test the API endpoint using a POST request.

- **Method**: POST
- **URL**: `http://localhost:<PORT>/ask`
- **Body Payload** (JSON):
  ```json
  {
    "question": "What you think can we take this candidate ?"
  }
  ```

#### Example Request

You can use a tool like `curl`, Postman, or any HTTP client to send the request. Example using `curl`:

```bash
curl -X POST http://localhost:<PORT>/ask -H "Content-Type: application/json" -d '{"question": "What you think can we take this candidate ?"}'
```

#### Expected Output

The API will respond with a JSON object. Example response:

```json
{
  "answer": "The provided context describes Janine Nel's qualifications, experience, and education. However, it does not include any information about the requirements or criteria for the position you are trying to fill. Therefore, based *only* on the given context, I cannot determine if this candidate is suitable for your needs."
}
```

## Video Tutorial

[Example Link](https://jam.dev/c/5dab16eb-8377-458c-9ff0-e3d4aa80296b)

## Troubleshooting

- **Port Conflict**: If the specified port is already in use, update the `PORT` value in the `.env` file to an available port.
- **Missing Dependencies**: If `yarn` fails, ensure Node.js and Yarn are correctly installed, then retry.
- **Invalid API Key**: Ensure the `GOOGLE_API_KEY` is valid and has the necessary permissions.
- **Server Not Starting**: Check the terminal for error messages and ensure all dependencies are installed.

## Additional Notes

- Ensure you have a stable internet connection for API calls that require external services.
- For production deployment, additional configuration may be required (e.g., setting up a production server, securing the API key, etc.).
