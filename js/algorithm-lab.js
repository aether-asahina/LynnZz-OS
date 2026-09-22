
// ============================================================
// LYNNZZ OS — ALGORITHM LAB
// ============================================================

// ---- Sorting: generators yield step-by-step for animation; the final
// 'done' step also carries the true comparisons/swaps count ----
function* bubbleSortGen(input){
  const arr = input.slice();
  let comparisons = 0, swaps = 0;
  const n = arr.length;
  for (let i = 0; i < n - 1; i++){
    for (let j = 0; j < n - 1 - i; j++){
      comparisons++;
      yield { type:'compare', a1:j, a2:j+1, array:arr.slice(), comparisons, swaps };
      if (arr[j] > arr[j+1]){
        [arr[j], arr[j+1]] = [arr[j+1], arr[j]];
        swaps++;
        yield { type:'swap', a1:j, a2:j+1, array:arr.slice(), comparisons, swaps };
      }
    }
  }
  yield { type:'done', a1:-1, a2:-1, array:arr.slice(), comparisons, swaps };
}

function* quickSortGen(input){
  const arr = input.slice();
  let comparisons = 0, swaps = 0;
  function* qs(lo, hi){
    if (lo >= hi) return;
    const pivot = arr[hi];
    let i = lo - 1;
    for (let j = lo; j < hi; j++){
      comparisons++;
      yield { type:'compare', a1:j, a2:hi, array:arr.slice(), comparisons, swaps };
      if (arr[j] < pivot){
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        swaps++;
        yield { type:'swap', a1:i, a2:j, array:arr.slice(), comparisons, swaps };
      }
    }
    [arr[i+1], arr[hi]] = [arr[hi], arr[i+1]];
    swaps++;
    yield { type:'swap', a1:i+1, a2:hi, array:arr.slice(), comparisons, swaps };
    yield* qs(lo, i);
    yield* qs(i + 2, hi);
  }
  yield* qs(0, arr.length - 1);
  yield { type:'done', a1:-1, a2:-1, array:arr.slice(), comparisons, swaps };
}

function* mergeSortGen(input){
  const arr = input.slice();
  let comparisons = 0, swaps = 0;
  function* merge(lo, mid, hi){
    const left = arr.slice(lo, mid+1);
    const right = arr.slice(mid+1, hi+1);
    let i=0, j=0, k=lo;
    while (i < left.length && j < right.length){
      comparisons++;
      yield { type:'compare', a1:lo+i, a2:mid+1+j, array:arr.slice(), comparisons, swaps };
      if (left[i] <= right[j]){ arr[k] = left[i]; i++; } else { arr[k] = right[j]; j++; }
      swaps++;
      yield { type:'swap', a1:k, a2:k, array:arr.slice(), comparisons, swaps };
      k++;
    }
    while (i < left.length){ arr[k] = left[i]; i++; swaps++; yield { type:'swap', a1:k, a2:k, array:arr.slice(), comparisons, swaps }; k++; }
    while (j < right.length){ arr[k] = right[j]; j++; swaps++; yield { type:'swap', a1:k, a2:k, array:arr.slice(), comparisons, swaps }; k++; }
  }
  function* ms(lo, hi){
    if (lo >= hi) return;
    const mid = Math.floor((lo+hi)/2);
    yield* ms(lo, mid);
    yield* ms(mid+1, hi);
    yield* merge(lo, mid, hi);
  }
  yield* ms(0, arr.length - 1);
  yield { type:'done', a1:-1, a2:-1, array:arr.slice(), comparisons, swaps };
}

const SORT_ALGOS = {
  bubble: { label: 'Bubble Sort', gen: bubbleSortGen },
  quick:  { label: 'Quick Sort',  gen: quickSortGen  },
  merge:  { label: 'Merge Sort',  gen: mergeSortGen  },
};

function runSortMetrics(genFn, data){
  const start = performance.now();
  let last = null;
  for (const step of genFn(data)) last = step;
  const time = performance.now() - start;
  return { array: last.array, comparisons: last.comparisons, swaps: last.swaps, time };
}
function collectSortSteps(genFn, data){
  const steps = [];
  for (const step of genFn(data)) steps.push(step);
  return steps;
}
function sortRandomDataset(count, max = 99){
  return Array.from({ length: count }, () => Math.floor(Math.random() * max) + 1);
}
// pulls the first fully-numeric column out of the dataset uploaded via Dataset Manager
function sortDatasetFromCSV(){
  const raw = localStorage.getItem('lynnzz_dataset');
  if (!raw) return { error: 'Belum ada dataset. Upload CSV lewat Dataset Manager dulu.' };
  let parsed;
  try { parsed = JSON.parse(raw); } catch(e){ return { error: 'Dataset tersimpan rusak, upload ulang.' }; }
  const { headers, data } = parsed;
  for (let col = 0; col < headers.length; col++){
    const values = data.map(row => Number(row[col]));
    if (values.every(v => !Number.isNaN(v)) && values.length){
      return { data: values, column: headers[col] };
    }
  }
  return { error: `Dataset "${parsed.name}" tidak punya kolom yang seluruhnya angka.` };
}
function algoSortSleep(ms){ return new Promise(r => setTimeout(r, ms)); }

