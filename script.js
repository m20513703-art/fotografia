"use strict";

/* ============================================================
   LUZ & MEMÓRIA — FOTOGRAFIA
   SCRIPT PRINCIPAL
   PARTE 1/4
============================================================ */


/* ============================================================
   CONFIGURAÇÕES
============================================================ */

const CONFIG = {

    nome: "Luz & Memória — Fotografia",

    whatsapp: "5519999999999",

    instagram: "https://instagram.com/luzememoria",

    storage: {

        galerias: "luzMemoria_galerias",

        favoritos: "luzMemoria_favoritos"

    },

    bancoFotos: {

        nome: "luzMemoria_fotos_db",

        versao: 1,

        store: "fotos"

    }

};


/* ============================================================
   VARIÁVEIS
============================================================ */

let listaGalerias = null;

let modalGaleria = null;

let modalTitulo = null;

let modalDescricao = null;

let modalFotos = null;

let modalOverlay = null;

let botaoFecharModal = null;


/* ============================================================
   INICIALIZAÇÃO
============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    iniciarSite
);


async function iniciarSite() {

    console.log(
        "Luz & Memória iniciando..."
    );


    /* --------------------------------------------------------
       ELEMENTOS DO HTML
    -------------------------------------------------------- */

    listaGalerias =
        document.getElementById(
            "listaGalerias"
        );

    modalGaleria =
        document.getElementById(
            "modalGaleria"
        );

    modalTitulo =
        document.getElementById(
            "modalGaleriaTitulo"
        );

    modalDescricao =
        document.getElementById(
            "modalGaleriaDescricao"
        );

    modalFotos =
        document.getElementById(
            "modalFotos"
        );

    modalOverlay =
        document.getElementById(
            "modalOverlay"
        );

    botaoFecharModal =
        document.getElementById(
            "fecharModal"
        );


    /* --------------------------------------------------------
       VERIFICAÇÃO
    -------------------------------------------------------- */

    if (!listaGalerias) {

        console.error(
            "Elemento #listaGalerias não encontrado."
        );

        return;
    }


    /* --------------------------------------------------------
       GALERIAS
    -------------------------------------------------------- */

    inicializarGalerias();


    await carregarGalerias();


    /* --------------------------------------------------------
       MODAL
    -------------------------------------------------------- */

    configurarModal();


    /* --------------------------------------------------------
       MENU
    -------------------------------------------------------- */

    configurarMenuMobile();


    /* --------------------------------------------------------
       CONTATO
    -------------------------------------------------------- */

    configurarWhatsApp();

    configurarInstagram();


    /* --------------------------------------------------------
       ANO
    -------------------------------------------------------- */

    atualizarAno();


    console.log(
        "Luz & Memória carregado com sucesso."
    );

}


/* ============================================================
   GALERIAS PADRÃO
============================================================ */

function obterGaleriasPadrao() {

    return [

        {

            id: "galeria_casamentos",

            nome: "Casamentos",

            descricao:
                "Momentos especiais de casamentos registrados pela Luz & Memória.",

            ordem: 1

        },


        {

            id: "galeria_familia",

            nome: "Família",

            descricao:
                "Momentos especiais em família.",

            ordem: 2

        },


        {

            id: "galeria_ensaios",

            nome: "Ensaios",

            descricao:
                "Ensaios fotográficos realizados pela Luz & Memória.",

            ordem: 3

        },


        {

            id: "galeria_eventos",

            nome: "Eventos",

            descricao:
                "Eventos e celebrações registrados em fotografia.",

            ordem: 4

        }

    ];

}


/* ============================================================
   INICIALIZAR GALERIAS
============================================================ */

function inicializarGalerias() {

    const dados =
        localStorage.getItem(
            CONFIG.storage.galerias
        );


    if (dados) {

        return;

    }


    const galerias =
        obterGaleriasPadrao();


    localStorage.setItem(

        CONFIG.storage.galerias,

        JSON.stringify(galerias)

    );

}


/* ============================================================
   LER GALERIAS
============================================================ */

function obterGalerias() {

    try {

        const dados =
            localStorage.getItem(
                CONFIG.storage.galerias
            );


        if (!dados) {

            return obterGaleriasPadrao();

        }


        const galerias =
            JSON.parse(dados);


        if (!Array.isArray(galerias)) {

            return obterGaleriasPadrao();

        }


        return galerias;

    } catch (erro) {

        console.error(
            "Erro ao carregar galerias:",
            erro
        );

        return obterGaleriasPadrao();

    }

}


