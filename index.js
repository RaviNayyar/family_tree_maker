var individual_array = []
var family_array = []

var indiv_data = {}
var indiv_flag = true
var family_index = null

function analyze_family_data() {
  console.log(individual_array.length)
  console.log(family_array.length)

  for (let i = 0; i < individual_array.length; i++) {
    console.log(individual_array[i])
  }
  console.log("\n\n\n=============================================")
  for (let i = 0; i < family_array.length; i++) {
    console.log(family_array[i])
  }
  return;
}

function create_entry(gedcom_event, gedcom_value) {
  if (gedcom_event == "")
    gedcom_event = "0"
  
  // Handling the case for multiple entries
  if (!(gedcom_event in indiv_data))
    indiv_data[gedcom_event] = []
  
  indiv_data[gedcom_event].push(gedcom_value)
}


function parse_line(gedcom_tab, gedcom_line) {
  // Gets gedcom event and value from the line
  var event_idx = gedcom_line.indexOf(" ")
  var gedcom_event = gedcom_line.substring(0, event_idx).trim()
  var gedcom_value = gedcom_line.substring(event_idx, gedcom_line.length).trim()
  
  // Finds beginning of family section
  if (gedcom_tab == "0" && gedcom_event.includes("@F") && indiv_flag == true) {
    indiv_flag = false
    family_index = individual_array.length - 1
  }

  create_entry(gedcom_event, gedcom_value) 
}


function parseFileData(file_text) {
  var gedcom_text = file_text.split('\n')
  
  // Client-side parsing of entire gedcom file upload
  for (let i = 0; i < gedcom_text.length; i++) {
    var gedcom_line = gedcom_text[i]
    var gedcom_tab = gedcom_line[0]
    gedcom_line = gedcom_line.substring(2, gedcom_line.length)
    
    if (gedcom_tab == "0") {
      if (indiv_data != null) {
        individual_array.push(indiv_data)
        indiv_data = {}
      }    
    }
    
    parse_line(gedcom_tab, gedcom_line)
  }

  individual_array.shift()
  family_array = individual_array.splice(family_index, individual_array.length)
  
  family_array.unshift({})
  
  //analyze_family_data()

  document.getElementById("submit_btn").disabled = false;
}

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
const fileContentDiv = document.querySelector('div#file-content')

try {
    const fileContents = await readUploadedFileAsText(file)
    //fileContentDiv.innerHTML = fileContents
    parseFileData(fileContents)
} catch (e) {
    alert(e.message)
}
}



function get_data(name, para_text) {
  try {
    for (let i = 1; i < individual_array.length; i++) {
      let curr_name = individual_array[i].NAME
      curr_name = curr_name.toString().replaceAll('/', '')
      if (curr_name == name) {
        console.log("Name for entry was found!")

        for (key in individual_array[i]) {
          para_text += key.toString() + ":&emsp;&emsp;" + individual_array[i][key].toString() + "<br>"
        }
        return para_text
      } 
    }
  }
  catch(err) {
    
  }
  
}


function submit_btn() {
  console.log("Submit Button Pressed")
  let name = document.getElementById("myName").value
  
  let para_text = ""

  let para = document.getElementById("paragraph_text")

  para_text = para_text += "Showing Data" + "<br><br>"
  para_text = get_data(name, para_text)
  para.innerHTML = para_text
 
}