import React, { useState, useEffect } from "react";
import { ShoppingBag, MapPin } from "lucide-react";
import { motion } from "framer-motion";export default function App() {
const [carrinho, setCarrinho] = useState(() => {
  const carrinhoSalvo = localStorage.getItem("carrinho");

  return carrinhoSalvo
    ? JSON.parse(carrinhoSalvo)
    : [];
});

const [carrinhoEventos, setCarrinhoEventos] = useState(() => {
  const salvo = localStorage.getItem("carrinhoEventos");
  

  return salvo
    ? JSON.parse(salvo)
    : [];
});
const [agendamentoAberto, setAgendamentoAberto] = useState(false);
const [tipoEntregaEvento, setTipoEntregaEvento] = useState("");
const [produtoAgendamento, setProdutoAgendamento] = useState(null);
const [carrinhoAberto, setCarrinhoAberto] = useState(false);
const [comboAdicionado, setComboAdicionado] = useState("");
const [nomeCliente, setNomeCliente] = useState("");
const [bairro, setBairro] = useState("");
const [endereco, setEndereco] = useState(() => {
  return localStorage.getItem("endereco") || "";
});

const [observacao, setObservacao] = useState(() => {
  
  return localStorage.getItem("observacao") || "";
});

const [pagamento, setPagamento] = useState(() => {
  return localStorage.getItem("pagamento") || "";
});
const [trocoPara, setTrocoPara] = useState(() => {
  
  return localStorage.getItem("trocoPara") || "";
});
const [nomeEvento, setNomeEvento] = useState("");
const [dataEvento, setDataEvento] = useState("");
const [horarioEvento, setHorarioEvento] = useState("");
const [enderecoEvento, setEnderecoEvento] = useState("");
const [pagamentoEvento, setPagamentoEvento] = useState("");
useEffect(() => {
  localStorage.setItem("trocoPara", trocoPara);
}, [trocoPara]);

useEffect(() => {
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
}, [carrinho]);
useEffect(() => {
  localStorage.setItem(
    "carrinhoEventos",
    JSON.stringify(carrinhoEventos)
  );
}, [carrinhoEventos]);
const taxasPorBairro = {
  "Cidade da Esperança": 5,
  "Dix-Sept Rosado": 5,
  "Nossa Senhora de Nazaré": 5,

  "Lagoa Nova": 7,
  "Alecrim": 7,
  "Tirol": 7,

  "Nova Descoberta": 9,
  "Cidade Alta": 9,
  "Candelária": 9,
  
  
};

const taxaEntrega = bairro ? taxasPorBairro[bairro] : 0;

const totalCarrinho = carrinho.reduce((total, item) => {
  const valor = Number(item.preco.replace("R$", "").replace(",", ".").trim());
  return total + valor;
}, 0);

const totalFinal = totalCarrinho + taxaEntrega;
const totalAgendamento = carrinhoEventos.reduce((total, item) => {
  const valor = Number(
    item.preco.replace("R$", "").replace(",", ".").trim()
  );

  return total + valor;
}, 0);

function adicionarAoCarrinho(produto) {
  setCarrinho((atual) => [...atual, produto]);
}
function adicionarItem(item) {
  adicionarAoCarrinho(item);
  setComboAdicionado(item.nome);

  setTimeout(() => {
    setComboAdicionado("");
  }, 1000);
}
function removerDoCarrinho(index) {
  setCarrinho((atual) => atual.filter((_, i) => i !== index));
}
function removerAgendamento(index) {
  setCarrinhoEventos((atual) =>
    atual.filter((_, i) => i !== index)
  );
}
function finalizarPedido() {

  if (carrinho.length === 0) {
    alert("Adicione pelo menos um item ao carrinho.");
    return;
  }
if (!bairro) {
  alert("Selecione seu bairro.");
  return;
}
  if (!endereco.trim()) {
    alert("Digite seu endereço antes de finalizar o pedido.");
    return;
  }

  if (!pagamento) {
    alert("Selecione a forma de pagamento.");
    return;
  }

  window.open(linkWhatsapp, "_blank");
}
const mensagemPedido = encodeURIComponent(`
Novo Pedido - NiceBurguer!

Cliente: ${nomeCliente || "Não informado"}

${Object.values(
  carrinho.reduce((acc, item) => {

    if (!acc[item.nome]) {
      acc[item.nome] = {
        ...item,
        quantidade: 0,
      };
    }

    acc[item.nome].quantidade += 1;

    return acc;

  }, {})
)

.map(
  (item) =>
    `${item.quantidade}x ${item.nome} - ${item.preco}`
)
.join("\n")}

Taxa de entrega: R$ ${taxaEntrega.toFixed(2).replace(".", ",")}

Total dos itens: R$ ${totalCarrinho.toFixed(2).replace(".", ",")}

Total final: R$ ${totalFinal.toFixed(2).replace(".", ",")}

Bairro: ${bairro || "Não informado"}


Endereço: ${endereco || "Não informado"}


Pagamento: ${pagamento || "Não informado"}


${pagamento === "Dinheiro" ? `Troco Para: R$ ${trocoPara || "Não informado"}` : ""}
`);

const linkWhatsapp = `https://wa.me/5584997063345?text=${mensagemPedido}`;
const produtos = [
  {
    nome: "Burguer 3.0",
    descricao: "Pão Com Gergelim Macio , 2 Blend Bovino 60g, Queijo Cheddar ou mussarela , Bacon , Cebola Empanada, Cebola Caramelizada e Delicioso Molho especial da casa.",
    preco: "R$24,99",
   imagem: "/img/uju.png",
},
  {
    nome: "Burguer 2.0",
    descricao: "Pão Com Gergelim Macio, Blend Bovino 80g , Queijo Cheddar ou mussarela, Cebola Empanada, Cebola Caramelizada e Delicioso Molho especial da casa.",
    preco: "R$17,99",
    imagem: "/img/png",
  },
  {
    nome: "Burguer 1.0",
    descricao: "Pão Com Gergelim Macio, Blend Bovino 60g, Queijo Cheddar ou mussarela e Delicioso Molho especial da casa.",
    preco: "R$11,99",
    imagem:"/img/png",
  },
 
  
{
  nome: "Batata Frita Acompnhamento De Combo",
  descricao: "Batata Frita McCain Corte Fino Super Crocante e Delicioso Molho especial da casa.",
  preco: "R$6,99",
  imagem: "/img/Batata MacCain.png",
},
{
  nome: "Batata Frita Tamanho família",
  descricao: "Batata Frita McCain Corte Fino Super Crocante e Delicioso Molho especial da casa.",
  preco: "R$15,99",
  imagem: "/img/grande.png",
},
{
  nome: "Batata Suprema Cheddar e Bacon",
  descricao: "Batata Frita McCain Corte Fino Super Crocante Com Cheddar e Bacon e Delicioso Molho especial da casa.",
  preco: "R$21,99",
  imagem: "/img/BATATA SUPREMAA.png",
},

  {
    nome: "Coca-Cola Original Garrafinha 250ml",
    descricao: "Coca-Cola Garrafinha 250ml",
    preco: "R$ 3,99",
    imagem: "/img/250ml.png"
  },
{
    nome: "Coca-Cola Original Lata 350ml",
    descricao: "Coca-Cola Lata 350ml",
    preco: "R$ 5,99",
    imagem: "/img/350ml.png",
  },{
    nome: "Coca-Cola Original Garrafa 1 Litro",
    descricao: "Coca-Cola Garrafa 1 Litro",
    preco: "R$ 9,99",
    imagem: "/img/1litro.png",
  },
  
{
  nome: "Suco de Maracujá",
  descricao: "Delicioso Suco De Maracujá 300ml",
  preco: "R$ 7,99",
  imagem: "/img/image.png",
},

]; 
const combos = [
  {
    nome: "Combo Turbo",
    descricao: "Burguer 3.0 + Batata Frita + Coca-Cola  250ml + Molho Especial",
    preco: "R$ 35,97",
    imagem: "/img/Turbooo.png",
  },
  {
    nome: "Combo Street",
    descricao: "Burguer 2.0 + Batata Frita + Coca-Cola 250ml + Molho Especial",
    preco: "R$ 28,97",
    imagem: "/img/.png",
    
  },
  {
    nome: "Combo Prime",
    descricao: "Burguer 1.0 + Batata Frita + Coca-Cola 250ml + Molho Especial",
    preco: "R$ 22,97",
    imagem: "/img/.png",
  },
  
  
  {
  nome: "5 Mini Burguer",
  descricao: "Turbine sua festa ou evento com o melhor! Apenas por agendamento. Cada Mini Burguer sai a R$2,99",
  preco: "R$ 14,95",
  imagem: "/img/Mini Burguer.png",
  tipo: "mini-burguer",
},
  {
  nome: "10 Mini Burguer",
  descricao: "Turbine sua festa ou evento com o melhor! Apenas por agendamento. Cada Mini Burguer sai a R$2,99",
  preco: "R$ 29,90",
  imagem: "/img/Mini Burguer.png",
  tipo: "mini-burguer",
},
  {
  nome: "20 Mini Burguer",
  descricao: "Turbine sua festa ou evento com o melhor! Apenas por agendamento. Cada Mini Burguer sai a R$2,99",
  preco: "R$ 59,80",
  imagem: "/img/Mini Burguer.png",
  tipo: "mini-burguer",
},
{
  nome: "30 Mini Burguer",
  descricao: "Turbine sua festa ou evento com o melhor! Apenas por agendamento. Cada Mini Burguer sai a R$2,99",
  preco: "R$ 89,70",
  imagem: "/img/Mini Burguer.png",
  tipo: "mini-burguer",
},
  {
  nome: "40 Mini Burguer",
  descricao: "Turbine sua festa ou evento com o melhor! Apenas por agendamento. Cada Mini Burguer sai a R$2,99",
  preco: "R$ 119,60",
  imagem: "/img/Mini Burguer.png",
  tipo: "mini-burguer",
},
{
  nome: "50 Mini Burguer",
  descricao: "Turbine sua festa ou evento com o melhor! Apenas por agendamento. Cada Mini Burguer sai a R$2,89",
  preco: "R$ 144,50",
  imagem: "/img/Mini Burguer.png",
  tipo: "mini-burguer",
},
{
  nome: "100 Mini Burguer",
  descricao: "Turbine sua festa ou evento com o melhor! Apenas por agendamento. Cada Mini Burguer sai a R$2,84",
  preco: "R$ 284,00",
  imagem: "/img/Mini Burguer.png",
  tipo: "mini-burguer",
},
];
function agendar(combo) {
  setCarrinhoEventos((atual) => [...atual, combo]);
  setComboAdicionado(combo.nome);

  setTimeout(() => {
    setComboAdicionado("");
  }, 1000);
}
function finalizarAgendamento() {
  if (carrinhoEventos.length === 0) {
    alert("Adicione pelo menos um agendamento.");
    return;
  }
  if (!nomeEvento.trim()) {
    alert("Digite seu nome.");
    return;
  }
  if (!dataEvento) {
    alert("Selecione a data do evento.");
    return;
    if (!horarioEvento) {
  alert("Selecione o horário de entrega.");
  return;
}
  }
  if (
  tipoEntregaEvento === "Entrega" &&
  !enderecoEvento.trim()
) {
    alert("Digite o endereço.");
    return;
  }
  if (!pagamentoEvento) {
    alert("Selecione a forma de pagamento.");
    return;
  }

  const mensagemAgendamento = encodeURIComponent(`
Novo Agendamento - NiceBurguer!

Cliente: ${nomeEvento}

${Object.values(
  carrinhoEventos.reduce((acc, item) => {

    if (!acc[item.nome]) {
      acc[item.nome] = {
        ...item,
        quantidade: 0,
        total: 0,
      };
    }

    acc[item.nome].quantidade += 1;

    acc[item.nome].total += Number(
      item.preco.replace("R$", "").replace(",", ".").trim()
    );

    return acc;

  }, {})
)

.map(
  (item) =>
    `${item.quantidade}x ${item.nome} - R$ ${item.total
      .toFixed(2)
      .replace(".", ",")}`
)
.join("\n")}

Data do evento: ${dataEvento}
Horário de entrega: ${horarioEvento}
Tipo: ${tipoEntregaEvento}

${tipoEntregaEvento === "Entrega"
  ? `Endereço: ${enderecoEvento}`
  : "Retirada no local"}

Pagamento: ${pagamentoEvento}
Total: R$ ${totalAgendamento.toFixed(2).replace(".", ",")}

`);


  const linkAgendamento =
    `https://wa.me/5584997063345?text=${mensagemAgendamento}`;

  window.open(linkAgendamento, "_blank");
}
const burguers = produtos.filter((produto) =>
  produto.nome.includes("Burguer")
);

const fritas = produtos.filter((produto) =>
  produto.nome.includes("Batata")
);

const bebidas = produtos.filter((produto) =>
  produto.nome.includes("Coca-Cola")
);
const sucos = produtos.filter((produto) =>
  produto.nome.includes("Suco")
);

const eventos = combos.filter((combo) =>
  combo.tipo === "mini-burguer"
);

const combosNormais = combos.filter((combo) =>
  combo.tipo !== "mini-burguer"
);
function ArrasteDica() {
  return (
    <div className="mb-4 flex items-center justify-center gap-2 text-sm font-bold text-orange-400 md:hidden">
      <motion.span
        animate={{ x: [0, 10, 0] }}
        transition={{ duration: 1.2, repeat: Infinity }}
        className="text-2xl"
      >
        👉
      </motion.span>

      <span>Arraste para o lado</span>
    </div>
  );
}
return (
<main className="min-h-screen bg-[#14100f] relative overflow-hidden text-white">    <div className="absolute inset-0 opacity-20 pointer-events-none">
      <div className="absolute top-0 left-6 h-[500px] w-[500px] rounded-full bg-orange-500 blur-[140px]" />
      <div className="absolute bottom-6 right-6 h-[400px] w-[400px] rounded-full bg-red-500 blur-[140px]" />
      <div className="absolute top-[40%] left-[40%] h-[300px] w-[300px] rounded-full bg-yellow-400 blur-[120px]" />
    </div>

    <header className="sticky top-0 z-50 border-b bg-[#1b1614]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <a
  href="#inicio"
  className="text-2xl text-orange-400"
  style={{
    fontFamily: "'Road Rage', cursive",
    textShadow: "0 0 12px rgba(255,120,0,0.9)",
    letterSpacing: "1px",
  }}
>
  Nice Burguer
</a>

        <nav className="flex items-center gap-3 text-xs font-semibold sm:gap-7 sm:text-sm">
          <a href="#cardapio" className="hover:text-orange-700">Cardápio</a>
          <a href="#combos" className="hover:text-orange-700">Combos</a>
          <a href="#local" className="hover:text-orange-700">Localização</a>
        </nav>

        
      </div>

</header>
  
{carrinho.length > 0 && (
  <div className="fixed right-2 top-20 z-50">
<motion.button
  onClick={() => setCarrinhoAberto(!carrinhoAberto)}
animate={{
  scale:
    carrinho.length > 0
      ? [1, 1.35, 0.92, 1.18, 1]
      : 1,

  rotate:
    carrinho.length > 0
      ? [0, -8, 8, -4, 0]
      : 0,

  boxShadow:
    carrinho.length > 0
      ? [
          "0 0 0px rgba(255,120,0,0)",
          "0 0 45px rgba(255,120,0,1)",
          "0 0 20px rgba(255,180,0,0.9)",
          "0 0 0px rgba(255,120,0,0)",
        ]
      : "0 0 0px rgba(255,120,0,0)",
}}
transition={{
  duration: 1,
  ease: "easeInOut",
}}
  className="flex items-center justify-center gap-2 rounded-full bg-orange-600 px-4 py-3 text-lg font-black text-white shadow-xl transition hover:scale-105"
>
  <ShoppingBag size={22} />
  <span>{carrinho.length}</span>
</motion.button>

 
  {carrinhoAberto && (
    <div className="mt-3 max-h-[70vh] overflow-y-auto rounded-3xl border border-orange-100 bg-[#1f1a18] p-5 shadow-2xl">

<div className="mt-4 max-h-64 overflow-y-auto">
  {carrinho.length === 0 ? (
    <p className="text-sm text-stone-500">
      Nenhum item ainda.
    </p>
  ) : (
    Object.values(
  carrinho.reduce((acc, item) => {

    if (!acc[item.nome]) {
      acc[item.nome] = {
        ...item,
        quantidade: 0,
        total: 0,
      };
    }

    acc[item.nome].quantidade += 1;
    acc[item.nome].total += Number(
      item.preco.replace("R$", "").replace(",", ".").trim()
    );

    return acc;

  }, {})
).map((item, index) => (
      <div key={index} className="mb-3 rounded-xl border border-orange-500/30 bg-[#2b211d] p-3 shadow-lg">
<p className="font-bold text-white">
  {item.quantidade}x {item.nome}
</p>
<p className="text-sm text-orange-200">
  R$ {item.total.toFixed(2).replace(".", ",")}
</p>
        <button
          onClick={() => removerDoCarrinho(index)}
          className="mt-2 text-xs font-bold text-red-400 hover:text-red-700"
        >
          Remover
        </button>
      </div>
    ))
  )}
</div>

<div className="mt-4 border-t pt-4">
  <p className="text-sm font-bold text-stone-600">
  Itens: R$ {totalCarrinho.toFixed(2).replace(".", ",")}
</p>

<p className="text-sm font-bold text-stone-600">
  Taxa de entrega: R$ {taxaEntrega.toFixed(2).replace(".", ",")}
</p>

<p className="mt-2 text-lg font-black text-orange-700">
  Total: R$ {totalFinal.toFixed(2).replace(".", ",")}
</p>
</div>

<input
  type="text"
  value={nomeCliente}
  onChange={(e) => setNomeCliente(e.target.value)}
  placeholder="Qual seu nome?"
  className="mt-4 w-full rounded-xl border border-orange-200 p-3 text-sm outline-none focus:border-orange-500"
/>
<select
  value={bairro}
  onChange={(e) => setBairro(e.target.value)}
  className="mt-4 w-full rounded-xl border border-orange-400 bg-[#fff7ed] p-3 text-sm font-bold text-stone-900 outline-none focus:border-orange-500"
>
  <option value="">Selecione seu bairro</option>

  <option value="Cidade da Esperança">
    Cidade da Esperança - R$ 5,00
  </option>
  
  <option value="Dix-Sept Rosado">
    Dix-Sept Rosado - R$ 5,00
  </option>

  <option value="Nossa Senhora de Nazaré">
    Nossa Senhora de Nazaré - R$ 5,00
  </option>

  <option value="Lagoa Nova">
    Lagoa Nova - R$ 7,00
  </option>

  <option value="Alecrim">
    Alecrim - R$ 7,00
  </option>

  <option value="Tirol">
    Tirol - R$ 7,00
  </option>

  <option value="Nova Descoberta">
    Nova Descoberta  R$9,00
  </option>

  <option value="Cidade Alta">
    Cidade Alta R$9,00
  </option>

  <option value="Candelária">
    Candelária R$9,00
  </option>

</select>

<input
  type="text"
  value={endereco}
  onChange={(e) => setEndereco(e.target.value)}
  placeholder="Digite seu endereço"
  className="mt-4 w-full rounded-xl border border-orange-200 p-3 text-sm outline-none focus:border-orange-500"
/>

<select
  value={pagamento}
  onChange={(e) => setPagamento(e.target.value)}
  className="mt-3 w-full rounded-xl border border-orange-400 bg-[#fff7ed] p-3 text-sm font-bold text-stone-900 outline-none focus:border-orange-500"
>
  <option value="">Escolha a forma de pagamento</option>
  <option value="Pix">Pix</option>
  <option value="Dinheiro">Dinheiro</option>
  <option value="Cartão">Cartão</option>
</select>
{pagamento === "Pix" && (
  <div className="mt-3 rounded-xl border border-orange-200 bg-orange-50 p-3 text-sm">
    <p className="font-bold text-orange-700">Chave Pix:</p>
    <p className="font-black text-stone-800">08977689490</p>

    <p className="mt-2 font-bold text-orange-700">Valor total:</p>
    <p className="font-black text-stone-800">
      R$ {totalFinal.toFixed(2).replace(".", ",")}
    </p>
  </div>
)}
{pagamento === "Dinheiro" && (
  <input
    type="text"
    value={trocoPara}
    onChange={(e) => setTrocoPara(e.target.value)}
    placeholder="Troco para quanto?"
    className="mt-3 w-full rounded-xl border border-orange-200 p-3 text-sm outline-none focus:border-orange-500"
  />
)}

<button
  onClick={finalizarPedido}
  className="mt-4 block w-full rounded-xl bg-orange-600 py-3 text-center font-bold text-white hover:bg-orange-700"
>
  Finalizar Pedido
</button>

    </div>
  )}
</div>
)}
{carrinhoEventos.length > 0 && (
  <div className="fixed left-2 top-20 z-50">
  <motion.button
    type="button"
    onClick={() => setAgendamentoAberto(!agendamentoAberto)}
    className="flex items-center justify-center gap-2 rounded-full bg-yellow-500 px-4 py-3 text-lg font-black text-black shadow-xl"
  >
    📅
    <span>{carrinhoEventos.length}</span>
  </motion.button>

  {agendamentoAberto && (
<div className="mt-3 max-h-[70vh] w-80 overflow-y-auto rounded-3xl border border-yellow-400 bg-[#1f1a18] p-5 shadow-2xl">
      <h2 className="mb-4 text-xl font-black text-yellow-400">
        Agendamentos
      </h2>

      {carrinhoEventos.length === 0 ? (
        <p className="text-sm text-stone-400">
          Nenhum agendamento ainda.
        </p>
      ) : (
        Object.values(
  carrinhoEventos.reduce((acc, item) => {
    if (!acc[item.nome]) {
      acc[item.nome] = {
        ...item,
        quantidade: 1,
      };
    } else {
      acc[item.nome].quantidade += 1;
    }

    return acc;
  }, {})
).map((item, index) => (
  <div
    key={index}
    className="mb-3 rounded-2xl border border-yellow-500/30 bg-[#2b211d] p-3"
  >
    <p className="font-bold text-white">
      {item.quantidade}x {item.nome}
    </p>

    <p className="text-sm font-black text-yellow-400">
  R$ {(item.quantidade * Number(
    item.preco.replace("R$", "").replace(",", ".").trim()
  ))
    .toFixed(2)
    .replace(".", ",")}
</p>

    <button
      onClick={() => removerAgendamento(index)}
      className="mt-2 text-xs font-bold text-red-400 hover:text-red-600"
    >
      Remover
    </button>
  </div>
))
      )}
     <div className="mt-4 border-t border-yellow-500/30 pt-4">
     <p className="mb-4 text-lg font-black text-yellow-400">
  Total: R$ {totalAgendamento.toFixed(2).replace(".", ",")}
</p>
  <input
    type="text"
    value={nomeEvento}
    onChange={(e) => setNomeEvento(e.target.value)}
    placeholder="Qual seu nome?"
    className="mt-3 w-full rounded-xl border border-yellow-400 bg-[#fff7ed] p-3 text-sm font-bold text-stone-900 outline-none"
  />

<select
  value={tipoEntregaEvento}
  onChange={(e) => setTipoEntregaEvento(e.target.value)}
  className="mt-3 w-full rounded-xl border border-yellow-400 bg-[#fff7ed] p-3 text-sm font-bold text-stone-900 outline-none"
>
  <option value="">Entrega ou retirada?</option>
  <option value="Entrega">Entrega</option>
  <option value="Retirada">Retirada</option>
</select>

<div className="mt-3">
  <label className="mb-2 block text-sm font-black text-yellow-400">
    Qual a data do seu evento?
  </label>

  <input
    type="date"
    value={dataEvento}
    onChange={(e) => setDataEvento(e.target.value)}
    className="w-full rounded-xl border border-yellow-400 bg-[#fff7ed] p-3 text-sm font-bold text-stone-900 outline-none [color-scheme:light]"
  />
</div>
<div className="mt-3">
  <label className="mb-2 block text-sm font-black text-yellow-400">
    Qual horário de entrega/retirada?
  </label>

  <input
    type="time"
    value={horarioEvento}
    onChange={(e) => setHorarioEvento(e.target.value)}
    className="w-full rounded-xl border border-yellow-400 bg-[#fff7ed] p-3 text-sm font-bold text-stone-900 outline-none [color-scheme:light]"
  />
</div>
  
{tipoEntregaEvento === "Entrega" && (
  <input
    type="text"
    value={enderecoEvento}
    onChange={(e) => setEnderecoEvento(e.target.value)}
    placeholder="Adicione seu endereço"
    className="mt-3 w-full rounded-xl border border-yellow-400 bg-[#fff7ed] p-3 text-sm font-bold text-stone-900 outline-none"
    
  />
)}
 
  <select
    value={pagamentoEvento}
    onChange={(e) => setPagamentoEvento(e.target.value)}
    className="mt-3 w-full rounded-xl border border-yellow-400 bg-[#fff7ed] p-3 text-sm font-bold text-stone-900 outline-none"
  >
    <option value="">Forma de pagamento</option>
    <option value="Pix">Pix</option>
    <option value="Dinheiro">Dinheiro</option>
    <option value="Cartão">Cartão</option>
  </select>
  <button
  type="button"
  onClick={finalizarAgendamento}
  className="mt-4 w-full rounded-xl bg-yellow-500 py-3 text-center font-black text-black shadow-xl hover:bg-yellow-400"
>
  Finalizar Agendamento
</button>
</div>
    </div>
  )}
</div>
)}
<section
  id="inicio"
  className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-10 md:grid-cols-2 md:py-16"
>
  <motion.div
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="flex flex-col items-center text-center"
  >
          <p className="mb-4 inline-flex rounded-full bg-orange-500 px-4 py-2 text-lg font-bold text-black">
            Hamburgueria Artesanal
          </p>

          <div className="flex flex-col items-center justify-center">
  <img
    src="/img/NiceBurguer!!.png"
    alt="Nice Burguer"
    className="h-85 w-85 rounded-full object-cover shadow-lg"
  />

  <h1 className="text-2xl font-black text-orange-100">
  
  </h1>
</div>
<p
  className="mt-5 text-5xl text-white-700"
  style={{ fontFamily: "Kaushan Script" }}
>
  O Burguer que você merece!
</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          

            
            
          </div>
          </motion.div>
        <motion.div
  initial={{ opacity: 0, scale: 0.96 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 2 }}
className="rounded-[2rem] bg-[#1f1a18] p-0 shadow-[0_0_80px_rgba(255,120,0,0.25)]">

<div className="rounded-[1.5rem] bg-[#1f1a18] p-5">

<div className="mb-4 flex items-center justify-center">
      <div className="flex flex-col leading-none">
  
  <span
  className="px-2 text-5xl text-orange-400"
  style={{
    fontFamily: "'Another Danger', cursive",
    textShadow: "0 0 12px rgba(255,120,0,0.7)",
  }}
>
  O Top 1 Mais Pedido!
</span>

</div>
    </div>

    <div className="overflow-hidden rounded-[2rem]">

      <img
        src="/img/Turbooo.png"
        alt="Combo Street"
        className="h-[333px] w-full object-cover"
      />
    </div>

  
    <motion.button
  type="button"
  whileTap={{ scale: 0.95 }}
  whileHover={{ scale: 1.03 }}
  onClick={() =>
    adicionarItem({
      nome: "Combo Street",
      preco: "R$ 35,97",
      imagem: "/img/Turbooo.png", 
    })
  }
  className="mt-6 w-full rounded-2xl bg-orange-600 py-4 text-lg font-black text-white shadow-xl transition hover:bg-orange-500"
>
  {comboAdicionado === "Combo Turbo"
    ? "Adicionado à sacola!"
    : "Adicionar"}
    
</motion.button>
  </div>
</motion.div>
<a
              href="#combos"
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-orange-600 px-7 py-4 font-bold text-orange-700 hover:bg-orange-100"
            >
              Ver Combos Exclusivos
            </a>
            
      </section>
<section id="cardapio" className="mx-auto max-w-6xl px-5 py-16">
  <div className="mb-10 text-center">
    <h2 className="text-3xl font-black md:text-4xl">Burguer's</h2>
  </div>
  <ArrasteDica />
<div className="flex gap-5 overflow-x-auto scroll-smooth pb-4 md:grid md:grid-cols-3 md:overflow-visible"><>
{burguers.map((produto) => (
  <motion.div
  key={produto.nome}
  whileHover={{ y: -3, scale: 1.005 }}
  whileTap={{ scale: 0.98 }}
  transition={{ duration: 0.2 }}
className="min-w-[280px] md:min-w-0 flex flex-col rounded-3xl bg-[#1f1a18]/80 p-5 shadow-[0_0_40px_rgba(255,120,0,0.18)] transition hover:shadow-[0_0_60px_rgba(255,120,0,0.25)]">
  <div className="relative mb-4 overflow-hidden rounded-2xl">
<img
  src={produto.imagem}
  alt={produto.nome}
  className="h-[320px] w-full object-cover"
/>
</div>
  <h3 className="text-2xl font-black text-white">
    {produto.nome}
  </h3>

<p className="mt-3 min-h-[120px] text-sm leading-7 text-stone-300">   
   {produto.descricao}
  </p>

  <div className="mt-6">
    <motion.button
      type="button"
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.01 }}
      onClick={() => adicionarItem(produto)}
className="w-full rounded-3xl bg-orange-600 py-6 text-2xl font-black text-white shadow-xl hover:bg-orange-500"    >
      {comboAdicionado === produto.nome
        ? "Adicionado!"
        : "Adicionar"}
    </motion.button>
  </div>
</motion.div>
))}
</>
</div>
<div className="mb-10 mt-20 text-center">
  <h2 className="text-4xl font-black md:text-4xl">
    Porções de Fritas
  </h2>
