main();

function main() {
  const containerProps = [
    {
      name: 'flex-direction',
      description: 'desc of flex-direction',
      options: [
        { name: 'row', description: 'desc of row' },
        { name: 'row-reverse', description: 'desc of column' },
        { name: 'column', description: 'desc of column' },
        { name: 'column-reverse', description: 'desc of column' }
      ]
    },
    {
      name: 'flex-wrap',
      description: 'desc of flex-wrap',
      options: [
        { name: 'nowrap', description: 'desc of row' },
        { name: 'wrap', description: 'desc of column' },
        { name: 'wrap-reverse', description: 'desc of column' }
      ]
    },
    {
      name: 'justify-content',
      description: 'desc of justify-content',
      options: [
        { name: 'flex-start', description: 'desc of row' },
        { name: 'flex-end', description: 'desc of column' },
        { name: 'center', description: 'desc of column' },
        { name: 'space-between', description: 'desc of column' },
        { name: 'space-around', description: 'desc of column' },
        { name: 'space-evenly', description: 'desc of column' }
      ]
    },
    {
      name: 'align-items',
      description: 'desc of align-items',
      options: [
        { name: 'flex-start', description: 'desc of row' },
        { name: 'flex-end', description: 'desc of column' },
        { name: 'center', description: 'desc of column' },
        { name: 'baseline', description: 'desc of column' },
        { name: 'stretch', description: 'desc of row' }
      ]
    },
    {
      name: 'align-content',
      description: 'desc of align-content',
      options: [
        { name: 'flex-start', description: 'desc of row' },
        { name: 'flex-end', description: 'desc of column' },
        { name: 'center', description: 'desc of column' },
        { name: 'space-between', description: 'desc of column' },
        { name: 'space-around', description: 'desc of column' },
        { name: 'stretch', description: 'desc of column' }
      ]
    }
  ];

  const itemProps = [
    {
      name: 'order',
      description: 'desc of order',
      isInteger: true
    },
    {
      name: 'flex-grow',
      description: 'desc of flex-grow',
      isInteger: true
    },
    {
      name: 'flex-shrink',
      description: 'desc of flex-shrink',
      isInteger: true
    },
    {
      name: 'flex',
      description: 'desc of flex',
      isInteger: true
    },
    {
      name: 'align-self',
      description: 'desc of align-self',
      options: [
        { name: 'flex-start', description: 'desc of row' },
        { name: 'flex-end', description: 'desc of column' },
        { name: 'center', description: 'desc of column' }
      ]
    }
  ];

  const state = {
    numOfBox: 5,
    containState: {}
  };

  const controlPanel = document.querySelector('.control-panel');
  const flexContainer = document.querySelector('.flex-container');
  const styleContainer = document.querySelector('.style-container');

  render(state);
  initEventHandler();

  function initEventHandler() {
    window.handleSelect = function(category, key, value) {
      state[category][key] = value;
      render(state);
    };

    window.handleNumBoxChange = function(num) {
      state.numOfBox = Math.max(1, +num);
      render(state);
    };
  }

  function render(state) {
    controlPanel.innerHTML = renderControls({ containerProps, itemProps, state });
    flexContainer.innerHTML = renderBoxes({ state });
    styleContainer.innerHTML = renderStyle({ state });
  }

  function renderStyle({ state }) {
    return `
      .flex-container {
        ${Object.keys(state.containState)
          .map(propKey => `${propKey}: ${state.containState[propKey]}`)
          .join(';')}
      }
    `;
  }

  function renderControls({ containerProps, itemProps, state }) {
    const numBoxHTML = `<div class="num-box-container">
                  <span class="num-box-title">Number of Box</span>
                  <div>
                    <button onclick="handleNumBoxChange(${state.numOfBox - 1})">-</button>
                    <input
                      class="num-box-input"
                      type="number"
                      value="${state.numOfBox}"
                      onchange="handleNumBoxChange(event.target.value)"
                    />
                    <button onclick="handleNumBoxChange(${state.numOfBox + 1})">+</button>
                  </div>
                </div>`;

    const containerHTML = containerProps
      .map(prop => {
        return `<div class="prop-container">
                  <div class="prop-name">${prop.name}</div>
                  <div class="button-container">
                    ${prop.options
                      .map(
                        option =>
                          `
                    <button
                      class="selector-button ${
                        state.containState[prop.name] === option.name ? 'selected' : ''
                      }"
                      onclick="handleSelect('containState', '${prop.name}','${option.name}')"
                    >
                      ${option.name}
                    </button>
                          `
                      )
                      .join('')}
                  </div>
              </div>`;
      })
      .join('');

    return `
      ${numBoxHTML}
      <div class="container-props">
        <h2>The Container</h2>
        ${containerHTML}
      </div>
    `;

    // const itemHTML = itemProps
    //   .map(prop => {
    //     return `<div>
    //               <div class="prop-name">${prop.name}</div>
    //               <select class="prop-options">
    //               ${prop.options.map(o => `<option>${o.name}</option>`).join('')}
    //               </select>
    //             </div>`;
    //   })
    //   .join('');

    // return containerHTML + itemHTML;
  }

  function renderBoxes({ state }) {
    return [...new Array(state.numOfBox)]
      .map(
        (_, i) => `
        <div
          style="
            width: ${getWidth(i)}px;
            height: ${getHeight(i)}px;
            padding-top: ${getPaddingTop(i)}px
          "
          class="flex-item flex-item-${i}"
        >
          <span>${i}</span>
        </div>
      `
      )
      .join('');
  }

  function getWidth(num) {
    return [70, 90, 100][num % 3];
  }

  function getHeight(num) {
    return [60, 90, 70][num % 3];
  }

  function getPaddingTop(num) {
    return [10, 30][num % 2];
  }
}
