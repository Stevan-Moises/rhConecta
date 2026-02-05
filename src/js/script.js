// --- DADOS INICIAIS ---
// Adicionada propriedade 'ativo' para controle de status
let colaboradores = [
    { id: 1, nome: 'Carlos Silva', matricula: '1001', filial: 'FL 02', dataAdmissao: '2023-01-15', cargo: 'Vendedor', statusCracha: 'Definitivo', registraPonto: true, ativo: true, assinaturas: { '2026-02': true } },
    { id: 2, nome: 'Ana Souza', matricula: '1002', filial: 'FL 53', dataAdmissao: '2023-03-10', cargo: 'Gerente', statusCracha: 'Provisório', registraPonto: true, ativo: true, assinaturas: { '2026-02': true } },
    { id: 3, nome: 'Roberto Lima', matricula: '1003', filial: 'FL 03', dataAdmissao: '2023-06-20', cargo: 'Supervisor', statusCracha: 'Sem Crachá', registraPonto: false, ativo: true, assinaturas: {} },
    { id: 4, nome: 'Fernanda Costa', matricula: '1004', filial: 'FL 54', dataAdmissao: '2023-08-01', cargo: 'Caixa', statusCracha: 'Definitivo', registraPonto: true, ativo: true, assinaturas: { '2026-02': false } },
];

// --- ESTADO DA APLICAÇÃO ---
let estadoApp = {
    abaAtiva: 'colaboradores',
    mesAtual: new Date().toISOString().slice(0, 7),
    filtroPonto: 'Todos'
};

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    carregarDoArmazenamento(); // Carrega dados do localStorage
    lucide.createIcons();
    renderizarApp();
    document.getElementById('inputArquivo').addEventListener('change', processarImportacaoArquivo);
});

/* --- PERSISTÊNCIA DE DADOS (LOCALSTORAGE) --- */
function salvarNoArmazenamento() {
    try {
        localStorage.setItem('rhConectaDados', JSON.stringify(colaboradores));
    } catch (e) {
        console.error("Erro ao salvar dados localmente:", e);
    }
}

function carregarDoArmazenamento() {
    try {
        const dadosSalvos = localStorage.getItem('rhConectaDados');
        if (dadosSalvos) {
            colaboradores = JSON.parse(dadosSalvos);
        }
    } catch (e) {
        console.error("Erro ao carregar dados locais:", e);
    }
}

/* --- FUNÇÕES DE INTERFACE --- */
function alternarBarraLateral() {
    const barraLateral = document.getElementById('barraLateral');
    const overlay = document.getElementById('overlayMovel');
    const estaFechado = barraLateral.classList.contains('-translate-x-full');

    if (estaFechado) {
        barraLateral.classList.remove('-translate-x-full');
        overlay.classList.remove('hidden');
        setTimeout(() => overlay.classList.remove('opacity-0'), 10);
    } else {
        barraLateral.classList.add('-translate-x-full');
        overlay.classList.add('opacity-0');
        setTimeout(() => overlay.classList.add('hidden'), 300);
    }
}

function alternarBarraLateralMovel() {
    if (window.innerWidth < 768) alternarBarraLateral();
}

function alternarAba(nomeAba) {
    estadoApp.abaAtiva = nomeAba;
    document.querySelectorAll('.sidebar-link').forEach(el => {
        el.classList.remove('active');
        el.querySelector('span').classList.remove('text-indigo-500');
    });
    document.getElementById(`nav-${nomeAba}`).classList.add('active');

    const titulo = document.getElementById('tituloPagina');
    const subtitulo = document.getElementById('subtituloPagina');

    if (nomeAba === 'colaboradores') {
        titulo.textContent = 'Gestão de Colaboradores';
        subtitulo.textContent = 'Gerencie o quadro de funcionários das filiais.';
    } else {
        titulo.textContent = 'Controle de Ponto';
        subtitulo.textContent = 'Acompanhe as assinaturas de espelho de ponto mensais.';
    }
    renderizarApp();
}

