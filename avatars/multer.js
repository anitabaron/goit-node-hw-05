const multer = require("multer");
const path = require("path");

const tempDir = path.join(__dirname, "../temp");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const extensionWhiteList = [".jpg", ".jpeg", ".png", ".gif"];
const mimetypeWhiteList = ["image/png", "image/jpg", "image/jpeg", "image/gif"];

const uploadAvatar = multer({
  storage,
  fileFilter: async (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const mimetype = file.mimetype.toLowerCase();
    if (
      !extensionWhiteList.includes(extension) ||
      !mimetypeWhiteList.includes(mimetype)
    ) {
      return cb(
        new Error("Invalid file type. Only JPEG, PNG, and JPG are allowed."),
        false
      );
    }
    return cb(null, true);
  },
  limits: { fileSize: 1024 * 1024 * 5 },
});

module.exports = { uploadAvatar };
