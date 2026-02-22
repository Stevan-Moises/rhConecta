// --- 1. DADOS INICIAIS E ESTADO ---
// Dados de exemplo caso não haja nada no localStorage
let colaboradores = [
    { id: 1, nome: 'Carlos Silva', matricula: '1001', filial: 'FL 02', dataAdmissao: '2023-01-15', cargo: 'Vendedor', statusCracha: 'Definitivo', registraPonto: true, situacao: 'Ativo', assinaturas: { '2026-02': true } },
    { id: 2, nome: 'Ana Souza', matricula: '1002', filial: 'FL 53', dataAdmissao: '2023-03-10', cargo: 'Gerente', statusCracha: 'Provisório', registraPonto: true, situacao: 'Ativo', assinaturas: { '2026-02': true } }
];

// Estado que controla o que é exibido na tela
let estadoApp = {
    abaAtiva: 'colaboradores', // 'colaboradores' ou 'ponto'
    mesAtual: new Date().toISOString().slice(0, 7), // AAAA-MM
    filtroPonto: 'Todos' // 'Todos', 'Assinado', 'Pendente'
};

let timeoutBusca = null; // Para otimizar a barra de pesquisa

// --- 2. INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    carregarDoArmazenamento(); // Busca dados salvos
    inicializarTema();         // Configura o tema Inicial (Light/Dark)
    if (window.lucide) window.lucide.createIcons();
    renderizarApp();           // Desenha a tela inicial
    document.getElementById('inputArquivo').addEventListener('change', processarImportacaoArquivo);
});

// --- 3. PERSISTÊNCIA (LOCALSTORAGE) ---
function salvarNoArmazenamento() {
    try {
        localStorage.setItem('rhConectaDadosV4', JSON.stringify(colaboradores));
    } catch (e) { console.error("Erro ao salvar:", e); }
}

function carregarDoArmazenamento() {
    try {
        const dadosV4 = localStorage.getItem('rhConectaDadosV4');
        if (dadosV4) {
            colaboradores = JSON.parse(dadosV4);
            return;
        }
    } catch (e) { console.error("Erro ao carregar:", e); }
}

// --- 4. CONTROLE DE TEMA (DARK MODE) ---
function inicializarTema() {
    // Verifica se já havia um tema selecionado ou se o sistema do utilizador usa dark mode nativo
    if (localStorage.getItem('tema') === 'dark' || (!('tema' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        atualizarIconeTema('dark');
    } else {
        document.documentElement.classList.remove('dark');
        atualizarIconeTema('light');
    }
}

function alternarTema() {
    if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('tema', 'light');
        atualizarIconeTema('light');
    } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('tema', 'dark');
        atualizarIconeTema('dark');
    }
}

function atualizarIconeTema(temaAtual) {
    const icones = document.querySelectorAll('.icone-tema');
    const textos = document.querySelectorAll('.texto-tema');

    icones.forEach(i => i.setAttribute('data-lucide', temaAtual === 'dark' ? 'sun' : 'moon'));
    textos.forEach(t => t.innerText = temaAtual === 'dark' ? 'Modo Claro' : 'Modo Escuro');

    if (window.lucide) window.lucide.createIcons();
}

// --- 5. INTERFACE E NAVEGAÇÃO ---

// Atrasa a busca para não travar a tela enquanto digita (Debounce)
function debounceBusca() {
    clearTimeout(timeoutBusca);
    timeoutBusca = setTimeout(() => { renderizarApp(); }, 200);
}

// Abre/Fecha o menu lateral no telemóvel
function alternarBarraLateral() {
    const el = document.getElementById('barraLateral');
    const overlay = document.getElementById('overlayMovel');
    if (el.classList.contains('-translate-x-full')) {
        el.classList.remove('-translate-x-full');
        overlay.classList.remove('hidden');
        setTimeout(() => overlay.classList.remove('opacity-0'), 10);
    } else {
        el.classList.add('-translate-x-full');
        overlay.classList.add('opacity-0');
        setTimeout(() => overlay.classList.add('hidden'), 300);
    }
}
function alternarBarraLateralMovel() { if (window.innerWidth < 768) alternarBarraLateral(); }

// Troca as abas e atualiza títulos
function alternarAba(aba) {
    estadoApp.abaAtiva = aba;
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active', 'bg-slate-800'));
    document.getElementById(`nav-${aba}`).classList.add('active');

    const titulos = { colaboradores: ['Gestão de Colaboradores', 'Gerencie o quadro de funcionários.'], ponto: ['Controle de Ponto', 'Acompanhe as assinaturas mensais.'] };
    document.getElementById('tituloPagina').innerText = titulos[aba][0];
    document.getElementById('subtituloPagina').innerText = titulos[aba][1];
    renderizarApp();
}