/* ============================================================
   BANCO DE FOTOS — INDEXEDDB
============================================================ */

function abrirBancoFotos() {

    return new Promise(
        function (resolve, reject) {

            if (!window.indexedDB) {

                reject(
                    new Error(
                        "IndexedDB não está disponível neste navegador."
                    )
                );

                return;

            }


            const requisicao =
                indexedDB.open(

                    CONFIG.bancoFotos.nome,

                    CONFIG.bancoFotos.versao

                );


            requisicao.onupgradeneeded =
                function (evento) {

                    const banco =
                        evento.target.result;


                    if (
                        !banco.objectStoreNames.contains(
                            CONFIG.bancoFotos.store
                        )
                    ) {

                        banco.createObjectStore(

                            CONFIG.bancoFotos.store,

                            {
                                keyPath: "id"
                            }

                        );

                    }

                };


            requisicao.onsuccess =
                function (evento) {

                    resolve(
                        evento.target.result
                    );

                };


            requisicao.onerror =
                function () {

                    reject(
                        requisicao.error
                    );

                };

        }
    );

}


/* ============================================================
   BUSCAR FOTOS
============================================================ */

async function obterFotos() {

    try {

        const banco =
            await abrirBancoFotos();


        return await new Promise(
            function (resolve, reject) {

                const transacao =
                    banco.transaction(

                        CONFIG.bancoFotos.store,

                        "readonly"

                    );


                const loja =
                    transacao.objectStore(

                        CONFIG.bancoFotos.store

                    );


                const requisicao =
                    loja.getAll();


                requisicao.onsuccess =
                    function () {

                        resolve(
                            requisicao.result || []
                        );

                    };


                requisicao.onerror =
                    function () {

                        reject(
                            requisicao.error
                        );

                    };

            }
        );

    } catch (erro) {

        console.error(
            "Erro ao buscar fotos:",
            erro
        );

        return [];

    }

}/* ============================================================
   FILTRAR FOTOS PUBLICADAS
============================================================ */

function filtrarFotosPublicadas(fotos) {

    if (!Array.isArray(fotos)) {

        return [];

    }


    return fotos.filter(
        function (foto) {

            return (

                foto.liberada === true ||

                foto.publicada === true ||

                foto.publicado === true

            );

        }
    );

}


/* ============================================================
   IDENTIFICAR GALERIA DA FOTO
============================================================ */

function obterIdGaleriaDaFoto(foto) {

    if (!foto) {

        return null;

    }


    return (

        foto.galeriaId ||

        foto.idGaleria ||

        foto.galeria ||

        null

    );

}


/* ============================================================
   OBTER ENDEREÇO DA FOTO
============================================================ */

function obterArquivoDaFoto(foto) {

    if (!foto) {

        return "";

    }


    return (

        foto.arquivo ||

        foto.data ||

        foto.dataUrl ||

        foto.url ||

        foto.src ||

        ""

    );

}


/* ============================================================
   OBTER NOME DA FOTO
============================================================ */

function obterNomeDaFoto(foto, indice) {

    if (foto && foto.nome) {

        return foto.nome;

    }


    if (foto && foto.titulo) {

        return foto.titulo;

    }


    return "Foto " + (indice + 1);

}


/* ============================================================
   CARREGAR GALERIAS
============================================================ */

async function carregarGalerias() {

    const galerias =
        obterGalerias();


    const fotosBanco =
        await obterFotos();


    const fotosPublicadas =
        filtrarFotosPublicadas(
            fotosBanco
        );


    renderizarGalerias(
        galerias,
        fotosPublicadas
    );

}


/* ============================================================
   RENDERIZAR GALERIAS
============================================================ */

