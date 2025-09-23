// app/api/chat/route.ts
export async function POST(req: Request) {
  try {
    const { messages, userId } = await req.json();
    console.log("Received messages:", messages);
    console.log("User ID:", userId);

    if (!messages || !messages.length) {
      return new Response(JSON.stringify({ message: "No messages provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const lastMessage = messages[messages.length - 1].content;
    console.log("Last message:", lastMessage);

    // Prepare payload for external API
    const requestBody = {
      query: lastMessage,
      user_id: userId || "anonymous_user",
    };

    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/ask`;
    console.log("Calling external API:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log("External API response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("External API error response:", errorText);
      throw new Error(
        `API returned ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("External API response data:", data);

    // Extract message safely
    const responseMessage =
      data.answer ||
      data.response ||
      data.message ||
      data.reply ||
      data.text ||
      JSON.stringify(data);

    console.log("Sending back responseMessage:", responseMessage);

    // ✅ Return proper JSON for frontend
    return new Response(JSON.stringify({ message: responseMessage }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ message: `Error: ${error.message}` }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
