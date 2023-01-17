
let male_color = '#87CEFA'
let female_color = '#FFC0CB'


class family_tree {
  constructor(x, y, width, height, name, sex, image, id) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.radii = this.radii
    this.name = name
    this.sex = sex
    this.image = image
    this.id = id
  }
}

function draw_canvas_grid(ctx, grid_line_width, grid_line_color, spacing) {
  // Set the line width and stroke color
  ctx.lineWidth = grid_line_width;
  ctx.strokeStyle = grid_line_color;

  // Draw the horizontal lines
  for (var i = 0; i <= canvas.height; i += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(canvas.width, i);
    ctx.stroke();
  }

  // Draw the vertical lines
  for (var i = 0; i <= canvas.width; i += spacing) {
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
    roundedRect(ctx, i*node_size + i*node_size, 100, node_size, node_size, 15, male_color, "Raman Nayyar", null);  
  }
  for (i=0;i<105;i++){
    roundedRect(ctx, i*node_size + i*node_size, 300, node_size, node_size, 15, female_color, "Vibha Nayyar", img);  
  }
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





