const express = require("express");
const path = require("path");
require("dotenv").config();

const { InferenceClient } = require("@huggingface/inference");

const app = express();

const PORT = process.env.PORT || 3000;

const hf = process.env.HF_TOKEN
  ? new InferenceClient(process.env.HF_TOKEN)
  : null;


// اجازه دریافت JSON
app.use(express.json({ limit: "2mb" }));


// نمایش صفحه اصلی CORTEX
app.get("/", (req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "index.html")
  );
});


// تولید تصویر با AI
app.post("/api/generate-image", async (req, res) => {

  try {

    if (!hf) {
      return res.status(500).json({
        error: "HF_TOKEN is not configured."
      });
    }


    const prompt = String(
      req.body?.prompt || ""
    ).trim();


    if (!prompt) {
      return res.status(400).json({
        error: "Prompt is required."
      });
    }


    const blob = await hf.textToImage({

      model: "black-forest-labs/FLUX.1-schnell",

      inputs: prompt

    });


    const buffer = Buffer.from(
      await blob.arrayBuffer()
    );


    res.json({

      mime: blob.type || "image/png",

      image: buffer.toString("base64")

    });


  } catch (error) {

    console.error(error);

    res.status(500).json({

      error:
        error?.message ||
        "Image generation failed."

    });

  }

});


// اجرای سرور
app.listen(PORT, () => {

  console.log(
    `CORTEX running on port ${PORT}`
  );

});