/* --- RENDERIZAÇÃO --- */
function renderizarApp() {
    const termoBusca = document.getElementById('campoBusca').value.toLowerCase();
    const filtroFilial = document.getElementById('filtroFilial').value;
    const filtroCracha = document.getElementById('filtroCracha').value;
    const filtroSituacao = document.getElementById('filtroSituacao').value; // Novo Filtro
    const divConteudo = document.getElementById('conteudoApp');
    const divAcoesCabecalho = document.getElementById('acoesCabecalho');

    if (estadoApp.abaAtiva === 'colaboradores') {
        divAcoesCabecalho.innerHTML = `
                    <button onclick="abrirModalFormulario()" class="btn-hover flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-md shadow-indigo-200 active:scale-95 transform">
                        <i data-lucide="plus" class="w-4 h-4"></i> Novo Colaborador
                    </button>`;
    } else {
        divAcoesCabecalho.innerHTML = `
                    <div class="flex items-center gap-3 bg-white p-1 pr-4 rounded-lg border border-slate-200 shadow-sm transition-shadow hover:shadow-md">
                        <div class="bg-slate-100 p-2 rounded text-slate-500"><i data-lucide="calendar" class="w-4 h-4"></i></div>
                        <span class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Mês:</span>
                        <input type="month" value="${estadoApp.mesAtual}" onchange="alterarMes(this.value)" class="border-none bg-transparent text-sm font-semibold text-slate-700 focus:ring-0 cursor-pointer p-0">
                    </div>`;
    }

    let dadosFiltrados = colaboradores.filter(c => {
        const coincideBusca = c.nome.toLowerCase().includes(termoBusca) || c.matricula.includes(termoBusca);
        const coincideFilial = filtroFilial === 'Todas' || c.filial === filtroFilial;
        const coincideCracha = filtroCracha === 'Todos' || c.statusCracha === filtroCracha;

        // Lógica do filtro de situação
        let coincideSituacao = true;
        if (filtroSituacao === 'Ativos') coincideSituacao = c.ativo === true;
        if (filtroSituacao === 'Desligados') coincideSituacao = c.ativo === false;

        return coincideBusca && coincideFilial && coincideCracha && coincideSituacao;
    });

    if (estadoApp.abaAtiva === 'colaboradores') {
        renderizarTabelaColaboradores(dadosFiltrados, divConteudo);
    } else {
        // Na aba de ponto, mostramos apenas quem registra ponto
        let dadosPonto = dadosFiltrados.filter(c => c.registraPonto);

        if (estadoApp.filtroPonto !== 'Todos') {
            dadosPonto = dadosPonto.filter(c => {
                const assinado = c.assinaturas && c.assinaturas[estadoApp.mesAtual];
                return estadoApp.filtroPonto === 'Assinado' ? assinado : !assinado;
            });
        }
        renderizarVisaoPonto(dadosPonto, divConteudo);
    }
    lucide.createIcons();
}

function renderizarTabelaColaboradores(dados, container) {
    if (dados.length === 0) {
        container.innerHTML = `
                    <div class="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 stagger-enter">
                        <div class="bg-slate-50 p-4 rounded-full mb-3"><i data-lucide="search-x" class="w-8 h-8 text-slate-400"></i></div>
                        <h3 class="text-lg font-medium text-slate-900">Nenhum resultado encontrado</h3>
                        <p class="text-slate-500 text-sm mt-1">Tente ajustar seus filtros.</p>
                    </div>`;
        return;
    }

    const linhas = dados.map((c, index) => {
        const partesData = c.dataAdmissao.split('-');
        const dataFormatada = `${partesData[2]}/${partesData[1]}/${partesData[0]}`;

        let classeBadge = 'bg-slate-100 text-slate-600 border-slate-200';
        if (c.statusCracha === 'Definitivo') classeBadge = 'bg-emerald-50 text-emerald-700 border-emerald-100';
        if (c.statusCracha === 'Provisório') classeBadge = 'bg-amber-50 text-amber-700 border-amber-100';
        if (c.statusCracha === 'Sem Crachá') classeBadge = 'bg-rose-50 text-rose-700 border-rose-100';

        // Se desligado, aplica estilo visual diferenciado
        const classeLinha = c.ativo ? 'row-hover bg-white' : 'row-desligado';
        const iconeAcao = c.ativo ? 'power' : 'refresh-cw'; // Ícone muda dependendo do estado
        const tituloAcao = c.ativo ? 'Desligar Colaborador' : 'Reativar Colaborador';
        const corBotaoAcao = c.ativo ? 'text-rose-500 hover:bg-rose-50' : 'text-emerald-500 hover:bg-emerald-50';

        return `
                    <tr class="${classeLinha} transition-all-custom border-b border-slate-100 last:border-0 group">
                        <td class="px-6 py-4">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 shrink-0 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm border border-indigo-200 transition-transform duration-200 group-hover:scale-110">${c.nome.charAt(0)}</div>
                                <div><span class="block font-medium text-slate-900 group-hover:text-indigo-600 transition-colors">${c.nome}</span><span class="block text-xs text-slate-500 font-mono">MAT: ${c.matricula}</span></div>
                            </div>
                        </td>
                        <td class="px-6 py-4"><div class="flex flex-col"><span class="text-sm font-medium text-slate-700">${c.filial}</span><span class="text-xs text-slate-500">${c.cargo}</span></div></td>
                        <td class="px-6 py-4 hidden sm:table-cell"><div class="flex items-center gap-2 text-sm text-slate-600"><i data-lucide="calendar-days" class="w-4 h-4 text-slate-400"></i> ${dataFormatada}</div></td>
                        <td class="px-6 py-4"><span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${classeBadge} transition-transform duration-200 group-hover:scale-105"><span class="w-1.5 h-1.5 rounded-full bg-current opacity-60"></span> ${c.statusCracha}</span></td>
                        <td class="px-6 py-4 text-right">
                            <div class="flex items-center justify-end gap-1 opacity-100 sm:opacity-80 sm:group-hover:opacity-100 transition-opacity">
                                <button onclick="abrirModalFormulario(${c.id})" class="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all active:scale-95" title="Editar"><i data-lucide="pencil" class="w-4 h-4"></i></button>
                                <button onclick="abrirModalDesligamento(${c.id})" class="p-2 ${corBotaoAcao} rounded-lg transition-all active:scale-95" title="${tituloAcao}"><i data-lucide="${iconeAcao}" class="w-4 h-4"></i></button>
                            </div>
                        </td>
                    </tr>`;
    }).join('');

    container.innerHTML = `
                <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-shadow hover:shadow-md">
                    <div class="overflow-x-auto"><table class="w-full text-left border-collapse">
                        <thead><tr class="bg-slate-50 border-b border-slate-200">
                            <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Colaborador</th>
                            <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Filial / Cargo</th>
                            <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase hidden sm:table-cell">Admissão</th>
                            <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status Crachá</th>
                            <th class="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase">Ações</th>
                        </tr></thead>
                        <tbody>${linhas}</tbody>
                    </table></div>
                    <div class="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-between items-center"><span class="text-xs text-slate-500 font-medium">Mostrando <strong>${dados.length}</strong> registros</span></div>
                </div>`;
}

