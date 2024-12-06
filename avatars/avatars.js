const fs = require("fs").promises;
const path = require("path");
const { v4: uuidV4 } = require("uuid");
const User = require("../models/schemaUser");
const { isImageAndTransform } = require("./avatarPath");

const storeImageDir = path.join(process.cwd(), "public/avatars");

const processImage = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file." });
  }

  const { path: temporaryPath } = req.file;
  const extension = path.extname(temporaryPath);
  const fileName = `${uuidV4()}${extension}`;
  const filePath = path.join(storeImageDir, fileName);

  console.log("Temporary path:", temporaryPath);
  console.log("File path:", filePath);
  try {
    await fs.rename(temporaryPath, filePath);
    console.log("File moved successfully");
  } catch (error) {
    console.error("Error renaming file:", error);
    await fs.unlink(temporaryPath);
    return next(error);
  }

  console.log("filePath", filePath);

  const isValidAndTransform = await isImageAndTransform(filePath);
  if (!isValidAndTransform) {
    await fs.unlink(filePath);
    return res.status(400).json({ message: "File isn't a photo." });
  }

  await User.findOneAndUpdate(
    // { token: res.locals.user.token },
    { avatarURL: `/avatars/${fileName}` }
  );
  res.status(200).json({ message: `avatarURL: /avatars/${fileName}` });
};

module.exports = { processImage };
