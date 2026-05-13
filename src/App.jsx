import React, { useState, useEffect } from "react";import { ShoppingBag, MessageCircle, Star, Clock, MapPin, Menu, X } from "lucide-react";
import { motion } from "framer-motion";

export default function App() {
const [menuAberto, setMenuAberto] = useState(false);

const [carrinho, setCarrinho] = useState(() => {
  const carrinhoSalvo = localStorage.getItem("carrinho");

  return carrinhoSalvo
    ? JSON.parse(carrinhoSalvo)
    : [];
});

const [carrinhoAberto, setCarrinhoAberto] = useState(false);
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

useEffect(() => {
  localStorage.setItem("trocoPara", trocoPara);
}, [trocoPara]);
useEffect(() => {
  
  
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
}, [carrinho]);
const taxaEntrega = 3;

const totalCarrinho = carrinho.reduce((total, item) => {
  const valor = Number(item.preco.replace("R$", "").replace(",", ".").trim());
  return total + valor;
}, 0);

const totalFinal = totalCarrinho + taxaEntrega;

function adicionarAoCarrinho(produto) {
  setCarrinho((atual) => [...atual, produto]);
}

function removerDoCarrinho(index) {
  setCarrinho((atual) => atual.filter((_, i) => i !== index));
}

const mensagemPedido = encodeURIComponent(`
🍔 NOVO PEDIDO - NICE BURGUER

🛒 ITENS:
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

💰 TOTAL DOS ITENS: R$ ${totalCarrinho.toFixed(2).replace(".", ",")}
🛵 TAXA DE ENTREGA: R$ ${taxaEntrega.toFixed(2).replace(".", ",")}
💵 TOTAL FINAL: R$ ${totalFinal.toFixed(2).replace(".", ",")}

📍 ENDEREÇO:
${endereco || "Não informado"}

💳 PAGAMENTO:
${pagamento || "Não informado"}

${pagamento === "Dinheiro" ? `💸 TROCO PARA: R$ ${trocoPara || "Não informado"}` : ""}

📝 OBSERVAÇÃO:
${observacao || "Nenhuma"}
`);

const linkWhatsapp = `https://wa.me/5584997063345?text=${mensagemPedido}`;
const produtos = [

  {
    nome: "Burguer 1.0",
    descricao: "Pão Brioche, Blend Bovino 80g, Queijo Mussarela, e Molho da casa.",
    preco: "R$ 9,99",
    imagem:"/img/1.0.png",
  },
  {
    nome: "Burguer 2.0",
    descricao: "Pão Brioche, Blend Bovino 80g, Queijo Mussarela, Picles, Aneis de Cebola Empanada, Cebola Caramelizada  e Molho da casa.",
    preco: "R$ 14,99",
    imagem: "/img/2.0.png"
  },
  {
    nome: "Burguer 3.0",
    descricao: "Pão Brioche, 2 Blend Bovino 80g, 2 Fatias de Queijo Mussarela, Bacon, Picles, Aneis de Cebola Empanada, Cebola Caramelizada e Molho da casa.",
    preco: "R$ 21,99",
    imagem: "/img/novo3.0.png"
  },
  {
    nome: "Coca-Cola Garrafinha 250ml",
    descricao: "Coca-Cola Garrafinha 250ml",
    preco: "R$ 3,99",
    imagem: "/img/coca250.png"
  },
{
    nome: "Coca-Cola Lata 350 ml",
    descricao: "Coca-Cola Lata 350 ml",
    preco: "R$ 5,99",
    imagem: "/img/coca coca.png",
  },{
    nome: "Coca-Cola Garrafa 1 Litro",
    descricao: "oca-Cola Garrafa 1 Litro",
    preco: "R$ 9,99",
    imagem: "/img/coca1.png",
  },
]; 
const combos = [
  {
    nome: "Combo Prime",
    descricao: "Burguer 1.0 + Coca-Cola Garrafinha 250ml",
    preco: "R$ 13,98",
    imagem: "/img/Combo Prime1.png",
  },
  {
    nome: "Combo Street",
    descricao: "Burguer 2.0 + Coca Lata 350ml",
    preco: "R$ 20,98",
    imagem: "/img/Combo Street2.png",
    
  },
  {
    nome: "Combo Turbo",
    descricao: "Burguer 1.0 + Burguer 2.0 + Coca-Cola 1 Litro",
    preco: "R$ 34,97",
    imagem: "/img/Combo Turbo1.png",
  },
];
    function adicionarAoCarrinho(produto) {
  setCarrinho((atual) => [...atual, produto]);
}
return (
  <main className="min-h-screen bg-[#f6f0e7] relative overflow-hidden">
    <div className="absolute inset-0 opacity-20 pointer-events-none">
      <div className="absolute top-0 left-6 h-[500px] w-[500px] rounded-full bg-orange-500 blur-[140px]" />
      <div className="absolute bottom-6 right-6 h-[400px] w-[400px] rounded-full bg-red-500 blur-[140px]" />
      <div className="absolute top-[40%] left-[40%] h-[300px] w-[300px] rounded-full bg-yellow-400 blur-[120px]" />
    </div>

    <header className="sticky top-0 z-50 border-b bg-orange-50/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <a href="#inicio" className="text-xl font-black text-orange-700">
          NiceBurguer!
        </a>

        <nav className="hidden items-center gap-7 text-sm font-semibold md:flex">
          <a href="#cardapio" className="hover:text-orange-700">Cardápio</a>
          <a href="#combos" className="hover:text-orange-700">Combos</a>
          <a href="#local" className="hover:text-orange-700">Localização</a>
        </nav>

        <button className="md:hidden" onClick={() => setMenuAberto(!menuAberto)}>
          {menuAberto ? <X /> : <Menu />}
        </button>
      </div>

</header>
  
<div className="fixed right-2 top-20 z-50">
<button
  onClick={() => setCarrinhoAberto(!carrinhoAberto)}
className="flex items-center justify-center gap-2 rounded-full bg-orange-600 px-4 py-3 text-lg font-black text-white shadow-xl transition hover:scale-105">
  <ShoppingBag size={22} />
  <span>{carrinho.length}</span>
</button>
  {carrinhoAberto && (
    <div className="mt-3 max-h-[70vh] overflow-y-auto rounded-3xl border border-orange-100 bg-white p-5 shadow-2xl">

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
      <div key={index} className="mb-3 rounded-xl bg-orange-50 p-3">
<p className="font-bold">
  {item.quantidade}x {item.nome}
</p>
<p className="text-sm text-stone-600">
  R$ {item.total.toFixed(2).replace(".", ",")}
</p>
        <button
          onClick={() => removerDoCarrinho(index)}
          className="mt-2 text-xs font-bold text-red-500 hover:text-red-700"
        >
          Remover
        </button>
      </div>
    ))
  )}
