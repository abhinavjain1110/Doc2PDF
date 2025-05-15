const express = require('express');
const multer = require('multer');
const docxToPDF = require('docx-pdf');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.urlencoded({extended: false}));

// Ensure the directories exist
const uploadDir = path.join(__dirname, 'uploads');
const outputDir = path.join(__dirname, 'files');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Setting up the file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

app.post('/convertFile', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file was uploaded"
      });
    }

    // Defining output path
    let outputPath = path.join(outputDir, `${req.file.originalname}.pdf`);

    await convertDocxToPdf(req.file.path, outputPath);

    res.download(outputPath, err => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          message: "Error downloading the file"
        });
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

const convertDocxToPdf = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    docxToPDF(inputPath, outputPath, (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
};

app.listen(port, () => {
  console.log(`EServer running at ${port}`);
});
