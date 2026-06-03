const SQLITE_DB_URL = './data/prescribe_guard.sqlite';
const SQLITE_WORKER_URL = './assets/js/sqlite-data-worker.js?sqlite3.dir=../vendor/sqlite-wasm';

let DRUG_CATALOG = [];
let DRUG_BY_NAME = new Map();
let DATA_STORE = null;
let interactionRequestId = 0;

class BrowserSqliteDataStore {
    constructor({ workerUrl, dbUrl }) {
        if (!window.Worker) {
            throw new Error('Este navegador não oferece suporte a Web Workers.');
        }

        this.dbUrl = dbUrl;
        this.nextId = 0;
        this.pending = new Map();
        this.worker = new Worker(workerUrl, { name: 'prescribe-guard-sqlite' });
        this.worker.addEventListener('message', event => this.handleMessage(event));
        this.worker.addEventListener('error', event => {
            this.rejectAll(new Error(event.message || 'Falha ao executar o Worker SQLite.'));
        });
        this.ready = this.request('init', { dbUrl });
    }

    handleMessage(event) {
        const { id, ok, result, error } = event.data || {};
        const pending = this.pending.get(id);
        if (!pending) return;

        this.pending.delete(id);
        if (ok) {
            pending.resolve(result);
        } else {
            pending.reject(new Error(error?.message || 'Falha na consulta SQLite.'));
        }
    }

    rejectAll(error) {
        this.pending.forEach(({ reject }) => reject(error));
        this.pending.clear();
    }

    request(type, payload = {}) {
        const id = ++this.nextId;
        return new Promise((resolve, reject) => {
            this.pending.set(id, { resolve, reject });
            this.worker.postMessage({ id, type, payload });
        });
    }

    async loadCatalog() {
        await this.ready;
        return this.request('loadCatalog');
    }

    async findDrugByName(name) {
        await this.ready;
        return this.request('findDrugByName', { name });
    }

    async findInteractionsForPairs(pairKeys) {
        await this.ready;
        return this.request('findInteractionsForPairs', { pairKeys });
    }
}

async function loadAppData() {
    const workerUrl = new URL(SQLITE_WORKER_URL, window.location.href);
    const dbUrl = new URL(SQLITE_DB_URL, window.location.href).href;
    DATA_STORE = new BrowserSqliteDataStore({ workerUrl, dbUrl });
    const initInfo = await DATA_STORE.ready;
    const drugCatalog = await DATA_STORE.loadCatalog();
    return {
        drugCatalog: Array.isArray(drugCatalog) ? drugCatalog : [],
        metadata: initInfo?.metadata || {},
    };
}

