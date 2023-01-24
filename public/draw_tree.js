
let male_color = '#87CEFA'
let female_color = '#FFC0CB'
const node_size = 100
const node_radii = 15
const spousal_spacing = node_size * 2
const fixed_family_height = node_size * 2


class family_tree_node {
  constructor(x, y, name, sex, image, id) {
    this.x = x
    this.y = y
    this.width = node_size
    this.height = node_size
    this.radii = node_radii
    this.name = name
    this.sex = sex
    this.image = image
    this.id = id
    this.top_mid = [x+node_size/2, y]
    this.left_mid = [x, y+node_size/2] 
    this.right_mid = [x+node_size, y+node_size/2] 
    this.bottom_mid = [x+node_size/2, y+node_size] 
  }
}

function draw_canvas_grid(ctx, grid_line_width, grid_line_color) {
  // Set the line width and stroke color
  ctx.lineWidth = grid_line_width;
  ctx.strokeStyle = grid_line_color;

  // Draw the horizontal lines
  for (var i = 0; i <= canvas.height; i += node_size) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(canvas.width, i);
    ctx.stroke();
  }

  // Draw the vertical lines
  for (var i = 0; i <= canvas.width; i += node_size) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, canvas.height);
    ctx.stroke();
  }
}

function draw_node(ctx, node_size) {
  var img = new Image();
  img.src = "mom_photo.jpg";

  for (i=0;i<105;i++){
    roundedRect(ctx, i*node_size + i*node_size, 100, node_size, node_size, 15, male_color, "Dad Name", null);  
  }
  for (i=0;i<105;i++){
    roundedRect(ctx, i*node_size + i*node_size, 300, node_size, node_size, 15, female_color, "Mom Name", img);  
  }
}

function pj(jsn) {
  return JSON.stringify(jsn)
}

function get_id_image(id) {
  return null
}



function draw_family_node(node) {
  var img = new Image();
  img.src = "mom_photo.jpg";
  color = null
  if (node.sex == "M") color = male_color
  else color = female_color
  roundedRect(ctx, node.x, node.y, node_size, node_size, node_radii, color, node.name, node.image)
}


function draw_parent_child_connection(default_x, default_y, child_node) {
  ctx.lineWidth = 2;
  ctx.strokeStyle = "black";
  
  var s_x = default_x + 1.5*node_size
  var s_y = default_y + 0.5*node_size
  var e_x = s_x
  var e_y = s_y + node_size

  //Down from spouce to middle
  ctx.beginPath();
  ctx.moveTo(s_x, s_y);
  ctx.lineTo(e_x, e_y);
  ctx.stroke();

  if (child_node.top_mid[1] == e_y) {  

    ctx.moveTo(child_node.top_mid[0], child_node.top_mid[1]);
    ctx.stroke();
  } else {
    console.log("Side to side")
    ctx.beginPath();
    ctx.moveTo(e_x, e_y);
    ctx.lineTo(child_node.top_mid[0], child_node.top_mid[1]-node_size/2);
    ctx.stroke()
    ctx.lineTo(child_node.top_mid[0], child_node.top_mid[1]);
    ctx.stroke();
  }

}

function create_parent_child_connection(child_array, default_x, default_y) {
  child_nodes = []
  num_children = child_array.length
  total_child_space = num_children * spousal_spacing
  child_fixed_y = default_y + fixed_family_height
  child_variable_x = (default_x + 1.5*node_size) - total_child_space/2
  child_array.forEach(child => {
    child = fam_tree_structure['individuals'][convert_id_to_idx(child)]
    console.log(child.name, child.sex)
    c_node = new family_tree_node(child_variable_x, child_fixed_y, child.name, child.sex, child.image, child.id)
    draw_family_node(c_node)
    draw_parent_child_connection(default_x, default_y, c_node)
    child_nodes.push(c_node)
    child_variable_x += spousal_spacing + node_size
  });  
  
}



function draw_spousal_connections(start_coord, stop_coord) {
  ctx.lineWidth = 3;
  ctx.strokeStyle = "black";
  ctx.beginPath();
  ctx.moveTo(start_coord[0], start_coord[1]);
  ctx.lineTo(stop_coord[0], start_coord[1]);
  ctx.stroke();
}
function create_spousal_connection(husband, wife, default_x, default_y) {
  husband = fam_tree_structure['individuals'][convert_id_to_idx(husband[0])]
  wife = fam_tree_structure['individuals'][convert_id_to_idx(wife[0])]


  husband_node = new family_tree_node(default_x, default_y, husband.name[0].replace(" ", "\n"), husband.sex[0], get_id_image(husband.id), husband.id)
  wife_node = new family_tree_node(default_x+spousal_spacing, default_y, wife.name[0], wife.sex[0], get_id_image(wife.id), wife.id)
  console.log(husband_node, wife_node)
  draw_family_node(husband_node)
  draw_family_node(wife_node)
  draw_spousal_connections(husband_node.right_mid, wife_node.left_mid)
  console.log("Test")
  return husband_node
}


function draw_i1_family() {
  i1_fam = fam_tree_structure['families'][0]
  console.log(i1_fam)

  console.log(i1_fam.husband) 
  console.log(i1_fam.wife)
  console.log(i1_fam.children)
  
  console.log(i1_fam.children.length)

  default_x = 200
  default_y = 200
  console.log("Test0.0")
  create_spousal_connection(i1_fam.husband, i1_fam.wife, default_x, default_y)
  create_parent_child_connection(i1_fam.children, default_x, default_y)
}

function draw_root_nodes(tree_height, dfs_data) {
  draw_i1_family()
  return
  console.log("Draw Root Tree")

  indiv = fam_tree_structure['individuals'][convert_id_to_idx(dfs_data[0])]
  console.log(JSON.stringify(indiv))
  immediate_family = get_specific_family(indiv, fam_tree_structure)
  console.log(immediate_family)
  immediate_family.forEach(branch => {
    husband_node = create_spousal_connection(indiv, branch.spouce)
    //draw_parent_child_connection(husband_node, 2, "black")
  });
}



function roundedRect(ctx, x, y, width, height, radius, color, text, img) {
  ctx.beginPath();
  ctx.moveTo(x, y + radius);
  ctx.arcTo(x, y + height, x + radius, y + height, radius);
  ctx.arcTo(x + width, y + height, x + width, y + height - radius, radius);
  ctx.arcTo(x + width, y, x + width - radius, y, radius);
  ctx.arcTo(x, y, x, y + radius, radius); 

  ctx.fillStyle = color;
  ctx.fill();
  //ctx.strokeStyle = color
  ctx.fillStyle = "black";
  ctx.font = "15px Arial";
  ctx.fillText(text, x+20, y+20);
  if (img != null) {
    ctx.drawImage(img, x+30, y+30, width*0.75, height*0.75);
  }
  ctx.stroke();
}