</div>

<div className="flex gap-5 overflow-x-auto scroll-smooth pb-4 md:grid md:grid-cols-3 md:overflow-visible">
  {fritas.map((produto) => (
  <motion.div
    key={produto.nome}
    whileHover={{ y: -8, scale: 1.05 }}
    whileTap={{ scale: 0.98 }}
    transition={{ duration: 0.2 }}
className="min-w-[280px] md:min-w-0 relative overflow-hidden rounded-3xl bg-[#1f1a18]/10 p-5 shadow-xl backdrop-blur" >
<div className="relative mb-4 flex h-[285px] items-center justify-center overflow-hidden rounded-2xl bg-orange-100">      

      <img
        src={produto.imagem}
        alt={produto.nome}
className="h-full w-full object-cover"      />
    </div>

    <h3 className="text-xl font-black text-white">
      {produto.nome}
    </h3>

    <p className="mt-2 min-h-[70px] text-sm leading-6 text-stone-300">
      {produto.descricao}
    </p>

<div className="mt-6">      

      <motion.button
        type="button"
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => adicionarItem(produto)}
className="w-full rounded-2xl bg-orange-600 py-4 text-lg font-black text-white shadow-xl hover:bg-orange-500"      >
        {comboAdicionado === produto.nome ? "Adicionado à sacola!" : "Adicionar"}
      </motion.button>
    </div>
  </motion.div>
))}
</div>
<div className="mb-10 mt-20 text-center">
  <h2 className="text-4xl font-black md:text-4xl">
    Coca-Cola
  </h2>