function renderizarGalerias(
    galerias,
    fotos
) {

    if (!listaGalerias) {

        return;

    }


    listaGalerias.innerHTML = "";


    if (
        !Array.isArray(galerias) ||
        galerias.length === 0
    ) {

        listaGalerias.innerHTML = `

            <div class="galeria-vazia">

                <p>
                    Nenhuma galeria disponível no momento.
                </p>

            </div>

        `;

        return;

    }


    const galeriasOrdenadas =
        [...galerias].sort(
            function (a, b) {

                return (
                    (a.ordem || 0) -
                    (b.ordem || 0)
                );

            }
        );


    galeriasOrdenadas.forEach(
        function (galeria) {

            const fotosGaleria =
                fotos.filter(
                    function (foto) {

                        return (
                            obterIdGaleriaDaFoto(foto) ===
                            galeria.id
                        );

                    }
                );


            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "card-galeria";


            /* ------------------------------------------------
               CAPA
            ------------------------------------------------ */

            const areaImagem =
                document.createElement(
                    "div"
                );


            areaImagem.className =
                "imagem-galeria";


            if (
                fotosGaleria.length > 0
            ) {

                const capa =
                    fotosGaleria[0];


                const imagem =
                    document.createElement(
                        "img"
                    );


                imagem.src =
                    obterArquivoDaFoto(
                        capa
                    );


                imagem.alt =
                    galeria.nome ||
                    "Galeria de fotografia";


                imagem.loading =
                    "lazy";


                imagem.draggable =
                    false;


                areaImagem.appendChild(
                    imagem
                );

            } else {

                const inicial =
                    document.createElement(
                        "span"
                    );


                inicial.textContent =
                    galeria.nome
                        ? galeria.nome
                            .charAt(0)
                            .toUpperCase()
                        : "L";


                areaImagem.appendChild(
                    inicial
                );

            }


            /* ------------------------------------------------
               CONTEÚDO
            ------------------------------------------------ */

            const conteudo =
                document.createElement(
                    "div"
                );


            conteudo.className =
                "conteudo-galeria";


            const titulo =
                document.createElement(
                    "h3"
                );


            titulo.textContent =
                galeria.nome ||
                "Galeria";


            const descricao =
                document.createElement(
                    "p"
                );


            descricao.textContent =
                galeria.descricao ||
                "Confira os momentos registrados.";


            const botao =
                document.createElement(
                    "button"
                );


            botao.type =
                "button";


            botao.className =
                "btn btn-primary";


            botao.textContent =
                "Ver galeria";


            botao.addEventListener(
                "click",
                function () {

                    abrirGaleria(
                        galeria,
                        fotosGaleria
                    );

                }
            );


            conteudo.appendChild(
                titulo
            );


            conteudo.appendChild(
                descricao
            );


            conteudo.appendChild(
                botao
            );


            card.appendChild(
                areaImagem
            );


            card.appendChild(
                conteudo
            );


            listaGalerias.appendChild(
                card
            );

        }
    );

}


/* ============================================================
   ABRIR GALERIA
============================================================ */

function abrirGaleria(
    galeria,
    fotosGaleria
) {

    if (!modalGaleria) {

        console.error(
            "Modal #modalGaleria não encontrado."
        );

        return;

    }


    /* --------------------------------------------------------
       TÍTULO
    -------------------------------------------------------- */

    if (modalTitulo) {

        modalTitulo.textContent =
            galeria.nome ||
            "Galeria";

    }


    /* --------------------------------------------------------
       DESCRIÇÃO
    -------------------------------------------------------- */

    if (modalDescricao) {

        modalDescricao.textContent =
            galeria.descricao ||
            "";

    }


    /* --------------------------------------------------------
       FOTOS
    -------------------------------------------------------- */

    if (modalFotos) {

        modalFotos.innerHTML = "";


        if (
            !fotosGaleria ||
            fotosGaleria.length === 0
        ) {

            modalFotos.innerHTML = `

                <div class="galeria-vazia">

                    <p>
                        Esta galeria ainda não possui
                        fotos publicadas.
                    </p>

                </div>

            `;

        } else {

            fotosGaleria.forEach(
                function (foto, indice) {

                    const imagem =
                        document.createElement(
                            "img"
                        );


                    imagem.src =
                        obterArquivoDaFoto(
                            foto
                        );


                    imagem.alt =
                        obterNomeDaFoto(
                            foto,
                            indice
                        );


                    imagem.loading =
                        "lazy";


                    imagem.draggable =
                        false;


                    imagem.addEventListener(
                        "click",
                        function () {

                            abrirFotoAmpliada(
                                imagem.src,
                                imagem.alt
                            );

                        }
                    );


                    modalFotos.appendChild(
                        imagem
                    );

                }
            );

        }

    }


    /* --------------------------------------------------------
       ABRIR MODAL
    -------------------------------------------------------- */

    modalGaleria.hidden =
        false;


    modalGaleria.classList.add(
        "ativo"
    );


    modalGaleria.classList.add(
        "aberto"
    );


    document.body.classList.add(
        "modal-aberto"
    );

}/* ============================================================
   FECHAR GALERIA
============================================================ */

