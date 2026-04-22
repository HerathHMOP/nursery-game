let idleTime = 0;
let scrollTime = 0;
let clicks = 0;
let drags = 0;
let correctDrops = 0;
let wrongDrops = 0;

let lastActivity = Date.now();

export const startTracking = () => {
  setInterval(() => {
    let now = Date.now();
    if (now - lastActivity > 2000) {
      idleTime++;
    }
  }, 1000);

  window.addEventListener("scroll", () => {
    scrollTime++;
    lastActivity = Date.now();
  });

  window.addEventListener("click", () => {
    clicks++;
    lastActivity = Date.now();
  });
};

export const recordDrag = () => {
  drags++;
  lastActivity = Date.now();
};

export const recordDrop = (correct) => {
  if (correct) correctDrops++;
  else wrongDrops++;
  lastActivity = Date.now();
};

export const getData = () => {
  return {
    idleTime,
    scrollTime,
    clicks,
    drags,
    correctDrops,
    wrongDrops,
  };
};