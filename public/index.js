
const canvas = document.getElementById("tree_canvas");
var ctx = canvas.getContext("2d");


const readUploadedFileAsText = (inputFile) => {
    const temporaryFileReader = new FileReader();
  
    return new Promise((resolve, reject) => {
        temporaryFileReader.onerror = () => {
            temporaryFileReader.abort();
            reject(new DOMException("Problem parsing input file."));
        };
  
        temporaryFileReader.onload = () => {
            resolve(temporaryFileReader.result);
        };
        temporaryFileReader.readAsText(inputFile);
    });
  };


const handleUpload = async (event) => {
    const file = event.target.files[0];    
    try {
        const fileContents = await readUploadedFileAsText(file)
        var root_data = parse_ged_file_wrapper(fileContents)
        // draw_canvas_grid(ctx, 1, "grey" )
        // //draw_node(ctx, node_size)
        // draw_root_nodes(root_data[0], root_data[1])
        
    } catch (e) {
        alert(e.message)
    }
}