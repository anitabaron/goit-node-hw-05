const fs = require("fs").promises;
const path = require("path");
const { v4: uuidV4 } = require("uuid");
const User = require("../models/schemaUser");
const { isImageAndTransform } = require("./avatarPath");

const updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    // const tempPath = req.file.path;
    // const outputDir = path.join(process.cwd(), "public/avatars");
    // const extension = path.extname(tempPath);
    // const outputFileName = `${uuidV4()}${extension}`;
    // const outputPath = path.join(outputDir, outputFileName);
    const { path: temporaryPath } = req.file;
    const extension = path.extname(temporaryPath);
    const fileName = `${uuidV4()}${extension}`;
    const filePath = path.join(process.cwd(), "public/avatars", fileName);

    //   if (!fs.existsSync(outputDir)) {
    //     fs.mkdirSync(outputDir);
    //   }
    //   const image = await Jimp.read(tempPath);
    //   image.resize(250, 250);
    //   await image.writeAsync(outputPath);
    //   await fs.unlink(tempPath);

    //   res.status(200).json({
    //     message: "Avatar updated successfully",
    //     avatarURL: `/avatars/${outputFileName}`,
    //   });
    // } catch (error) {
    //   console.error("Error processing file:", error.message);
    //   next(error);
    // }

    const isValidAndTransform = await isImageAndTransform(
      temporaryPath,
      filePath
    );
    if (!isValidAndTransform) {
      await fs.unlink(temporaryPath);
      return res.status(400).json({ message: "File isn't a photo" });
    }

    const user = await User.findByIdAndUpdate(
      res.locals.user.id,
      { avatarURL: `/avatars/${fileName}` },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      avatarURL: user.avatarURL,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { updateAvatar };
