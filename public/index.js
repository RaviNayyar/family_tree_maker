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
        parse_ged_file_wrapper(fileContents)
    } catch (e) {
        alert(e.message)
    }
}