function renderizarVisaoPonto(dados, container) {
    const mesChave = estadoApp.mesAtual;
    const total = dados.length;
    const assinados = dados.filter(c => c.assinaturas && c.assinaturas[mesChave]).length;
    const pendentes = total - assinados;
    const porcentagem = total === 0 ? 0 : Math.round((assinados / total) * 100);

    const listaItens = dados.length === 0
        ? `<div class="p-12 text-center text-slate-500 stagger-enter">Nenhum colaborador elegível.</div>`
        : dados.map((c, index) => {
            const estaAssinado = c.assinaturas && c.assinaturas[mesChave];
            return `
                        <div class="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 transition-colors duration-200 border-b border-slate-100 last:border-0 group gap-4">
                            <div class="flex items-center gap-4">
                                <div class="w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-bold text-sm shadow-sm border transition-transform duration-200 group-hover:scale-110 ${estaAssinado ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}">${c.nome.charAt(0)}</div>
                                <div><h3 class="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">${c.nome}</h3><div class="flex items-center gap-2 text-xs text-slate-500 mt-0.5"><span class="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-mono">${c.filial}</span><span>•</span><span>MAT: ${c.matricula}</span></div></div>
                            </div>
                            <div class="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pl-14 sm:pl-0">
                                <div class="flex items-center gap-2"><span class="text-xs font-medium ${estaAssinado ? 'text-emerald-700' : 'text-rose-700'}">${estaAssinado ? 'Assinado' : 'Pendente'}</span></div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" class="sr-only peer" ${estaAssinado ? 'checked' : ''} onchange="alternarAssinatura(${c.id})">
                                    <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 transition-colors duration-300"></div>
                                </label>
                            </div>
                        </div>`;
        }).join('');

    container.innerHTML = `
                <div class="space-y-6">
                    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
                            <div class="absolute right-0 top-0 h-full w-1 bg-indigo-600"></div>
                            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total</p>
                            <div class="flex items-end justify-between"><h3 class="text-2xl font-bold text-slate-800">${total}</h3><i data-lucide="users" class="w-5 h-5 text-indigo-500"></i></div>
                        </div>
                        <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
                            <div class="absolute right-0 top-0 h-full w-1 bg-emerald-500"></div>
                            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Assinados</p>
                            <div class="flex items-end justify-between"><h3 class="text-2xl font-bold text-slate-800">${assinados}</h3><i data-lucide="check-circle-2" class="w-5 h-5 text-emerald-500"></i></div>
                        </div>
                        <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
                            <div class="absolute right-0 top-0 h-full w-1 bg-rose-500"></div>
                            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Pendentes</p>
                            <div class="flex items-end justify-between"><h3 class="text-2xl font-bold text-slate-800">${pendentes}</h3><i data-lucide="alert-circle" class="w-5 h-5 text-rose-500"></i></div>
                        </div>
                        <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center">
                            <div class="flex justify-between items-end mb-2"><span class="text-xs font-bold text-slate-500">Progresso</span><span class="text-sm font-bold text-indigo-600">${porcentagem}%</span></div>
                            <div class="w-full bg-slate-100 rounded-full h-2"><div class="bg-indigo-600 h-2 rounded-full transition-all duration-1000 ease-out" style="width: ${porcentagem}%"></div></div>
                        </div>
                    </div>
                    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div class="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50/50 gap-4">
                            <h3 class="font-semibold text-slate-700">Lista de Assinaturas</h3>
                            <div class="flex bg-slate-100 p-1 rounded-lg w-full sm:w-auto">
                                ${['Todos', 'Assinado', 'Pendente'].map(f => `<button onclick="definirFiltroPonto('${f}')" class="flex-1 sm:flex-none px-3 py-1 text-xs font-medium rounded-md transition-all duration-200 ${estadoApp.filtroPonto === f ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}">${f}</button>`).join('')}
                            </div>
                        </div>
                        <div class="divide-y divide-slate-100">${listaItens}</div>
                    </div>
                </div>`;
}

