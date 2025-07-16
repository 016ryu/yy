let frequency = 0.001;
let fontSize = 100;

// 图片相关变量
let images = [];
let imgStates = [];

// 鸭子相关变量
let duck, duckX, duckY, duckDirection, duckStep;

// 噪音变量
let centerX, centerY, step, amplitude;

function preload() {
  img1 = loadImage("12.jpg");
  img2 = loadImage("13.png");
  img3 = loadImage("14.png");
  img4 = loadImage("15.png");
  img16 = loadImage("16.png");
  duck = loadImage("duck.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  centerX = windowWidth / 3;
  centerY = windowHeight / 2;
  textSize(fontSize);
  step = 0;
  amplitude = 300;

  // 初始化图片数组
  images = [
    { img: img1, x: random(width), y: random(height), angle: radians(15), scale: 6 }, // img1 初始倾斜 15 度
    { img: img2, x: random(width), y: random(height), angle: 0, scale: 2 },
    { img: img3, x: random(width), y: random(height), angle: 0, scale: 9 },
    { img: img4, x: random(width), y: random(height), angle: 0, scale: 9 },
    { img: img16, x: random(width), y: random(height), angle: 0, scale: 9 },
  ];

  // 初始化图片状态数组
  imgStates = images.map(() => ({
    flying: false,
    speedX: 0,
    speedY: 0,
    rotationSpeed: 0,
    gravity: 0.2, // 重力加速度
    targetX: 0,
    targetY: 0,
    time: 0,
    startX: 0, // 记录起始位置X
    startY: 0, // 记录起始位置Y
    noiseStepX: random(1000),
    noiseStepY: random(1000),
    returning: false, // 是否开始返回
    returnSpeedX: 0,
    returnSpeedY: 0,
  }));

  // 初始化鸭子
  duckX = width / 2;
  duckY = getY(duckX);
  duckDirection = 1; // 向右移动
  duckStep = 0.005; // 噪音曲线步长
}

function getY(x) {
  return centerY + noise(step, x * frequency) * amplitude;
}

function draw() {
  background(300);
  fill(0);

  // 更新噪音
  step += 0.01;

  // 绘制噪音区域
  fill(0, 250, 255);
  beginShape();
  vertex(0, height);
  for (let x = 0; x < width; x += 10) {
    vertex(x, getY(x));
  }
  vertex(width, height);
  endShape(CLOSE);

  // 绘制图片
  for (let i = 0; i < images.length; i++) {
    let imgData = images[i];
    let state = imgStates[i];

    if (state.flying) {
      state.time++;
      imgData.x += state.speedX;
      imgData.y += state.speedY;
      imgData.angle += state.rotationSpeed;
      state.speedY += state.gravity; // 应用重力加速度

      // 如果图片到达目标点，开始返回
      if (state.speedY > 0 && imgData.y >= state.targetY - 5) {
        state.flying = false;
        imgData.x = state.targetX;
        imgData.y = state.targetY;
        imgData.angle = 0;
        state.returning = true;
        state.returnSpeedX = (state.startX - imgData.x) / 100; // 缓慢返回
        state.returnSpeedY = (state.startY - imgData.y) / 100; // 缓慢返回
      }
    } else if (state.returning) {
      // 图片开始返回
      imgData.x += state.returnSpeedX;
      imgData.y += state.returnSpeedY;

      // 如果图片接近原始位置，停止返回
      if (dist(imgData.x, imgData.y, state.startX, state.startY) < 5) {
        imgData.x = state.startX;
        imgData.y = state.startY;
        state.returning = false;
      }
    } else {
      // 噪音运动
      state.noiseStepX += 0.005;
      state.noiseStepY += 0.005;
      imgData.x = map(noise(state.noiseStepX), 0, 1, 0, width);
      imgData.y = getY(imgData.x) + map(noise(state.noiseStepY), 0, 1, -50, 50);
    }

    // 绘制图片
    push();
    translate(imgData.x, imgData.y);
    rotate(imgData.angle);
    imageMode(CENTER);
    image(imgData.img, 0, 0, imgData.img.width / imgData.scale, imgData.img.height / imgData.scale);
    pop();
  }

  // 绘制鸭子
  drawDuck();
}

function drawDuck() {
  // 更新鸭子的噪音和位置
  duckX += duckDirection * 2;
  if (duckX > width || duckX < 0) {
    duckDirection *= -1; // 碰到屏幕边缘时反向
  }
  duckY = getY(duckX); // 根据噪音曲线更新鸭子位置

  // 绘制鸭子
  push();
  translate(duckX, duckY);
  imageMode(CENTER);
  image(duck, 0, 0, duck.width / 20, duck.height / 20);
  pop();
}

function mousePressed() {
  for (let i = 0; i < images.length; i++) {
    let imgData = images[i];
    let state = imgStates[i];
    let d = dist(mouseX, mouseY, imgData.x, imgData.y);

    // 点击图片时触发飞出效果
    if (d < 50 && !state.flying && !state.returning) {
      state.flying = true;

      // 记录起始位置
      state.startX = imgData.x;
      state.startY = imgData.y;

      // 随机生成目标位置
      state.targetX = random(width);
      state.targetY = getY(state.targetX) + random(-50, 50);

      // 初始速度
      state.speedX = (state.targetX - imgData.x) / 30 + random(-2, 2);
      state.speedY = -10; // 初始向上的速度
      state.rotationSpeed = random(-0.1, 0.1);
      state.time = 0;
    }
  }
}