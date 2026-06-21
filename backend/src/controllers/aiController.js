const { GoogleGenerativeAI } = require("@google/generative-ai");
const Product = require("../models/Product");

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

// ==========================
// AI PRODUCT RECOMMENDATION
// ==========================

exports.getAIRecommendation = async (req, res) => {
  try {
    const { query } = req.body;

    const products = await Product.find({
      approvalStatus: "approved",
    }).select(
      "_id title description price category images"
    );

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
User Query:
${query}

Available Products:
${JSON.stringify(products)}

Suggest maximum 5 matching products.

IMPORTANT:

Return ONLY valid JSON.

Example:

[
  {
    "productId":"685123456",
    "reason":"Best option under budget"
  }
]

Rules:
- Return only JSON array
- No markdown
- No explanation
- No extra text
`;

    const result = await model.generateContent(prompt);

    const response = result.response.text();

    let aiProducts = [];

    try {
      aiProducts = JSON.parse(response);
    } catch (error) {
      console.log("AI Parse Error:", response);

      return res.status(500).json({
        message: "AI response parse failed",
      });
    }

    const productIds = aiProducts.map(
      (item) => item.productId
    );

    const matchedProducts = await Product.find({
      _id: {
        $in: productIds,
      },
    });

    const finalProducts = matchedProducts.map(
      (product) => {
        const aiData = aiProducts.find(
          (item) =>
            item.productId === product._id.toString()
        );

        return {
          ...product.toObject(),
          reason: aiData?.reason || "",
        };
      }
    );

    res.json({
      success: true,
      products: finalProducts,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};