const ORGANS = [
    { key: "cardiovascular", label: "Cardiovascular", emoji: "🫀" },
    { key: "snc", label: "Sistema Nervoso", emoji: "🧠" },
    { key: "figado", label: "Fígado", emoji: "🟤" },
    { key: "rins", label: "Rins", emoji: "🫘" },
    { key: "hematologico", label: "Hematológico", emoji: "🩸" },
    { key: "gastrointestinal", label: "TGI", emoji: "💊" },
    { key: "respiratorio", label: "Respiratório", emoji: "🫁" },
];

        const SEVERITY_LABELS = {
            contraindicated: "Contraindicado", major: "Maior", moderate: "Moderado", minor: "Menor"
        };

        // ════════════════════════════════════════════════
        //  ESTADO
        // ════════════════════════════════════════════════
        const state = {
            drugs: [],
            interactions: [],
            currentLayout: 'force',
        };

        // ════════════════════════════════════════════════
        //  D3 GRAPH STATE
        // ════════════════════════════════════════════════
        const G = {
            simulation: null,
            nodes: [],
            links: [],
            safeLinks: [],
        };

        const SEV = {
            contraindicated: {
                nodeColor: '#2A0808', stroke: '#FF4444', filter: 'url(#gf-contra)',
                textColor: '#FF9999', edgeColor: '#FF3333', edgeWidth: 6, edgeDash: null, edgeOpacity: .92,
            },
            major: {
                nodeColor: '#241000', stroke: '#FF8844', filter: 'url(#gf-major)',
                textColor: '#FFCC99', edgeColor: '#FF7733', edgeWidth: 4.5, edgeDash: null, edgeOpacity: .85,
            },
            moderate: {
                nodeColor: '#211A00', stroke: '#FFDD55', filter: 'url(#gf-moderate)',
                textColor: '#FFE899', edgeColor: '#FFCC44', edgeWidth: 3.5, edgeDash: '10,5', edgeOpacity: .78,
            },
            minor: {
                nodeColor: '#101A08', stroke: '#66DD55', filter: 'url(#gf-minor)',
                textColor: '#BBEEAA', edgeColor: '#55CC44', edgeWidth: 2.5, edgeDash: '3,6', edgeOpacity: .68,
            },
            safe: {
                nodeColor: '#0F1825', stroke: '#2A4A7F', filter: null,
                textColor: '#5A7899', edgeColor: '#1E3A6E', edgeWidth: 1, edgeDash: null, edgeOpacity: .2,
            },
        };

        const SEV_ORDER = ['safe', 'minor', 'moderate', 'major', 'contraindicated'];

        // ════════════════════════════════════════════════
        //  UTILITÁRIOS
        // ════════════════════════════════════════════════
        function canonicalPairKey(drugA, drugB) {
            return [drugA, drugB]
                .map(name => name.trim().toLocaleLowerCase('pt-BR'))
                .sort()
                .join('||');
        }

        function rebuildDataIndexes() {
            DRUG_BY_NAME = new Map(
                DRUG_CATALOG.map(drug => [drug.name.toLocaleLowerCase('pt-BR'), drug])
            );
        }

        async function computeInteractions() {
            if (!DATA_STORE || state.drugs.length < 2) return [];

            const pairs = [];
            const drugs = state.drugs;
            for (let i = 0; i < drugs.length; i++) {
                for (let j = i + 1; j < drugs.length; j++) {
                    pairs.push({
                        key: canonicalPairKey(drugs[i], drugs[j]),
                        drug_a: drugs[i],
                        drug_b: drugs[j],
                    });
                }
            }

            const matches = await DATA_STORE.findInteractionsForPairs(pairs.map(pair => pair.key));
            const matchByPair = new Map(matches.map(interaction => [interaction.pair_key, interaction]));
            return pairs
                .map(pair => {
                    const match = matchByPair.get(pair.key);
                    return match ? { ...match, drug_a: pair.drug_a, drug_b: pair.drug_b } : null;
                })
                .filter(Boolean);
        }

        async function refreshInteractions() {
            const requestId = ++interactionRequestId;
            let interactions = [];
            try {
                interactions = await computeInteractions();
            } catch (error) {
                console.error(error);
                announceSR('Falha ao consultar interações no SQLite local.');
                return;
            }
            if (requestId !== interactionRequestId) return;

            state.interactions = interactions;
            renderCounter();
            renderGraph();
            renderOrgans();
        }

        function worstSevForDrug(name) {
            let worst = 'safe';
            state.interactions.forEach(i => {
                if (i.drug_a === name || i.drug_b === name) {
                    if (SEV_ORDER.indexOf(i.severity) > SEV_ORDER.indexOf(worst)) worst = i.severity;
                }
            });
            return worst;
        }

        function announceSR(text) {
            const el = document.getElementById('sr-live');
            el.textContent = '';
            requestAnimationFrame(() => { el.textContent = text; });
        }

        function getContainerSize() {
            const el = document.getElementById('cy-container');
            return { w: el.clientWidth || 800, h: el.clientHeight || 500 };
        }

        // ════════════════════════════════════════════════
        //  RENDER: TAGS
        // ════════════════════════════════════════════════
        function renderTags() {
            const row = document.getElementById('tags-row');
            row.innerHTML = '';
            state.drugs.forEach((drug, i) => {
                const li = document.createElement('div');
                li.className = 'drug-tag';
                li.setAttribute('role', 'listitem');
                li.setAttribute('tabindex', '0');
                li.innerHTML = `${drug}
      <button aria-label="Remover ${drug}" data-index="${i}" tabindex="0">
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
          <line x1="1" y1="1" x2="7" y2="7"/><line x1="7" y1="1" x2="1" y2="7"/>
        </svg>
      </button>`;
                li.querySelector('button').addEventListener('click', () => removeDrug(i));
                row.appendChild(li);
            });
        }

        // ════════════════════════════════════════════════
        //  RENDER: COUNTER
        // ════════════════════════════════════════════════
        function renderCounter() {
            const count = state.drugs.length;
            const iCount = state.interactions.length;
            document.getElementById('drug-count').textContent = count;
            document.getElementById('drug-count-label').textContent = count === 1 ? 'medicamento' : 'medicamentos';

            const interSection = document.getElementById('interaction-count-section');
            const interBadge = document.getElementById('interaction-badge');
            if (count >= 2) {
                interSection.style.display = '';
                const color = iCount > 0
                    ? (state.interactions.some(i => i.severity === 'contraindicated') ? '#DC2626'
                        : state.interactions.some(i => i.severity === 'major') ? '#EA580C' : '#D97706')
                    : '#65A30D';
                interBadge.style.background = color + '18';
                interBadge.style.color = color;
                interBadge.style.border = `1px solid ${color}40`;
                interBadge.textContent = `${iCount} ${iCount === 1 ? 'interação' : 'interações'}`;
            } else {
                interSection.style.display = 'none';
            }
        }

        // ════════════════════════════════════════════════
        //  RENDER: GRAFO D3
        // ════════════════════════════════════════════════
        function renderGraph() {
            const empty = document.getElementById('graph-empty');

            if (state.drugs.length < 1) {
                empty.style.display = '';
                clearGraph();
                return;
            }
            empty.style.display = 'none';
            buildAndDraw();
        }

        function clearGraph() {
            if (G.simulation) { G.simulation.stop(); G.simulation = null; }
            ['g-safe-links', 'g-links', 'g-link-hits', 'g-halos', 'g-nodes', 'g-labels'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.innerHTML = '';
            });
        }

        function buildAndDraw() {
            const prevPos = {};
            G.nodes.forEach(n => { prevPos[n.id] = { x: n.x, y: n.y, vx: n.vx || 0, vy: n.vy || 0 }; });

            const { w, h } = getContainerSize();

            G.nodes = state.drugs.map(name => {
                const p = prevPos[name];
                return {
                    id: name,
                    severity: worstSevForDrug(name),
                    x: p ? p.x : w / 2 + (Math.random() - .5) * 120,
                    y: p ? p.y : h / 2 + (Math.random() - .5) * 120,
                    vx: p ? p.vx : 0,
                    vy: p ? p.vy : 0,
                };
            });

            const activePairs = new Set();
            G.links = state.interactions.map(i => {
                activePairs.add(`${i.drug_a}||${i.drug_b}`);
                activePairs.add(`${i.drug_b}||${i.drug_a}`);
                return { source: i.drug_a, target: i.drug_b, severity: i.severity, interaction: i };
            });

            G.safeLinks = [];
            for (let i = 0; i < state.drugs.length; i++) {
                for (let j = i + 1; j < state.drugs.length; j++) {
                    const a = state.drugs[i], b = state.drugs[j];
                    if (!activePairs.has(`${a}||${b}`))
                        G.safeLinks.push({ source: a, target: b });
                }
            }

            drawGraph();
            startSimulation();
        }

        function startSimulation() {
            if (G.simulation) G.simulation.stop();
            const { w, h } = getContainerSize();
            const viewportScale = Math.min(w, h);

            const allLinksForSim = [
                ...G.links,
                ...G.safeLinks.map(l => ({ ...l, severity: 'safe', _isSafe: true }))
            ];
            const linkDistances = {
                contraindicated: Math.max(95, viewportScale * 0.15),
                major: Math.max(110, viewportScale * 0.17),
                moderate: Math.max(125, viewportScale * 0.19),
                minor: Math.max(140, viewportScale * 0.21),
            };
            const linkStrengths = {
                contraindicated: .42,
                major: .36,
                moderate: .30,
                minor: .24,
            };
            const chargeStrengths = {
                contraindicated: -320,
                major: -285,
                moderate: -260,
                minor: -235,
                safe: -210,
            };

            G.simulation = d3.forceSimulation(G.nodes)
                .force('link',
                    d3.forceLink(allLinksForSim)
                        .id(d => d.id)
                        .distance(d => d._isSafe ? Math.max(155, viewportScale * 0.24) : (linkDistances[d.severity] || 125))
                        .strength(d => d._isSafe ? 0.012 : (linkStrengths[d.severity] || .18))
                )
                .force('charge',
                    d3.forceManyBody()
                        .strength(d => chargeStrengths[d.severity] || -260)
                        .distanceMin(24)
                        .distanceMax(Math.max(320, Math.max(w, h) * 0.55))
                )
                .force('center', d3.forceCenter(w / 2, h / 2).strength(0.05))
                .force('x', d3.forceX(w / 2).strength(0.025))
                .force('y', d3.forceY(h / 2).strength(0.025))
                .force('collide', d3.forceCollide().radius(d => Math.max(30, Math.min(62, d.id.length * 2.7))).strength(.88))
                .alphaDecay(0.016)
                .velocityDecay(0.34)
                .on('tick', tickGraph);
        }

        function drawGraph() {
            const { w, h } = getContainerSize();
            d3.select('#graph-svg').attr('viewBox', `0 0 ${w} ${h}`);

            const nodeById = new Map(G.nodes.map(n => [n.id, n]));

            d3.select('#g-safe-links').selectAll('line').remove();
            d3.select('#g-safe-links').selectAll('line')
                .data(G.safeLinks)
                .join('line')
                .attr('stroke', SEV.safe.edgeColor)
                .attr('stroke-width', SEV.safe.edgeWidth)
                .attr('opacity', SEV.safe.edgeOpacity)
                .style('pointer-events', 'none');

            d3.select('#g-links').selectAll('line').remove();
            d3.select('#g-links').selectAll('line')
                .data(G.links)
                .join('line')
                .attr('stroke', d => SEV[d.severity].edgeColor)
                .attr('stroke-width', d => SEV[d.severity].edgeWidth)
                .attr('stroke-dasharray', d => SEV[d.severity].edgeDash || null)
                .attr('stroke-linecap', 'round')
                .attr('opacity', d => SEV[d.severity].edgeOpacity)
                .style('pointer-events', 'none');

            d3.select('#g-link-hits').selectAll('line').remove();
            d3.select('#g-link-hits').selectAll('line')
                .data(G.links)
                .join('line')
                .attr('stroke', 'transparent')
                .attr('stroke-width', 18)
                .attr('stroke-linecap', 'round')
                .style('cursor', 'pointer')
                .on('mouseenter', function (event, d) {
                    d3.select('#g-links').selectAll('line')
                        .filter(l => l === d)
                        .attr('stroke-width', SEV[d.severity].edgeWidth + 2)
                        .attr('opacity', 1);
                    showEdgeTip(event, d);
                })
                .on('mousemove', moveTip)
                .on('mouseleave', function (event, d) {
                    d3.select('#g-links').selectAll('line')
                        .filter(l => l === d)
                        .attr('stroke-width', SEV[d.severity].edgeWidth)
                        .attr('opacity', SEV[d.severity].edgeOpacity);
                    hideTip();
                })
                .on('click', (event, d) => openInteractionPanel(d.interaction));

            d3.select('#g-halos').selectAll('circle').remove();
            d3.select('#g-halos').selectAll('circle')
                .data(G.nodes.filter(n => n.severity !== 'safe'))
                .join('circle')
                .attr('r', 18)
                .attr('fill', d => {
                    const colors = { contraindicated: '#FF222233', major: '#FF550022', moderate: '#FFAA0018', minor: '#44AA2215' };
                    return colors[d.severity] || 'transparent';
                })
                .attr('filter', d => SEV[d.severity].filter || null)
                .attr('stroke', d => SEV[d.severity].stroke)
                .attr('stroke-width', .8)
                .attr('opacity', .4)
                .attr('pointer-events', 'none');

            d3.select('#g-nodes').selectAll('circle').remove();
            d3.select('#g-nodes').selectAll('circle')
                .data(G.nodes)
                .join('circle')
                .attr('r', 10)
                .attr('fill', d => SEV[d.severity].nodeColor)
                .attr('stroke', d => SEV[d.severity].stroke)
                .attr('stroke-width', d => d.severity === 'safe' ? 1.5 : 2.2)
                .attr('filter', d => SEV[d.severity].filter || null)
                .style('cursor', 'grab')
                .call(
                    d3.drag()
                        .on('start', (event, d) => {
                            if (!event.active) G.simulation.alphaTarget(.3).restart();
                            d.fx = d.x; d.fy = d.y;
                        })
                        .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y; })
                        .on('end', (event, d) => {
                            if (!event.active) G.simulation.alphaTarget(0);
                            d.fx = null; d.fy = null;
                        })
                )
                .on('mouseenter', function (event, d) {
                    d3.select(this).attr('r', 14).attr('stroke-width', 3);
                    d3.select('#g-halos').selectAll('circle')
                        .filter(h => h.id === d.id)
                        .attr('r', 24).attr('opacity', .65);
                    showNodeTip(event, d);
                    highlightConnected(d.id);
                })
                .on('mousemove', moveTip)
                .on('mouseleave', function (event, d) {
                    d3.select(this).attr('r', 10).attr('stroke-width', d.severity === 'safe' ? 1.5 : 2.2);
                    d3.select('#g-halos').selectAll('circle')
                        .filter(h => h.id === d.id)
                        .attr('r', 18).attr('opacity', .4);
                    hideTip();
                    resetHighlight();
                });

            d3.select('#g-labels').selectAll('text').remove();
            d3.select('#g-labels').selectAll('text')
                .data(G.nodes)
                .join('text')
                .attr('text-anchor', 'middle')
                .attr('dy', '24')
                .attr('font-family', 'IBM Plex Sans, sans-serif')
                .attr('font-size', '10')
                .attr('font-weight', '600')
                .attr('fill', d => SEV[d.severity].textColor)
                .attr('filter', 'url(#gf-label)')
                .attr('pointer-events', 'none')
                .text(d => d.id);
        }

        function tickGraph() {
            const nb = new Map(G.nodes.map(n => [n.id, n]));

            d3.select('#g-safe-links').selectAll('line')
                .attr('x1', d => nb.get(typeof d.source === 'string' ? d.source : d.source.id)?.x ?? 0)
                .attr('y1', d => nb.get(typeof d.source === 'string' ? d.source : d.source.id)?.y ?? 0)
                .attr('x2', d => nb.get(typeof d.target === 'string' ? d.target : d.target.id)?.x ?? 0)
                .attr('y2', d => nb.get(typeof d.target === 'string' ? d.target : d.target.id)?.y ?? 0);

            d3.select('#g-links').selectAll('line')
                .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x).attr('y2', d => d.target.y);

            d3.select('#g-link-hits').selectAll('line')
                .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x).attr('y2', d => d.target.y);

            d3.select('#g-halos').selectAll('circle')
                .attr('cx', d => d.x).attr('cy', d => d.y);

            d3.select('#g-nodes').selectAll('circle')
                .attr('cx', d => d.x).attr('cy', d => d.y);

            d3.select('#g-labels').selectAll('text')
                .attr('x', d => d.x).attr('y', d => d.y);
        }

        function highlightConnected(nodeId) {
            const connected = new Set([nodeId]);
            G.links.forEach(l => {
                const s = l.source.id || l.source, t = l.target.id || l.target;
                if (s === nodeId) connected.add(t);
                if (t === nodeId) connected.add(s);
            });
            d3.select('#g-nodes').selectAll('circle').attr('opacity', d => connected.has(d.id) ? 1 : .08);
            d3.select('#g-halos').selectAll('circle').attr('opacity', d => connected.has(d.id) ? .65 : .03);
            d3.select('#g-labels').selectAll('text').attr('opacity', d => connected.has(d.id) ? 1 : .05);
            d3.select('#g-links').selectAll('line').attr('opacity', d => {
                const s = d.source.id || d.source, t = d.target.id || d.target;
                return (s === nodeId || t === nodeId) ? 1 : .03;
            });
            d3.select('#g-safe-links').selectAll('line').attr('opacity', .03);
        }

        function resetHighlight() {
            d3.select('#g-nodes').selectAll('circle').attr('opacity', 1);
            d3.select('#g-halos').selectAll('circle').attr('opacity', .4);
            d3.select('#g-labels').selectAll('text').attr('opacity', 1);
            d3.select('#g-links').selectAll('line').attr('opacity', d => SEV[d.severity].edgeOpacity);
            d3.select('#g-safe-links').selectAll('line').attr('opacity', SEV.safe.edgeOpacity);
        }

        function applyRadialLayout() {
            if (G.simulation) G.simulation.stop();
            const { w, h } = getContainerSize();
            const cx = w / 2, cy = h / 2;
            const n = G.nodes.length;
            G.nodes.forEach((node, i) => {
                const angle = (2 * Math.PI * i / n) - Math.PI / 2;
                const r = Math.min(w, h) * 0.35;
                node.x = cx + Math.cos(angle) * r;
                node.y = cy + Math.sin(angle) * r;
                node.fx = node.x; node.fy = node.y;
            });
            tickGraph();
            setTimeout(() => { G.nodes.forEach(n => { n.fx = null; n.fy = null; }); }, 800);
        }

        function applyGridLayout() {
            if (G.simulation) G.simulation.stop();
            const { w, h } = getContainerSize();
            const n = G.nodes.length;
            const cols = Math.ceil(Math.sqrt(n));
            const cellW = w / (cols + 1), cellH = h / (Math.ceil(n / cols) + 1);
            G.nodes.forEach((node, i) => {
                node.x = cellW * (i % cols + 1);
                node.y = cellH * (Math.floor(i / cols) + 1);
                node.fx = node.x; node.fy = node.y;
            });
            tickGraph();
            setTimeout(() => { G.nodes.forEach(n => { n.fx = null; n.fy = null; }); }, 800);
        }

        function runLayout(name) {
            state.currentLayout = name;
            if (name === 'force') {
                G.nodes.forEach(n => { n.fx = null; n.fy = null; });
                if (G.simulation) G.simulation.alpha(0.6).restart();
                else buildAndDraw();
            } else if (name === 'radial') {
                applyRadialLayout();
            } else if (name === 'grid') {
                applyGridLayout();
            }
        }

        // ════════════════════════════════════════════════
        //  TOOLTIP
        // ════════════════════════════════════════════════
        const tipEl = document.getElementById('cy-tooltip');

        function showNodeTip(event, d) {
            const s = SEV[d.severity];
            const info = DRUG_BY_NAME.get(d.id.toLocaleLowerCase('pt-BR')) || {};
            const count = G.links.filter(l => (l.source.id || l.source) === d.id || (l.target.id || l.target) === d.id).length;
            tipEl.innerHTML = `
    <strong style="color:${s.textColor}">${d.id}</strong>
    <span class="tip-class">${info.class || 'Medicamento'}</span>
    <span class="tip-interactions" style="color:${count > 0 ? s.stroke : '#4A6080'}">
      ${count > 0 ? `⚠ ${count} interação${count > 1 ? 'ões' : ''} detectada${count > 1 ? 's' : ''}` : '✓ Sem interações conhecidas com os demais'}
    </span>`;
            positionTip(event);
            tipEl.classList.add('visible');
        }

        function showEdgeTip(event, d) {
            const s = SEV[d.severity];
            tipEl.innerHTML = `
    <strong style="color:${s.textColor}">${d.source.id || d.source} × ${d.target.id || d.target}</strong>
    <span class="tip-interactions" style="color:${s.edgeColor}">⚠ ${SEVERITY_LABELS[d.severity]} — clique para detalhes</span>`;
            positionTip(event);
            tipEl.classList.add('visible');
        }

        function positionTip(e) {
            tipEl.style.left = (e.clientX + 16) + 'px';
            tipEl.style.top = (e.clientY - 14) + 'px';
        }
        function moveTip(e) { positionTip(e); }
        function hideTip() { tipEl.classList.remove('visible'); }

        // ════════════════════════════════════════════════
        //  RENDER: ORGANS
        // ════════════════════════════════════════════════
        function renderOrgans() {
            const SEV_COLORS = {
                contraindicated: '#DC2626', major: '#EA580C', moderate: '#D97706', minor: '#65A30D',
            };
            const SEV_TAGS = {
                contraindicated: { bg: '#FEF2F2', color: '#991B1B', label: 'Contraindicado' },
                major: { bg: '#FFF7ED', color: '#9A3412', label: 'Maior' },
                moderate: { bg: '#FFFBEB', color: '#92400E', label: 'Moderado' },
                minor: { bg: '#F0FDF4', color: '#166534', label: 'Menor' },
            };
            const order = ['minor', 'moderate', 'major', 'contraindicated'];
            const organRisk = {};
            ORGANS.forEach(o => { organRisk[o.key] = null; });
            state.interactions.forEach(inter => {
                inter.systems_affected.forEach(sys => {
                    const prev = organRisk[sys], sev = inter.severity;
                    if (!prev || order.indexOf(sev) > order.indexOf(prev)) organRisk[sys] = sev;
                });
            });

            ORGANS.forEach(organ => {
                const risk = organRisk[organ.key];
                const group = document.querySelector(`[data-organ="${organ.key}"]`);
                if (!group) return;
                group.setAttribute('data-risk', risk || '');
                group.setAttribute('aria-label', `${organ.label}${risk ? ' — risco ' + SEVERITY_LABELS[risk] : ' — sem risco'}`);
                const dot = document.getElementById(`dot-${organ.key}`);
                if (dot) { dot.style.fill = risk ? SEV_COLORS[risk] : '#CBD5E1'; dot.style.opacity = risk ? '1' : '.35'; }
                const lbl = document.getElementById(`lbl-${organ.key}`);
                if (lbl) lbl.style.fill = risk ? SEV_COLORS[risk] : '#94A3B8';
                if (!group.dataset.listenerAdded) {
                    group.addEventListener('click', () => openOrganPanel(organ));
                    group.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openOrganPanel(organ); } });
                    group.dataset.listenerAdded = 'true';
                }
            });

            const panel = document.getElementById('organ-legend-panel');
            const affectedOrgans = ORGANS.filter(o => organRisk[o.key]);
            affectedOrgans.sort((a, b) => order.indexOf(organRisk[b.key]) - order.indexOf(organRisk[a.key]));

            if (!affectedOrgans.length) {
                panel.innerHTML = `
      <div class="organ-legend-title">Sistemas afetados</div>
      <p style="font-size:.8rem;color:var(--text-muted);line-height:1.6;margin-top:6px;">
        ${state.drugs.length < 2 ? 'Adicione ao menos 2 medicamentos.' : 'Nenhuma interação detectada nos sistemas orgânicos.'}
      </p>`;
                return;
            }

            panel.innerHTML = `<div class="organ-legend-title">Sistemas afetados</div>`;
            affectedOrgans.forEach(organ => {
                const risk = organRisk[organ.key], tag = SEV_TAGS[risk];
                const item = document.createElement('div');
                item.className = 'organ-legend-item';
                item.setAttribute('role', 'button'); item.setAttribute('tabindex', '0');
                item.innerHTML = `
      <div class="organ-dot" style="background:${SEV_COLORS[risk]};box-shadow:0 0 5px ${SEV_COLORS[risk]}66;"></div>
      <span class="organ-label-text">${organ.label}</span>
      <span class="organ-risk-tag" style="background:${tag.bg};color:${tag.color};">${tag.label}</span>`;
                item.addEventListener('click', () => openOrganPanel(organ));
                panel.appendChild(item);
            });

            const unaffected = ORGANS.filter(o => !organRisk[o.key]);
            if (unaffected.length) {
                const div = document.createElement('div');
                div.style.cssText = 'margin-top:10px;padding-top:10px;border-top:1px solid var(--border);';
                div.innerHTML = `<div class="organ-legend-title" style="margin-bottom:6px;">Sem interação</div>`;
                unaffected.forEach(o => {
                    const row = document.createElement('div');
                    row.style.cssText = 'display:flex;align-items:center;gap:8px;padding:4px 10px;opacity:.5;';
                    row.innerHTML = `<div style="width:7px;height:7px;border-radius:50%;background:#CBD5E1;flex-shrink:0;"></div><span style="font-size:.78rem;color:var(--text-secondary);">${o.label}</span>`;
                    div.appendChild(row);
                });
                panel.appendChild(div);
            }
        }

        // ════════════════════════════════════════════════
        //  PANELS
        // ════════════════════════════════════════════════
        function openPanel() {
            document.getElementById('side-panel').classList.add('open');
            document.getElementById('panel-overlay').classList.add('open');
            document.getElementById('side-panel').setAttribute('aria-hidden', 'false');
            document.getElementById('close-panel-btn').focus();
        }
        function closePanel() {
            document.getElementById('side-panel').classList.remove('open');
            document.getElementById('panel-overlay').classList.remove('open');
            document.getElementById('side-panel').setAttribute('aria-hidden', 'true');
        }

        function openInteractionPanel(inter) {
            document.getElementById('panel-title-group').innerHTML = `
    <div class="panel-drugs">${inter.drug_a} <span class="vs">×</span> ${inter.drug_b}</div>
    <span class="severity-badge ${inter.severity}">
      ${inter.severity === 'contraindicated' ? '⛔' : inter.severity === 'major' ? '🔴' : inter.severity === 'moderate' ? '🟡' : '🟢'}
      ${SEVERITY_LABELS[inter.severity] || inter.severity}
    </span>`;
            const systemNames = { cardiovascular: 'Cardiovascular', snc: 'SNC', figado: 'Fígado', rins: 'Rins', hematologico: 'Hematológico', gastrointestinal: 'GI', respiratorio: 'Respiratório' };
            document.getElementById('panel-body').innerHTML = `
    <div class="panel-section">
      <div class="panel-section-label">Mecanismo Farmacológico</div>
      <p class="panel-text">${inter.mechanism}</p>
    </div>
    <div class="panel-section">
      <div class="panel-section-label">Efeitos Clínicos</div>
      <div class="effects-list">${inter.effects.map(e => `<span class="effect-chip">${e}</span>`).join('')}</div>
    </div>
    <div class="panel-section">
      <div class="panel-section-label">Recomendação</div>
      <div class="recommendation-box ${inter.severity}">${inter.recommendation}</div>
    </div>
    <div class="panel-section">
      <div class="panel-section-label">Sistemas Afetados</div>
      <div class="systems-chips">${inter.systems_affected.map(s => `<span class="system-chip">${systemNames[s] || s}</span>`).join('')}</div>
    </div>`;
            openPanel();
        }

        function openOrganPanel(organ) {
            // ── Zoom: limpar estado anterior e aplicar no órgão clicado ──
            document.querySelectorAll('.organ-group.organ-zoom-active')
                .forEach(el => el.classList.remove('organ-zoom-active'));

            const organEl = document.querySelector(`[data-organ="${organ.key}"]`);
            if (organEl) {
                organEl.classList.add('organ-zoom-active');
                const removeZoom = () => {
                    organEl.classList.remove('organ-zoom-active');
                    document.getElementById('close-panel-btn').removeEventListener('click', removeZoom);
                    document.getElementById('panel-overlay').removeEventListener('click', removeZoom);
                };
                document.getElementById('close-panel-btn').addEventListener('click', removeZoom);
                document.getElementById('panel-overlay').addEventListener('click', removeZoom);
            }

            const affected = state.interactions.filter(i => i.systems_affected.includes(organ.key));
            document.getElementById('panel-title-group').innerHTML = `
    <div class="panel-drugs">${organ.emoji} ${organ.label}</div>
    <span style="font-size:.82rem;color:var(--text-muted);">
      ${affected.length === 0 ? 'Sem interações identificadas' : `${affected.length} interação${affected.length > 1 ? 'ões' : ''} afetando este sistema`}
    </span>`;
            document.getElementById('panel-body').innerHTML = affected.length === 0
                ? `<div style="text-align:center;padding:40px 0;color:var(--text-muted);"><div style="font-size:2rem;margin-bottom:12px;">✅</div><p>Nenhuma interação identificada nos medicamentos atuais impacta este sistema.</p></div>`
                : `<div class="panel-section">
        <div class="panel-section-label">Interações Ativas</div>
        <div class="organ-panel-list">
          ${affected.map(inter => `
            <div class="organ-interaction-item">
              <div class="organ-interaction-drugs" style="display:flex;align-items:center;gap:8px;justify-content:space-between;">
                <span>${inter.drug_a} × ${inter.drug_b}</span>
                <span class="severity-badge ${inter.severity}" style="font-size:.68rem;padding:2px 8px;">${SEVERITY_LABELS[inter.severity]}</span>
              </div>
              <div class="organ-interaction-desc">${inter.mechanism.substring(0, 160)}${inter.mechanism.length > 160 ? '...' : ''}</div>
            </div>`).join('')}
        </div>
      </div>`;
            openPanel();
        }

        // ════════════════════════════════════════════════
        //  ADD / REMOVE DRUGS
        // ════════════════════════════════════════════════
        async function addDrug(name) {
            const trimmed = name.trim();
            if (!trimmed) return;
            if (state.drugs.includes(trimmed)) { announceSR(`${trimmed} já foi adicionado.`); return; }
            state.drugs.push(trimmed);
            state.interactions = [];
            renderTags(); renderCounter(); renderGraph(); renderOrgans();
            await refreshInteractions();
            announceSR(`${trimmed} adicionado. ${state.drugs.length} medicamentos. ${state.interactions.length} interações.`);
        }

        async function removeDrug(index) {
            const removed = state.drugs[index];
            state.drugs.splice(index, 1);
            state.interactions = [];
            renderTags(); renderCounter(); renderGraph(); renderOrgans();
            await refreshInteractions();
            announceSR(`${removed} removido.`);
            document.getElementById('drug-input').focus();
        }

        // ════════════════════════════════════════════════
        //  AUTOCOMPLETE
        // ════════════════════════════════════════════════
        const input = document.getElementById('drug-input');
        const addButton = document.getElementById('add-btn');
        const listbox = document.getElementById('autocomplete-listbox');
        let acActiveIndex = -1;
        let acItems = [];

        function setControlsDisabled(disabled) {
            input.disabled = disabled;
            addButton.disabled = disabled;
        }

        function renderDataLoadError(error) {
            console.error(error);
            hideAutocomplete();
            setControlsDisabled(true);
            input.value = '';
            input.placeholder = 'Base SQLite indisponível no momento.';
            const emptyState = document.getElementById('graph-empty');
            if (emptyState) {
                emptyState.querySelector('p').textContent = 'Não foi possível abrir a base SQLite';
                emptyState.querySelector('small').textContent = 'Verifique data/prescribe_guard.sqlite e sqlite3.wasm.';
                emptyState.style.display = '';
            }
            announceSR('Falha ao abrir a base SQLite local de medicamentos.');
        }

        function showAutocomplete(query) {
            const q = query.toLocaleLowerCase('pt-BR');
            acItems = q.length < 1 ? [] :
                DRUG_CATALOG.filter(d => d.name.toLocaleLowerCase('pt-BR').includes(q) && !state.drugs.includes(d.name)).slice(0, 8);
            listbox.innerHTML = ''; acActiveIndex = -1;
            if (!acItems.length) { listbox.classList.remove('open'); input.setAttribute('aria-activedescendant', ''); return; }
            acItems.forEach((drug, i) => {
                const item = document.createElement('div');
                item.className = 'autocomplete-item';
                item.id = `ac-item-${i}`;
                item.setAttribute('role', 'option');
                item.setAttribute('aria-selected', 'false');
                item.innerHTML = `<div class="drug-dot"></div><span>${drug.name}</span><span class="drug-class">${drug.class}</span>`;
                item.addEventListener('mousedown', e => { e.preventDefault(); confirmDrug(drug.name); });
                listbox.appendChild(item);
            });
            listbox.classList.add('open');
        }

        function hideAutocomplete() {
            listbox.classList.remove('open'); acActiveIndex = -1; acItems = [];
            input.setAttribute('aria-activedescendant', '');
        }

        function setAcActive(index) {
            listbox.querySelectorAll('.autocomplete-item').forEach((el, i) => {
                el.classList.toggle('active', i === index);
                el.setAttribute('aria-selected', i === index ? 'true' : 'false');
            });
            acActiveIndex = index;
            if (index >= 0) input.setAttribute('aria-activedescendant', `ac-item-${index}`);
        }

        async function findCanonicalDrugName(value) {
            const trimmed = value.trim();
            if (!trimmed) return '';

            const cached = DRUG_BY_NAME.get(trimmed.toLocaleLowerCase('pt-BR'));
            if (cached) return cached.name;

            const match = DATA_STORE ? await DATA_STORE.findDrugByName(trimmed) : null;
            return match?.name || trimmed;
        }

        async function confirmDrug(name) {
            let drugName = name || '';
            if (!name) {
                const val = input.value.trim();
                if (acActiveIndex >= 0 && acItems[acActiveIndex]) {
                    drugName = acItems[acActiveIndex].name;
                } else if (val) {
                    drugName = await findCanonicalDrugName(val);
                }
            }

            if (drugName) await addDrug(drugName);
            input.value = ''; hideAutocomplete(); input.focus();
        }

        // ════════════════════════════════════════════════
        //  EVENT LISTENERS
        // ════════════════════════════════════════════════
        input.addEventListener('input', () => {
            showAutocomplete(input.value);
            if (state.drugs.length >= 1) input.placeholder = 'Adicione outro medicamento...';
        });

        input.addEventListener('keydown', e => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setAcActive(Math.min(acActiveIndex + 1, acItems.length - 1)); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); setAcActive(Math.max(acActiveIndex - 1, 0)); }
            else if (e.key === 'Enter') { e.preventDefault(); confirmDrug(acActiveIndex >= 0 ? acItems[acActiveIndex]?.name : ''); }
            else if (e.key === 'Escape') hideAutocomplete();
            else if (e.key === 'Backspace' && input.value === '' && state.drugs.length > 0) removeDrug(state.drugs.length - 1);
        });

        addButton.addEventListener('click', () => {
            confirmDrug(acActiveIndex >= 0 ? acItems[acActiveIndex]?.name : '');
        });

        document.addEventListener('click', e => { if (!e.target.closest('.search-wrapper')) hideAutocomplete(); });

        document.getElementById('close-panel-btn').addEventListener('click', closePanel);
        document.getElementById('panel-overlay').addEventListener('click', closePanel);
        document.addEventListener('keydown', e => { if (e.key === 'Escape') closePanel(); });

        // Layout buttons
        document.querySelectorAll('.ctrl-btn[data-layout]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.ctrl-btn[data-layout]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                runLayout(btn.dataset.layout);
            });
        });

        document.getElementById('reset-view-btn').addEventListener('click', () => {
            if (G.simulation) {
                G.nodes.forEach(n => { n.fx = null; n.fy = null; });
                G.simulation.alpha(.6).restart();
            }
        });

        window.addEventListener('resize', () => {
            if (!G.simulation || !state.drugs.length) return;
            const { w, h } = getContainerSize();
            d3.select('#graph-svg').attr('viewBox', `0 0 ${w} ${h}`);
            G.simulation.force('center', d3.forceCenter(w / 2, h / 2).strength(.035));
            G.simulation.force('x', d3.forceX(w / 2).strength(0.018));
            G.simulation.force('y', d3.forceY(h / 2).strength(0.018));
            G.simulation.alpha(.2).restart();
        });

        // ════════════════════════════════════════════════
        //  INIT
        // ════════════════════════════════════════════════
        async function init() {
            setControlsDisabled(true);
            renderOrgans();
            renderCounter();

            try {
                const data = await loadAppData();
                DRUG_CATALOG = data.drugCatalog;
                rebuildDataIndexes();
            } catch (error) {
                renderDataLoadError(error);
                return;
            }

            setControlsDisabled(false);
            input.focus();
            input.placeholder = 'Ex: Varfarina, AAS, Sinvastatina...';
            announceSR(`${DRUG_CATALOG.length} medicamentos carregados do SQLite local.`);
        }

        init();
    
