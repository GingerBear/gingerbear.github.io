/**
 * TODO:
 * - breadth first search
 * - A*
 * - lian lian kan
 * - lian lian kan + A*?
 * - multi finding
 *
 */

main();

async function main() {
  const gridWidth = 30;
  const gridHeight = 30;
  const grid = [];

  for (let i = 0; i < gridHeight; i++) {
    for (let j = 0; j < gridWidth; j++) {
      grid[i] = grid[i] || [];
      grid[i][j] = 1;

      if (i > 13 && i < 27 && (j > 10 && j < 14)) {
        grid[i][j] = 0;
      }
    }
  }

  const from = { x: 5, y: 18 };
  const to = { x: 26, y: 17 };

  drawGrid(grid, from, to);

  const path = await pathFindDijkstra(grid, from, to);
  console.log(path);

  drawPath(path);
}

function drawPath(path) {
  path.forEach(item => {
    if (!item.x) return;
    document.querySelector(`.y-${item.y} .x-${item.x}`).classList.add('path');
  });
}

function drawGrid(grid, from, to) {
  let html = ``;

  for (let i = 0; i < grid.length; i++) {
    html += `<div class="y-${i} row">`;
    for (let j = 0; j < grid[i].length; j++) {
      const classes = [
        `x-${j}`,
        `node`,
        grid[i][j] ? '' : 'hill',
        from.x === j && from.y === i ? 'from' : '',
        to.x === j && to.y === i ? 'to' : ''
      ];

      html += `<span title="${j},${i}" class="${classes.filter(Boolean).join(' ')}"></span>`;
    }
    html += '</div>';
  }

  document.querySelector('.grid').innerHTML = html;
}

async function pathFindDijkstra(grid, from, to) {
  const queue = [from];
  const prevs = [];

  prevs[from.y] = prevs[from.y] || [];
  prevs[from.y][from.x] = 1;

  while (queue.length) {
    const item = queue.shift();
    if (item.x === to.x && item.y === to.y) {
      return backTracePath(prevs, to);
    }

    await sleep(5);

    [
      [item.x, item.y - 1],
      [item.x - 1, item.y],
      [item.x, item.y + 1],
      [item.x + 1, item.y]
    ].forEach(([x, y]) => {
      if (existAndUnvisited(grid, prevs, x, y)) {
        queue.push({ x: x, y: y });

        prevs[y] = prevs[y] || [];
        prevs[y][x] = item;
        document.querySelector(`.y-${y} .x-${x}`).classList.add('visited');
      }
    });
  }
}

function backTracePath(prevs, item) {
  const path = [item];
  let curr = item;

  while (prevs[curr.y][curr.x]) {
    path.push(prevs[curr.y][curr.x]);
    curr = prevs[curr.y][curr.x];
    if (curr === 1) {
      break;
    }
  }

  return path;
}

function exist(grid, x, y) {
  return grid[y] && grid[y][x];
}

function existAndUnvisited(grid, prevs, x, y) {
  return exist(grid, x, y) && !exist(prevs, x, y);
}

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}