/* --- LÓGICA DE NEGÓCIO --- */

function alterarMes(novoMes) {
    estadoApp.mesAtual = novoMes;
    renderizarApp();
}

function definirFiltroPonto(filtro) {
    estadoApp.filtroPonto = filtro;
    renderizarApp();
}

function alternarAssinatura(id) {
    const colab = colaboradores.find(c => c.id === id);
    if (colab) {
        if (!colab.assinaturas) colab.assinaturas = {};
        const atual = colab.assinaturas[estadoApp.mesAtual] || false;
        colab.assinaturas[estadoApp.mesAtual] = !atual;
        salvarNoArmazenamento(); // Salva após alterar
        renderizarApp();
    }
}

/* --- MODAIS E FORMULÁRIOS --- */

function abrirModalFormulario(id = null) {
    const modal = document.getElementById('modalFormulario');
    const conteudoModal = document.getElementById('conteudoModalFormulario');
    const titulo = document.getElementById('tituloModal');

    document.getElementById('formularioColaborador').reset();
    document.getElementById('colaboradorId').value = '';

    if (id) {
        const colab = colaboradores.find(c => c.id === id);
        if (colab) {
            titulo.textContent = 'Editar Registro';
            document.getElementById('colaboradorId').value = colab.id;
            document.getElementById('colabNome').value = colab.nome;
            document.getElementById('colabMatricula').value = colab.matricula;
            document.getElementById('colabFilial').value = colab.filial;
            document.getElementById('colabDataAdmissao').value = colab.dataAdmissao;
            document.getElementById('colabCargo').value = colab.cargo;
            document.getElementById('colabCracha').value = colab.statusCracha;
            document.getElementById('colabRegistraPonto').checked = colab.registraPonto;
        }
    } else {
        titulo.textContent = 'Novo Colaborador';
    }

    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        conteudoModal.classList.remove('opacity-0', 'scale-95');
        conteudoModal.classList.add('scale-100');
    }, 10);
}

function abrirModalDesligamento(id) {
    const colab = colaboradores.find(c => c.id === id);
    if (!colab) return;

    const modal = document.getElementById('modalDesligamento');
    const conteudoModal = document.getElementById('conteudoModalDesligamento');
    const tituloModal = document.getElementById('tituloModalDesligamento');

    // Lógica dinâmica: Se já estiver inativo, pergunta se quer reativar
    if (colab.ativo) {
        tituloModal.textContent = "Confirmar Desligamento";
    } else {
        tituloModal.textContent = "Reativar Colaborador?";
    }

    document.getElementById('idAlvoDesligamento').value = id;
    document.getElementById('nomeAlvoDesligamento').textContent = colab.nome;

    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        conteudoModal.classList.remove('opacity-0', 'scale-95');
        conteudoModal.classList.add('scale-100');
    }, 10);
}

function fecharModal(idModal) {
    const modal = document.getElementById(idModal);
    const conteudoModal = modal.querySelector('div');

    modal.classList.add('opacity-0');
    if (conteudoModal) {
        conteudoModal.classList.remove('scale-100');
        conteudoModal.classList.add('opacity-0', 'scale-95');
    }
    setTimeout(() => modal.classList.add('hidden'), 300);
}