</div>

<div className="mt-4 border-t pt-4">
  <p className="text-lg font-black text-orange-700">
    Total: R$ {totalCarrinho.toFixed(2).replace(".", ",")}
  </p>
</div>

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
  className="mt-3 w-full rounded-xl border border-orange-200 p-3 text-sm outline-none focus:border-orange-500"
>
  <option value="">Forma de pagamento</option>
  <option value="Pix">Pix</option>
  <option value="Dinheiro">Dinheiro</option>
  <option value="Cartão">Cartão</option>
</select>

{pagamento === "Dinheiro" && (
  <input
    type="text"
    value={trocoPara}
    onChange={(e) => setTrocoPara(e.target.value)}
    placeholder="Troco para quanto?"
    className="mt-3 w-full rounded-xl border border-orange-200 p-3 text-sm outline-none focus:border-orange-500"
  />
)}
<textarea
  value={observacao}
  onChange={(e) => setObservacao(e.target.value)}
  placeholder="Observação do pedido"
  className="mt-3 w-full rounded-xl border border-orange-200 p-3 text-sm outline-none focus:border-orange-500"
/>


<a
  href={`https://wa.me/5584997063345?text=${encodeURIComponent(`
🍔 NOVO PEDIDO - NICE BURGUER

🛒 ITENS:
${Object.values(
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
)
  .map(
    (item) =>
      `${item.quantidade}x ${item.nome} - R$ ${item.total
        .toFixed(2)
        .replace(".", ",")}`
  )
  .join("\n")}

  💰 TOTAL: R$ ${totalCarrinho.toFixed(2).replace(".", ",")}

📍 ENDEREÇO:
${endereco || "Não informado"}

💳 PAGAMENTO:
${pagamento || "Não informado"}

📝 OBSERVAÇÃO:
${observacao || "Nenhuma"}
`)}`}

  href={`https://wa.me/5584997063345?text=${encodeURIComponent(`
🍔 NOVO PEDIDO - NICE BURGUER

🛒 ITENS:
${Object.values(
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
)
  .map(
    (item) =>
      `${item.quantidade}x ${item.nome} - R$ ${item.total
        .toFixed(2)
        .replace(".", ",")}`
  )
  .join("\n")}

  💰 TOTAL: R$ ${totalCarrinho.toFixed(2).replace(".", ",")}

📍 ENDEREÇO:
${endereco || "Não informado"}

💳 PAGAMENTO:
${pagamento || "Não informado"}

📝 OBSERVAÇÃO:
${observacao || "Nenhuma"}
`)}`}
  target="_blank"
  rel="noreferrer"
  className="mt-4 block w-full rounded-xl bg-orange-600 py-3 text-center font-bold text-white hover:bg-orange-700"