function renderDatasetManager(body){

  body.innerHTML = `
    <div class="dataset-wrap">

      <div class="dataset-header">
        <div>
          <button id="dataset-back" class="dataset-back">← Back</button>
          <div class="dataset-eyebrow">LYNNZZ OS · ALGORITHM LAB</div>
          <h2>Dataset Manager</h2>
          <p>Upload dataset CSV untuk digunakan dalam eksperimen algoritma.</p>
        </div>

        <div class="dataset-actions">
          <button id="dataset-clear" class="dataset-clear">
            🗑 Clear
          </button>

          <label class="dataset-upload">
            <input id="dataset-file" type="file" accept=".csv,text/csv">
            <span>＋ Upload CSV</span>
          </label>
        </div>
      </div>

      <div class="dataset-stats">
        <div class="dataset-stat">
          <span>Rows</span>
          <strong id="dataset-rows">0</strong>
        </div>

        <div class="dataset-stat">
          <span>Columns</span>
          <strong id="dataset-cols">0</strong>
        </div>

        <div class="dataset-stat">
          <span>Dataset</span>
          <strong id="dataset-name">None</strong>
        </div>
      </div>

      <div class="dataset-preview">
        <div class="dataset-preview-head">
          <strong>Data Preview</strong>
          <span id="dataset-status">Waiting for dataset...</span>
        </div>

        <div class="dataset-table-wrap">
          <table id="dataset-table">
            <tbody>
              <tr>
                <td class="dataset-empty">
                  Upload file CSV untuk melihat data.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `;

  const fileInput = body.querySelector('#dataset-file');
  const table = body.querySelector('#dataset-table');
  const rowsEl = body.querySelector('#dataset-rows');
  const colsEl = body.querySelector('#dataset-cols');
  const nameEl = body.querySelector('#dataset-name');
  const statusEl = body.querySelector('#dataset-status');
  const backBtn = body.querySelector('#dataset-back');
  const clearBtn = body.querySelector('#dataset-clear');

  backBtn.onclick = () => {

    const lab = document.querySelector('.algo-wrap');

    if(!lab){
      location.reload();
      return;
    }

    const algoContent = lab.querySelector('.algo-content');

    if(!algoContent){
      location.reload();
      return;
    }

    const firstAlgo = lab.querySelector('.algo-item');

    if(firstAlgo){
      firstAlgo.click();
      return;
    }

    location.reload();
  };

  clearBtn.onclick = () => {

    localStorage.removeItem('lynnzz_dataset');

    rowsEl.textContent = '0';
    colsEl.textContent = '0';
    nameEl.textContent = 'None';
    statusEl.textContent = 'Dataset cleared';

    table.innerHTML = `
      <tbody>
        <tr>
          <td class="dataset-empty">
            Upload file CSV untuk melihat data.
          </td>
        </tr>
      </tbody>
    `;

    fileInput.value = '';
  };

  fileInput.onchange = () => {

    const file = fileInput.files?.[0];

    if(!file){
      return;
    }

    if(!file.name.toLowerCase().endsWith('.csv')){
      statusEl.textContent = 'Invalid file';
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {

      const text = String(reader.result || '');

      const lines = text
        .replace(/\r/g, '')
        .split('\n')
        .filter(line => line.trim() !== '');

      if(lines.length < 2){
        statusEl.textContent = 'Dataset kosong';
        return;
      }

      const parseCSVLine = line => {

        const result = [];
        let current = '';
        let quoted = false;

        for(let i=0;i<line.length;i++){

          const char = line[i];

          if(char === '"'){

            if(
              quoted &&
              line[i + 1] === '"'
            ){
              current += '"';
              i++;
              continue;
            }

            quoted = !quoted;
            continue;
          }

          if(char === ',' && !quoted){
            result.push(current.trim());
            current = '';
            continue;
          }

          current += char;
        }

        result.push(current.trim());

        return result;
      };

      const headers = parseCSVLine(lines[0]);

      const data = lines
        .slice(1)
        .map(parseCSVLine);

      rowsEl.textContent = data.length;
      colsEl.textContent = headers.length;
      nameEl.textContent = file.name;
      statusEl.textContent = 'Dataset loaded';

      table.innerHTML = '';

      const thead = document.createElement('thead');
      const headRow = document.createElement('tr');

      headers.forEach(header => {

        const th = document.createElement('th');

        th.textContent = header || 'Column';

        headRow.appendChild(th);
      });

      thead.appendChild(headRow);
      table.appendChild(thead);

      const tbody = document.createElement('tbody');

      data.slice(0,50).forEach(row => {

        const tr = document.createElement('tr');

        headers.forEach((_, index) => {

          const td = document.createElement('td');

          td.textContent = row[index] ?? '';

          tr.appendChild(td);
        });

        tbody.appendChild(tr);
      });

      table.appendChild(tbody);

      const dataset = {
        name: file.name,
        headers,
        data,
        rows: data.length,
        columns: headers.length,
        uploadedAt: new Date().toISOString()
      };

      localStorage.setItem(
        'lynnzz_dataset',
        JSON.stringify(dataset)
      );

      console.log(
        '[LynnZz Dataset]',
        dataset
      );
    };

    reader.onerror = () => {
      statusEl.textContent = 'Failed to read dataset';
    };

    reader.readAsText(file);
  };
}

function renderAlgorithmLab(body){
  body.innerHTML = `
    <div class="algo-wrap">
      <aside class="algo-sidebar">
        <div class="algo-brand">
          <div class="algo-brand-icon">🧠</div>
          <div>
            <div class="algo-brand-title">Algorithm Lab</div>
            <div class="algo-brand-sub">Interactive Laboratory</div>
          </div>
        </div>

        <div class="algo-section-label">ALGORITHMS</div>

        <button class="algo-item active" data-algo="ga">
          <span>🧬</span>
          <div>
            <strong>Genetic Algorithm</strong>
            <small>Optimization</small>
          </div>
        </button>

        <button class="algo-item" data-algo="astar">
          <span>🗺️</span>
          <div>
            <strong>A* Pathfinding</strong>
            <small>Path Search</small>
          </div>
        </button>

        <button class="algo-item" data-algo="dijkstra">
          <span>🔗</span>
          <div>
            <strong>Dijkstra</strong>
            <small>Shortest Path</small>
          </div>
        </button>

        <button class="algo-item" data-algo="compare">
          <span>⚖️</span>
          <div>
            <strong>Compare</strong>
            <small>A* vs Dijkstra</small>
          </div>
        </button>

        <button class="algo-item" data-algo="kmeans">
          <span>📊</span>
          <div>
            <strong>K-Means</strong>
            <small>Clustering</small>
          </div>
        </button>

        <button class="algo-item" data-algo="sorting">
          <span>↕️</span>
          <div>
            <strong>Sorting</strong>
            <small>Data Ordering</small>
          </div>
        </button>


        <div class="algo-section-label dataset-section-label">DATA</div>

        <button class="algo-item" data-algo="dataset">
          <span>📂</span>
          <div>
            <strong>Dataset Manager</strong>
            <small>CSV / Data</small>
          </div>
        </button>
      </aside>

      <main class="algo-content">

        <header class="algo-header">
          <div>
            <div class="algo-kicker">LYNNZZ OS</div>
            <h2 id="algo-title">Genetic Algorithm</h2>
            <p id="algo-description">
              Optimasi menggunakan proses seleksi, crossover dan mutasi.
            </p>
          </div>

          <button id="algo-run" class="algo-run-btn">
            ▶ Run Evolution
          </button>
        </header>

        <section class="algo-config-card">
          <div class="algo-card-title">Configuration</div>

          <div id="algo-config">
            <div class="algo-field">
              <label>Population</label>
              <input id="ga-population" type="number" value="20" min="4" max="100">
            </div>

            <div class="algo-field">
              <label>Mutation Rate (%)</label>
              <input id="ga-mutation" type="number" value="5" min="0" max="100">
            </div>

            <div class="algo-field">
              <label>Generations</label>
              <input id="ga-generations" type="number" value="30" min="1" max="500">
            </div>

            <div class="algo-field">
              <label>Target</label>
              <input id="ga-target" type="number" value="100">
            </div>
          </div>
        </section>

        <section class="algo-visual-card">
          <div class="algo-card-title">
            Visualization
            <span id="algo-status">Ready</span>
          </div>

          <div id="algo-visual">
            <div class="algo-empty">
              <div class="algo-empty-icon">🧬</div>
              <div>Ready to evolve</div>
              <small>Configure parameters lalu tekan Run Evolution.</small>
            </div>
          </div>
        </section>

        <section class="algo-log-card">
          <div class="algo-card-title">Evolution Log</div>
          <pre id="algo-log">Waiting for execution...</pre>
        </section>

      </main>
    </div>
  `;

  const title = body.querySelector('#algo-title');
  const description = body.querySelector('#algo-description');
  const config = body.querySelector('#algo-config');
  const visual = body.querySelector('#algo-visual');
  const log = body.querySelector('#algo-log');
  const status = body.querySelector('#algo-status');
  const runBtn = body.querySelector('#algo-run');

  const algorithms = {
    ga: {
      title: 'Genetic Algorithm',
      description: 'Optimasi menggunakan proses seleksi, crossover dan mutasi.'
    },
    astar: {
      title: 'A* Pathfinding',
      description: 'Mencari jalur dengan mempertimbangkan cost dan estimasi jarak.'
    },
    dijkstra: {
      title: 'Dijkstra',
      description: 'Mencari jalur terpendek dari satu node ke node lainnya.'
    },
    kmeans: {
      title: 'K-Means',
      description: 'Mengelompokkan data berdasarkan kedekatan antar titik.'
    },
    sorting: {
      title: 'Sorting Visualizer',
      description: 'Memvisualisasikan proses pengurutan data.'
    },
    dataset: {
      title: 'Dataset Manager',
      description: 'Mengelola dataset CSV untuk eksperimen algoritma.'
    }
  };

  body.querySelectorAll('.algo-item').forEach(btn => {
    btn.onclick = () => {
      body.querySelectorAll('.algo-item')
        .forEach(x => x.classList.remove('active'));

      btn.classList.add('active');

      const algo = algorithms[btn.dataset.algo];

      if(!algo){
        console.error(
          '[Algorithm Lab] Unknown module:',
          btn.dataset.algo
        );
        return;
      }

      title.textContent = algo.title;
      description.textContent = algo.description;

      if(btn.dataset.algo === 'dataset'){
        renderDatasetManager(body);
        config.innerHTML = `
          <div class="algo-field">
            <label>Dataset</label>
            <div class="dataset-config-info">
              <span>📂</span>
              <div>
                <strong>CSV Dataset</strong>
                <small>Upload dataset untuk eksperimen.</small>
              </div>
            </div>
          </div>
        `;
        runBtn.textContent = '📂 Open Dataset';
        status.textContent = 'Dataset Manager';
        log.textContent = 'Waiting for dataset upload...';
        return;
      }

      if(btn.dataset.algo === 'ga'){

        config.innerHTML = `
          <div class="algo-field">
            <label>Population</label>
            <input id="ga-population" type="number" value="20" min="4" max="100">
          </div>

          <div class="algo-field">
            <label>Mutation Rate (%)</label>
            <input id="ga-mutation" type="number" value="5" min="0" max="100">
          </div>

          <div class="algo-field">
            <label>Generations</label>
            <input id="ga-generations" type="number" value="30" min="1" max="500">
          </div>

          <div class="algo-field">
            <label>Target</label>
            <input id="ga-target" type="number" value="100">
          </div>
        `;

        runBtn.textContent = '▶ Run Evolution';

      }else if(
        btn.dataset.algo === 'astar' ||
        btn.dataset.algo === 'dijkstra'
      ){

        const isAStar = btn.dataset.algo === 'astar';

        config.innerHTML = `
          <div class="algo-field">
            <label>Grid Size</label>
            <select id="path-grid-size">
              <option value="8">8 × 8</option>
              <option value="12" selected>12 × 12</option>
              <option value="16">16 × 16</option>
              <option value="20">20 × 20</option>
            </select>
          </div>

          <div class="algo-field">
            <label>Movement</label>
            <select id="path-movement">
              <option value="4" selected>4 Directions</option>
              <option value="8">8 Directions</option>
            </select>
          </div>

          <div class="algo-field">
            <label>Animation</label>
            <select id="path-speed">
              <option value="0">Instant</option>
              <option value="15">Fast</option>
              <option value="30" selected>Normal</option>
              <option value="80">Slow</option>
            </select>
          </div>

          ${
            isAStar
              ? `
                <div class="algo-field">
                  <label>Heuristic</label>
                  <select id="astar-heuristic">
                    <option value="manhattan" selected>Manhattan</option>
                    <option value="euclidean">Euclidean</option>
                  </select>
                </div>
              `
              : `
                <div class="algo-field">
                  <label>Weight</label>
                  <select id="dijkstra-weight">
                    <option value="1" selected>Uniform Cost</option>
                  </select>
                </div>
              `
          }

          <div class="algo-field">
            <label>Obstacles</label>
            <select id="path-obstacle-density">
              <option value="10">10%</option>
              <option value="20" selected>20%</option>
              <option value="30">30%</option>
              <option value="40">40%</option>
            </select>
          </div>
        `;

        runBtn.textContent =
          isAStar
            ? '▶ Run A*'
            : '▶ Run Dijkstra';

      }else if(btn.dataset.algo === 'dataset'){

        config.innerHTML = `
          <div class="algo-field">
            <label>Dataset Source</label>
            <div class="dataset-config-info">
              <span>📂</span>
              <div>
                <strong>Local Dataset</strong>
                <small>CSV disimpan di browser perangkat ini.</small>
              </div>
            </div>
          </div>

          <div class="algo-field">
            <label>Format</label>
            <select disabled>
              <option selected>CSV</option>
            </select>
          </div>

          <div class="algo-field">
            <label>Preview Limit</label>
            <select disabled>
              <option selected>50 rows</option>
            </select>
          </div>
        `;

        runBtn.textContent = '📂 Open Dataset';

      }else if(btn.dataset.algo === 'sorting'){

        const hasDataset = !!localStorage.getItem('lynnzz_dataset');

        config.innerHTML = `
          <div class="algo-field">
            <label>Algoritma</label>
            <select id="sort-algo">
              <option value="bubble">Bubble Sort</option>
              <option value="quick">Quick Sort</option>
              <option value="merge">Merge Sort</option>
            </select>
          </div>

          <div class="algo-field">
            <label>Sumber Data</label>
            <select id="sort-source">
              <option value="random" selected>Random</option>
              <option value="dataset" ${hasDataset ? '' : 'disabled'}>Dataset CSV${hasDataset ? '' : ' (belum ada)'}</option>
            </select>
          </div>

          <div class="algo-field">
            <label>Jumlah Data (Random)</label>
            <input id="sort-count" type="number" value="30" min="4" max="300">
          </div>

          <div class="algo-field">
            <label>Animation</label>
            <select id="sort-speed">
              <option value="0">Instant</option>
              <option value="15">Fast</option>
              <option value="30" selected>Normal</option>
              <option value="80">Slow</option>
            </select>
          </div>
        `;

        runBtn.textContent = '▶ Run Sort';

      }else{

        config.innerHTML = `
          <div class="algo-placeholder">
            Konfigurasi untuk <strong>${algo.title}</strong>
            akan tersedia pada modul berikutnya.
          </div>
        `;

        runBtn.textContent = '▶ Run';
      }

      visual.innerHTML = `
        <div class="algo-empty">
          <div class="algo-empty-icon">⚡</div>
          <div>${algo.title} Ready</div>
          <small>Tekan Run untuk memulai simulasi.</small>
        </div>
      `;

      log.textContent = 'Waiting for execution...';
      status.textContent = 'Ready';
    };
  });

  runBtn.onclick = () => {

    const active =
      body.querySelector('.algo-item.active');

    if(!active) return;

    if(active.dataset.algo === 'astar'){
      runAStar();
      return;
    }

    if(active.dataset.algo === 'dijkstra'){
      runDijkstra();
      return;
    }

    if(active.dataset.algo === 'compare'){
      runCompare();
      return;
    }

    if(active.dataset.algo === 'dataset'){
      renderDatasetManager(body);
      return;
    }

    if(active.dataset.algo === 'sorting'){
      runSorting();
      return;
    }

    if(active.dataset.algo !== 'ga'){
      status.textContent = 'Coming Soon';
      log.textContent =
        `${algorithms[active.dataset.algo].title}\n\nModule belum diimplementasikan.`;
      return;
    }

    runGeneticAlgorithm();
  };


  function runCompare(){

    const size =
      Number(body.querySelector('#path-grid-size')?.value) || 12;

    const movement =
      Number(body.querySelector('#path-movement')?.value) || 4;

    const density =
      Number(body.querySelector('#path-obstacle-density')?.value) || 20;

    const heuristicType =
      body.querySelector('#astar-heuristic')?.value || 'manhattan';

    const start = { r:1, c:1 };
    const end = {
      r:size - 2,
      c:size - 2
    };

    const key = (r,c) => `${r},${c}`;

    const obstacles = new Set();

    const total = size * size;
    const amount =
      Math.floor((total - 2) * density / 100);

    const candidates = [];

    for(let r=0;r<size;r++){
      for(let c=0;c<size;c++){

        if(
          (r === start.r && c === start.c) ||
          (r === end.r && c === end.c)
        ){
          continue;
        }

        candidates.push({r,c});
      }
    }

    for(let i=candidates.length-1;i>0;i--){

      const j =
        Math.floor(Math.random() * (i + 1));

      [candidates[i],candidates[j]] =
        [candidates[j],candidates[i]];
    }

    candidates
      .slice(0, amount)
      .forEach(cell =>
        obstacles.add(
          key(cell.r,cell.c)
        )
      );

    const dirs = movement === 8
      ? [
          [-1,0],
          [1,0],
          [0,-1],
          [0,1],
          [-1,-1],
          [-1,1],
          [1,-1],
          [1,1]
        ]
      : [
          [-1,0],
          [1,0],
          [0,-1],
          [0,1]
        ];

    function heuristic(a,b){

      if(
        movement === 8 &&
        heuristicType === 'euclidean'
      ){
        return Math.sqrt(
          Math.pow(a.r-b.r,2) +
          Math.pow(a.c-b.c,2)
        );
      }

      return Math.abs(a.r-b.r) +
             Math.abs(a.c-b.c);
    }

    function neighbors(cell){

      const result = [];

      dirs.forEach(([dr,dc]) => {

        const r = cell.r + dr;
        const c = cell.c + dc;

        if(
          r < 0 ||
          r >= size ||
          c < 0 ||
          c >= size
        ){
          return;
        }

        if(obstacles.has(key(r,c))){
          return;
        }

        result.push({
          r,
          c,
          cost:
            dr !== 0 && dc !== 0
              ? Math.SQRT2
              : 1
        });
      });

      return result;
    }

    function runSearch(useHeuristic){

      const startTime = performance.now();

      const open = [{
        r:start.r,
        c:start.c,
        f:0
      }];

      const gScore = new Map();
      const previous = new Map();
      const closed = new Set();

      gScore.set(key(start.r,start.c), 0);

      let visited = 0;
      let found = false;

      while(open.length){

        open.sort((a,b) => a.f - b.f);

        const current = open.shift();
        const currentKey =
          key(current.r,current.c);

        if(closed.has(currentKey)){
          continue;
        }

        closed.add(currentKey);
        visited++;

        if(
          current.r === end.r &&
          current.c === end.c
        ){
          found = true;
          break;
        }

        neighbors(current).forEach(neighbor => {

          const neighborKey =
            key(neighbor.r,neighbor.c);

          if(closed.has(neighborKey)){
            return;
          }

          const tentative =
            (gScore.get(currentKey) ?? Infinity) +
            neighbor.cost;

          if(
            tentative <
            (gScore.get(neighborKey) ?? Infinity)
          ){

            gScore.set(
              neighborKey,
              tentative
            );

            previous.set(
              neighborKey,
              currentKey
            );

            const h =
              useHeuristic
                ? heuristic(neighbor,end)
                : 0;

            open.push({
              r:neighbor.r,
              c:neighbor.c,
              f:tentative + h
            });
          }
        });
      }

      let path = [];

      if(found){

        let currentKey =
          key(end.r,end.c);

        path.push(currentKey);

        while(currentKey !== key(start.r,start.c)){

          currentKey =
            previous.get(currentKey);

          if(!currentKey){
            path = [];
            break;
          }

          path.push(currentKey);
        }

        path.reverse();
      }

      const elapsed =
        performance.now() - startTime;

      return {
        found,
        visited,
        pathLength:
          path.length
            ? path.length - 1
            : 0,
        distance:
          found
            ? gScore.get(key(end.r,end.c))
            : Infinity,
        time:elapsed,
        path
      };
    }

    const astar =
      runSearch(true);

    const dijkstra =
      runSearch(false);

    status.textContent =
      astar.found && dijkstra.found
        ? 'Comparison Complete'
        : 'No Path';

    visual.innerHTML = `
      <div class="compare-result">

        <div class="compare-card">
          <div class="compare-title">
            <span>🧠</span>
            A*
          </div>

          <div class="compare-status">
            ${astar.found ? 'Path Found' : 'No Path'}
          </div>

          <div class="compare-stat">
            <span>Nodes Visited</span>
            <strong>${astar.visited}</strong>
          </div>

          <div class="compare-stat">
            <span>Path Length</span>
            <strong>${astar.pathLength}</strong>
          </div>

          <div class="compare-stat">
            <span>Distance</span>
            <strong>
              ${astar.found
                ? astar.distance.toFixed(2)
                : '—'}
            </strong>
          </div>

          <div class="compare-stat">
            <span>Execution</span>
            <strong>${astar.time.toFixed(2)} ms</strong>
          </div>
        </div>

        <div class="compare-card">
          <div class="compare-title">
            <span>🧭</span>
            Dijkstra
          </div>

          <div class="compare-status">
            ${dijkstra.found ? 'Path Found' : 'No Path'}
          </div>

          <div class="compare-stat">
            <span>Nodes Visited</span>
            <strong>${dijkstra.visited}</strong>
          </div>

          <div class="compare-stat">
            <span>Path Length</span>
            <strong>${dijkstra.pathLength}</strong>
          </div>

          <div class="compare-stat">
            <span>Distance</span>
            <strong>
              ${dijkstra.found
                ? dijkstra.distance.toFixed(2)
                : '—'}
            </strong>
          </div>

          <div class="compare-stat">
            <span>Execution</span>
            <strong>${dijkstra.time.toFixed(2)} ms</strong>
          </div>
        </div>

      </div>
    `;

    log.textContent =
      `A* vs Dijkstra\n\n` +
      `Grid       : ${size} × ${size}\n` +
      `Movement   : ${movement} directions\n` +
      `Obstacles  : ${density}%\n\n` +
      `A* Nodes   : ${astar.visited}\n` +
      `A* Path    : ${astar.pathLength}\n` +
      `A* Time    : ${astar.time.toFixed(2)} ms\n\n` +
      `Dij Nodes  : ${dijkstra.visited}\n` +
      `Dij Path   : ${dijkstra.pathLength}\n` +
      `Dij Time   : ${dijkstra.time.toFixed(2)} ms`;
  }

  function runDijkstra(){

    const size =
      Number(body.querySelector('#path-grid-size')?.value) || 12;

    const movement =
      Number(body.querySelector('#path-movement')?.value) || 4;

    const speed =
      Number(body.querySelector('#path-speed')?.value) || 0;

    let start = {
      r:1,
      c:1
    };

    let end = {
      r:size - 2,
      c:size - 2
    };

    const obstacles = new Set();

    const algoTitle = 'Dijkstra';

    let mode = 'obstacle';

    const visualGrid = document.createElement('div');
    visualGrid.className = 'astar-grid';

    const controls = document.createElement('div');
    controls.className = 'astar-controls';

    controls.innerHTML = `
      <div class="astar-tools">
        <button class="astar-tool active" data-mode="obstacle">
          ⬛ Obstacle
        </button>

        <button class="astar-tool" data-mode="start">
          🟢 Start
        </button>

        <button class="astar-tool" data-mode="end">
          🔴 End
        </button>

        <button class="astar-tool" data-mode="clear">
          ✕ Clear
        </button>
      </div>

      <button class="algo-run-btn" id="dijkstra-start">
        ▶ Run Dijkstra
      </button>
    `;

    const key = (r,c) => `${r},${c}`;

    function renderGrid(){

      visualGrid.innerHTML = '';

      for(let r=0;r<size;r++){
        for(let c=0;c<size;c++){

          const cell = document.createElement('button');

          cell.className = 'astar-cell';

          cell.dataset.r = r;
          cell.dataset.c = c;

          const k = key(r,c);

          if(r === start.r && c === start.c){
            cell.classList.add('astar-start');
            cell.textContent = 'S';
          }

          else if(r === end.r && c === end.c){
            cell.classList.add('astar-end');
            cell.textContent = 'E';
          }

          else if(obstacles.has(k)){
            cell.classList.add('astar-obstacle');
          }

          cell.onclick = () => {

            if(mode === 'obstacle'){

              if(
                (r === start.r && c === start.c) ||
                (r === end.r && c === end.c)
              ) return;

              if(obstacles.has(k)){
                obstacles.delete(k);
              }else{
                obstacles.add(k);
              }

            }else if(mode === 'start'){

              if(
                !(r === end.r && c === end.c) &&
                !obstacles.has(k)
              ){
                start = {r,c};
              }

            }else if(mode === 'end'){

              if(
                !(r === start.r && c === start.c) &&
                !obstacles.has(k)
              ){
                end = {r,c};
              }

            }else if(mode === 'clear'){

              if(
                !(r === start.r && c === start.c) &&
                !(r === end.r && c === end.c)
              ){
                obstacles.delete(k);
              }
            }

            renderGrid();
          };

          visualGrid.appendChild(cell);
        }
      }
    }

    controls
      .querySelectorAll('.astar-tool')
      .forEach(btn => {

        btn.onclick = () => {

          controls
            .querySelectorAll('.astar-tool')
            .forEach(x =>
              x.classList.remove('active')
            );

          btn.classList.add('active');

          mode = btn.dataset.mode;
        };
      });

    visual.innerHTML = '';

    visual.appendChild(visualGrid);

    const mazeTools = document.createElement('div');
    mazeTools.className = 'astar-maze-tools';

    mazeTools.innerHTML = `
      <button class="astar-tool" id="astar-random">
        ⚡ Random Obstacles
      </button>

      <button class="astar-tool" id="astar-clear">
        🧹 Clear Obstacles
      </button>
    `;

    visual.appendChild(mazeTools);
    visual.appendChild(controls);

    renderGrid();

    mazeTools.querySelector('#astar-random').onclick = () => {

      const density =
        Number(
          body.querySelector('#path-obstacle-density')?.value
        ) || 20;

      obstacles.clear();

      const total =
        size * size;

      const amount =
        Math.floor(total * density / 100);

      const candidates = [];

      for(let r=0;r<size;r++){
        for(let c=0;c<size;c++){

          if(
            (r === start.r && c === start.c) ||
            (r === end.r && c === end.c)
          ){
            continue;
          }

          candidates.push({r,c});
        }
      }

      for(let i=candidates.length-1;i>0;i--){

        const j =
          Math.floor(Math.random() * (i + 1));

        [candidates[i],candidates[j]] =
          [candidates[j],candidates[i]];
      }

      candidates
        .slice(0,amount)
        .forEach(cell =>
          obstacles.add(
            key(cell.r,cell.c)
          )
        );

      renderGrid();

      status.textContent = 'Grid Generated';

      log.textContent =
        `${algoTitle}\\n\\n` +
        `Grid       : ${size} × ${size}\\n` +
        `Obstacles  : ${density}%\\n` +
        'Status     : Ready';
    };

    mazeTools.querySelector('#astar-clear').onclick = () => {

      obstacles.clear();

      renderGrid();

      status.textContent = 'Ready';

      log.textContent =
        `${algoTitle}\\n\\n` +
        'All obstacles cleared.';
    };

    log.textContent =
      'Dijkstra\n\n' +
      '🟢 Start : pilih titik awal\n' +
      '🔴 End   : pilih tujuan\n' +
      '⬛ Obstacle : klik untuk membuat dinding\n\n' +
      'Grid ready.';

    status.textContent = 'Ready';

    controls.querySelector('#dijkstra-start').onclick = async () => {

      const begin = performance.now();

      status.textContent = 'Searching...';

      visualGrid
        .querySelectorAll('.astar-cell')
        .forEach(cell => {
          cell.classList.remove(
            'astar-open',
            'astar-closed',
            'astar-path'
          );
        });

      const distance = new Map();
      const previous = new Map();
      const unvisited = new Set();

      for(let r=0;r<size;r++){
        for(let c=0;c<size;c++){

          if(!obstacles.has(key(r,c))){

            distance.set(
              key(r,c),
              Infinity
            );

            unvisited.add(
              key(r,c)
            );
          }
        }
      }

      distance.set(
        key(start.r,start.c),
        0
      );

      let visited = 0;
      let found = false;

      while(unvisited.size){

        let currentKey = null;
        let currentDistance = Infinity;

        for(const k of unvisited){

          const d = distance.get(k);

          if(d < currentDistance){
            currentDistance = d;
            currentKey = k;
          }
        }

        if(currentKey === null || currentDistance === Infinity){
          break;
        }

        unvisited.delete(currentKey);
        visited++;

        const [cr,cc] =
          currentKey.split(',').map(Number);

        if(
          !(cr === start.r && cc === start.c) &&
          !(cr === end.r && cc === end.c)
        ){

          const cell =
            visualGrid.querySelector(
              `[data-r="${cr}"][data-c="${cc}"]`
            );

          if(cell){
            cell.classList.add('astar-closed');
          }
        }

        if(
          cr === end.r &&
          cc === end.c
        ){

          found = true;
          break;
        }

        const neighbors = (
          movement === 8
            ? [
                {r:cr-1,c:cc},
                {r:cr+1,c:cc},
                {r:cr,c:cc-1},
                {r:cr,c:cc+1},
                {r:cr-1,c:cc-1},
                {r:cr-1,c:cc+1},
                {r:cr+1,c:cc-1},
                {r:cr+1,c:cc+1}
              ]
            : [
                {r:cr-1,c:cc},
                {r:cr+1,c:cc},
                {r:cr,c:cc-1},
                {r:cr,c:cc+1}
              ]
        ).filter(n =>
          n.r >= 0 &&
          n.r < size &&
          n.c >= 0 &&
          n.c < size &&
          !obstacles.has(key(n.r,n.c))
        );

        for(const neighbor of neighbors){

          const nk =
            key(neighbor.r,neighbor.c);

          if(!unvisited.has(nk)){
            continue;
          }

          const diagonal =
            neighbor.r !== cr &&
            neighbor.c !== cc;

          const moveCost =
            diagonal ? Math.SQRT2 : 1;

          const newDistance =
            currentDistance + moveCost;

          if(
            newDistance <
            (distance.get(nk) ?? Infinity)
          ){

            distance.set(
              nk,
              newDistance
            );

            previous.set(
              nk,
              {r:cr,c:cc}
            );

            const cell =
              visualGrid.querySelector(
                `[data-r="${neighbor.r}"][data-c="${neighbor.c}"]`
              );

            if(cell){
              cell.classList.add('astar-open');
            }
          }
        }

        await new Promise(resolve =>
          setTimeout(resolve,speed)
        );
      }

      const elapsed =
        (performance.now() - begin).toFixed(2);

      if(found){

        const path = [];

        let current = end;

        while(
          !(current.r === start.r &&
            current.c === start.c)
        ){

          path.push(current);

          const prev =
            previous.get(
              key(current.r,current.c)
            );

          if(!prev) break;

          current = prev;
        }

        path.reverse();

        for(const node of path){

          const cell =
            visualGrid.querySelector(
              `[data-r="${node.r}"][data-c="${node.c}"]`
            );

          if(cell){

            cell.classList.remove(
              'astar-open',
              'astar-closed'
            );

            cell.classList.add('astar-path');
          }

          await new Promise(resolve =>
            setTimeout(resolve,speed)
          );
        }

        status.textContent = 'Path Found';

        log.textContent =
          'Dijkstra\n\n' +
          `Nodes Visited : ${visited}\n` +
          `Path Length   : ${path.length + 1}\n` +
          `Distance      : ${distance.get(key(end.r,end.c))}\n` +
          `Execution     : ${elapsed} ms\n` +
          'Status        : Shortest Path Found';

      }else{

        status.textContent = 'No Path';

        log.textContent =
          'Dijkstra\n\n' +
          `Nodes Visited : ${visited}\n` +
          `Execution     : ${elapsed} ms\n` +
          'Status        : No Path Found';
      }
    };
  }

  function runAStar(){

    const size =
      Number(body.querySelector('#path-grid-size')?.value) || 12;

    const movement =
      Number(body.querySelector('#path-movement')?.value) || 4;

    const speed =
      Number(body.querySelector('#path-speed')?.value) || 0;

    const heuristicType =
      body.querySelector('#astar-heuristic')?.value || 'manhattan';

    let start = {
      r:1,
      c:1
    };

    let end = {
      r:size - 2,
      c:size - 2
    };

    const obstacles = new Set();

    let mode = 'obstacle';

    const visualGrid = document.createElement('div');
    visualGrid.className = 'astar-grid';

    const controls = document.createElement('div');
    controls.className = 'astar-controls';

    controls.innerHTML = `
      <div class="astar-tools">
        <button class="astar-tool active" data-mode="obstacle">
          ⬛ Obstacle
        </button>

        <button class="astar-tool" data-mode="start">
          🟢 Start
        </button>

        <button class="astar-tool" data-mode="end">
          🔴 End
        </button>

        <button class="astar-tool" data-mode="clear">
          ✕ Clear
        </button>
      </div>

      <button class="algo-run-btn" id="astar-start">
        ▶ Run A*
      </button>
    `;

    function key(r,c){
      return `${r},${c}`;
    }

    function renderGrid(){

      visualGrid.innerHTML = '';

      for(let r=0;r<size;r++){
        for(let c=0;c<size;c++){

          const cell = document.createElement('button');

          cell.className = 'astar-cell';

          cell.dataset.r = r;
          cell.dataset.c = c;

          const k = key(r,c);

          if(r === start.r && c === start.c){
            cell.classList.add('astar-start');
            cell.textContent = 'S';
          }

          else if(r === end.r && c === end.c){
            cell.classList.add('astar-end');
            cell.textContent = 'E';
          }

          else if(obstacles.has(k)){
            cell.classList.add('astar-obstacle');
          }

          cell.onclick = () => {

            if(mode === 'obstacle'){

              if(
                (r === start.r && c === start.c) ||
                (r === end.r && c === end.c)
              ) return;

              if(obstacles.has(k)){
                obstacles.delete(k);
              }else{
                obstacles.add(k);
              }

            }else if(mode === 'start'){

              if(
                !(r === end.r && c === end.c) &&
                !obstacles.has(k)
              ){
                start = {r,c};
              }

            }else if(mode === 'end'){

              if(
                !(r === start.r && c === start.c) &&
                !obstacles.has(k)
              ){
                end = {r,c};
              }

            }else if(mode === 'clear'){

              if(
                !(r === start.r && c === start.c) &&
                !(r === end.r && c === end.c)
              ){
                obstacles.delete(k);
              }
            }

            renderGrid();
          };

          visualGrid.appendChild(cell);
        }
      }
    }

    controls
      .querySelectorAll('.astar-tool')
      .forEach(btn => {

        btn.onclick = () => {

          controls
            .querySelectorAll('.astar-tool')
            .forEach(x =>
              x.classList.remove('active')
            );

          btn.classList.add('active');

          mode = btn.dataset.mode;
        };
      });

    visual.innerHTML = '';

    visual.appendChild(visualGrid);
    visual.appendChild(controls);

    renderGrid();

    log.textContent =
      'A* Pathfinding\n\n' +
      '🟢 Start : pilih titik awal\n' +
      '🔴 End   : pilih tujuan\n' +
      '⬛ Obstacle : klik untuk membuat dinding\n\n' +
      'Grid ready.';

    status.textContent = 'Ready';

    controls.querySelector('#astar-start').onclick = async () => {

      const begin = performance.now();

      status.textContent = 'Searching...';

      visualGrid
        .querySelectorAll('.astar-cell')
        .forEach(cell => {
          cell.classList.remove(
            'astar-open',
            'astar-closed',
            'astar-path'
          );
        });

      function heuristic(a,b){

        if(heuristicType === 'euclidean'){
          return Math.sqrt(
            Math.pow(a.r-b.r,2) +
            Math.pow(a.c-b.c,2)
          );
        }

        return Math.abs(a.r-b.r) +
               Math.abs(a.c-b.c);
      }

      function neighbors(node){

        const dirs = movement === 8
          ? [
              [-1,0],
              [1,0],
              [0,-1],
              [0,1],
              [-1,-1],
              [-1,1],
              [1,-1],
              [1,1]
            ]
          : [
              [-1,0],
              [1,0],
              [0,-1],
              [0,1]
            ];

        return dirs
          .map(([dr,dc]) => ({
            r:node.r + dr,
            c:node.c + dc
          }))
          .filter(n =>
            n.r >= 0 &&
            n.r < size &&
            n.c >= 0 &&
            n.c < size &&
            !obstacles.has(key(n.r,n.c))
          );
      }

      const open = [start];

      const cameFrom = new Map();
      const gScore = new Map();
      const fScore = new Map();

      gScore.set(
        key(start.r,start.c),
        0
      );

      fScore.set(
        key(start.r,start.c),
        heuristic(start,end)
      );

      const closed = new Set();

      let visited = 0;
      let found = false;

      while(open.length){

        open.sort((a,b) =>
          (fScore.get(key(a.r,a.c)) ?? Infinity) -
          (fScore.get(key(b.r,b.c)) ?? Infinity)
        );

        const current = open.shift();

        const currentKey =
          key(current.r,current.c);

        if(closed.has(currentKey)) continue;

        closed.add(currentKey);

        visited++;

        if(
          !(current.r === start.r &&
            current.c === start.c) &&
          !(current.r === end.r &&
            current.c === end.c)
        ){

          const cell =
            visualGrid.querySelector(
              `[data-r="${current.r}"][data-c="${current.c}"]`
            );

          if(cell){
            cell.classList.add('astar-closed');
          }
        }

        if(
          current.r === end.r &&
          current.c === end.c
        ){

          found = true;
          break;
        }

        for(const neighbor of neighbors(current)){

          const neighborKey =
            key(neighbor.r,neighbor.c);

          if(closed.has(neighborKey)){
            continue;
          }

          const diagonal =
            neighbor.r !== current.r &&
            neighbor.c !== current.c;

          const moveCost =
            diagonal ? Math.SQRT2 : 1;

          const tentative =
            (gScore.get(currentKey) ?? Infinity) + moveCost;

          if(
            tentative <
            (gScore.get(neighborKey) ?? Infinity)
          ){

            cameFrom.set(
              neighborKey,
              current
            );

            gScore.set(
              neighborKey,
              tentative
            );

            fScore.set(
              neighborKey,
              tentative +
              heuristic(neighbor,end)
            );

            if(
              !open.some(
                n =>
                  key(n.r,n.c) === neighborKey
              )
            ){

              open.push(neighbor);

              const cell =
                visualGrid.querySelector(
                  `[data-r="${neighbor.r}"][data-c="${neighbor.c}"]`
                );

              if(cell){
                cell.classList.add('astar-open');
              }
            }
          }
        }

        await new Promise(resolve =>
          setTimeout(resolve,speed)
        );
      }

      const elapsed =
        (performance.now() - begin).toFixed(2);

      if(found){

        const path = [];

        let current = end;

        while(
          !(current.r === start.r &&
            current.c === start.c)
        ){

          path.push(current);

          const previous =
            cameFrom.get(
              key(current.r,current.c)
            );

          if(!previous) break;

          current = previous;
        }

        path.reverse();

        for(const node of path){

          const cell =
            visualGrid.querySelector(
              `[data-r="${node.r}"][data-c="${node.c}"]`
            );

          if(cell){

            cell.classList.remove(
              'astar-open',
              'astar-closed'
            );

            cell.classList.add('astar-path');
          }

          await new Promise(resolve =>
            setTimeout(resolve,speed)
          );
        }

        status.textContent = 'Path Found';

        log.textContent =
          'A* Pathfinding\n\n' +
          `Nodes Visited : ${visited}\n` +
          `Path Length   : ${path.length + 1}\n` +
          `Execution     : ${elapsed} ms\n` +
          'Status        : Path Found';

      }else{

        status.textContent = 'No Path';

        log.textContent =
          'A* Pathfinding\n\n' +
          `Nodes Visited : ${visited}\n` +
          `Execution     : ${elapsed} ms\n` +
          'Status        : No Path Found';
      }
    };
  }

  function runGeneticAlgorithm(){

    const populationSize =
      Number(body.querySelector('#ga-population').value) || 20;

    const mutationRate =
      Number(body.querySelector('#ga-mutation').value) || 5;

    const generations =
      Number(body.querySelector('#ga-generations').value) || 30;

    const target =
      Number(body.querySelector('#ga-target').value) || 100;

    let population =
      Array.from(
        {length: populationSize},
        () => Math.floor(Math.random() * 201) - 100
      );

    let best = null;
    let output = '';

    function fitness(value){
      return 1 / (1 + Math.abs(target - value));
    }

    function select(){

      const sorted =
        [...population]
          .sort((a,b) => fitness(b) - fitness(a));

      return sorted.slice(
        0,
        Math.max(2, Math.floor(populationSize / 2))
      );
    }

    function crossover(a,b){
      return Math.random() < 0.5
        ? a
        : b;
    }

    function mutate(value){

      if(Math.random() * 100 < mutationRate){

        const change =
          Math.floor(Math.random() * 21) - 10;

        value += change;
      }

      return Math.max(-100, Math.min(100, value));
    }

    for(let generation = 1; generation <= generations; generation++){

      const selected = select();

      best =
        [...population]
          .sort((a,b) => fitness(b) - fitness(a))[0];

      output +=
        `Generation ${String(generation).padStart(2,'0')}  |  ` +
        `Best: ${best}  |  ` +
        `Fitness: ${fitness(best).toFixed(6)}\n`;

      if(best === target){
        break;
      }

      const next = [];

      while(next.length < populationSize){

        const a =
          selected[Math.floor(Math.random() * selected.length)];

        const b =
          selected[Math.floor(Math.random() * selected.length)];

        const child =
          mutate(crossover(a,b));

        next.push(child);
      }

      population = next;
    }

    const finalBest =
      [...population, best]
        .sort((a,b) =>
          Math.abs(target-a) -
          Math.abs(target-b)
        )[0];

    status.textContent =
      finalBest === target ? 'Optimal' : 'Completed';

    visual.innerHTML = `
      <div class="algo-result">
        <div class="algo-result-label">BEST SOLUTION</div>
        <div class="algo-result-value">${finalBest}</div>
        <div class="algo-result-target">
          Target: ${target}
        </div>
        <div class="algo-progress">
          <div style="width:${Math.max(
            0,
            Math.min(
              100,
              100 - Math.abs(target-finalBest)
            )
          )}%"></div>
        </div>
      </div>
    `;

    log.textContent = output;
  }

  async function runSorting(){

    const algoKey = body.querySelector('#sort-algo').value;
    const source = body.querySelector('#sort-source').value;
    const speed = Number(body.querySelector('#sort-speed').value) || 0;

    let dataset, sourceLabel;

    if (source === 'dataset'){
      const result = sortDatasetFromCSV();
      if (result.error){
        status.textContent = 'Data Ditolak';
        log.textContent = `Sorting\n\nError: ${result.error}`;
        return;
      }
      dataset = result.data;
      sourceLabel = `Dataset CSV (kolom "${result.column}")`;
    } else {
      const count = Math.max(4, Math.min(300, Number(body.querySelector('#sort-count').value) || 30));
      dataset = sortRandomDataset(count);
      sourceLabel = 'Random';
    }

    const genFn = SORT_ALGOS[algoKey].gen;
    const original = dataset.slice();

    status.textContent = 'Running';
    runBtn.disabled = true;

    visual.innerHTML = `<div class="sort-bars" id="sort-bars"></div>`;
    const barsEl = body.querySelector('#sort-bars');

    function drawBars(array, highlight, mode){
      barsEl.innerHTML = '';
      const max = Math.max(...array), min = Math.min(...array);
      const range = (max - min) || 1;
      array.forEach((val, idx) => {
        const bar = document.createElement('div');
        bar.className = 'sort-bar';
        bar.style.height = (8 + ((val - min) / range) * 92) + '%';
        if (mode === 'done') bar.classList.add('done');
        else if (highlight.includes(idx)) bar.classList.add(mode === 'swap' ? 'swap' : 'compare');
        barsEl.appendChild(bar);
      });
    }

    const trueMetrics = runSortMetrics(genFn, original);
    const steps = collectSortSteps(genFn, original);
    const stride = Math.max(1, Math.floor(steps.length / 400));

    for (let s = 0; s < steps.length; s += stride){
      const step = steps[s];
      drawBars(step.array, [step.a1, step.a2], step.type);
      log.textContent =
        `${SORT_ALGOS[algoKey].label}\n\n` +
        `Sumber Data   : ${sourceLabel}\n` +
        `Jumlah Data   : ${dataset.length}\n` +
        `Komparasi     : ${step.comparisons}\n` +
        `Swap/Tulis    : ${step.swaps}\n` +
        `Status        : Berjalan...`;
      if (speed > 0) await algoSortSleep(speed);
    }

    drawBars(trueMetrics.array, [], 'done');
    status.textContent = 'Done';
    log.textContent =
      `${SORT_ALGOS[algoKey].label}\n\n` +
      `Sumber Data   : ${sourceLabel}\n` +
      `Jumlah Data   : ${dataset.length}\n` +
      `Waktu         : ${trueMetrics.time.toFixed(2)} ms\n` +
      `Komparasi     : ${trueMetrics.comparisons}\n` +
      `Swap/Tulis    : ${trueMetrics.swaps}\n` +
      `Status        : Selesai`;

    runBtn.disabled = false;
  }
}
