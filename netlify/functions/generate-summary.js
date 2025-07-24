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
    const { notes, users, date } = JSON.parse(event.body);

    if (!notes || notes.trim() === "") {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No notes provided to summarize." }),
      };
    }

    // Format the date for display.
    const displayDate = new Date(date + "T00:00:00").toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    });

    // 2. Create the new, more detailed system prompt.
    const systemPrompt = `
You are an expert assistant for a software development team. Your task is to create a concise, professional summary of the team's daily standup notes for ${displayDate}.

The following users contributed today: ${users.join(", ")}.

Your output MUST be a single block of clean, elegant HTML. Do not include any markdown or plain text. The entire response must be valid HTML.

- Start with an <h2> tag for the title: "Daily Summary for ${displayDate}".
- Below the title, add a <p> tag that lists the contributing team members: "Updates from: ${users.join(", ")}".
- Create a bulleted list (<ul>) of the key takeaways from all the notes combined.
- Focus on summarizing accomplishments, key plans for the day, and any critical blockers.
- Keep the summary high-level. Do not just list every single note.
- Use <strong> tags to highlight important keywords or names.
- The entire response should be wrapped in a single parent <div> tag.
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
    const aiSummary = completion.choices[0].message.content;

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