>
  Finalizar Pedido
</a>

    </div>
  )}
</div>

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
          <p className="mb-4 inline-flex rounded-full bg-orange-500 px-4 py-2 text-sm font-bold text-orange-9900">
            Hamburguer Artesanal
          </p>

          <div className="flex flex-col items-center justify-center">
  <img
    src="/img/NiceBurguer.jpeg"
    alt="Nice Burguer"
    className="h-85 w-85 rounded-full object-cover shadow-lg"
  />

  <h1 className="text-2xl font-black text-orange-100">
  
  </h1>
</div>
<p
  className="mt-5 text-5xl text-black-700"
  style={{ fontFamily: "Kaushan Script" }}
>
  O Burguer que você merece!
</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          

            <a
              href="#cardapio"
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-orange-600 px-7 py-4 font-bold text-orange-700 hover:bg-orange-100"
            >
              Ver cardápio
            </a>
            
          </div>
          </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="rounded-[2rem] bg-gradient-to-br from-orange-500 to-amber-300 p-6 shadow-1xl"
        >
          <div className="rounded-[1.5rem] bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-bold text-orange-700">
                O Mais Pedido
              </span>
              <span className="text-2xl font-black text-orange-700">R$ 14,99</span>
            </div><div className="mb-5 flex h-[280px] items-center justify-center overflow-hidden rounded-[1.5rem] bg-orange-100">
  <img
    src="/img/2.0.png"
    alt="Burguer 2.0"
    className="max-h-[250px] w-auto object-contain"
  />
</div>
            <h2 className="mt-5 text-2xl font-black">Burguer 2.0</h2>
            <p className="mt-2 text-stone-700">
              Pão Brioche, Blend Bovino 80g, Queijo Mussarela, Picles, Aneis de Cebola Empanada, Cebola Caramelizada e Molho da casa.
            </p>
          </div>
        </motion.div>
      </section>

      <section className="bg-white py-10">
        <div className="mx-auto grid max-w-6xl gap-4 px-5 md:grid-cols-3">
          <div className="rounded-2xl bg-orange-50 p-5 shadow-sm">
            <Clock className="mb-3 text-orange-600" />
            <h3 className="font-black">Pedido rápido</h3>
            <p className="mt-2 text-sm text-stone-700">
              Clique no botão e peça direto pelo WhatsApp.
            </p>
          </div>

          <div className="rounded-2xl bg-orange-50 p-5 shadow-sm">
            <Star className="mb-3 text-orange-600" />
            <h3 className="font-black">Sabor caseiro</h3>
            <p className="mt-2 text-sm text-stone-700">
              Lanches preparados com cuidado e ingredientes selecionados.
            </p>
          </div>

          <div className="rounded-2xl bg-orange-50 p-5 shadow-sm">
            <ShoppingBag className="mb-3 text-orange-600" />
            <h3 className="font-black">Combos econômicos</h3>
            <p className="mt-2 text-sm text-stone-700">
              Opções para comer bem gastando pouco.
            </p>
          </div>
        </div>
      </section>
