const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const formData = new FormData();

const generateGANShape = async (label) => {
    if (!label) {
        return {
            success: false,
            message: "Shape label is required.",
        };
    }

    try {
        const response = await axios.post("http://127.0.0.1:5000/generate-gan-shape", { label });
        return { success: true, data: response.data };
    } catch (error) {
        console.error("Error generating GAN shape:", error.message);
        return {
            success: false,
            message: error.response?.data?.error || error.message,
        };
    }
};


const predictNewShape = async (imagePath) => {
  try {
    const formData = new FormData();
    formData.append("image", fs.createReadStream(imagePath));

    const response = await axios.post("http://127.0.0.1:5000/predict-new-shape", formData, {
      headers: formData.getHeaders(),  // ✅ Now works!
    });

    return {
      success: true,
      prediction: response.data.prediction,
      confidence: response.data.confidence,
    };
  } catch (error) {
    console.error("Error in predictNewShape service:", error.message);

    return {
      success: false,
      message: error.response?.data?.error || "Failed to get prediction from Flask API",
    };
  }
};

const getGANShape = async (shapeName) => {
  try {
    const response = await axios.post("http://127.0.0.1:5000/get-gan-shape", { shape: shapeName });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error in getGANShape:", error.message);
    return {
      success: false,
      message: error.response?.data?.error || "Error generating GAN shape.",
    };
  }
};




module.exports = { generateGANShape,predictNewShape, getGANShape };
