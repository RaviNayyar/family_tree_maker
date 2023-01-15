const express = require('express');
const app = express();
const path = require('path');
const upload = require('express-fileupload')
const ged_parser = require("./gedparser.js");
app.use(express.static(path.join(__dirname, 'public')));

g_tree = null

async function parse_gedcom(file, file_path) {
  file.mv(file_path, (err) => {
    return "File Move Error"
  });

  g_tree = await ged_parser.parse_ged_file_wrapper(file_path)

  //console.log(g_tree)
  return "File Success"
}


app.use(upload())
app.post('/upload', (req, res) => {
  console.log("Upload Post Detected")
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  let file = req.files.files
  let file_path = `${__dirname}\\uploads\\${file.name}`
  console.log(file_path)
  retval = parse_gedcom(file, file_path)
  res.send(retval)
});


app.get('/', (req, res) => {
    res.headers({
        'Access-Control-Allow-Origin': '*',
        'ExpressAccess-Control-Allow-Methods': '*',
        'Access-Control-Allow-Headers': '*'
    });

    res.sendFile(__dirname + '/public/index.html');
});


app.listen(4000, () => {
    console.log('Server started on port 4000');
});

