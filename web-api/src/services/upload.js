const fs = require('fs');

const CONSTANT = require('../utils/constant');

async function detectAndUploadFile(file, name = new Date().getTime()) {  
  const folderPath = `${CONSTANT.USER_UPLOAD_FOLDER}/`;
  const originalFilename = file.hapi.filename;
  const extension = originalFilename.split('.').pop();
  const filename = `${name}.${extension}`;  
  const uploadedFileName = await handleFileUpload(folderPath, filename, file);

  return uploadedFileName;
}

function handleFileUpload(folderPath, filename, file) {

  if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });
  
  const path = `${folderPath}${filename}`;
  const fileStream = fs.createWriteStream(path);
  
  return new Promise((resolve, reject) => {
    file.on('error', function (err) {
      reject(err);
    });

    file.pipe(fileStream);

    file.on('end', function (err) {
      resolve(filename);
    })
  })
}

function getFilePath(filename) {
  const filePath = `${CONSTANT.USER_UPLOAD_FOLDER}/${filename}`;
  if (!fs.existsSync(filePath)) { 
    return null;
  }

  return filePath;
}

function encodeFileToBase64(filePath) {
  return fs.readFileSync(filePath, {encoding: 'base64'});
}

module.exports = {
  detectAndUploadFile,
  getFilePath,
  encodeFileToBase64
};