// --- 6. RENDERIZAÇÃO DA APLICAÇÃO ---
// Função principal: Controla o que aparece na tela baseado nos filtros
function renderizarApp() {
    const busca = document.getElementById('campoBusca').value.toLowerCase();
    const fFilial = document.getElementById('filtroFilial').value;
    const fSituacao = document.getElementById('filtroSituacao').value;
    const fCracha = document.getElementById('filtroCracha').value;
    const divConteudo = document.getElementById('conteudoApp');
    const divAcoes = document.getElementById('acoesCabecalho');

    // Renderiza botão de ação no topo (Adicionar ou Mês)
    if (estadoApp.abaAtiva === 'colaboradores') {
        divAcoes.innerHTML = `<button onclick="abrirModalFormulario()" class="btn-hover flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-md active:scale-95 transform"><i data-lucide="plus" class="w-4 h-4"></i> Novo Colaborador</button>`;
    } else {
        divAcoes.innerHTML = `<div class="flex items-center gap-3 bg-white dark:bg-slate-800 p-1 pr-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm transition-colors"><div class="bg-slate-100 dark:bg-slate-700 p-2 rounded text-slate-500 dark:text-slate-400"><i data-lucide="calendar" class="w-4 h-4"></i></div><input type="month" value="${estadoApp.mesAtual}" onchange="alterarMes(this.value)" class="border-none bg-transparent text-sm font-semibold text-slate-700 dark:text-slate-200 focus:ring-0 cursor-pointer p-0 outline-none style-color-scheme"></div>`;
    }

    // Filtra os dados com segurança
    let filtrados = colaboradores.filter(c => {
        const nomeSeguro = (c.nome || '').toLowerCase();
        const matriculaSegura = (c.matricula || '');
        const matchBusca = nomeSeguro.includes(busca) || matriculaSegura.includes(busca);
        const matchFilial = fFilial === 'Todas' || c.filial === fFilial;
        const matchSituacao = fSituacao === 'Todos' || c.situacao === fSituacao;
        const matchCracha = fCracha === 'Todos' || c.statusCracha === fCracha;
        return matchBusca && matchFilial && matchSituacao && matchCracha;
    });

    // Decide qual tabela mostrar
    if (estadoApp.abaAtiva === 'colaboradores') {
        renderizarTabela(filtrados, divConteudo);
    } else {
        let dadosPonto = filtrados.filter(c => c.registraPonto);
        if (estadoApp.filtroPonto !== 'Todos') {
            dadosPonto = dadosPonto.filter(c => {
                const assinou = c.assinaturas && c.assinaturas[estadoApp.mesAtual];
                return estadoApp.filtroPonto === 'Assinado' ? assinou : !assinou;
            });
        }
        renderizarPonto(dadosPonto, divConteudo);
    }
    if (window.lucide) window.lucide.createIcons();
}

// --- 7. COMPONENTES VISUAIS ---