function fecharGaleria() {

    if (!modalGaleria) {

        return;

    }


    modalGaleria.hidden =
        true;


    modalGaleria.classList.remove(
        "ativo"
    );


    modalGaleria.classList.remove(
        "aberto"
    );


    document.body.classList.remove(
        "modal-aberto"
    );

}


/* ============================================================
   CONFIGURAR MODAL
============================================================ */

function configurarModal() {

    if (!modalGaleria) {

        console.error(
            "Modal #modalGaleria não encontrado."
        );

        return;

    }


    /* --------------------------------------------------------
       BOTÃO FECHAR
    -------------------------------------------------------- */

    if (botaoFecharModal) {

        botaoFecharModal.addEventListener(
            "click",
            function () {

                fecharGaleria();

            }
        );

    }


    /* --------------------------------------------------------
       CLIQUE NO FUNDO
    -------------------------------------------------------- */

    if (modalOverlay) {

        modalOverlay.addEventListener(
            "click",
            function () {

                fecharGaleria();

            }
        );

    }


    /* --------------------------------------------------------
       TECLA ESC
    -------------------------------------------------------- */

    document.addEventListener(
        "keydown",
        function (evento) {

            if (
                evento.key === "Escape" &&
                modalGaleria &&
                !modalGaleria.hidden
            ) {

                fecharGaleria();

            }

        }
    );

}


/* ============================================================
   FOTO AMPLIADA
============================================================ */

function abrirFotoAmpliada(
    src,
    alt
) {

    if (!src) {

        return;

    }


    /* --------------------------------------------------------
       VERIFICAR SE JÁ EXISTE
    -------------------------------------------------------- */

    const existente =
        document.querySelector(
            ".modal-foto-ampliada"
        );


    if (existente) {

        existente.remove();

    }


    /* --------------------------------------------------------
       CRIAR MODAL
    -------------------------------------------------------- */

    const modal =
        document.createElement(
            "div"
        );


    modal.className =
        "modal-foto-ampliada";


    /* --------------------------------------------------------
       FUNDO
    -------------------------------------------------------- */

    const fundo =
        document.createElement(
            "div"
        );


    fundo.className =
        "modal-foto-fundo";


    /* --------------------------------------------------------
       CONTEÚDO
    -------------------------------------------------------- */

    const conteudo =
        document.createElement(
            "div"
        );


    conteudo.className =
        "modal-foto-conteudo";


    /* --------------------------------------------------------
       BOTÃO FECHAR
    -------------------------------------------------------- */

    const fechar =
        document.createElement(
            "button"
        );


    fechar.type =
        "button";


    fechar.className =
        "modal-foto-fechar";


    fechar.textContent =
        "×";


    fechar.setAttribute(
        "aria-label",
        "Fechar foto"
    );


    /* --------------------------------------------------------
       IMAGEM
    -------------------------------------------------------- */

    const imagem =
        document.createElement(
            "img"
        );


    imagem.src =
        src;


    imagem.alt =
        alt || "Fotografia";


    imagem.draggable =
        false;


    /* --------------------------------------------------------
       MONTAR
    -------------------------------------------------------- */

    conteudo.appendChild(
        fechar
    );


    conteudo.appendChild(
        imagem
    );


    modal.appendChild(
        fundo
    );


    modal.appendChild(
        conteudo
    );


    document.body.appendChild(
        modal
    );


    /* --------------------------------------------------------
       FECHAR PELO BOTÃO
    -------------------------------------------------------- */

    fechar.addEventListener(
        "click",
        function () {

            modal.remove();

        }
    );


    /* --------------------------------------------------------
       FECHAR PELO FUNDO
    -------------------------------------------------------- */

    fundo.addEventListener(
        "click",
        function () {

            modal.remove();

        }
    );


    /* --------------------------------------------------------
       ESC
    -------------------------------------------------------- */

    function fecharComEsc(evento) {

        if (
            evento.key === "Escape"
        ) {

            modal.remove();

            document.removeEventListener(
                "keydown",
                fecharComEsc
            );

        }

    }


    document.addEventListener(
        "keydown",
        fecharComEsc
    );

}


