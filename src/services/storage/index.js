import { storage } from "../utils/firebase_config";
import { randHashString } from "../utils/utils";

const getExtenstionFromPath = (path) => path.substr(path.lastIndexOf(".") + 1);

const generateFileName = (filePath, prefix = "") =>
  prefix + randHashString(16) + "." + getExtenstionFromPath(filePath);

const upload_file = (
  { uploadPath, file, fileName = generateFileName(file.name), metadata },
  progressCallback = (percent) => {}
) => {
  return new Promise((res, rej) => {
    const ref = storage().ref(uploadPath + fileName);
    const task = ref.put(
      file,
      typeof metadata === "object" ? metadata : undefined
    );
    task.on("state_changed", (snap) =>
      progressCallback((snap.bytesTransferred / snap.totalBytes) * 100)
    );
    task
      .then(() => ref.getDownloadURL().then((url) => res(url)))
      .catch((e) => rej(e));
  });
};

const upload = (
  { uploadPath, files, fileNames = [], metadatas = [] },
  progressCallback = (percent) => {}
) => {
  const total = files.length;
  let progress = Array(total).fill(0);
  return Promise.all(
    files.map((file, i) =>
      upload_file(
        {
          uploadPath,
          file,
          fileName: fileNames[i],
          metadata: metadatas[i],
        },
        (p) => {
          progress[i] = p;
          progressCallback(
            Math.round(progress.reduce((prev, curr) => prev + curr) / total)
          );
        }
      )
    )
  );
};

const Storage = {
  upload,
};

export default Storage;
