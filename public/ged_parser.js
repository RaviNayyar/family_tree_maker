fam_tree_structure = null


function convert_id_to_idx(id) {
  if (id.includes("I"))
    return parseInt(id.replaceAll("@", "").replaceAll("I", "")) - 1
  if (id.includes("F"))
    return parseInt(id.replaceAll("@", "").replaceAll("F", "")) - 1
  return -1
}


function get_user_id_family(id) {
  for (f in fam_tree_structure["families"]) {
    console.log(JSON.stringify(fam_tree_structure["families"][f]))
  }
}


/*
  Function returns the immediate family of the selected individual
  @param indiv: Object representing the entire individual
*/
function get_specific_family(indiv) {
  indiv_id = indiv.id
  let fam_c = indiv.famc
  let fam_s = indiv.fams

  var fam_retval = []
  fam_s.forEach(s_idx => {
    fam = fam_tree_structure['families'][convert_id_to_idx(s_idx)]
    husband = fam.husband[0]
    wife = fam.wife[0]
    fam_temp = {}
    fam_temp["spouce"] = null
    if (husband != indiv_id) {
      fam_temp["spouce"] = fam_tree_structure['individuals'][convert_id_to_idx(husband)]
    } else if (wife != indiv_id) {
      fam_temp["spouce"] = fam_tree_structure['individuals'][convert_id_to_idx(wife)]
    }

    c_temp = []
    fam.children.forEach(child => {
      c_temp.push(fam_tree_structure['individuals'][convert_id_to_idx(child)])
    });
    fam_temp["children"] = c_temp
    fam_retval.push(fam_temp)
  });

  //console.log("FAM RETVAL: ", JSON.stringify(fam_retval))
  return fam_retval
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
      individual["gen"] = []
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
          individual.gen.push(null)
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


/*
  Function that uses depth first search to find the longest path front the start node
  Function is also used to map a generation to each individual when the root node is given as start
  @param g: directed graph object representing family tree
  @param start: the starting node upon which to start dfs
  @assign_gen: flag which allows the mapping of generations onto individuals
*/
function get_longest_path(g, start, assign_gen = false) {
  current_generation = 0
  let longest = { path: [], weight: Number.NEGATIVE_INFINITY };

  function dfs(g, vertex, path = [], weight = 0) {
    path.push(vertex);
    
    if (assign_gen) {
      fam_tree_structure['individuals'][convert_id_to_idx(vertex)]["gen"] = current_generation
      let vertex_family = get_specific_family(fam_tree_structure['individuals'][convert_id_to_idx(vertex)])
      vertex_family.forEach(fam => {
        if (fam.spouce != null)
          fam_tree_structure['individuals'][convert_id_to_idx(fam.spouce.id)]["gen"] = current_generation
      });
    }

    if (weight > longest.weight) {
      longest = { path: [...path], weight };
    }

    for (let edge of g.adjacencyList[vertex]) {
      if (assign_gen) current_generation += 1
      if (!path.includes(edge.vertex)) {
        dfs(g, edge.vertex, path, weight + edge.weight);
      }
    }

    if (assign_gen) current_generation -= 1
    path.pop();
  }
  dfs(g, start);
  return [longest.weight, longest.path]
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

  return g
}


function print_parsed_file(tree) {
  for (f in tree["individuals"]) {
    console.log(JSON.stringify(tree["individuals"][f]))
  }

  for (f in tree["families"]) {
    console.log(JSON.stringify(tree["families"][f]))
  }

  for (f in tree["connections"]) {
    console.log(JSON.stringify(tree["connections"][f]))
  }
}


function associate_family_by_generation(max_gen) {
  console.log(max_gen)
  for(let i=max_gen; i>= 0; --i) {
    console.log("================= GEN: ",i," =================")
    fam_tree_structure['families'].forEach(family => {
      if (family.children.length != 0) {
        family.children.forEach(child => {
          if (fam_tree_structure['individuals'][convert_id_to_idx(child)]["gen"] == i) {
            console.log(JSON.stringify(family))
          }
        })
      }
    })
  }
}


function get_individuals_by_generation(max_gen) {
  for(let i=0; i< max_gen; ++i) {
    console.log("================= GEN: ",i," =================")
    fam_tree_structure['individuals'].forEach(indiv => {
      if (indiv.gen == i) {
        console.log(indiv.name)
      }
    })
  }
}


function parse_ged_file_wrapper(fileData) {
  fam_tree_structure = parseGEDFile(fileData)
  g = make_directed_graph(fam_tree_structure)

  console.log("Recursive Depth First Search To Find Longest Tree Path")
  var longest_path_data = g.longestPathRecursive(g, fam_tree_structure['individuals'])
  longest_path_data[1].forEach(id => {
    console.log(id, fam_tree_structure['individuals'][convert_id_to_idx(id)].name)
  });

  max_generation = longest_path_data[0]
  root_node = longest_path_data[1][0]

  console.log(JSON.stringify(longest_path_data))
  console.log("MAX GEN: ", max_generation, "Root Node: ", root_node)

  // Assign generations to each individual in tree
  get_longest_path(g, longest_path_data[1][0], true)
  
  get_individuals_by_generation(max_generation)
  //associate_family_by_generation(max_generation)
  //print_parsed_file(fam_tree_structure)
  return longest_path_data
}






