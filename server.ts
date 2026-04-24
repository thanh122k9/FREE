import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
// In many environments, it will automatically find credentials
async function startServer() {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const admin = (await import("firebase-admin")).default;

  try {
    if (admin.apps.length === 0) {
      admin.initializeApp();
    }
  } catch (error) {
    console.log("Firebase Admin initialization error:", error);
  }

  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Gemini API Proxy
  app.post("/api/extract-product", async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: "URL is required" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on server" });
      }

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `Bạn là một trợ lý hữu ích. Hãy phân tích URL sản phẩm này: ${url}. 
      Nếu có thể, hãy trả về thông tin sản phẩm dưới dạng JSON với các trường:
      - title: Tên sản phẩm
      - description: Mô tả ngắn gọn
      - price: Giá (kèm đơn vị tiền tệ nếu có)
      - imageUrl: Link ảnh sản phẩm (nếu tìm thấy)
      
      Chỉ trả về JSON, không kèm giải thích. Nếu không tìm thấy thông tin, hãy trả về JSON với các trường rỗng.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        res.json(JSON.parse(jsonMatch[0]));
      } else {
        res.status(404).json({ error: "Could not extract product info" });
      }
    } catch (error: any) {
      console.error("Gemini Proxy Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
