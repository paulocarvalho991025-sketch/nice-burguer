import React, { useState } from "react";
import { ShoppingBag, MessageCircle, Star, Clock, MapPin, Menu, X } from "lucide-react";
import { motion } from "framer-motion";

export default function SiteSanduiches() {
  const [menuAberto, setMenuAberto] = useState(false);

  const whatsapp = "5584997063345"; // troque pelo seu número com DDD
  const mensagem = encodeURIComponent("Olá! Quero fazer um pedido de sanduíche.");
  const linkWhatsapp = `https://wa.me/${whatsapp}?text=${mensagem}`;

  const produtos = [
    {
      nome: "Hambúrguer Artesanal",
      descricao: "Pão macio, carne suculenta, queijo mussarela derretido e molho especial.",
      preco: "R$ 9,99",
      destaque: true,
    },
    {
      nome: "Combo Especial",
      descricao: "Hambúrguer Artesanal + Suco 300ml.",
      preco: "R$ 11,99",
      destaque: true,
    },
    {
      nome: "Pastel de Carne",
      descricao: "Pastel crocante, bem recheado e feito na hora.",
      preco: "R$ 3,99",
      destaque: false,
    },
    {
      nome: "Pastel de Frango",
      descricao: "Massa sequinha, recheio cremoso e sabor marcante.",
      preco: "R$ 3,99",
      destaque: false,
    },
    {
      nome: "Pastel de Queijo",
      descricao: "Queijo derretido, massa dourada e textura crocante.",
      preco: "R$ 3,99",
      destaque: false,
    },
    {
      nome: "Enroladinho",
      descricao: "Salsicha inteira, massa fofinha por dentro e crocante por fora.",
      preco: "R$ 2,99",
      destaque: false,
    },
  ];

  return (
    <main className="min-h-screen bg-[#fff8ec] text-[#2b1a12]">
      <header className="sticky top-0 z-50 border-b border-orange-100 bg-[#fff8ec]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <a href="#inicio" className="text-xl font-black tracking-tight text-orange-700">
            Lanches da Casa
          </a>

          <nav className="hidden items-center gap-7 text-sm font-semibold md:flex">
            <a href="#cardapio" className="hover:text-orange-700">Cardápio</a>
            <a href="#combos" className="hover:text-orange-700">Combos</a>
            <a href="#local" className="hover:text-orange-700">Localização</a>
            <a href={linkWhatsapp} className="rounded-full bg-orange-600 px-5 py-2 text-white shadow hover:bg-orange-700">
              Pedir agora
            </a>
          </nav>

          <button className="md:hidden" onClick={() => setMenuAberto(!menuAberto)}>
            {menuAberto ? <X /> : <Menu />}
          </button>
        </div>

        {menuAberto && (
          <div className="border-t border-orange-100 bg-white px-5 py-4 md:hidden">
            <div className="flex flex-col gap-4 font-semibold">
              <a href="#cardapio" onClick={() => setMenuAberto(false)}>Cardápio</a>
              <a href="#combos" onClick={() => setMenuAberto(false)}>Combos</a>
              <a href="#local" onClick={() => setMenuAberto(false)}>Localização</a>
              <a href={linkWhatsapp} className="rounded-full bg-orange-600 px-5 py-3 text-center text-white">Pedir pelo WhatsApp</a>
            </div>
          </div>
        )}
      </header>

      <section id="inicio" className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:py-24">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="mb-4 inline-flex rounded-full bg-orange-100 px-4 py-2 text-sm font-bold text-orange-700">
            Sanduíches, pastéis e combos fresquinhos
          </p>
          <h1 className="text-4xl font-black leading-tight md:text-6xl">
            Lanche gostoso, preço justo e pedido fácil pelo WhatsApp.
          </h1>
          <p className="mt-5 text-lg leading-8 text-[#6d4a38]">
            Cardápio simples, comida bem feita e atendimento rápido para quem quer comer bem sem complicação.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href={linkWhatsapp} className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-600 px-7 py-4 font-bold text-white shadow-lg hover:bg-orange-700">
              <MessageCircle size={20} /> Fazer pedido
            </a>
            <a href="#cardapio" className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-orange-600 px-7 py-4 font-bold text-orange-700 hover:bg-orange-50">
              Ver cardápio
            </a>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="rounded-[2rem] bg-gradient-to-br from-orange-500 to-amber-300 p-6 shadow-2xl">
          <div className="rounded-[1.5rem] bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-bold text-orange-700">Mais pedido</span>
              <span className="text-2xl font-black text-orange-700">R$ 9,99</span>
            </div>
            <div className="flex aspect-square items-center justify-center rounded-[1.5rem] bg-[#fff1d6] text-center text-7xl shadow-inner">
              🍔
            </div>
            <h2 className="mt-5 text-2xl font-black">Hambúrguer Artesanal</h2>
            <p className="mt-2 text-[#6d4a38]">Mussarela derretida, carne suculenta e molho especial da casa.</p>
          </div>
        </motion.div>
      </section>

      <section className="bg-white py-10">
        <div className="mx-auto grid max-w-6xl gap-4 px-5 md:grid-cols-3">
          <div className="rounded-2xl bg-[#fff8ec] p-5 shadow-sm">
            <Clock className="mb-3 text-orange-600" />
            <h3 className="font-black">Pedido rápido</h3>
            <p className="mt-2 text-sm text-[#6d4a38]">Clique no botão e peça direto pelo WhatsApp.</p>
          </div>
          <div className="rounded-2xl bg-[#fff8ec] p-5 shadow-sm">
            <Star className="mb-3 text-orange-600" />
            <h3 className="font-black">Sabor caseiro</h3>
            <p className="mt-2 text-sm text-[#6d4a38]">Lanches preparados com cuidado e ingredientes selecionados.</p>
          </div>
          <div className="rounded-2xl bg-[#fff8ec] p-5 shadow-sm">
            <ShoppingBag className="mb-3 text-orange-600" />
            <h3 className="font-black">Combos econômicos</h3>
            <p className="mt-2 text-sm text-[#6d4a38]">Opções para comer bem gastando pouco.</p>
          </div>
        </div>
      </section>

      <section id="cardapio" className="mx-auto max-w-6xl px-5 py-16">
        <div className="mb-10 text-center">
          <p className="font-bold text-orange-700">Cardápio</p>
          <h2 className="text-3xl font-black md:text-4xl">Escolha seu lanche</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {produtos.map((produto) => (
            <div key={produto.nome} className={`rounded-3xl border p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${produto.destaque ? "border-orange-300 bg-orange-50" : "border-orange-100 bg-white"}`}>
              <div className="mb-4 flex h-32 items-center justify-center rounded-2xl bg-[#fff1d6] text-5xl">
                {produto.nome.includes("Hambúrguer") || produto.nome.includes("Combo") ? "🍔" : produto.nome.includes("Pastel") ? "🥟" : "🌭"}
              </div>
              <h3 className="text-xl font-black">{produto.nome}</h3>
              <p className="mt-2 min-h-16 text-sm leading-6 text-[#6d4a38]">{produto.descricao}</p>
              <div className="mt-5 flex items-center justify-between">
                <span className="text-2xl font-black text-orange-700">{produto.preco}</span>
                <a href={linkWhatsapp} className="rounded-full bg-orange-600 px-4 py-2 text-sm font-bold text-white hover:bg-orange-700">
                  Pedir
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="combos" className="bg-[#2b1a12] py-16 text-white">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mb-10 text-center">
            <p className="font-bold text-orange-300">Promoções</p>
            <h2 className="text-3xl font-black md:text-4xl">Combos para vender mais</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div className="rounded-3xl bg-white/10 p-6 shadow-xl backdrop-blur">
              <h3 className="text-2xl font-black">Combo Especial</h3>
              <p className="mt-3 text-orange-100">Hambúrguer Artesanal + Suco 300ml.</p>
              <p className="mt-6 text-3xl font-black text-orange-300">R$ 11,99</p>
            </div>
            <div className="rounded-3xl bg-orange-500 p-6 text-[#2b1a12] shadow-xl">
              <h3 className="text-2xl font-black">Combo Econômico</h3>
              <p className="mt-3">Enroladinho + Dore Uva.</p>
              <p className="mt-6 text-3xl font-black">Monte seu preço</p>
            </div>
            <div className="rounded-3xl bg-white/10 p-6 shadow-xl backdrop-blur">
              <h3 className="text-2xl font-black">Combo Imperdível</h3>
              <p className="mt-3 text-orange-100">Na compra de 3 pastéis, bebida por apenas R$ 0,99.</p>
              <p className="mt-6 text-3xl font-black text-orange-300">Oferta limitada</p>
            </div>
          </div>
        </div>
      </section>

      <section id="local" className="mx-auto max-w-6xl px-5 py-16">
        <div className="rounded-[2rem] bg-white p-8 shadow-xl md:flex md:items-center md:justify-between">
          <div>
            <p className="flex items-center gap-2 font-bold text-orange-700"><MapPin size={18} /> Onde estamos</p>
            <h2 className="mt-3 text-3xl font-black">Atendimento por encomenda e retirada.</h2>
            <p className="mt-3 text-[#6d4a38]">Troque este texto pelo endereço, bairro, ponto de referência ou área de entrega.</p>
          </div>
          <a href={linkWhatsapp} className="mt-6 inline-flex rounded-full bg-orange-600 px-7 py-4 font-bold text-white shadow hover:bg-orange-700 md:mt-0">
            Chamar no WhatsApp
          </a>
        </div>
      </section>

      <footer className="border-t border-orange-100 px-5 py-8 text-center text-sm text-[#6d4a38]">
        © 2026 Lanches da Casa. Feito para vender mais pelo WhatsApp.
      </footer>
    </main>
  );
}