// Gera HTML da Tabela de Colaboradores
function renderizarTabela(dados, container) {
    if (dados.length === 0) {
        container.innerHTML = `<div class="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 transition-colors"><div class="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-full mb-3"><i data-lucide="search-x" class="w-8 h-8 text-slate-400 dark:text-slate-500"></i></div><h3 class="text-lg font-medium text-slate-900 dark:text-slate-100">Nenhum resultado</h3><p class="text-slate-500 dark:text-slate-400 text-sm">Tente ajustar seus filtros.</p></div>`;
        return;
    }

    const linhas = dados.map(c => {
        const dataFormatada = c.dataAdmissao ? c.dataAdmissao.split('-').reverse().join('/') : '--';

        // Cores Dinâmicas de Badge Suportando Dark Mode
        let badgeClass = 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600';
        if (c.statusCracha === 'Definitivo') badgeClass = 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20';
        else if (c.statusCracha === 'Provisório') badgeClass = 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-500/20';
        else if (c.statusCracha === 'Sem Crachá') badgeClass = 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-500/20';
        else if (c.statusCracha === 'Crachá Quebrado') badgeClass = 'bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-100 dark:border-orange-500/20';
        else if (c.statusCracha === 'Outra Via') badgeClass = 'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-100 dark:border-violet-500/20';

        let rowClass = 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50';
        let iconeAcao = 'power';
        let tituloAcao = 'Desligar Colaborador';
        let corAcao = 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/20';

        if (c.situacao === 'Desligado') {
            rowClass = 'row-desligado';
            iconeAcao = 'refresh-cw';
            tituloAcao = 'Reativar Colaborador';
            corAcao = 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/20';
        } else if (c.situacao === 'Afastado') {
            rowClass = 'row-afastado dark:bg-amber-900/10 dark:hover:bg-amber-900/20';
        }

        return `
                <tr class="${rowClass} transition-colors border-b border-slate-100 dark:border-slate-700 last:border-0 group">
                    <td class="px-6 py-4 flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm border border-indigo-200 dark:border-indigo-500/30">${c.nome.charAt(0)}</div>
                        <div>
                            <span class="block font-medium text-slate-900 dark:text-slate-100">${c.nome}</span>
                            <span class="block text-xs text-slate-500 dark:text-slate-400">MAT: ${c.matricula}</span>
                            ${c.situacao === 'Afastado' ? '<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 mt-1">Afastado</span>' : ''}
                        </div>
                    </td>
                    <td class="px-6 py-4"><span class="text-sm font-medium text-slate-700 dark:text-slate-300">${c.filial}</span><br><span class="text-xs text-slate-500 dark:text-slate-400">${c.cargo}</span></td>
                    <td class="px-6 py-4 hidden sm:table-cell"><div class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400"><i data-lucide="calendar" class="w-4 h-4 text-slate-400"></i> ${dataFormatada}</div></td>
                    <td class="px-6 py-4"><span class="px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeClass}">${c.statusCracha}</span></td>
                    <td class="px-6 py-4 text-right">
                        <div class="flex items-center justify-end gap-1 opacity-100 sm:opacity-80 sm:group-hover:opacity-100 transition-opacity">
                            <button onclick="abrirModalFormulario(${c.id})" class="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 rounded-lg transition-all active:scale-95" title="Editar Informações"><i data-lucide="pencil" class="w-4 h-4"></i></button>
                            <button onclick="abrirModalDesligamento(${c.id})" class="p-2 ${corAcao} rounded-lg transition-all active:scale-95" title="${tituloAcao}"><i data-lucide="${iconeAcao}" class="w-4 h-4"></i></button>
                            <!-- Botão de Exclusão Definitiva -->
                            <button onclick="abrirModalExclusaoPermanente(${c.id})" class="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/20 rounded-lg transition-all active:scale-95" title="Excluir Permanentemente"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                        </div>
                    </td>
                </tr>`;
    }).join('');

    container.innerHTML = `<div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors"><div class="overflow-x-auto"><table class="w-full text-left border-collapse"><thead><tr class="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700"><th class="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Colaborador</th><th class="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Filial / Cargo</th><th class="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase hidden sm:table-cell">Admissão</th><th class="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Status Crachá</th><th class="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Ações</th></tr></thead><tbody>${linhas}</tbody></table></div><div class="px-6 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center"><span class="text-xs text-slate-500 dark:text-slate-400 font-medium">Total: <strong class="text-slate-700 dark:text-slate-200">${dados.length}</strong></span></div></div>`;
}

