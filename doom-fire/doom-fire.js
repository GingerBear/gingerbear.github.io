window.fig1 = initFig1();
window.fig2 = initFig2();
window.fig3 = initFig3();
window.fig4 = initFig4();
window.fig5 = initFig5();
window.fig6 = initFig6();

function initFig1() {
  const container = document.querySelector('#fig-1 .container');
  const WIDTH = 10;
  const HEIGHT = 10;
  const frame = [];
  let isAnimating = false;

  setupFrame();
  animate();
  paintFrame(frame);

  function animate() {
    requestAnimationFrame(() => {
      if (isAnimating) {
        nextFrame();
      }

      setTimeout(() => {
        animate();
      }, 300);
    });
  }

  function n(num) {
    return [...new Array(num)];
  }

  function setupFrame() {
    n(HEIGHT).forEach((_, i) => {
      n(WIDTH).forEach((_, j) => {
        frame[i] = frame[i] || [];
        frame[i][j] = 0;
      });
    });

    n(WIDTH).forEach((_, j) => {
      frame[HEIGHT - 1][j] = 9;
    });
  }

  function updateFrame(frame) {
    n(WIDTH).forEach((_, j) => {
      n(HEIGHT).forEach((_, i) => {
        if (i === 0) return;

        const currentColor = frame[i][j];

        if (currentColor === 0) {
          frame[i - 1][j] = 0;
        } else {
          frame[i - 1][j] = currentColor - 1;
        }
      });
    });
  }

  function paintFrame(pxiels) {
    container.innerHTML = pxiels
      .map(p => {
        const row = p
          .map(c => {
            return `<span>${c}</span>`;
          })
          .join('');

        return `<div class="row">${row}</div>`;
      })
      .join('');
  }

  function nextFrame() {
    updateFrame(frame);
    paintFrame(frame);
  }

  function startAnimate() {
    isAnimating = true;
  }

  function stopAnimate() {
    isAnimating = false;
  }

  function handleNext() {
    isAnimating = false;
    nextFrame();
  }

  function resetFrame() {
    isAnimating = false;
    n(HEIGHT).forEach((_, i) => {
      n(WIDTH).forEach((_, j) => {
        frame[i] = frame[i] || [];
        frame[i][j] = 0;
      });
    });

    n(WIDTH).forEach((_, j) => {
      frame[HEIGHT - 1][j] = 9;
    });

    paintFrame(frame);
  }

  return {
    startAnimate,
    stopAnimate,
    handleNext,
    resetFrame
  };
}