</div>

<div className="flex gap-5 overflow-x-auto scroll-smooth pb-4 md:grid md:grid-cols-3 md:overflow-visible">  
{bebidas.map((produto) => (
    <motion.div
  key={produto.nome}
  whileHover={{ y: -3, scale: 1.005 }}
  whileTap={{ scale: 0.98 }}
  transition={{ duration: 0.2 }}
  className="min-w-[340px] md:min-w-0 rounded-3xl bg-[#1f1a18]/80 p-5 shadow-xl backdrop-blur transition hover:shadow-[0_0_25px_rgba(255,120,0,0.25)]"
>
  <div className="relative mb-4 overflow-hidden rounded-2xl">
    <img
      src={produto.imagem}
      alt={produto.nome}
      className="h-[320px] w-full object-cover"
    />
  </div>

  <h3 className="text-2xl font-black text-white">
    {produto.nome}
  </h3>

  <p className="mt-3 text-sm leading-7 text-stone-300">
    {produto.descricao}
  </p>

  <div className="mt-6">
    <motion.button
      type="button"
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.01 }}
      onClick={() => adicionarItem(produto)}
      className="w-full rounded-2xl bg-orange-600 py-4 text-lg font-black text-white shadow-xl hover:bg-orange-500"
    >
      {comboAdicionado === produto.nome
        ? "Adicionado!"
        : "Adicionar"}
    </motion.button>
  </div>
</motion.div>
  ))}