function renderizarPonto(dados, container) {
    const mes = estadoApp.mesAtual;
    const total = dados.length;
    const assinados = dados.filter(c => c.assinaturas && c.assinaturas[mes]).length;
    const pendentes = total - assinados;
    const pct = total === 0 ? 0 : Math.round((assinados / total) * 100);

    const lista = dados.map(c => {
        const assinou = c.assinaturas && c.assinaturas[mes];
        let rowStyle = 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50';
        let badge = '';

        if (c.situacao === 'Desligado') {
            rowStyle = 'row-desligado';
            badge = '<span class="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">Desligado</span>';
        }
        else if (c.situacao === 'Afastado') {
            rowStyle = 'row-afastado dark:bg-amber-900/10 dark:hover:bg-amber-900/20';
            badge = '<span class="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300">Afastado</span>';
        }

        return `<div class="p-4 flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-700 last:border-0 gap-4 ${rowStyle} transition-colors">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm border ${assinou ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-500/20'}">${c.nome.charAt(0)}</div>
                        <div><h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center">${c.nome} ${badge}</h3><div class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5"><span class="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded font-mono">${c.filial}</span><span>• MAT: ${c.matricula}</span></div></div>
                    </div>
                    <div class="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pl-14 sm:pl-0">
                        <span class="text-xs font-medium w-24 text-right ${assinou ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}">${assinou ? 'Assinado' : 'Pendente'}</span>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" class="sr-only peer" ${assinou ? 'checked' : ''} onchange="alternarAssinatura(${c.id})">
                            <div class="w-11 h-6 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                    </div>
                </div>`;
    }).join('');

    container.innerHTML = `
                <div class="space-y-6">
                    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <div class="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden transition-colors"><div class="absolute right-0 top-0 h-full w-1 bg-indigo-600"></div><p class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Total</p><div class="flex justify-between items-end"><h3 class="text-2xl font-bold text-slate-800 dark:text-slate-100">${total}</h3><i data-lucide="users" class="w-5 h-5 text-indigo-500"></i></div></div>
                        <div class="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden transition-colors"><div class="absolute right-0 top-0 h-full w-1 bg-emerald-500"></div><p class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Assinados</p><div class="flex justify-between items-end"><h3 class="text-2xl font-bold text-slate-800 dark:text-slate-100">${assinados}</h3><i data-lucide="check-circle-2" class="w-5 h-5 text-emerald-500"></i></div></div>
                        <div class="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden transition-colors"><div class="absolute right-0 top-0 h-full w-1 bg-rose-500"></div><p class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Pendentes</p><div class="flex justify-between items-end"><h3 class="text-2xl font-bold text-slate-800 dark:text-slate-100">${pendentes}</h3><i data-lucide="alert-circle" class="w-5 h-5 text-rose-500"></i></div></div>
                        <div class="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors"><div class="flex justify-between mb-2"><span class="text-xs font-bold text-slate-500 dark:text-slate-400">Progresso</span><span class="text-sm font-bold text-indigo-600 dark:text-indigo-400">${pct}%</span></div><div class="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2"><div class="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full transition-all duration-1000" style="width: ${pct}%"></div></div></div>
                    </div>
                    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
                        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 gap-4">
                            <h3 class="font-semibold text-slate-700 dark:text-slate-200">Lista de Assinaturas</h3>
                            <div class="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg w-full sm:w-auto">${['Todos', 'Assinado', 'Pendente'].map(f => `<button onclick="definirFiltroPonto('${f}')" class="flex-1 sm:flex-none px-3 py-1 text-xs font-medium rounded-md transition-all duration-200 ${estadoApp.filtroPonto === f ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}">${f}</button>`).join('')}</div>
                        </div>
                        <div class="divide-y divide-slate-100 dark:divide-slate-700">${lista}</div>
                    </div>
                </div>`;
}

// --- 8. LÓGICA DE AÇÕES E MODAIS ---
function alterarMes(m) { estadoApp.mesAtual = m; renderizarApp(); }
function definirFiltroPonto(f) { estadoApp.filtroPonto = f; renderizarApp(); }

function alternarAssinatura(id) {
    const c = colaboradores.find(x => x.id === id);
    if (c) {
        if (!c.assinaturas) c.assinaturas = {};
        c.assinaturas[estadoApp.mesAtual] = !c.assinaturas[estadoApp.mesAtual];
        salvarNoArmazenamento();
        renderizarApp();
    }
}

function abrirModalFormulario(id = null) {
    const modal = document.getElementById('modalFormulario');
    const conteudo = document.getElementById('conteudoModalFormulario');
    document.getElementById('formularioColaborador').reset();
    document.getElementById('colaboradorId').value = '';
    document.getElementById('colabSituacao').value = 'Ativo';
    document.getElementById('tituloModal').innerText = 'Novo Registro';

    if (id) {
        const c = colaboradores.find(x => x.id === id);
        if (c) {
            document.getElementById('tituloModal').innerText = 'Editar Registro';
            document.getElementById('colaboradorId').value = c.id;
            document.getElementById('colabNome').value = c.nome;
            document.getElementById('colabMatricula').value = c.matricula;
            document.getElementById('colabFilial').value = c.filial;
            document.getElementById('colabDataAdmissao').value = c.dataAdmissao;
            document.getElementById('colabCargo').value = c.cargo;
            document.getElementById('colabCracha').value = c.statusCracha;
            document.getElementById('colabSituacao').value = c.situacao;
            document.getElementById('colabRegistraPonto').checked = c.registraPonto;
        }
    }
    modal.classList.remove('hidden');
    setTimeout(() => { modal.classList.remove('opacity-0'); conteudo.classList.remove('opacity-0', 'scale-95'); conteudo.classList.add('scale-100'); }, 10);
}

function abrirModalDesligamento(id) {
    const c = colaboradores.find(x => x.id === id);
    if (!c) return;
    document.getElementById('idAlvoDesligamento').value = id;
    document.getElementById('tituloModalDesligamento').innerText = c.situacao === 'Desligado' ? 'Reativar Colaborador?' : 'Confirmar Alteração';
    document.getElementById('nomeAlvoDesligamento').innerText = c.nome;

    const modal = document.getElementById('modalDesligamento');
    const conteudo = document.getElementById('conteudoModalDesligamento');
    modal.classList.remove('hidden');
    setTimeout(() => { modal.classList.remove('opacity-0'); conteudo.classList.remove('opacity-0', 'scale-95'); conteudo.classList.add('scale-100'); }, 10);
}