function initFig2() {
  const container = document.querySelector('#fig-2 .container');
  const WIDTH = 38;
  const HEIGHT = 64;
  const frame = [];
  const domCache = [];
  let isAnimating = false;
  const colorMap = [
    { r: 7, g: 7, b: 7 },
    { r: 31, g: 7, b: 7 },
    { r: 47, g: 15, b: 7 },
    { r: 71, g: 15, b: 7 },
    { r: 87, g: 23, b: 7 },
    { r: 103, g: 31, b: 7 },
    { r: 119, g: 31, b: 7 },
    { r: 143, g: 39, b: 7 },
    { r: 159, g: 47, b: 7 },
    { r: 175, g: 63, b: 7 },
    { r: 191, g: 71, b: 7 },
    { r: 199, g: 71, b: 7 },
    { r: 223, g: 79, b: 7 },
    { r: 223, g: 87, b: 7 },
    { r: 223, g: 87, b: 7 },
    { r: 215, g: 95, b: 7 },
    { r: 215, g: 95, b: 7 },
    { r: 215, g: 103, b: 15 },
    { r: 207, g: 111, b: 15 },
    { r: 207, g: 119, b: 15 },
    { r: 207, g: 127, b: 15 },
    { r: 207, g: 135, b: 23 },
    { r: 199, g: 135, b: 23 },
    { r: 199, g: 143, b: 23 },
    { r: 199, g: 151, b: 31 },
    { r: 191, g: 159, b: 31 },
    { r: 191, g: 159, b: 31 },
    { r: 191, g: 167, b: 39 },
    { r: 191, g: 167, b: 39 },
    { r: 191, g: 175, b: 47 },
    { r: 183, g: 175, b: 47 },
    { r: 183, g: 183, b: 47 },
    { r: 183, g: 183, b: 55 },
    { r: 207, g: 207, b: 111 },
    { r: 223, g: 223, b: 159 },
    { r: 239, g: 239, b: 199 },
    { r: 255, g: 255, b: 255 }
  ];

  setupFrame();
  animate();
  paintFrameWithColor(frame);

  function animate() {
    requestAnimationFrame(() => {
      if (isAnimating) {
        nextFrame();
      }

      setTimeout(() => {
        animate();
      }, 64);
    });
  }

  function n(num) {
    return [...new Array(num)];
  }

  function setupFrame() {
    n(HEIGHT).forEach((_, i) => {
      n(WIDTH).forEach((_, j) => {
        frame[i] = frame[i] || [];
        frame[i][j] = 0;
      });
    });

    n(WIDTH).forEach((_, j) => {
      frame[HEIGHT - 1][j] = 36;
    });
  }

  function updateFrame(frame) {
    n(WIDTH).forEach((_, j) => {
      n(HEIGHT).forEach((_, i) => {
        if (i === 0) return;

        const currentColor = frame[i][j];

        if (currentColor === 0) {
          frame[i - 1][j] = 0;
        } else {
          frame[i - 1][j] = currentColor - 1;
        }
      });
    });
  }

  function paintFrameWithColor(pxiels) {
    if (!domCache.length) {
      container.innerHTML = pxiels
        .map((p, i) => {
          const row = p
            .map((c, j) => {
              const color = colorMap[c];
              return `<span
              data-pos="${i}-${j}"
              style="background: rgb(${color.r},${color.g},${color.b})">${c}</span>`;
            })
            .join('');
          return `<div class="row">${row}</div>`;
        })
        .join('');

      pxiels.map((p, i) => {
        p.map((c, j) => {
          domCache[i] = domCache[i] || [];
          domCache[i][j] = container.querySelector(`[data-pos="${i}-${j}"]`);
        });
      });
    } else {
      pxiels.map((p, i) => {
        p.map((c, j) => {
          const color = colorMap[c];
          domCache[i][j].style.backgroundColor = `rgb(${color.r},${color.g},${color.b})`;
          domCache[i][j].textContent = c;
        });
      });
    }
  }

  function nextFrame() {
    updateFrame(frame);

    paintFrameWithColor(frame);
  }

  function startAnimate() {
    isAnimating = true;
  }

  function stopAnimate() {
    isAnimating = false;
  }

  function handleNext() {
    isAnimating = false;
    nextFrame();
  }

  function resetFrame() {
    isAnimating = false;
    n(HEIGHT).forEach((_, i) => {
      n(WIDTH).forEach((_, j) => {
        frame[i] = frame[i] || [];
        frame[i][j] = 0;
      });
    });

    n(WIDTH).forEach((_, j) => {
      frame[HEIGHT - 1][j] = 36;
    });

    paintFrameWithColor(frame);
  }

  return {
    startAnimate,
    stopAnimate,
    handleNext,
    resetFrame
  };
}