function processarEnvioFormulario(e) {
    e.preventDefault();
    const id = document.getElementById('colaboradorId').value;

    const novosDados = {
        id: id ? parseInt(id) : Date.now(),
        nome: document.getElementById('colabNome').value,
        matricula: document.getElementById('colabMatricula').value,
        filial: document.getElementById('colabFilial').value,
        dataAdmissao: document.getElementById('colabDataAdmissao').value,
        cargo: document.getElementById('colabCargo').value,
        statusCracha: document.getElementById('colabCracha').value,
        registraPonto: document.getElementById('colabRegistraPonto').checked,
        ativo: true, // Novos criados sempre ativos
        assinaturas: id ? (colaboradores.find(x => x.id == id).assinaturas || {}) : {}
    };

    if (id) {
        // Ao editar, mantemos o status 'ativo' original
        const original = colaboradores.find(c => c.id == id);
        novosDados.ativo = original.ativo;
        colaboradores = colaboradores.map(c => c.id == id ? novosDados : c);
    } else {
        colaboradores.push(novosDados);
    }
    salvarNoArmazenamento();
    fecharModal('modalFormulario');
    renderizarApp();
}

// Função que muda o status em vez de deletar
function confirmarAlteracaoStatus() {
    const id = parseInt(document.getElementById('idAlvoDesligamento').value);
    colaboradores = colaboradores.map(c => {
        if (c.id === id) {
            return { ...c, ativo: !c.ativo }; // Inverte o status (Ativo <-> Desligado)
        }
        return c;
    });
    salvarNoArmazenamento();
    fecharModal('modalDesligamento');
    renderizarApp();
}

/* --- IMPORTAÇÃO E EXPORTAÇÃO --- */

function exportarJSON() {
    const dadosStr = JSON.stringify(colaboradores, null, 2);
    const blob = new Blob([dadosStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rh-conecta-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function exportarCSV() {
    const cabecalhoMes = `Assinou Ponto (${estadoApp.mesAtual})`;
    // Adicionado coluna Situação
    const cabecalhos = ["Nome", "Matricula", "Filial", "Data Admissao", "Cargo", "Status Cracha", "Registra Ponto", "Situacao", cabecalhoMes];

    const conteudoCSV = colaboradores.map(c => {
        let statusAssinatura = "N/A";
        if (c.registraPonto) {
            statusAssinatura = c.assinaturas[estadoApp.mesAtual] ? "Sim" : "Não";
        }

        const situacaoTexto = c.ativo ? "Ativo" : "Desligado";

        return [
            `"${c.nome}"`,
            `"${c.matricula}"`,
            `"${c.filial}"`,
            c.dataAdmissao,
            `"${c.cargo}"`,
            `"${c.statusCracha}"`,
            c.registraPonto ? "Sim" : "Não",
            `"${situacaoTexto}"`, // Nova coluna no CSV
            `"${statusAssinatura}"`
        ].join(',');
    });

    const stringCSV = [cabecalhos.join(','), ...conteudoCSV].join('\n');
    const blob = new Blob(['\uFEFF' + stringCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rh-conecta-export-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function acionarImportacao() {
    document.getElementById('inputArquivo').click();
}

function processarImportacaoArquivo(evento) {
    const arquivo = evento.target.files[0];
    if (!arquivo) return;
    const leitor = new FileReader();
    leitor.onload = (e) => {
        try {
            const dadosImportados = JSON.parse(e.target.result);
            if (Array.isArray(dadosImportados)) {
                if (confirm(`Importar ${dadosImportados.length} registros e substituir os dados atuais?`)) {
                    colaboradores = dadosImportados.map(d => ({
                        id: d.id,
                        nome: d.nome || d.name,
                        matricula: d.matricula,
                        filial: d.filial || d.branch,
                        dataAdmissao: d.dataAdmissao || d.admissionDate,
                        cargo: d.cargo || d.role,
                        statusCracha: d.statusCracha || d.badgeStatus,
                        registraPonto: d.registraPonto !== undefined ? d.registraPonto : d.registersPoint,
                        // Garante que campo ativo exista ao importar backups antigos
                        ativo: d.ativo !== undefined ? d.ativo : true,
                        assinaturas: d.assinaturas || d.signatures || {}
                    }));
                    salvarNoArmazenamento();
                    renderizarApp();
                }
            } else { alert('Arquivo inválido.'); }
        } catch (erro) { alert('Erro na leitura do JSON.'); }
    };
    leitor.readAsText(arquivo);
    evento.target.value = '';
}