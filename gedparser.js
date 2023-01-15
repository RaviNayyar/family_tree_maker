const { sign } = require("crypto");
const fs = require("fs");
const { exit } = require("process");

function file_exists(filePath) {
  fs.access(filePath, fs.F_OK, (err) => {
    if (err) {
      console.error(err)
      return false
    }
    return true
  })
}


function parseGEDFile(filePath) {
  const fileData = fs.readFileSync(filePath, "utf8");
  const fileLines = fileData.split("\n");
  const individuals = [];
  const families = [];
  const connections = [];

  for (let i = 0; i < fileLines.length; i++) {
    line = fileLines[i];
    if (!line.startsWith("0 @")) continue;
    
    let [, id, recordType] = line.split(" ");
    id = id.trim()
    recordType = recordType.trim()

    if (recordType === "INDI") {
      let individual = { id };

      while (true) {
        if ((++i > fileLines.length) || (fileLines[i].startsWith("0 @"))) {--i; break}
        if (fileLines[i].startsWith("1 NAME")) {
          individual.name = fileLines[i].split(" ").slice(2).join(" ").trim().replaceAll("/", "");
        }
        
        if (fileLines[i].startsWith("1 SEX")) {
          individual.sex = fileLines[i].split(" ").slice(2).join(" ").trim();
        }
        
        if (fileLines[i].startsWith("1 FAMC")) {
          individual.famc = fileLines[i].split(" ")[2].trim();
          connections.push({ type: "child", individual: id, family: individual.famc });
        }
        
        if (fileLines[i].startsWith("1 FAMS")) {
          individual.fams = fileLines[i].split(" ")[2].trim();
          connections.push({ type: "spouse", individual: id, family: individual.fams });
        }
      }
      individuals.push(individual);
    }

    if (recordType === "FAM") {
      let family = { id };
      while (true) {
        if (++i > fileLines.length || fileLines[i] == undefined) break
        if (fileLines[i].startsWith("0 @")) {--i; break}

        if (fileLines[i].startsWith("1 HUSB")) {
          family.husband = fileLines[i].split(" ")[2].trim();
          connections.push({ type: "spouse", individual: family.husband, family: id });
        }
        if (fileLines[i].startsWith("1 WIFE")) {
          family.wife = fileLines[i].split(" ")[2].trim();
          connections.push({ type: "spouse", individual: family.wife, family: id });
        }
        if (fileLines[i].startsWith("1 CHIL")) {
          if (!family.children) family.children = [];
          family.children.push(fileLines[i].split(" ")[2].trim());
          connections.push({ type: "child", individual: fileLines[i].split(" ")[2].trim(), family: id });
        }
      }
      families.push(family);
    }

  }
  return { individuals, families, connections };
}

async function checkFileExist(path, timeout = 2000)
{
    let totalTime = 0; 
    let checkTime = timeout / 10;
    return await new Promise((resolve, reject) => {
        const timer = setInterval(function() {
            totalTime += checkTime;
            let fileExists = fs.existsSync(path);
            if (fileExists || totalTime >= timeout) {
                clearInterval(timer);
                resolve(fileExists);
            }
        }, checkTime);
    });
}

function parse_ged_file_wrapper(filename) {
  checkFileExist(filename)
  tree = parseGEDFile(filename)
  find_sprawl("Krishan-kanta(Geeta) Chopra", tree)
  return tree
}

function convert_id_to_idx(id) {
  if (id.includes("I"))
    return parseInt(id.replaceAll("@", "").replaceAll("I", "")) - 1
  if (id.includes("F"))
    return parseInt(id.replaceAll("@", "").replaceAll("F", "")) - 1
  return -1
}

function get_specific_family(indiv_id, fam_id, tree) {
  let fam_c_idx = fam_id[0];
  let fam_s_idx = fam_id[1];

  if (fam_c_idx != undefined) {
    fam_c_idx = convert_id_to_idx(fam_c_idx)
    var fam = tree["families"][fam_c_idx]
    console.log(fam)
    console.log("Father", individuals[convert_id_to_idx(fam.husband)])
    console.log("Mother", individuals[convert_id_to_idx(fam.wife)])

    for (s_idx in fam.children) {
      if (fam.children[s_idx] == indiv_id) continue;
      console.log("Siblings", individuals[convert_id_to_idx(fam.children[s_idx])])
    }
  }

  if (fam_s_idx != undefined) {
    fam_s_idx = convert_id_to_idx(fam_s_idx)
    var fam = tree["families"][fam_s_idx]
  }

  
}


function find_sprawl(person_name, tree) {
  // Finding Person
  individuals = tree["individuals"]
  for (i in individuals) {
    console.log(individuals[i].name)
    if (individuals[i].name == person_name) {
      console.log("Found Him", individuals[i])
      get_specific_family(individuals[i].id, [individuals[i].famc, individuals[i].fams], tree)
      break
    }
  }
}

module.exports = {parse_ged_file_wrapper};
