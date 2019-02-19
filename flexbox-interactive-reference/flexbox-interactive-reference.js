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
      name: 'order',
      description: 'desc of order',
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
    selectedBox: 0,
    containState: {},
    boxState: {
      0: {},
      1: {},
      2: {},
      3: {},
      4: {}
    }
  };

  const controlPanel = document.querySelector('.control-panel');
  const flexContainer = document.querySelector('.flex-container');
  const styleContainer = document.querySelector('.style-container');

  render(state);
  initEventHandler();

  function initEventHandler() {
    window.handleSelect = function(category, key, value) {
      if (category === 'containState') {
        if (value === null) {
          delete state[category][key];
        } else {
          state[category][key] = value;
        }
      } else {
        if (value === null) {
          delete state[category][state.selectedBox][key];
        } else {
          state[category][state.selectedBox][key] = value;
        }
      }

      render(state);
    };

    window.handleSelectBox = function(boxIndex) {
      state.selectedBox = boxIndex;
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
      .map(prop => renderProperty('containState', prop, state))
      .join('');
    const itemHTML = itemProps.map(prop => renderProperty('boxState', prop, state)).join('');

    return `
      ${numBoxHTML}

      <div class="container-props">
        <h2>The Container</h2>
        ${containerHTML}
      </div>

      <div class="container-props">
        <h2>The Box (selected box: ${state.selectedBox})</h2>
        ${itemHTML}
      </div>
    `;
  }

  function renderProperty(controlType, prop, state) {
    const selectedBox = state.boxState[state.selectedBox] || {};
    const isValueUndefined = selectedBox[prop.name] === undefined;
    return `<div class="prop-container">
        <div class="prop-name">${prop.name}</div>

        <div class="button-container">
        ${(prop.options &&
          prop.options
            .map(option => {
              const propValue =
                controlType === 'containState'
                  ? state.containState[prop.name]
                  : selectedBox[prop.name];
              return `
                <button
                  class="selector-button ${propValue === option.name ? 'selected' : ''}"
                  onclick="handleSelect('${controlType}', '${prop.name}',${
                propValue === option.name ? 'null' : `'${option.name}'`
              })"
                >
                  ${option.name}
                </button>
              `;
            })
            .join('')) ||
          ''}

          ${(prop.isInteger &&
            `
            <button
              onclick="handleSelect('${controlType}', '${prop.name}', ${
              isValueUndefined ? 1 : selectedBox[prop.name] - 1
            })">-</button>

            <input
            style="width: 80px"
            onchange="handleSelect('${controlType}', '${prop.name}', event.target.value)"
            type="text" value="${isValueUndefined ? '' : selectedBox[prop.name]}" />

            <button onclick="handleSelect('${controlType}', '${prop.name}', ${
              isValueUndefined ? 1 : selectedBox[prop.name] + 1
            })">+</button>

            <button onclick="handleSelect('${controlType}',  '${prop.name}', null)">&times;</button>
            `) ||
            ''}
        </div>
    </div>`;
  }

  function renderBoxes({ state }) {
    return [...new Array(state.numOfBox)]
      .map(
        (_, i) => `
        <div
          onclick="handleSelectBox(${i})"
          style="
            width: ${getWidth(i)}px;
            height: ${getHeight(i)}px;
            padding-top: ${getPaddingTop(i)}px;
            ${itemProps
              .map(item => {
                const box = state.boxState[i] || {};
                return box[item.name] && `${item.name}: ${box[item.name]};`;
              })
              .join('')}"
          class="flex-item flex-item-${i} ${state.selectedBox === i ? 'selected-box' : ''}"
        >
          <span>${i}</span>


          <div class="box-properties">
          ${itemProps
            .map(item => {
              const box = state.boxState[i] || {};
              return box[item.name] && `<span>${item.name}: ${box[item.name]};</span>`;
            })
            .filter(Boolean)
            .join('')}
          </div>

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