function initFig3() {
  const container = document.querySelector('#fig-3 .container');
  const WIDTH = 38;
  const HEIGHT = 64;
  const frame = [];
  const domCache = [];
  let isAnimating = false;
  const colorMap = [
    { r: 7, g: 7, b: 7 },
    { r: 31, g: 7, b: 7 },
    { r: 47, g: 15, b: 7 },
    { r: 71, g: 15, b: 7 },
    { r: 87, g: 23, b: 7 },
    { r: 103, g: 31, b: 7 },
    { r: 119, g: 31, b: 7 },
    { r: 143, g: 39, b: 7 },
    { r: 159, g: 47, b: 7 },
    { r: 175, g: 63, b: 7 },
    { r: 191, g: 71, b: 7 },
    { r: 199, g: 71, b: 7 },
    { r: 223, g: 79, b: 7 },
    { r: 223, g: 87, b: 7 },
    { r: 223, g: 87, b: 7 },
    { r: 215, g: 95, b: 7 },
    { r: 215, g: 95, b: 7 },
    { r: 215, g: 103, b: 15 },
    { r: 207, g: 111, b: 15 },
    { r: 207, g: 119, b: 15 },
    { r: 207, g: 127, b: 15 },
    { r: 207, g: 135, b: 23 },
    { r: 199, g: 135, b: 23 },
    { r: 199, g: 143, b: 23 },
    { r: 199, g: 151, b: 31 },
    { r: 191, g: 159, b: 31 },
    { r: 191, g: 159, b: 31 },
    { r: 191, g: 167, b: 39 },
    { r: 191, g: 167, b: 39 },
    { r: 191, g: 175, b: 47 },
    { r: 183, g: 175, b: 47 },
    { r: 183, g: 183, b: 47 },
    { r: 183, g: 183, b: 55 },
    { r: 207, g: 207, b: 111 },
    { r: 223, g: 223, b: 159 },
    { r: 239, g: 239, b: 199 },
    { r: 255, g: 255, b: 255 }
  ];

  setupFrame();
  animate();
  paintFrameWithColor(frame);

  function animate() {
    requestAnimationFrame(() => {
      if (isAnimating) {
        nextFrame();
      }

      setTimeout(() => {
        animate();
      }, 64);
    });
  }

  function n(num) {
    return [...new Array(num)];
  }

  function setupFrame() {
    n(HEIGHT).forEach((_, i) => {
      n(WIDTH).forEach((_, j) => {
        frame[i] = frame[i] || [];
        frame[i][j] = 0;
      });
    });

    n(WIDTH).forEach((_, j) => {
      frame[HEIGHT - 1][j] = 36;
    });
  }

  function updateFrame(frame) {
    n(WIDTH).forEach((_, j) => {
      n(HEIGHT).forEach((_, i) => {
        if (i === 0) return;

        const currentColor = frame[i][j];

        if (currentColor === 0) {
          frame[i - 1][j] = 0;
        } else {
          const rand = Math.random();
          frame[i - 1][j] = currentColor - (rand > 0.5 ? 1 : 0);
        }
      });
    });
  }

  function paintFrameWithColor(pxiels) {
    if (!domCache.length) {
      container.innerHTML = pxiels
        .map((p, i) => {
          const row = p
            .map((c, j) => {
              const color = colorMap[c];
              return `<span
              data-pos="${i}-${j}"
              style="background: rgb(${color.r},${color.g},${color.b})">${c}</span>`;
            })
            .join('');
          return `<div class="row">${row}</div>`;
        })
        .join('');

      pxiels.map((p, i) => {
        p.map((c, j) => {
          domCache[i] = domCache[i] || [];
          domCache[i][j] = container.querySelector(`[data-pos="${i}-${j}"]`);
        });
      });
    } else {
      pxiels.map((p, i) => {
        p.map((c, j) => {
          const color = colorMap[c];
          domCache[i][j].style.backgroundColor = `rgb(${color.r},${color.g},${color.b})`;
          domCache[i][j].textContent = c;
        });
      });
    }
  }

  function nextFrame() {
    updateFrame(frame);

    paintFrameWithColor(frame);
  }

  function startAnimate() {
    isAnimating = true;
  }

  function stopAnimate() {
    isAnimating = false;
  }

  function handleNext() {
    isAnimating = false;
    nextFrame();
  }

  function resetFrame() {
    isAnimating = false;
    n(HEIGHT).forEach((_, i) => {
      n(WIDTH).forEach((_, j) => {
        frame[i] = frame[i] || [];
        frame[i][j] = 0;
      });
    });

    n(WIDTH).forEach((_, j) => {
      frame[HEIGHT - 1][j] = 36;
    });

    paintFrameWithColor(frame);
  }

  return {
    startAnimate,
    stopAnimate,
    handleNext,
    resetFrame
  };
}

