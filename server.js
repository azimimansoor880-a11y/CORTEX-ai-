const express=require("express");
const path=require("path");
require("dotenv").config();
const {InferenceClient}=require("@huggingface/inference");
const app=express(), PORT=process.env.PORT||3000;
const hf=process.env.HF_TOKEN?new InferenceClient(process.env.HF_TOKEN):null;
app.use(express.json({limit:"2mb"}));
app.use(express.static(path.join(__dirname,"public")));
app.post("/api/generate-image",async(req,res)=>{
  try{
    if(!hf) return res.status(500).json({error:"HF_TOKEN is not configured."});
    const prompt=String(req.body?.prompt||"").trim();
    if(!prompt) return res.status(400).json({error:"Prompt is required."});
    const blob=await hf.textToImage({
      model:"black-forest-labs/FLUX.1-schnell",
      inputs:prompt
    });
    const buf=Buffer.from(await blob.arrayBuffer());
    res.json({mime:blob.type||"image/png",image:buf.toString("base64")});
  }catch(e){res.status(500).json({error:e?.message||"Image generation failed."});}
});
app.listen(PORT,()=>console.log(`CORTEX running at http://localhost:${PORT}`));
