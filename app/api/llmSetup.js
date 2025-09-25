import Groq from "groq-sdk";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
import {vectorStore} from './prepareDoc.js'

export async function generate(question){


        // retrival
        const relevantChunks = await vectorStore.similaritySearch(question, 3);

        const context = relevantChunks.map((chunk)=> chunk.pageContent).join('\n\n');
        // console.log(context)

        const SYSTEM_PROMPT = `You are an assistant for question-answering tasks only related to the document to you have. Use the following
        relevant pieces of retrieved context to answer the question. provide the answer in very polite way ans use appropriate emogies if needed also use proper bullet points if needed and also provide the short summary at last if needed. If you don't the answer say I don't know.And if user asked anything part from this like greeting and searching for other stuf then give the message that 'I am only made for company policy Question-Answering', you don't use he data on which u are trained you just have to answer the Questions which are related to the retrieved context, but i u have any relevant pieces of retrieved context then answer it. So if the user Question do not match any relevant context, then say sorry in very polite way to user with emojies`

        const userQuery = `Question: ${question}
        Relevant context: ${context}
        Answer:`;

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role:"system",
                    content: SYSTEM_PROMPT
                },
                {
                    role: "user",
                    content: userQuery,
                },
            ],
             model: "openai/gpt-oss-20b",
         });

         return completion.choices[0].message.content;
}