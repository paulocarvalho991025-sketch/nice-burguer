import React, { useState } from "react";
import { ShoppingBag, MessageCircle, Star, Clock, MapPin, Menu, X } from "lucide-react";
import { motion } from "framer-motion";

export default function App() {
  const [menuAberto, setMenuAberto] = useState(false);
  const [carrinho, setCarrinho] = useState([]);
  function adicionarAoCarrinho(produto) {
  setCarrinho((atual) => [...atual, produto]);
}
  const whatsapp = "5584997063345";
  const mensagem = encodeURIComponent("Olá! Quero fazer um pedido de hamburguer artesanal.");
  const linkWhatsapp = `https://wa.me/${whatsapp}?text=${mensagem}`;

  const produtos = [
  {
    nome: "Burguer 1.0",
    descricao: "Pão Brioche, Blend Bovino 65g, Queijo Mussarela, e Molho da casa.",
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
    descricao: "Pão Brioche, 2 Blend Bovino 80g, Fatias de Queijo Cheddar, Bacon, Picles, Aneis de Cebola Empanada, Cebola Caramelizada e Molho da casa.",
    preco: "R$ 21,99",
    imagem: "/img/3333.png"
  },
  {
    nome: "Coca-Cola Lata 350ml",
    descricao: "Coca-Cola Lata 350ml",
    preco: "R$ 3,99",
    imagem: "/img/coca coca.png"
  },
{
    nome: "Coca-Cola 600 ml",
    descricao: "Coca-Cola 600 ml",
    preco: "R$ 5,99",
    imagem: "/img/coca600.png",
  },{
    nome: "Coca-Cola 1 Litro",
    descricao: "Coca-Cola 1 Litro",
    preco: "R$ 8,99",
    imagem: "/img/coca1.png",
  },
]; 
    function adicionarAoCarrinho(produto) {
  setCarrinho((atual) => [...atual, produto]);
}
  return (
    <main className="min-h-screen bg-[#f6f0e7] relative overflow-hidden">
      <header className="sticky top-0 z-50 border-b bg-orange-50/90 backdrop-blur">ame="absolute top-[40%] left-[40%] h-[300px] w-[300px] rounded-full bg-yellow-400 blur-[120px]" /
          <a href="#inicio" className="text-xl font-black text-orange-700">
            NiceBurguer!
          </a>
  <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-orange-500 blur-[140px]" />
  
  <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-red-500 blur-[140px]" />

  <div className="hidden items-center gap-7 text-sm font-semibold md:flex">
  <a href="#cardapio" className="hover:text-orange-700">
    Cardápio
  </a>

  <a href="#combos" className="hover:text-orange-700">
    Combos
  </a>

  <a href="#local" className="hover:text-orange-700">
    Localização
  </a>

  <a
    href={linkWhatsapp}
    target="_blank"
    rel="noreferrer"
    className="rounded-full bg-orange-600 px-5 py-2 text-white shadow hover:bg-orange-700"
  >
    Pedir agora
  </a>
</div>
      </header>
      <div className="fixed right-5 top-24 z-50 w-72 rounded-3xl bg-white p-5 shadow-2xl border border-orange-100">
  <h2 className="text-2xl font-black text-orange-700">
    Carrinho ({carrinho.length})
  </h2>

  <div className="mt-4 max-h-64 overflow-y-auto">
    {carrinho.length === 0 ? (
      <p className="text-sm text-stone-500">
        Nenhum item ainda.
      </p>
    ) : (
      carrinho.map((item, index) => (
        <div
          key={index}
          className="mb-3 rounded-xl bg-orange-50 p-3"
        >
          <p className="font-bold">
            {item.nome}
          </p>

          <p className="text-sm text-stone-600">
            {item.preco}
          </p>
        </div>
      ))
    )}
  </div>
</div>
      <section id="inicio" className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="mb-4 inline-flex rounded-full bg-orange-500 px-4 py-2 text-sm font-bold text-orange-9900">
            Hamburguer Artesanal
          </p>

          <div className="flex items-center gap-3">
  <img
    src="/img/NiceBurguer.jpeg"
    alt="Nice Burguer"
    className="h-64 w-64 rounded-full object-cover shadow-lg"
  />

  <h1 className="text-2xl font-black text-orange-100">
  
  </h1>
</div>
          <p className="mt-5 text-lg leading-8 text-stone-600">
             O Hamburguer que voce merece!
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={linkWhatsapp}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-600 px-7 py-4 font-bold text-white shadow-lg hover:bg-orange-700"
            >
              <MessageCircle size={20} />
              Fazer pedido
            </a>

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
          className="rounded-[2rem] bg-gradient-to-br from-orange-500 to-amber-300 p-6 shadow-2xl"
        >
          <div className="rounded-[1.5rem] bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-bold text-orange-700">
                O Mais Pedido

            
              </span>
              <span className="text-2xl font-black text-orange-700">R$ 9,99</span>
            </div>

            <div className="flex aspect-square items-center justify-center overflow-hidden rounded-[1.5rem] bg-orange-100 shadow-inner">
  <img
    src="/img/burguer 1.0 att.png"
    alt="Hambúrguer Artesanal"
    className="h-full w-full object-contain"
  />
</div>

            <h2 className="mt-5 text-2xl font-black">Burguer 1.0</h2>
            <p className="mt-2 text-stone-700">
              Mussarela derretida, carne suculenta e molho especial da casa.
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
          {produtos.map((produto) => (
            <div
              key={produto.nome}
              className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="mb-4 flex h-100 items-center justify-center rounded-2xl bg-orange-100 text-6xl">
                <img
 src={produto.imagem}
  alt="Hambúrguer"
  className="h-full w-full object-cover"
/>
              </div>=

              <h3 className="text-xl font-black">{produto.nome}</h3>

              <p className="mt-2 min-h-16 text-sm leading-6 text-stone-700">
                {produto.descricao}
              </p>

              <div className="mt-5 flex items-center justify-between">
                <span className="text-2xl font-black text-orange-700">{produto.preco}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="combos" className="bg-stone-900 py-16 text-white">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mb-10 text-center">
            <p className="font-bold text-orange-300">Promoções</p>
            <h2 className="text-3xl font-black md:text-4xl">Combos Especiais!</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div className="rounded-3xl bg-white/10 p-6 shadow-xl backdrop-blur">
              <h3 className="text-2xl font-black">Combo Essencial</h3>
              <p className="mt-3 text-orange-100">
                Burguer 1.0 + Coca Lata
              </p>
              <p className="mt-6 text-3xl font-black text-orange-300">R$ 12,99</p>
            </div>

            <div className="rounded-3xl bg-orange-500 p-6 text-stone-900 shadow-xl">
              <h3 className="text-2xl font-black">Combo Econômico</h3>
              <p className="mt-3">Burguer 2.0 + Coca Lata</p>
              <p className="mt-6 text-3xl font-black">R$ 17,99</p>
            </div>

            <div className="rounded-3xl bg-white/10 p-6 shadow-xl backdrop-blur">
              <h3 className="text-2xl font-black">Combo Imperdível</h3>
              <p className="mt-3 text-orange-100">
                2 Burguer's 1.0 + Coca-Cola 1 Litro
              </p>
              <p className="mt-6 text-3xl font-black text-orange-300">R$25,99</p>
            </div>
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
