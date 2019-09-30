const path = require("path");
const decompress = require("decompress");
const multer = require("multer");
const config = require("../../config");
const { write: writeMetadata } = require("../../lib/metadata");
const deploy = require("../../lib/deploy");

// return an array of expressjs callbacks, the first using multer to support
// uploading multipart forms (ie, files), and the second to handle extraction
function createDeployMiddleware() {
  const multerUpload = multer({
    dest: config.get("upload_dir"),
    fileFilter: (req, file, cb) => {
      // to reject file uploads: cb(null, false);
      cb(null, true);
    }
  });

  const upload = multerUpload.single("upload");

  const extract = (req, res) => {
    const { name, path: appPath, ref, type } = req.body;
    const { path: spaArchive } = req.file;

    //TODO: Before deploying look at the 'type' if type === 'app' then validate that spaship.yaml is included in the zip
    //TODO: If type === 'app' and no spaship.yaml is not included return 403 (bad request) with error message
    //TODO: Also validate that at a minimum path is defined for both app and bundle types, if not return 403 (bad request)

    deploy({ name, spaArchive, appPath, ref, type });

    res.send("SPA uploaded, deployment continuing in the background.");
  };

  return [upload, extract];
}

module.exports = createDeployMiddleware;