function initFig4() {
  const container = document.querySelector('#fig-4 .container');
  const WIDTH = 38;
  const HEIGHT = 64;
  const frame = [];
  const domCache = [];
  let isAnimating = false;
  const colorMap = [
    { r: 7, g: 7, b: 7 },
    { r: 31, g: 7, b: 7 },
    { r: 47, g: 15, b: 7 },
    { r: 71, g: 15, b: 7 },
    { r: 87, g: 23, b: 7 },
    { r: 103, g: 31, b: 7 },
    { r: 119, g: 31, b: 7 },
    { r: 143, g: 39, b: 7 },
    { r: 159, g: 47, b: 7 },
    { r: 175, g: 63, b: 7 },
    { r: 191, g: 71, b: 7 },
    { r: 199, g: 71, b: 7 },
    { r: 223, g: 79, b: 7 },
    { r: 223, g: 87, b: 7 },
    { r: 223, g: 87, b: 7 },
    { r: 215, g: 95, b: 7 },
    { r: 215, g: 95, b: 7 },
    { r: 215, g: 103, b: 15 },
    { r: 207, g: 111, b: 15 },
    { r: 207, g: 119, b: 15 },
    { r: 207, g: 127, b: 15 },
    { r: 207, g: 135, b: 23 },
    { r: 199, g: 135, b: 23 },
    { r: 199, g: 143, b: 23 },
    { r: 199, g: 151, b: 31 },
    { r: 191, g: 159, b: 31 },
    { r: 191, g: 159, b: 31 },
    { r: 191, g: 167, b: 39 },
    { r: 191, g: 167, b: 39 },
    { r: 191, g: 175, b: 47 },
    { r: 183, g: 175, b: 47 },
    { r: 183, g: 183, b: 47 },
    { r: 183, g: 183, b: 55 },
    { r: 207, g: 207, b: 111 },
    { r: 223, g: 223, b: 159 },
    { r: 239, g: 239, b: 199 },
    { r: 255, g: 255, b: 255 }
  ];

  setupFrame();
  animate();
  paintFrameWithColor(frame);

  function animate() {
    requestAnimationFrame(() => {
      if (isAnimating) {
        nextFrame();
      }

      setTimeout(() => {
        animate();
      }, 64);
    });
  }

  function n(num) {
    return [...new Array(num)];
  }

  function setupFrame() {
    n(HEIGHT).forEach((_, i) => {
      n(WIDTH).forEach((_, j) => {
        frame[i] = frame[i] || [];
        frame[i][j] = 0;
      });
    });

    n(WIDTH).forEach((_, j) => {
      frame[HEIGHT - 1][j] = 36;
    });
  }

  function updateFrame(frame) {
    n(WIDTH).forEach((_, j) => {
      n(HEIGHT).forEach((_, i) => {
        if (i === 0) return;

        const currentColor = frame[i][j];

        if (currentColor === 0) {
          frame[i - 1][j] = 0;
        } else {
          const rand = Math.random();
          const nextJ = j - Math.round(rand * 2) + 1;
          console.log(i, -Math.round(rand * 2) + 1, nextJ);
          if (nextJ < 0 || nextJ > WIDTH - 1) return;
          frame[i - 1][nextJ] = currentColor - (rand > 0.5 ? 1 : 0);
        }
      });
    });
  }

  function paintFrameWithColor(pxiels) {
    if (!domCache.length) {
      container.innerHTML = pxiels
        .map((p, i) => {
          const row = p
            .map((c, j) => {
              const color = colorMap[c];
              return `<span
              data-pos="${i}-${j}"
              style="background: rgb(${color.r},${color.g},${color.b})">${c}</span>`;
            })
            .join('');
          return `<div class="row">${row}</div>`;
        })
        .join('');

      pxiels.map((p, i) => {
        p.map((c, j) => {
          domCache[i] = domCache[i] || [];
          domCache[i][j] = container.querySelector(`[data-pos="${i}-${j}"]`);
        });
      });
    } else {
      pxiels.map((p, i) => {
        p.map((c, j) => {
          const color = colorMap[c];
          domCache[i][j].style.backgroundColor = `rgb(${color.r},${color.g},${color.b})`;
          domCache[i][j].textContent = c;
        });
      });
    }
  }

  function nextFrame() {
    updateFrame(frame);

    paintFrameWithColor(frame);
  }

  function startAnimate() {
    isAnimating = true;
  }

  function stopAnimate() {
    isAnimating = false;
  }

  function handleNext() {
    isAnimating = false;
    nextFrame();
  }

  function resetFrame() {
    isAnimating = false;
    n(HEIGHT).forEach((_, i) => {
      n(WIDTH).forEach((_, j) => {
        frame[i] = frame[i] || [];
        frame[i][j] = 0;
      });
    });

    n(WIDTH).forEach((_, j) => {
      frame[HEIGHT - 1][j] = 36;
    });

    paintFrameWithColor(frame);
  }

  return {
    startAnimate,
    stopAnimate,
    handleNext,
    resetFrame
  };
}

