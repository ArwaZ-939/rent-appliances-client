// Utility: random number between min and max
function range(min, max) {
	return min + (max - min) * Math.random();
  }
  
  // ParticleEngine constructor
  function ParticleEngine(canvas_id) {
	this.canvas_id = canvas_id;
	const canvas = document.getElementById(canvas_id);
	canvas.width = canvas.offsetWidth;
	canvas.height = canvas.offsetHeight;
  
	this.width = canvas.width;
	this.height = canvas.height;
  
	this.stage = new createjs.Stage(canvas);
	this.stage.compositeOperation = "lighter";
  
	this.particles = [];
  
	// Create particles with new shape and color #7B4F2C
	for (let i = 0; i < 120; i++) {
	  const shape = new createjs.Shape();
	  shape.graphics.beginFill("white").drawRect(0, 0, range(5, 10), range(5, 10)); // Rectangular particles
	  shape.x = range(0, this.width);
	  shape.y = range(0, this.height);
	  shape.alpha = range(0.1, 0.6);
	  this.stage.addChild(shape);
	  this.animate(shape);
	  this.particles.push(shape);
	}
  }
  
  // Animate individual particles
  ParticleEngine.prototype.animate = function(shape) {
	const duration = range(4, 8);
	const newX = range(0, this.width);
	const newY = range(0, this.height);
	const newAlpha = range(0.2, 0.6);
	const newScale = range(0.4, 1.2);
  
	gsap.to(shape, {
	  duration: duration,
	  x: newX,
	  y: newY,
	  alpha: newAlpha,
	  scaleX: newScale,
	  scaleY: newScale,
	  ease: "sine.inOut",
	  onComplete: () => this.animate(shape)
	});
  };
  
  // Render method
  ParticleEngine.prototype.render = function() {
	this.stage.update();
  };
  
  // Init engine and resize support
  const particles = new ParticleEngine("projector");
  createjs.Ticker.framerate = 60;
  createjs.Ticker.addEventListener("tick", () => particles.render());
  window.addEventListener("resize", () => location.reload());
  