</div>
</section>
<div className="mb-10 mt-20 text-center">
  <h2 className="text-4xl font-black md:text-4xl">
    Sucos
  </h2>
</div>

<div className="flex gap-5 overflow-x-auto scroll-smooth pb-4 md:grid md:grid-cols-3 md:overflow-visible">
  {sucos.map((produto) => (
    <motion.div
      key={produto.nome}
      whileHover={{ y: -3, scale: 1.005 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className="min-w-[340px] md:min-w-0 rounded-3xl bg-[#1f1a18]/80 p-5 shadow-[0_0_40px_rgba(255,120,0,0.18)] transition hover:shadow-[0_0_60px_rgba(255,120,0,0.35)]"
    >
      <div className="relative mb-4 overflow-hidden rounded-2xl">
        <img
          src={produto.imagem}
          alt={produto.nome}
          className="h-[320px] w-full object-cover"
        />
      </div>

      <h3 className="text-2xl font-black text-white">
        {produto.nome}
      </h3>

      <p className="mt-3 text-sm leading-7 text-stone-300">
        {produto.descricao}
      </p>

      <div className="mt-6">
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.01 }}
          onClick={() => adicionarItem(produto)}
          className="w-full rounded-2xl bg-orange-600 py-4 text-lg font-black text-white shadow-xl hover:bg-orange-500"
        >
          {comboAdicionado === produto.nome
            ? "Adicionado!"
            : "Adicionar"}
        </motion.button>
      </div>
    </motion.div>
  ))}