function initFig5() {
  const convas = document.querySelector('#fig-5 .fire-convas');
  const WIDTH = 250;
  const HEIGHT = 100;
  const frame = [];

  let isAnimating = false;
  const colorMap = [
    { r: 7, g: 7, b: 7 },
    { r: 31, g: 7, b: 7 },
    { r: 47, g: 15, b: 7 },
    { r: 71, g: 15, b: 7 },
    { r: 87, g: 23, b: 7 },
    { r: 103, g: 31, b: 7 },
    { r: 119, g: 31, b: 7 },
    { r: 143, g: 39, b: 7 },
    { r: 159, g: 47, b: 7 },
    { r: 175, g: 63, b: 7 },
    { r: 191, g: 71, b: 7 },
    { r: 199, g: 71, b: 7 },
    { r: 223, g: 79, b: 7 },
    { r: 223, g: 87, b: 7 },
    { r: 223, g: 87, b: 7 },
    { r: 215, g: 95, b: 7 },
    { r: 215, g: 95, b: 7 },
    { r: 215, g: 103, b: 15 },
    { r: 207, g: 111, b: 15 },
    { r: 207, g: 119, b: 15 },
    { r: 207, g: 127, b: 15 },
    { r: 207, g: 135, b: 23 },
    { r: 199, g: 135, b: 23 },
    { r: 199, g: 143, b: 23 },
    { r: 199, g: 151, b: 31 },
    { r: 191, g: 159, b: 31 },
    { r: 191, g: 159, b: 31 },
    { r: 191, g: 167, b: 39 },
    { r: 191, g: 167, b: 39 },
    { r: 191, g: 175, b: 47 },
    { r: 183, g: 175, b: 47 },
    { r: 183, g: 183, b: 47 },
    { r: 183, g: 183, b: 55 },
    { r: 207, g: 207, b: 111 },
    { r: 223, g: 223, b: 159 },
    { r: 239, g: 239, b: 199 },
    { r: 255, g: 255, b: 255 }
  ];

  setupFrame();
  animate();
  paintFrameWithConvas(frame);

  function animate() {
    requestAnimationFrame(() => {
      if (isAnimating) {
        nextFrame();
      }

      animate();
    });
  }

  function n(num) {
    return [...new Array(num)];
  }

  function setupFrame() {
    n(HEIGHT).forEach((_, i) => {
      n(WIDTH).forEach((_, j) => {
        frame[i] = frame[i] || [];
        frame[i][j] = 0;
      });
    });

    n(WIDTH).forEach((_, j) => {
      frame[HEIGHT - 1][j] = 36;
    });
  }

  function updateFrame(frame) {
    n(WIDTH).forEach((_, j) => {
      n(HEIGHT).forEach((_, i) => {
        if (i === 0) return;

        const currentColor = frame[i][j];

        if (currentColor === 0) {
          frame[i - 1][j] = 0;
        } else {
          const rand = Math.random();
          const nextJ = j - Math.round(rand * 2) + 1;

          if (nextJ < 0 || nextJ > WIDTH - 1) return;
          frame[i - 1][nextJ] = currentColor - (rand > 0.5 ? 1 : 0);
        }
      });
    });
  }

  function paintFrameWithConvas(pxiels) {
    const ctx = convas.getContext('2d');

    const scaleWidth = Math.ceil(convas.width / WIDTH);
    const scaleHeight = Math.ceil(convas.height / HEIGHT);

    pxiels.forEach((row, j) => {
      row.forEach((p, i) => {
        ctx.fillStyle = `rgb(${colorMap[p].r},${colorMap[p].g},${colorMap[p].b})`;
        ctx.fillRect(i * scaleWidth, j * scaleHeight, scaleWidth, scaleHeight);
      });
    });
  }

  function nextFrame() {
    updateFrame(frame);

    paintFrameWithConvas(frame);
  }

  function startAnimate() {
    isAnimating = true;
  }

  function stopAnimate() {
    isAnimating = false;
  }

  function handleNext() {
    isAnimating = false;
    nextFrame();
  }

  function resetFrame() {
    isAnimating = false;
    n(HEIGHT).forEach((_, i) => {
      n(WIDTH).forEach((_, j) => {
        frame[i] = frame[i] || [];
        frame[i][j] = 0;
      });
    });

    n(WIDTH).forEach((_, j) => {
      frame[HEIGHT - 1][j] = 36;
    });

    paintFrameWithConvas(frame);
  }

  return {
    startAnimate,
    stopAnimate,
    handleNext,
    resetFrame
  };
}

