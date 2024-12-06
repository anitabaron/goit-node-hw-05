const Jimp = require("jimp");

const isImageAndTransform = async (inputPath, outputPath) => {
  try {
    console.log("Processing image...");
    const image = await Jimp.read(inputPath); // Wczytanie obrazu
    image.resize(250, 250); // Zmiana rozmiaru
    await image.writeAsync(outputPath); // Zapisanie przetworzonego obrazu

    console.log("Input path:", inputPath);
    console.log("Output path:", outputPath);
    return true;
  } catch (error) {
    console.error("Error processing image:", error.message);
    return false;
  }
};

module.exports = { isImageAndTransform };