function abrirModalExclusaoPermanente(id) {
    const c = colaboradores.find(x => x.id === id);
    if (!c) return;
    document.getElementById('idAlvoExclusao').value = id;
    document.getElementById('nomeAlvoExclusao').innerText = c.nome;

    const modal = document.getElementById('modalExclusaoPermanente');
    const conteudo = document.getElementById('conteudoModalExclusao');
    modal.classList.remove('hidden');
    setTimeout(() => { modal.classList.remove('opacity-0'); conteudo.classList.remove('opacity-0', 'scale-95'); conteudo.classList.add('scale-100'); }, 10);
}

function fecharModal(id) {
    const modal = document.getElementById(id);
    const conteudo = modal.querySelector('div');
    modal.classList.add('opacity-0');
    if (conteudo) { conteudo.classList.remove('scale-100'); conteudo.classList.add('opacity-0', 'scale-95'); }
    setTimeout(() => modal.classList.add('hidden'), 300);
}

function processarEnvioFormulario(e) {
    e.preventDefault();
    const id = document.getElementById('colaboradorId').value;
    const novo = {
        id: id ? parseInt(id) : Date.now(),
        nome: document.getElementById('colabNome').value,
        matricula: document.getElementById('colabMatricula').value,
        filial: document.getElementById('colabFilial').value,
        dataAdmissao: document.getElementById('colabDataAdmissao').value,
        cargo: document.getElementById('colabCargo').value,
        statusCracha: document.getElementById('colabCracha').value,
        situacao: document.getElementById('colabSituacao').value,
        registraPonto: document.getElementById('colabRegistraPonto').checked,
        assinaturas: id ? (colaboradores.find(x => x.id == id).assinaturas || {}) : {}
    };

    if (id) colaboradores = colaboradores.map(c => c.id == id ? novo : c);
    else colaboradores.push(novo);

    salvarNoArmazenamento();
    fecharModal('modalFormulario');
    renderizarApp();
}

function confirmarAlteracaoStatus() {
    const id = parseInt(document.getElementById('idAlvoDesligamento').value);
    colaboradores = colaboradores.map(c => {
        if (c.id === id) {
            return { ...c, situacao: c.situacao === 'Desligado' ? 'Ativo' : 'Desligado' };
        }
        return c;
    });
    salvarNoArmazenamento();
    fecharModal('modalDesligamento');
    renderizarApp();
}

function confirmarExclusaoPermanente() {
    const id = parseInt(document.getElementById('idAlvoExclusao').value);
    // Remove o colaborador do array defenitivamente (Hard Delete)
    colaboradores = colaboradores.filter(c => c.id !== id);
    salvarNoArmazenamento();
    fecharModal('modalExclusaoPermanente');
    renderizarApp();
}

// --- 9. IMPORTAÇÃO E EXPORTAÇÃO ---
function exportarJSON() {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(colaboradores, null, 2)], { type: 'application/json' }));
    a.download = `rh-dados-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
}

function exportarCSV() {
    const cabecalho = ["Nome", "Matricula", "Filial", "Admissao", "Cargo", "Cracha", "Ponto?", "Situacao", `Assinou (${estadoApp.mesAtual})`];
    const linhas = colaboradores.map(c => [
        `"${c.nome}"`, `"${c.matricula}"`, `"${c.filial}"`, c.dataAdmissao, `"${c.cargo}"`, `"${c.statusCracha}"`,
        c.registraPonto ? "Sim" : "Não", `"${c.situacao}"`,
        c.registraPonto ? (c.assinaturas[estadoApp.mesAtual] ? "Sim" : "Não") : "N/A"
    ].join(','));
    const blob = new Blob(['\uFEFF' + [cabecalho.join(','), ...linhas].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `rh-planilha-${estadoApp.mesAtual}.csv`;
    a.click();
}

function acionarImportacao() { document.getElementById('inputArquivo').click(); }
function processarImportacaoArquivo(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        try {
            const dados = JSON.parse(ev.target.result);
            if (Array.isArray(dados) && confirm(`Importar ${dados.length} registos? Isso substituirá os dados atuais.`)) {
                colaboradores = dados;
                salvarNoArmazenamento();
                renderizarApp();
            }
        } catch (err) { alert('Erro ao importar ficheiro.'); }
    };
    reader.readAsText(file);
    e.target.value = '';
}