function initFig6() {
  const convas = document.querySelector('#fig-6 .fire-convas');
  const WIDTH = 250;
  const HEIGHT = 100;
  const frame = [];

  let isAnimating = false;
  let isFading = false;
  let wind = 0;
  let intensity = 0.5;

  const colorMap = [
    { r: 7, g: 7, b: 7 },
    { r: 31, g: 7, b: 7 },
    { r: 47, g: 15, b: 7 },
    { r: 71, g: 15, b: 7 },
    { r: 87, g: 23, b: 7 },
    { r: 103, g: 31, b: 7 },
    { r: 119, g: 31, b: 7 },
    { r: 143, g: 39, b: 7 },
    { r: 159, g: 47, b: 7 },
    { r: 175, g: 63, b: 7 },
    { r: 191, g: 71, b: 7 },
    { r: 199, g: 71, b: 7 },
    { r: 223, g: 79, b: 7 },
    { r: 223, g: 87, b: 7 },
    { r: 223, g: 87, b: 7 },
    { r: 215, g: 95, b: 7 },
    { r: 215, g: 95, b: 7 },
    { r: 215, g: 103, b: 15 },
    { r: 207, g: 111, b: 15 },
    { r: 207, g: 119, b: 15 },
    { r: 207, g: 127, b: 15 },
    { r: 207, g: 135, b: 23 },
    { r: 199, g: 135, b: 23 },
    { r: 199, g: 143, b: 23 },
    { r: 199, g: 151, b: 31 },
    { r: 191, g: 159, b: 31 },
    { r: 191, g: 159, b: 31 },
    { r: 191, g: 167, b: 39 },
    { r: 191, g: 167, b: 39 },
    { r: 191, g: 175, b: 47 },
    { r: 183, g: 175, b: 47 },
    { r: 183, g: 183, b: 47 },
    { r: 183, g: 183, b: 55 },
    { r: 207, g: 207, b: 111 },
    { r: 223, g: 223, b: 159 },
    { r: 239, g: 239, b: 199 },
    { r: 255, g: 255, b: 255 }
  ];

  setupFrame();
  animate();
  paintFrameWithConvas(frame);

  function animate() {
    requestAnimationFrame(() => {
      if (isAnimating) {
        nextFrame();
      }

      animate();
    });
  }

  function n(num) {
    return [...new Array(num)];
  }

  function setupFrame() {
    n(HEIGHT).forEach((_, i) => {
      n(WIDTH).forEach((_, j) => {
        frame[i] = frame[i] || [];
        frame[i][j] = 0;
      });
    });

    n(WIDTH).forEach((_, j) => {
      frame[HEIGHT - 1][j] = 36;
    });
  }

  function updateFrame(frame) {
    n(WIDTH).forEach((_, j) => {
      n(HEIGHT).forEach((_, i) => {
        if (i === 0) return;

        const currentColor = frame[i][j];

        if (currentColor === 0) {
          frame[i - 1][j] = 0;
        } else {
          const rand = Math.random();
          const nextJ = j - Math.round(rand * 2) + 1 + wind;

          if (nextJ < 0 || nextJ > WIDTH - 1) return;
          frame[i - 1][nextJ] = currentColor - (rand > intensity ? 1 : 0);
        }
      });
    });

    // fading the flame by keep setting the bottom pixel to darker color
    if (isFading) {
      n(WIDTH).forEach((_, j) => {
        n(7).forEach((_, i) => {
          if (frame[HEIGHT - i - 1][j] > 0) {
            frame[HEIGHT - i - 1][j] -= Math.round(Math.random()); // -0 or -1
          }
        });
      });
    }
  }

  function paintFrameWithConvas(pxiels) {
    const ctx = convas.getContext('2d');

    const scaleWidth = Math.ceil(convas.width / WIDTH);
    const scaleHeight = Math.ceil(convas.height / HEIGHT);

    pxiels.forEach((row, j) => {
      row.forEach((p, i) => {
        ctx.fillStyle = `rgb(${colorMap[p].r},${colorMap[p].g},${colorMap[p].b})`;
        ctx.fillRect(i * scaleWidth, j * scaleHeight, scaleWidth, scaleHeight);
      });
    });
  }

  function nextFrame() {
    updateFrame(frame);

    paintFrameWithConvas(frame);
  }

  function startAnimate() {
    isFading = false;
    isAnimating = true;

    // set the bottom to white, so it can propagate up
    n(WIDTH).forEach((_, j) => {
      frame[HEIGHT - 1][j] = 36;
    });
  }

  function fade() {
    isFading = true;
  }

  function stopAnimate() {
    isAnimating = false;
  }

  function handleNext() {
    isAnimating = false;
    nextFrame();
  }

  function resetFrame() {
    isAnimating = false;
    n(HEIGHT).forEach((_, i) => {
      n(WIDTH).forEach((_, j) => {
        frame[i] = frame[i] || [];
        frame[i][j] = 0;
      });
    });

    n(WIDTH).forEach((_, j) => {
      frame[HEIGHT - 1][j] = 36;
    });

    paintFrameWithConvas(frame);
  }

  function changeWind(e) {
    wind = Math.round((e.target.value / 100) * 10) + -5;
  }

  function changeIntensity(e) {
    let val = e.target.value / 100;
    val = Math.min(0.95, val);
    val = Math.max(0.05, val);

    intensity = val;
  }

  return {
    startAnimate,
    stopAnimate,
    handleNext,
    resetFrame,
    fade,
    changeWind,
    changeIntensity
  };
}