</div>
      <section id="combos" className="bg-stone-900 py-16 text-white">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mb-10 text-center">
  <p className="font-bold text-orange-300 md:text-xl">
    Em Nossa Hamburgueria Delivery
  </p>

  <h2 className="text-3xl font-black md:text-4xl">
    Você aproveita o melhor do hamburguer artesanal com um ótimo custo beneficio!
  </h2>
</div>
<div className="flex gap-5 overflow-x-auto scroll-smooth pb-4 md:grid md:grid-cols-3 md:overflow-visible">
  {combosNormais.map((combo) => (
  <motion.div
  key={combo.nome}
  whileHover={{ y: -3, scale: 0.95 }}
  whileTap={{ scale: 0.98 }}
  transition={{ duration: 0.2 }}
  className="fire-card min-w-[300px] md:min-w-0 overflow-hidden rounded-3xl bg-[#1f1a18]/20 border-2 border-orange-500 shadow-[0_0_15px_rgba(255,120,0,0.6),0_0_35px_rgba(255,80,0,0.4)]"
>  
  
    <img
      src={combo.imagem}
      alt={combo.nome}
      className="h-[280px] w-full object-contain"
    />

  
<div className="p-5">
  <h3 className="text-2xl font-black text-white">
    {combo.nome}
  </h3>

  <p className="mt-3 text-stone-300">
    {combo.descricao}
  </p>

  <div className="mt-5 flex items-center justify-between">
    <span className="text-3xl font-black text-orange-400">
      {combo.preco}
    </span>

    <motion.button
      type="button"
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      onClick={() => adicionarItem(combo)}
      className="rounded-full bg-orange-600 px-4 py-2 text-sm font-bold text-white"
    >
      {comboAdicionado === combo.nome
        ? "✓ Adicionado"
        : "Adicionar"}
    </motion.button>
  </div>
</div>
  </motion.div>
))}
</div>
</div>
      </section>
      <div className="mt-24 text-center">
  <h2 className="text-4xl font-black text-white">
    Festas & Eventos
  </h2>

  <p className="mt-4 text-xl font-bold text-white-300">
    Já pensou a NiceBurguer na sua festa ou evento?
  </p>

  <p className="mt-2 text-lg font-black text-white-200">
    Faça já seu agendamento!
  </p>
