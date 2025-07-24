// START of code to UPDATE

// 1. Import the OpenAI library
const { OpenAI } = require("openai");

// 2. Initialize the OpenAI client.
// The library will automatically find the OPENAI_API_KEY in the environment variables
// that we just set in the Netlify UI. We don't need to write the key in our code.
const openai = new OpenAI();

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({
        error: "This function only accepts POST requests.",
      }),
    };
  }

  try {
    // 1. Destructure the new data from the request body.
    const { notes, users, date, requestingUserDisplayName } = JSON.parse(
      event.body
    );

    if (!notes || notes.trim() === "") {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No notes provided to summarize." }),
      };
    }

    // Format the date for display.
    const displayDate = new Date(date + "T00:00:00").toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      }
    );

    // 2. Create the new, more detailed system prompt.
    const systemPrompt = `
You are an expert assistant for a software development team. Your task is to create a concise, professional summary of the team's daily standup notes for ${displayDate}.

The following users contributed today: ${users.join(", ")}.

Your output MUST be a single block of clean, elegant HTML. Do NOT include any markdown-style backticks. The entire response must be valid HTML.

Construct the HTML as follows:

<div class="ai-summary-container">
  <h2>Daily Summary for ${displayDate}</h2>
  <p>Updates from: ${users.join(", ")}</p>

  <h3>Key Takeaways:</h3>
  <ul>
    <!-- AI: Generate a bulleted list of key accomplishments, plans, and blockers from the notes. -->
  </ul>

  <hr style="margin: 2rem 0; border: 0; border-top: 1px solid var(--color-border);" />

  <h3>Personalized Email Update:</h3>
  <p>Dear ${requestingUserDisplayName},</p>
  <p>Here's a quick update on today's standup notes:</p>
  <p>
    <!-- AI: Write a conversational, personal email here. Do NOT use bullet points. Refer to team members by name for each item, making it clear who accomplished what, who is working on what, and who has blockers. Ensure all key points from the notes are covered in this conversational style. -->
  </p>
  <p>Love,</p> 
  <p>Echostatus</p>
</div>
`;

    // 3. Create the API request to OpenAI with the new prompt.
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: notes, // The filtered and formatted notes from the client.
        },
      ],
      model: "gpt-4o",
      temperature: 0.6, // Slightly increased for more natural-sounding summaries
    });

    // 4. Extract the summary text from the API response.
    let aiSummary = completion.choices[0].message.content;

    // Strip markdown-style code fences if present
    aiSummary = aiSummary.replace(/^```html\s*([\s\S]*?)\s*```$/i, "$1").trim();

    console.log("Raw AI summary:", completion.choices[0].message.content);
    console.log("Stripped summary:", aiSummary);

    // --- End of the REAL AI Logic ---

    return {
      statusCode: 200,
      body: JSON.stringify({ summary: aiSummary }), // 5. Send the real summary back!
    };
  } catch (error) {
    // This will now catch errors from the OpenAI API call as well.
    console.error("Error in generate-summary function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error:
          "An internal server error occurred while generating the summary.",
      }),
    };
  }
};
// END of code to UPDATE
