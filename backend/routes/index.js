var express = require('express');
const path = require('path');
const fs = require('fs');
var router = express.Router();
const multer = require('multer');
// 配置 multer 中间件，设置文件存储的目录为 'uploads/'
// const upload = multer({ dest: 'uploads/' })
// 设置存储配置
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {

    const { index, md5Str } = req.query
    createDirectory(md5Str)
    cb(null, `uploads/${md5Str}`) // 确保这个文件夹已经存在
  },
  filename: function (req, file, cb) {
    const { index, md5Str } = req.query
    cb(null, md5Str + '-' + index)
  }
})
const upload = multer({ storage: storage });
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/upload', upload.single('file'), function (req, res, next) {
  res.send({
    code: 0
  })
});
router.post('/mergeFile', async function (req, res, next) {
  const { md5, filename, count } = req.body
  // console.log(md5, );

  // await mergeFiles(md5, filename, count)
  const p = path.join('uploads', md5)
  await thunkStreamMerge(p, filename)
  res.send({
    code: 0
  })
})
module.exports = router;


function createDirectory(str) {
  try {
    if (!fs.existsSync(`uploads/${str}`)) {
      fs.mkdirSync(`uploads/${str}`);
    }
  } catch (err) {
    console.error(err);
  }
}


// // 合并文件
// async function mergeFiles(md5, filename, chunkCount) {
//   const uploadDir = 'uploads'; // 存储分片的临时目录

//   const output = fs.createWriteStream(filename);
//   for (let i = 0; i < chunkCount; i++) {
//     const chunkPath = path.join(`${uploadDir}/${md5}`, `${md5}-${i}`);
//     console.log(chunkPath)
//     await new Promise((resolve, reject) => {
//       fs.createReadStream(chunkPath)
//         .on('end', () => {
//           fs.unlink(chunkPath, () => {}); // 删除分片
//           resolve();
//         })
//         .on('error', reject)
//         .pipe(output, { end: false });
//     });
//   }
//   output.end();
// }

/**
 *文件合并
 * @param {*} sourceFiles 源文件目录：存放所有切片文件的目录
 * @param {*} targetFiles 目标文件：合并之后的文件名
 */
function thunkStreamMerge(sourceFiles, targetFiles) {
  return new Promise((resolve, reject) => {
    const list = fs.readdirSync(sourceFiles);
    const fileWriteStream = fs.createWriteStream(
      path.join('uploads', targetFiles)
    );
    fileWriteStream.on('finish', () => {
      resolve()
    })
    fileWriteStream.on('error', () => {
      reject()
    })
    //进行递归调用合并文件
    thunkStreamMergeProgress(list, fileWriteStream, sourceFiles);
  })
}
/**
 * 合并每一个切片
 * @param {*} fileList 文件数据
 * @param {*} fileWriteStream 最终的写入结果
 * @param {*} sourceFiles 文件路径
 */
function thunkStreamMergeProgress(fileList, fileWriteStream, sourceFiles) {
  if (!fileList.length) {
    return fileWriteStream.end("console.log('完成了')");
  }
  const currentFile = path.resolve(sourceFiles, fileList.shift());
  const currentReadSteam = fs.createReadStream(currentFile);
  //写入文件内容，括号内的会覆盖readStream的内容
  currentReadSteam.pipe(fileWriteStream, { end: false });
  //合并后，删除切片
  // fs.rm(currentFile, { recursive: true }, (err) => {
  //   if (err) {
  //     console.error(err.message);
  //     return;
  //   }
  // });
  currentReadSteam.on("end", () => {
    thunkStreamMergeProgress(fileList, fileWriteStream, sourceFiles);
  });
}
