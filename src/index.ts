import express, { Request, Response, RequestHandler } from "express";
import * as dotenv from "dotenv";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import bodyParser from "body-parser";

dotenv.config();

const app = express();
app.use(bodyParser.json());

/**
 * Loads a PDF file and splits its content into smaller chunks.
 * 
 * - Uses PDFLoader to load the PDF document from the specified path.
 * - Splits the loaded content into chunks using RecursiveCharacterTextSplitter,
 *   which helps maintain logical boundaries in the text.
 * 
 * @returns {Promise<Document[]>} An array of document chunks ready for embedding.
*/
const loadAndSplitDocs = async () => {
  const loader = new PDFLoader("pdfs/resume-1.pdf");
  const docs = await loader.load();

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 100,
  });

  return splitter.splitDocuments(docs);
};

/**
 * Creates an in-memory vector store from PDF documents.
 * 
 * - Loads and splits the documents into manageable chunks.
 * - Generates embeddings for each chunk using Google Generative AI's embedding model.
 * - Stores the embeddings in a MemoryVectorStore for later similarity searches.
 * 
 * @returns {Promise<MemoryVectorStore>} A vector store containing embedded document chunks.
*/
const createVectorStore = async () => {
  const docs = await loadAndSplitDocs();

  const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GOOGLE_API_KEY!,
    model: "embedding-001",
  });

  return MemoryVectorStore.fromDocuments(docs, embeddings);
};

// Set up vector store and chain
let vectorStore: MemoryVectorStore;

/**
 * Handles incoming questions from the client.
 * 
 * - Validates the question from the request body.
 * - Performs a similarity search on the vector store to retrieve the top 3 relevant documents.
 * - Builds a prompt using the retrieved context and the question.
 * - Uses the Gemini 2.5 Flash model to generate a response based on the prompt.
 * - Returns the generated answer in the JSON response.
*/

const askHandler: any = async (req: Request, res: Response) => {
  try {
    const question = req.body.question;
    if (!question) {
      return res.status(400).json({ error: "Missing question in body" });
    }
    const relevantDocs = await vectorStore.similaritySearch(question, 3);
    const prompt = PromptTemplate.fromTemplate(`Answer the question based only on the following context:{context}Question: {question}`);
    const model = new ChatGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY!,
      model: "gemini-2.5-flash", // Try this model
      temperature: 0.7,
    });
    const chain = RunnableSequence.from([
      {
        context: async () =>
          relevantDocs.map((doc) => doc.pageContent).join("\n\n"),
        question: (input: any) => input.question,
      },
      prompt,
      model,
      new StringOutputParser(),
    ]);
    const answer = await chain.invoke({ question });
    res.json({ answer });
  } catch (err) {
    console.log("🚀 ~ constaskHandler:any= ~ err:", err)
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

app.post("/ask",askHandler);



const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  vectorStore = await createVectorStore();
  console.log(`Server running on http://localhost:${PORT}`);
});