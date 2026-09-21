
// ============================================================
// LYNNZZ OS — ALGORITHM LAB
// ============================================================

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
    }
  };

  body.querySelectorAll('.algo-item').forEach(btn => {
    btn.onclick = () => {
      body.querySelectorAll('.algo-item')
        .forEach(x => x.classList.remove('active'));

      btn.classList.add('active');

      const algo = algorithms[btn.dataset.algo];

      title.textContent = algo.title;
      description.textContent = algo.description;

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

        config.innerHTML = `
          <div class="algo-field">
            <label>Grid Size</label>
            <input
              type="text"
              value="12 × 12"
              readonly
            >
          </div>

          <div class="algo-field">
            <label>Movement</label>
            <input
              type="text"
              value="4 Directions"
              readonly
            >
          </div>

          <div class="algo-field">
            <label>Start</label>
            <input
              type="text"
              value="Interactive"
              readonly
            >
          </div>

          <div class="algo-field">
            <label>Goal</label>
            <input
              type="text"
              value="Interactive"
              readonly
            >
          </div>
        `;

        runBtn.textContent =
          btn.dataset.algo === 'astar'
            ? '▶ Run A*'
            : '▶ Run Dijkstra';

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

    if(active.dataset.algo !== 'ga'){
      status.textContent = 'Coming Soon';
      log.textContent =
        `${algorithms[active.dataset.algo].title}\n\nModule belum diimplementasikan.`;
      return;
    }

    runGeneticAlgorithm();
  };

  function runDijkstra(){

    const size = 12;

    let start = {r:1, c:1};
    let end = {r:10, c:10};

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
    visual.appendChild(controls);

    renderGrid();

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

        const neighbors = [
          {r:cr-1,c:cc},
          {r:cr+1,c:cc},
          {r:cr,c:cc-1},
          {r:cr,c:cc+1}
        ].filter(n =>
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

          const newDistance =
            currentDistance + 1;

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
          setTimeout(resolve,30)
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
            setTimeout(resolve,40)
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

    const size = 12;

    let start = {r:1, c:1};
    let end = {r:10, c:10};

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
        return Math.abs(a.r-b.r) +
               Math.abs(a.c-b.c);
      }

      function neighbors(node){

        const dirs = [
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

          const tentative =
            (gScore.get(currentKey) ?? Infinity) + 1;

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
          setTimeout(resolve,30)
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
            setTimeout(resolve,40)
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
}