</div>

<div className="mt-12 grid gap-5 md:grid-cols-3">
  {eventos.map((produto) => (
    <motion.div
      key={produto.nome}
      whileHover={{ y: -8, scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
className="min-w-[280px] md:min-w-0 flex flex-col rounded-3xl bg-[#1f1a18]/80 p-5 shadow-[0_0_40px_rgba(255,120,0,0.18)] transition hover:shadow-[0_0_60px_rgba(255,120,0,0.35)]"   >
<div className="relative mb-4 flex h-[340px] items-center justify-center overflow-hidden rounded-2xl bg-[#2b211d]">        

        <img
          src={produto.imagem}
          alt={produto.nome}
          className="relative z-10 h-full w-auto object-contain"
        />
      </div>

      <h3 className="text-xl font-black text-white">
        {produto.nome}
      </h3>

      <p className="mt-2 min-h-16 text-sm leading-6 text-stone-300">
        {produto.descricao}
      </p>

      <div className="mt-5 flex items-center justify-between">
        <span className="text-2xl font-black text-orange-700">
          {produto.preco}
        </span>

        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => agendar(produto)}
          className="rounded-full bg-orange-600 px-3 py-1 text-sm font-bold text-white hover:bg-orange-700"
        >
          {comboAdicionado === produto.nome
            ? "Agendado!"
            : "Agendar"}
        </motion.button>
      </div>
    </motion.div>
  ))}
</div>
<div className="mt-24 text-center">

</div>

<div className="mt-12 flex gap-5 overflow-x-auto scroll-smooth pb-4 md:grid md:grid-cols-3 md:overflow-visible">
</div>
      <section id="local" className="mx-auto max-w-6xl px-5 py-16">
        <div className="rounded-[2rem] bg-[#1f1a18] p-8 shadow-xl md:flex md:items-center md:justify-between">
          <div>
            <p className="flex items-center gap-2 font-bold text-orange-700">
              <MapPin size={18} />
              Onde estamos
            </p>

            <h2 className="mt-3 text-3xl font-black">
              Rua Professor Saturnino, Nazaré
              
            </h2>

            <p className="mt-3 text-stone-300">
              Delivery e retirada,

                             
                             faça já seu pedido!
            
              
        
            </p>
          </div>

        </div>
      </section>

<footer className="border-t border-orange-100 px-5 py-8 text-center text-sm text-stone-300">
  © 2026 Hamburgueria Delivery.
</footer>

</main>
  );
}