<section id="cardapio" className="mx-auto max-w-6xl px-5 py-16">
  <div className="mb-10 text-center">
    <p className="font-bold text-orange-700">Cardápio</p>
    <h2 className="text-3xl font-black md:text-4xl">Escolha Seu Burguer</h2>
  </div>

  <div className="grid gap-5 md:grid-cols-3">
<>
{produtos.map((produto) => (      <div
        key={produto.nome}
        className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
      >
        <div className="relative mb-4 flex h-40 items-center justify-center overflow-hidden rounded-2xl bg-orange-100">
  <img
    src={produto.imagem}
    alt=""
    className="absolute inset-0 h-full w-full object-cover opacity-30 blur-md scale-110"
  />

  <img
    src={produto.imagem}
    alt={produto.nome}
    className="relative z-10 h-full w-auto object-contain"
  />
</div>

        <h3 className="text-xl font-black">{produto.nome}</h3>

        <p className="mt-2 min-h-16 text-sm leading-6 text-stone-700">
          {produto.descricao}
        </p>

        <div className="mt-5 flex items-center justify-between">
          <span className="text-2xl font-black text-orange-700">
            {produto.preco}
          </span>
<button
  type="button"
  onClick={() => adicionarAoCarrinho(produto)}
  className="rounded-full bg-orange-600 px-4 py-2 text-sm font-bold text-white hover:bg-orange-700"
>
  Adicionar
</button>
        </div>
      </div>
  ))}
</>

  </div>
</section>
      <section id="combos" className="bg-stone-900 py-16 text-white">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mb-10 text-center">
            <p className="font-bold text-orange-300">Em Nossa Hamburgueria Delivery </p>
            <h2 className="text-3xl font-black md:text-4xl">Você aproveita o melhor do hamburguer artesanal com um ótimo custo beneficio!</h2>
          </div>

<div className="grid gap-5 md:grid-cols-3">
  {combos.map((combo) => (
    <div
  key={combo.nome}
  className="relative min-h-[420px] overflow-hidden rounded-3xl bg-white/10 pt-0 px-6 pb-6 shadow-xl backdrop-blur"
>
  <img
    src={combo.imagem}
    alt={combo.nome}
    className="absolute inset-0 h-full w-full object-cover opacity-15 pointer-events-none"
  />

  <h3 className="relative z-10 mt-14 rounded-full bg-orange-600 px-6 py-3 text-lg font-black text-white shadow-2xl transition hover:scale-105 hover:bg-orange-500">
    {combo.nome}
  </h3>



      <button
        type="button"
        onClick={() => adicionarAoCarrinho(combo)}
        className="mt-4 rounded-full bg-orange-600 px-4 py-2 text-sm font-bold text-white hover:bg-orange-700"
      >
        Adicionar
      </button>
    </div>
  ))}
</div>
</div>
      </section>

      <section id="local" className="mx-auto max-w-6xl px-5 py-16">
        <div className="rounded-[2rem] bg-white p-8 shadow-xl md:flex md:items-center md:justify-between">
          <div>
            <p className="flex items-center gap-2 font-bold text-orange-700">
              <MapPin size={18} />
              Onde estamos
            </p>

            <h2 className="mt-3 text-3xl font-black">
              Rua professor saturnino 196
              
            </h2>

            <p className="mt-3 text-stone-700">
              Atendimento por encomenda e retirada,

                             
                             faça já seu pedido!
            
              
        
            </p>
          </div>

          <a
            href={linkWhatsapp}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex rounded-full bg-orange-600 px-7 py-4 font-bold text-white shadow hover:bg-orange-700 md:mt-0"
          >
            Chamar no WhatsApp
          </a>
        </div>
      </section>

<footer className="border-t border-orange-100 px-5 py-8 text-center text-sm text-stone-700">
  © 2026 Hamburgueria Delivery.
</footer>

</main>
  );
}