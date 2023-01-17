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
    console.log("Father", JSON.stringify(individuals[convert_id_to_idx(fam.husband)]))
    console.log("Mother", JSON.stringify(individuals[convert_id_to_idx(fam.wife)]))

    for (s_idx in fam.children) {
      if (fam.children[s_idx] == indiv_id) continue;
      console.log("Siblings", JSON.stringify(individuals[convert_id_to_idx(fam.children[s_idx])]))
    }
  }
  console.log("====================================================")
  if (fam_s_idx != undefined) {
    console.log(fam_s_idx)
    fam_s_idx = convert_id_to_idx(fam_s_idx)
    var fam = tree["families"][fam_s_idx]
    if (fam.husband != indiv_id) {
      console.log("Husband", JSON.stringify(individuals[convert_id_to_idx(fam.husband)]))
    } else if (fam.wife != indiv_id) {
      console.log("Wife", JSON.stringify(individuals[convert_id_to_idx(fam.wife)]))
    }

    for (c_idx in fam.children)
      console.log("Children", JSON.stringify(individuals[convert_id_to_idx(fam.children[c_idx])]))
  }  
}


function find_sprawl(person_name, tree) {
  console.log("\n\n")
  // Finding Person
  individuals = tree["individuals"]
  for (i in individuals) {
    if (individuals[i].name == person_name) {
      console.log("Individual Found", JSON.stringify(individuals[i]))
      get_specific_family(individuals[i].id, [individuals[i].famc, individuals[i].fams], tree)
      break
    }
  }
}

function parseGEDFile(fileData) {
  fileLines = fileData.split("\n");
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
      individual["name"] = [];
      individual["sex"] = [];
      individual["famc"] = [];
      individual["fams"] = [];
      individual["other"] = [];

      while (true) {
        if ((++i > fileLines.length) || (fileLines[i].startsWith("0 @"))) {--i; break}
        
        if (fileLines[i].startsWith("1 NAME")) {
          individual.name.push(fileLines[i].split(" ").slice(2).join(" ").trim().replaceAll("/", ""));
        } else if (fileLines[i].startsWith("1 SEX")) {
          individual.sex.push(fileLines[i].split(" ").slice(2).join(" ").trim())
        } else if (fileLines[i].startsWith("1 FAMC")) {
          individual.famc.push(fileLines[i].split(" ")[2].trim());
          connections.push({ type: "child", individual: id, family: individual.famc });
        } else if (fileLines[i].startsWith("1 FAMS")) {
          individual.fams.push(fileLines[i].split(" ")[2].trim());
          connections.push({ type: "spouse", individual: id, family: individual.fams });
        } else {
          individual.other.push(fileLines[i].split(" ")[1].trim()+"__"+fileLines[i].split(" ")[2].trim());
        }
      }
      individuals.push(individual);
    }

    if (recordType === "FAM") {
      let family = { id };
      family["husband"] = [];
      family["wife"] = [];
      family["children"] = [];
      family["other"] = [];
      while (true) {
        if (++i > fileLines.length || fileLines[i] == undefined) break
        if (fileLines[i].startsWith("0 @")) {--i; break}

        if (fileLines[i].startsWith("1 HUSB")) {
          family.husband.push(fileLines[i].split(" ")[2].trim());
          connections.push({ type: "spouse", individual: family.husband, family: id });
        } else if (fileLines[i].startsWith("1 WIFE")) {
          family.wife.push(fileLines[i].split(" ")[2].trim());
          connections.push({ type: "spouse", individual: family.wife, family: id });
        } else if (fileLines[i].startsWith("1 CHIL")) {
          if (!family.children) family.children = [];
          family.children.push(fileLines[i].split(" ")[2].trim());
          connections.push({ type: "child", individual: fileLines[i].split(" ")[2].trim(), family: id });
        } else {
          //family.other.push(fileLines[i].split(" ")[1].trim()+"__"+fileLines[i].split(" ")[2].trim());
        }
      }
      families.push(family);
    }

  }
  return { individuals, families, connections };
}



class Graph {
  constructor() {
    this.adjacencyList = {};
  }
  
  addVertex(vertex) {
    if (!this.adjacencyList[vertex]) this.adjacencyList[vertex] = [];
  }

  addEdge(vertex1, vertex2, weight) {
    this.adjacencyList[vertex1].push({ vertex: vertex2, weight});
  }
  
  edgeWeight(vertex1, vertex2) {
    this.adjacencyList[vertex1].forEach(element => {
      if (element.vertex == vertex2) {
        return element.weight
      }
    });
  }

  removeEdge(vertex1, vertex2) {
    this.adjacencyList[vertex1] = this.adjacencyList[vertex1].filter(
      v => v !== vertex2
    );
    this.adjacencyList[vertex2] = this.adjacencyList[vertex2].filter(
      v => v !== vertex1
    );
  }

  removeVertex(vertex) {
    while (this.adjacencyList[vertex].length) {
      const adjacentVertex = this.adjacencyList[vertex].pop();
      this.removeEdge(vertex, adjacentVertex);
    }
    delete this.adjacencyList[vertex];
  }

  printGraph() {
    for (let vertex in this.adjacencyList) {
      console.log(`${vertex} -> ${this.adjacencyList[vertex].join(", ")}`);
    }
  }

  longestPathRecursive(g, indiv_list) {
    
    function get_longest_path(g, start) {
    
      let longest = { path: [], weight: Number.NEGATIVE_INFINITY };

      function dfs(g, vertex, path = [], weight = 0) {
        path.push(vertex);
        if (weight > longest.weight) {
          longest = { path: [...path], weight };
        }

        for (let edge of g.adjacencyList[vertex]) {
          if (!path.includes(edge.vertex)) {
            dfs(g, edge.vertex, path, weight + edge.weight);
          }
        }
        path.pop();
      }
      dfs(g, start);
      return [longest.weight, longest.path]
    }

    var current_longest_weight = 0
    var current_longest_path = ""
    indiv_list.forEach(indiv_id => {
      var longest_data = get_longest_path(g, indiv_id.id)
      if (longest_data[0] > current_longest_weight) {
        current_longest_weight = longest_data[0]
        current_longest_path = longest_data[1]
      }
    });
    
    return [current_longest_weight, current_longest_path]
  }

}



function make_directed_graph(tree) {
  var g = new Graph(tree['individuals'].length);
  var person_verticies = [];

  //Adding all individuals as vertexes
  for (i in tree['individuals']) {
    person_verticies.push(tree['individuals'][i].id)
    g.addVertex(person_verticies[i])
  }

  for (f in tree['families']) {

    p1_id = tree['families'][f].husband
    p2_id = tree['families'][f].wife

    for (c in tree['families'][f].children) {
      g.addEdge(p1_id, tree['families'][f].children[c], 1);
      g.addEdge(p2_id, tree['families'][f].children[c], 1);
    }
  }

  var longest_path_data = g.longestPathRecursive(g, tree['individuals'])
  longest_path_data[1].forEach(id => {
    console.log(id, tree['individuals'][convert_id_to_idx(id)].name)
  });

}


function parse_ged_file_wrapper(fileData) {
  tree = parseGEDFile(fileData)
  for (f in tree["individuals"]) {
    console.log(JSON.stringify(tree["individuals"][f]))
  }

  for (f in tree["families"]) {
    console.log(JSON.stringify(tree["families"][f]))
  }

  for (f in tree["connections"]) {
    console.log(JSON.stringify(tree["connections"][f]))
  }

  make_directed_graph(tree)
  return tree
}






