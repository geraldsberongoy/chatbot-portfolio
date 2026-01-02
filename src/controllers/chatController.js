import { chatService } from "../services/chatService.js";

export const chatController = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        error: "Message is required",
        example: { message: "What projects has the developer built?" },
      });
    }

    const response = await chatService.processMessage(message);
    res.json(response);
  } catch (error) {
    console.error("Error:", error);
    const response = await chatService.getErrorResponse(error, req.body.message);
    res.status(500).json(response);
  }
};