/* ============================================================
   MENU MOBILE
============================================================ */

function configurarMenuMobile() {

    const botao =
        document.getElementById(
            "menuMobile"
        );


    const menu =
        document.getElementById(
            "siteNav"
        );


    if (!botao || !menu) {

        return;

    }


    botao.addEventListener(
        "click",
        function () {

            menu.classList.toggle(
                "ativo"
            );

        }
    );


    const links =
        menu.querySelectorAll(
            "a"
        );


    links.forEach(
        function (link) {

            link.addEventListener(
                "click",
                function () {

                    menu.classList.remove(
                        "ativo"
                    );

                }
            );

        }
    );

}


/* ============================================================
   WHATSAPP
============================================================ */

function configurarWhatsApp() {

    const botao =
        document.getElementById(
            "btnWhatsApp"
        );


    if (!botao) {

        return;

    }


    const numero =
        CONFIG.whatsapp.replace(
            /\D/g,
            ""
        );


    const mensagem =
        encodeURIComponent(
            "Olá! Gostaria de conhecer o trabalho da Luz & Memória — Fotografia."
        );


    botao.href =
        "https://wa.me/" +
        numero +
        "?text=" +
        mensagem;

}


/* ============================================================
   INSTAGRAM
============================================================ */

function configurarInstagram() {

    const botao =
        document.getElementById(
            "btnInstagram"
        );


    if (!botao) {

        return;

    }


    botao.href =
        CONFIG.instagram;

}


/* ============================================================
   ATUALIZAR ANO
============================================================ */

function atualizarAno() {

    const elemento =
        document.getElementById(
            "anoAtual"
        );


    if (!elemento) {

        return;

    }


    elemento.textContent =
        new Date().getFullYear();

}


/* ============================================================
   PROTEÇÃO DAS IMAGENS
============================================================ */

function configurarProtecaoImagens() {

    document.addEventListener(
        "contextmenu",
        function (evento) {

            if (
                evento.target &&
                evento.target.tagName === "IMG"
            ) {

                evento.preventDefault();

            }

        }
    );


    document.addEventListener(
        "dragstart",
        function (evento) {

            if (
                evento.target &&
                evento.target.tagName === "IMG"
            ) {

                evento.preventDefault();

            }

        }
    );

}


/* ============================================================
   ATUALIZAÇÃO AUTOMÁTICA
============================================================ */

function iniciarAtualizacaoAutomatica() {

    setInterval(
        async function () {

            try {

                await carregarGalerias();

            } catch (erro) {

                console.error(
                    "Erro na atualização automática:",
                    erro
                );

            }

        },
        5000
    );

}/* ============================================================
   FINALIZAÇÃO
============================================================ */


/* ============================================================
   DESABILITAR SELEÇÃO DAS IMAGENS
============================================================ */

function configurarImagens() {

    document.addEventListener(
        "selectstart",
        function (evento) {

            if (
                evento.target &&
                evento.target.tagName === "IMG"
            ) {

                evento.preventDefault();

            }

        }
    );

}


/* ============================================================
   RECARREGAR QUANDO A PÁGINA VOLTAR AO FOCO
============================================================ */

function configurarAtualizacaoFoco() {

    window.addEventListener(
        "focus",
        async function () {

            try {

                await carregarGalerias();

            } catch (erro) {

                console.error(
                    "Erro ao atualizar galerias:",
                    erro
                );

            }

        }
    );


    document.addEventListener(
        "visibilitychange",
        async function () {

            if (
                document.visibilityState === "visible"
            ) {

                try {

                    await carregarGalerias();

                } catch (erro) {

                    console.error(
                        "Erro ao atualizar galerias:",
                        erro
                    );

                }

            }

        }
    );

}


/* ============================================================
   CONFIGURAR TUDO
============================================================ */

function configurarSite() {

    configurarProtecaoImagens();

    configurarImagens();

    configurarAtualizacaoFoco();

    iniciarAtualizacaoAutomatica();

}


/* ============================================================
   EXECUTAR CONFIGURAÇÕES
============================================================ */

configurarSite();