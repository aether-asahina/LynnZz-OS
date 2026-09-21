
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

    if(active.dataset.algo !== 'ga'){
      status.textContent = 'Coming Soon';
      log.textContent =
        `${algorithms[active.dataset.algo].title}\n\nModule belum diimplementasikan.`;
      return;
    }

    runGeneticAlgorithm();
  };

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
