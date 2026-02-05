# 🚀 RH Conecta - Gestão Inteligente de Colaboradores

O **RH Conecta** é uma aplicação web *Single Page Application* (SPA) desenvolvida para facilitar a gestão de colaboradores e o controle de assinaturas de ponto em empresas com múltiplas filiais. O sistema foca em simplicidade, eficiência e portabilidade, funcionando inteiramente no navegador sem necessidade de instalação de banco de dados complexos.

## 📖 Sobre o Projeto

Este projeto foi criado para resolver a necessidade de gerenciar o quadro de funcionários de 4 filiais específicas (FL 02, FL 03, FL 53, FL 54). Ele permite o cadastro completo de colaboradores, controle de status de crachá e um acompanhamento mensal de assinaturas de espelho de ponto.

## ✨ Funcionalidades

### 👥 Gestão de Colaboradores

* **CRUD Completo:** Adicionar, Editar e Visualizar colaboradores.

* **Desligamento Lógico (Soft Delete):** Colaboradores podem ser marcados como "Desligados" sem perder o histórico, podendo ser reativados posteriormente.

* **Filtros Avançados:** Busca por nome/matrícula, filtragem por filial, status do crachá e situação (ativo/desligado).

* **Indicadores Visuais:** Cores distintas para status de crachá (Definitivo, Provisório, Sem Crachá).

### 📅 Controle de Ponto

* **Visão Mensal:** Seleção de mês/ano para auditoria de assinaturas.

* **Checklist Rápido:** Marcar quem assinou ou não o ponto com um clique.

* **Métricas:** Visualização rápida de total de colaboradores elegíveis, assinados e pendentes.

* **Barra de Progresso:** Acompanhamento visual da porcentagem de conclusão do mês.

### 💾 Persistência e Dados

* **LocalStorage:** Os dados são salvos automaticamente no navegador do usuário.

* **Exportação JSON:** Backup completo dos dados para segurança.

* **Exportação CSV (Excel):** Relatórios detalhados compatíveis com Excel/Google Sheets, incluindo status de assinatura do mês selecionado.

* **Importação:** Restauração de backups via arquivo JSON.

### 📱 Interface

* **Design Responsivo:** Funciona perfeitamente em Desktops, Tablets e Celulares.

* **Sidebar Adaptável:** Menu lateral que se transforma em menu "gaveta" no mobile.

* **Tema Moderno:** Utilização de paleta de cores profissional com transições suaves.

## 🛠 Tecnologias Utilizadas

Este projeto foi desenvolvido utilizando tecnologias web modernas, mantendo a leveza e a performance:

* **HTML5 Semântico**: Estrutura robusta da aplicação.

* **Tailwind CSS (via CDN)**: Estilização utilitária para design rápido e responsivo.

* **JavaScript (Vanilla)**: Lógica da aplicação, manipulação do DOM e gestão de estado.

* **Lucide Icons**: Biblioteca de ícones leve e moderna.

## 🚀 Como Executar

Não é necessário instalar Node.js, NPM ou servidores complexos.

1. Faça o download ou clone o repositório.

2. Certifique-se de manter a estrutura de pastas (`css/`, `js/` e `index.html`) conforme baixado.

3. Abra o arquivo `index.html` na raiz com qualquer navegador moderno (Chrome, Edge, Firefox, Safari).

4. Pronto! A aplicação está rodando.

## 💾 Gestão de Dados (Backup)

Como a aplicação não utiliza um banco de dados em nuvem (backend), os dados ficam salvos no seu navegador. Para garantir a segurança das informações ou transferir para outro computador:

1. Clique em **"Salvar Backup"** no menu lateral para baixar o arquivo `.json`.

2. Para restaurar, clique em **"Carregar Backup"** e selecione o arquivo baixado anteriormente.

3. Para relatórios, clique em **"Exportar Planilha"** para gerar um arquivo `.csv` compatível com Excel.

## 🤖 Desenvolvimento e IA

Este projeto foi idealizado e dirigido por **Stevan Moises**, com a codificação e implementação técnica auxiliada por ferramentas de **Inteligência Artificial**.

## 👨‍💻 Autor

### Stevan Moises

*Desenvolvedor Web*

<p align="center">Feito com muito ☕ por <strong>Stevan Moises.</strong></p>

<p align="center">
<a href="https://www.linkedin.com/in/stevan-moises/">LinkedIn</a> •
<a href="https://github.com/Stevan-Moises">GitHub</a>
</p>
