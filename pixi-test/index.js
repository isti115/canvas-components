const init = () => {
  let type = 'WebGL'
  if(!PIXI.utils.isWebGLSupported()){
    type = "canvas"
  }

  PIXI.utils.sayHello(type)

  //Create a Pixi Application
  let app = new PIXI.Application({width: 1500, height: 800});

  //Add the canvas that Pixi automatically created for you to the HTML document
  document.body.appendChild(app.view);

  for(let i = 0; i < 6000; i++) {
    const pixiCircle = new PIXI.Graphics();
    pixiCircle.lineStyle(1, 0xFF00FF);  //(thickness, color)
    pixiCircle.drawCircle(1500 * Math.random(), 800 * Math.random(), 10);   //(x,y,radius)
    pixiCircle.endFill();
    app.stage.addChild(pixiCircle);
  }
}

window.addEventListener('load', init)
