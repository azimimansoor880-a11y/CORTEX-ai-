const express = require("express");
const path = require("path");
require("dotenv").config();

const { InferenceClient } = require("@huggingface/inference");

const app = express();

const PORT = process.env.PORT || 3000;

const hf = process.env.HF_TOKEN
  ? new InferenceClient(process.env.HF_TOKEN)
  : null;


// JSON
app.use(express.json({ limit: "15mb" }));


// CORTEX main page
app.get("/", (req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "index.html")
  );
});


// =====================================================
// TEXT → IMAGE
// =====================================================

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

    console.error("IMAGE ERROR:", error);

    res.status(500).json({

      error:
        error?.message ||
        "Image generation failed."

    });

  }

});


// =====================================================
// IMAGE → VIDEO
// =====================================================

app.post("/api/generate-video", async (req, res) => {

  try {

    if (!hf) {

      return res.status(500).json({
        error: "HF_TOKEN is not configured."
      });

    }


    const imageBase64 =
      String(
        req.body?.image || ""
      ).trim();


    const prompt =
      String(
        req.body?.prompt || ""
      ).trim();


    if (!imageBase64) {

      return res.status(400).json({
        error: "Image is required."
      });

    }


    // Remove data:image/...;base64, prefix
    const cleanBase64 =
      imageBase64.includes(",")
        ? imageBase64.split(",")[1]
        : imageBase64;


    const imageBuffer =
      Buffer.from(
        cleanBase64,
        "base64"
      );


    const video =
      await hf.imageToVideo({

        model:
          "Wan-AI/Wan2.1-I2V-14B-720P",

        image:
          imageBuffer,

        prompt:
          prompt ||
          "Cinematic music video shot, smooth realistic camera movement, subtle natural motion, premium cinematic lighting, photorealistic."

      });


    const buffer =
      Buffer.from(
        await video.arrayBuffer()
      );


    res.json({

      mime:
        video.type ||
        "video/mp4",

      video:
        buffer.toString("base64")

    });


  } catch (error) {

    console.error(
      "VIDEO ERROR:",
      error
    );


    res.status(500).json({

      error:
        error?.message ||
        "Video generation failed."

    });

  }

});


// =====================================================
// SERVER
// =====================================================

app.listen(
  PORT,
  () => {

    console.log(
      `CORTEX running on port ${PORT}`
    );

  }
);
