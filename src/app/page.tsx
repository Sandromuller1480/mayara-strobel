"use client";

import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  Camera,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Heart,
  LayoutDashboard,
  Laptop,
  Menu,
  MessageCircle,
  MoreHorizontal,
  Play,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
  ChevronRight,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, startTransition, useEffect, useMemo, useState } from "react";

type Request = { name: string; event: string; date: string; city: string; people: string; status: string };
type DemoState = {
  enrolled: string[];
  completed: string[];
  lastLesson: string;
  bookings: string[];
  waitlist: string[];
  requests: Request[];
  published: boolean;
  reported: boolean;
  hidden: boolean;
  moderationNote: string;
  replies: string[];
};

const STORAGE_KEY = "mayara-strobel-demo-v1";
const initialState: DemoState = {
  enrolled: [],
  completed: [],
  lastLesson: "Pele preparada: o segredo da durabilidade",
  bookings: [],
  waitlist: [],
  requests: [],
  published: false,
  reported: false,
  hidden: false,
  moderationNote: "",
  replies: [],
};

const courses = [
  { id: "pele", title: "Pele blindada, acabamento natural", category: "CURSO ONLINE", lessons: 12, length: "4h 20min", level: "Iniciante", price: "R$ 297", image: "/media/portfolio/foto-01-modelo-01.jpg", description: "Uma pele impecável que continua parecendo pele. Do preparo à finalização, com técnicas que funcionam na vida real." },
  { id: "olhos", title: "Olhos que contam histórias", category: "CURSO ONLINE", lessons: 9, length: "3h 10min", level: "Intermediário", price: "R$ 247", image: "/media/portfolio/foto-02-modelo-02.jpg", description: "Construa profundidade, escolha cores com intenção e aprenda a adaptar cada técnica ao formato dos olhos." },
];
const classes = [
  { id: "auto", title: "Automaquiagem sem mistério", date: "22 NOV", time: "09:00 — 13:00", place: "Ateliê Mayara · Cuiabá, MT", seats: 8, booked: 5, label: "ÚLTIMAS VAGAS" },
  { id: "pro", title: "Imersão pele profissional", date: "29 NOV", time: "08:30 — 17:30", place: "Ateliê Mayara · Cuiabá, MT", seats: 10, booked: 10, label: "LISTA DE ESPERA" },
  { id: "noiva", title: "Especialização em noivas", date: "06 DEZ", time: "09:00 — 17:00", place: "Ateliê Mayara · Cuiabá, MT", seats: 12, booked: 7, label: "5 VAGAS" },
];
const projects = [
  { title: "Luz de fim de tarde", type: "Coleção 01", image: "/media/portfolio/foto-01-modelo-01.jpg" },
  { title: "Um toque de rosa", type: "Coleção 02", image: "/media/portfolio/foto-02-modelo-01.jpg" },
  { title: "Clássica, sempre", type: "Coleção 03", image: "/media/portfolio/foto-03-modelo-01.jpg" },
  { title: "Dourado que ilumina", type: "Coleção 04", image: "/media/portfolio/foto-04-modelo-01.jpg" },
];
const articles = [
  { title: "Sua pele, só que ainda mais bonita", category: "PELE", time: "6 min de leitura", image: "/media/editorial/blog.jpg" },
  { title: "O nécessaire inteligente: menos é mais", category: "PRODUTOS", time: "4 min de leitura", image: "/media/portfolio/foto-03-modelo-02.jpg" },
  { title: "Maquiagem de noiva que continua sendo você", category: "NOIVAS", time: "8 min de leitura", image: "/media/portfolio/foto-01-modelo-03.jpg" },
];
const draftArticle = {
  title: "O batom que combina com você",
  category: "INSPIRAÇÃO",
  time: "5 min de leitura",
  image: "/media/portfolio/foto-04-modelo-02.jpg",
};
const forumTopics = [
  { title: "Qual a ordem certa dos produtos na preparação de pele?", tag: "TÉCNICAS", replies: 12, author: "Camila R." },
  { title: "Compartilhe aqui o resultado da aula de esfumado ✨", tag: "RESULTADOS", replies: 8, author: "Luiza M." },
  { title: "Pincéis essenciais para quem está começando", tag: "DÚVIDAS DE AULA", replies: 5, author: "Ana P." },
];

function readState(): DemoState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? { ...initialState, ...JSON.parse(saved) } : initialState;
  } catch (error) {
    console.error("Não foi possível recuperar os dados desta demonstração.", error);
    return initialState;
  }
}

function Button({ children, className = "", onClick, type = "button", disabled = false }: {
  children: React.ReactNode; className?: string; onClick?: () => void; type?: "button" | "submit"; disabled?: boolean;
}) {
  return <button type={type} disabled={disabled} onClick={onClick} className={`btn3d ${className}`}>{children}</button>;
}

function SectionTitle({ eyebrow, title, copy, link }: { eyebrow: string; title: string; copy?: string; link?: string }) {
  return <div className="section-title"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{copy && <p>{copy}</p>}</div>{link && <Link className="text-link" href={link}>Ver tudo <ArrowRight size={15} /></Link>}</div>;
}

export default function Home() {
  const [data, setData] = useState<DemoState>(initialState);
  const [ready, setReady] = useState(false);
  const [path, setPath] = useState("/");
  const [filter, setFilter] = useState("Todos");
  const [modal, setModal] = useState<{ kind: "course" | "project" | "article"; id: string } | { kind: "request" } | null>(null);
  const [notice, setNotice] = useState("");
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    const onInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("popstate", onPop);
    window.addEventListener("beforeinstallprompt", onInstall);
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js").catch((error: unknown) => {
        console.error("Não foi possível habilitar o modo offline.", error);
      });
    }
    startTransition(() => {
      setData(readState());
      setPath(window.location.pathname);
      setReady(true);
    });
    return () => {
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("beforeinstallprompt", onInstall);
    };
  }, []);

  useEffect(() => {
    const sectionByPath: Record<string, string> = {
      "/sobre": "sobre",
      "/cursos": "cursos",
      "/portfolio": "portfolio",
      "/blog": "blog",
      "/turmas": "turmas",
      "/eventos": "cursos",
    };
    if (path === "/") return;
    const section = sectionByPath[path];
    if (section) window.setTimeout(() => document.getElementById(section)?.scrollIntoView(), 80);
  }, [path]);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data, ready]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 3400);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (!mobileMenu) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenu(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [mobileMenu]);

  const update = (fn: (previous: DemoState) => DemoState) => setData((previous) => fn(previous));
  const navigate = (target: string) => {
    const url = new URL(target, window.location.origin);
    window.history.pushState({}, "", url.pathname + url.hash);
    setPath(url.pathname);
    setMobileMenu(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const goTo = (id: string) => {
    setPath("/");
    window.history.pushState({}, "", `/#${id}`);
    setMobileMenu(false);
    window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 50);
  };
  const notify = (message: string) => setNotice(message);

  const filteredProjects = useMemo(() => projects.filter((project) => {
    const matchesCategory = filter === "Todos" || project.type === filter;
    const matchesQuery = project.title.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  }), [filter, query]);

  const submitRequest = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const request: Request = {
      name: String(form.get("name")), event: String(form.get("event")),
      date: String(form.get("date")), city: String(form.get("city")),
      people: String(form.get("people")), status: "Nova",
    };
    update((state) => ({ ...state, requests: [request, ...state.requests] }));
    setModal(null);
    notify("Pedido recebido! Nossa equipe vai analisar os detalhes com carinho.");
  };

  const enroll = (courseId: string) => {
    if (data.enrolled.includes(courseId)) {
      navigate("/app");
      return;
    }
    update((state) => ({ ...state, enrolled: [...state.enrolled, courseId] }));
    setModal(null);
    notify("Inscrição confirmada! Seu curso já está na área da aluna.");
  };

  const bookClass = (classItem: (typeof classes)[number]) => {
    if (data.bookings.includes(classItem.id) || data.waitlist.includes(classItem.id)) {
      notify("Você já tem uma inscrição para esta turma.");
      return;
    }
    const full = classItem.booked + data.bookings.filter((id) => id === classItem.id).length >= classItem.seats;
    update((state) => ({ ...state, [full ? "waitlist" : "bookings"]: [...state[full ? "waitlist" : "bookings"], classItem.id] }));
    notify(full ? "Você entrou na lista de espera desta turma." : "Sua vaga está reservada! Nos vemos em breve.");
  };

  const applyInstall = async () => {
    if (!installPrompt) {
      notify("No menu do navegador, escolha “Instalar app” ou “Adicionar à tela inicial”.");
      return;
    }
    await installPrompt.prompt();
    setInstallPrompt(null);
  };

  const resetDemo = () => {
    localStorage.removeItem(STORAGE_KEY);
    setData(initialState);
    notify("A demonstração voltou aos dados iniciais.");
  };

  const isAdmin = path.startsWith("/admin");
  const isApp = path.startsWith("/app");

  return (
    <>
      <header className={`site-header ${isAdmin || isApp ? "site-header-utility" : ""}`}>
        <Link className="brand" href="/" onClick={(event) => { event.preventDefault(); navigate("/"); }}>
          <Image src="/brand/logo-menu.png" alt="Mayara Strobel Make Up" width={2172} height={724} priority />
        </Link>
        <nav id="main-navigation" className={`main-nav ${mobileMenu ? "nav-open" : ""}`} aria-label="Navegação principal">
          <Link href="/cursos" onClick={(e) => { e.preventDefault(); goTo("cursos"); }}>Cursos</Link>
          <Link href="/eventos" onClick={(e) => { e.preventDefault(); setMobileMenu(false); setModal({ kind: "request" }); }}>Eventos</Link>
          <Link href="/portfolio" onClick={(e) => { e.preventDefault(); goTo("portfolio"); }}>Portfólio</Link>
          <Link href="/blog" onClick={(e) => { e.preventDefault(); goTo("blog"); }}>Blog</Link>
          <Link href="/forum" onClick={(e) => { e.preventDefault(); navigate("/forum"); }}>Fórum</Link>
          <Link className="nav-secondary-link" href="/sobre" onClick={(e) => { e.preventDefault(); goTo("sobre"); }}>A Mayara</Link>
          <Link className="nav-secondary-link" href="/app" onClick={(e) => { e.preventDefault(); navigate("/app"); }}>Minha área</Link>
        </nav>
        <div className="header-actions">
          <button className="icon-btn" aria-label="Pesquisar trabalhos" onClick={() => goTo("portfolio")}><Search size={18} /></button>
          <button className="menu-toggle" aria-label={mobileMenu ? "Fechar menu" : "Abrir menu"} aria-expanded={mobileMenu} aria-controls="main-navigation" onClick={() => setMobileMenu(!mobileMenu)}>{mobileMenu ? <X /> : <Menu />}</button>
          <div className={`header-menu-popover ${mobileMenu ? "is-open" : ""}`}>
            <button onClick={() => goTo("sobre")}>A Mayara</button>
            <button onClick={() => navigate("/app")}>Minha área <ArrowUpRight size={14} /></button>
          </div>
        </div>
      </header>

      <main>
        {isAdmin ? <AdminPage data={data} update={update} notify={notify} resetDemo={resetDemo} /> :
          isApp ? <StudentPage data={data} update={update} navigate={navigate} notify={notify} applyInstall={applyInstall} /> :
            <PublicPage
              path={path}
              data={data} filteredProjects={filteredProjects} filter={filter} setFilter={setFilter}
              query={query} setQuery={setQuery} goTo={goTo} navigate={navigate} setModal={setModal}
              bookClass={bookClass} notify={notify} setData={setData}
            />}
      </main>

      {!isAdmin && !isApp && <footer className="footer">
        <div className="footer-main">
          <div className="footer-brand"><Image src="/brand/logo-menu.png" alt="Mayara Strobel Make Up" width={2172} height={724} /><p>Beleza que ensina,<br />transforma e celebra.</p><a className="social-link" href="https://instagram.com" target="_blank" rel="noreferrer"><Camera size={16} /> @mayarastrobelmakeup</a></div>
          <div><span className="footer-label">EXPLORE</span><Link href="/cursos" onClick={(e) => { e.preventDefault(); goTo("cursos"); }}>Cursos</Link><Link href="/turmas" onClick={(e) => { e.preventDefault(); goTo("turmas"); }}>Turmas presenciais</Link><Link href="/portfolio" onClick={(e) => { e.preventDefault(); goTo("portfolio"); }}>Portfólio</Link></div>
          <div><span className="footer-label">INSPIRAÇÃO</span><Link href="/blog" onClick={(e) => { e.preventDefault(); goTo("blog"); }}>Blog</Link><Link href="/forum" onClick={(e) => { e.preventDefault(); navigate("/forum"); }}>Comunidade</Link><button className="footer-event-link" onClick={() => setModal({ kind: "request" })}>Maquiagem para eventos</button></div>
          <div className="footer-note"><Sparkles size={18} /><p>Seu próximo capítulo<br />começa com você.</p><Button onClick={() => goTo("cursos")}>Vamos começar <ArrowRight size={14} /></Button></div>
        </div>
        <div className="footer-bottom"><span>© 2026 Mayara Strobel Make Up</span><span>Feito com carinho em Cuiabá, MT</span><button onClick={resetDemo}>Reiniciar demonstração</button><button onClick={() => navigate("/admin")}>Acesso da equipe</button></div>
      </footer>}

      {modal && <Modal onClose={() => setModal(null)}>
        {modal.kind === "request" ? <div className="form-modal"><span className="eyebrow">VAMOS CELEBRAR</span><h2>Me conta sobre o seu evento.</h2><p>Preencha os detalhes e a equipe prepara uma proposta do seu jeitinho.</p>
          <form onSubmit={submitRequest} className="inquiry-form">
            <label>Seu nome<input name="name" required placeholder="Como podemos te chamar?" /></label>
            <div className="form-row"><label>Tipo de evento<select name="event" required defaultValue=""><option value="" disabled>Escolha uma opção</option><option>Casamento</option><option>Aniversário</option><option>Debutante</option><option>Formatura</option><option>Outro evento</option></select></label><label>Data do evento<input name="date" type="date" required min={new Date().toISOString().slice(0, 10)} /></label></div>
            <div className="form-row"><label>Cidade<input name="city" required placeholder="Ex.: Cuiabá" /></label><label>Pessoas<input name="people" type="number" min="1" max="100" required placeholder="Quantidade" /></label></div>
            <Button type="submit" className="form-submit">Enviar pedido de orçamento <ArrowRight size={15} /></Button>
            <span className="form-footnote"><ShieldCheck size={14} /> Demonstração: nenhum dado é enviado para fora deste navegador.</span>
          </form>
        </div> : modal.kind === "course" ? (() => {
          const course = courses.find((item) => item.id === modal.id) ?? courses[0];
          return <div className="course-modal"><div className="course-modal-photo" style={{ backgroundImage: `url('${course.image}')` }} /><div className="course-modal-body"><span className="eyebrow">{course.category} · {course.level}</span><h2>{course.title}</h2><p>{course.description}</p><div className="modal-meta"><span><Play size={14} /> {course.lessons} aulas</span><span><Clock3 size={14} /> {course.length}</span></div><div className="modal-price"><span>{course.price}</span><small>acesso demonstrativo · sem cobrança</small></div><Button onClick={() => enroll(course.id)}>{data.enrolled.includes(course.id) ? "Acessar meu curso" : "Quero aprender com a Mayara"} <ArrowRight size={15} /></Button></div></div>;
        })() : modal.kind === "article" ? <article className="article-modal"><Image src={articles.find((item) => item.title === modal.id)?.image ?? articles[0].image} alt="" width={900} height={480} /><span className="eyebrow">BELEZA · 6 MIN DE LEITURA</span><h2>{modal.id}</h2><p>Beleza não precisa de regras complicadas. Com os produtos certos e um pouco de prática, cada detalhe pode valorizar aquilo que faz você ser única.</p><p>Comece pelo que faz sentido para a sua rotina, respeite o seu tempo e permita-se experimentar. O melhor resultado é aquele em que você se reconhece.</p><Button onClick={() => { setModal({ kind: "course", id: "pele" }); }}>Aprenda mais com a Mayara <ArrowRight size={15} /></Button></article> : <div className="project-modal"><Image src={projects.find((item) => item.title === modal.id)?.image ?? projects[0].image} alt={modal.id} width={760} height={840} /><div><span className="eyebrow">BELEZA EM CADA DETALHE</span><h2>{modal.id}</h2><p>Um trabalho feito para realçar a beleza de cada mulher, com leveza, intenção e cuidado.</p><Button onClick={() => { setModal({ kind: "request" }); }}>Quero uma maquiagem assim <ArrowRight size={15} /></Button></div></div>}
      </Modal>}
      {notice && <div role="status" className="toast"><CheckCircle2 size={19} />{notice}<button aria-label="Fechar mensagem" onClick={() => setNotice("")}><X size={16} /></button></div>}
      {!isAdmin && !isApp && <button className="floating-chat" aria-label="Solicitar orçamento" onClick={() => setModal({ kind: "request" })}><MessageCircle size={21} /><span>Vamos conversar?</span></button>}
    </>
  );
}

function PublicPage({ path, data, filteredProjects, filter, setFilter, query, setQuery, goTo, navigate, setModal, bookClass, notify, setData }: {
  path: string;
  data: DemoState; filteredProjects: typeof projects; filter: string; setFilter: (filter: string) => void; query: string; setQuery: (query: string) => void;
  goTo: (id: string) => void; navigate: (target: string) => void;
  setModal: (modal: { kind: "course" | "project" | "article"; id: string } | { kind: "request" } | null) => void;
  bookClass: (classItem: (typeof classes)[number]) => void; notify: (message: string) => void;
  setData: React.Dispatch<React.SetStateAction<DemoState>>;
}) {
  if (path === "/forum") {
    return <ForumPage data={data} setData={setData} notify={notify} />;
  }

  return <>
    <section className="hero">
      <picture className="hero-picture">
        <source media="(max-width: 900px)" srcSet="/media/hero/mayara-hero-mobile.png" />
        <Image className="hero-image" src="/media/hero/mayara-hero-desktop.png" alt="Mayara Strobel em um retrato editorial elegante" fill priority sizes="100vw" />
      </picture>
      <div className="hero-shade" />
      <div className="hero-content">
        <h1>Maquiagem para<br />aprender e celebrar</h1>
        <span className="hero-rule" aria-hidden="true" />
        <div className="hero-cards" aria-label="Principais serviços">
          <button className="hero-card" onClick={() => goTo("cursos")}>
            <Laptop aria-hidden="true" />
            <strong>Cursos EAD</strong>
            <span className="hero-card-cta">Saiba mais</span>
            <ChevronRight className="hero-card-arrow" aria-hidden="true" />
          </button>
          <button className="hero-card" onClick={() => goTo("turmas")}>
            <Users aria-hidden="true" />
            <strong>Turmas<br className="desktop-only" /> presenciais</strong>
            <span className="hero-card-cta">Saiba mais</span>
            <ChevronRight className="hero-card-arrow" aria-hidden="true" />
          </button>
          <button className="hero-card" onClick={() => setModal({ kind: "request" })}>
            <CalendarDays aria-hidden="true" />
            <strong>Maquiagem<br className="desktop-only" /> para eventos</strong>
            <span className="hero-card-cta">Saiba mais</span>
            <ChevronRight className="hero-card-arrow" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>

    <section className="about-section section-wrap" id="sobre">
      <div className="about-visual"><div className="about-photo"><Image src="/media/editorial/mayara-about.jpg" alt="Mayara Strobel, maquiadora e educadora" fill sizes="(max-width: 900px) 90vw, 40vw" /></div><span className="about-stamp">CUIABÁ<br /><i>com amor</i></span><div className="about-vertical">MAKE UP ARTIST & EDUCADORA</div></div>
      <div className="about-copy"><span className="eyebrow">POR TRÁS DO PINCEL</span><h2>Oi, eu sou a<br /><i>Mayara.</i></h2><p className="about-lead">Acredito que maquiagem vai muito além do espelho. Ela é sobre se reconhecer, se expressar e ocupar o seu lugar no mundo.</p><p>Há anos transformo histórias com pincéis e compartilho o que aprendi com mulheres que, como eu, acreditam que a beleza começa de dentro pra fora.</p><div className="about-signature">Mayara Strobel <span>com carinho, sempre</span></div><Button className="btn-outline" onClick={() => setModal({ kind: "article", id: "Uma conversa sobre beleza e identidade" })}>Conheça minha história <ArrowRight size={15} /></Button></div>
    </section>

    <div className="parallax-zone">
    <section className="portfolio-section" id="portfolio"><div className="section-wrap"><SectionTitle eyebrow="FEITO PARA VOCÊ, COM VOCÊ" title="Beleza que tem história." copy="Cada rosto, um mundo. Cada produção, uma forma de dizer: essa sou eu." link="/portfolio" /><div className="portfolio-tools"><div className="filter-tabs" role="group" aria-label="Filtrar portfólio">{["Todos", "Coleção 01", "Coleção 02", "Coleção 03", "Coleção 04"].map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div><label className="portfolio-search"><Search size={15} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar trabalho" aria-label="Buscar trabalho" /></label></div>
      <div className="portfolio-grid">{filteredProjects.length ? filteredProjects.map((project, index) => <button key={project.title} className={`portfolio-item portfolio-${index + 1}`} onClick={() => setModal({ kind: "project", id: project.title })}><Image src={project.image} alt={`Maquiagem ${project.title}`} fill sizes="(max-width: 760px) 50vw, 25vw" /><span className="portfolio-overlay"><small>{project.type.toUpperCase()}</small><strong>{project.title}</strong><ArrowUpRight size={18} /></span></button>) : <p className="empty-state">Nenhum trabalho encontrado. Tente outra busca.</p>}</div>
      <div className="portfolio-foot"><span>BELEZA REAL, HISTÓRIAS REAIS.</span><button onClick={() => { setFilter("Todos"); setQuery(""); }}>Ver todos os trabalhos <ArrowRight size={15} /></button></div></div></section>

    <section className="parallax"><div className="parallax-shade" /><span className="parallax-caption">UM LEMBRETE PRA VOCÊ</span><p>O melhor da maquiagem<br />é quando você <i>se encontra.</i></p><span className="parallax-signature">Mayara <span>♡</span></span></section>

    <section className="courses-section section-wrap" id="cursos"><SectionTitle eyebrow="APRENDA NO SEU TEMPO" title="Seu próximo passo começa aqui." copy="Aulas práticas, sem complicação, para você evoluir de verdade." link="/cursos" /><div className="courses-grid">{courses.map((course, index) => <article className="course-card" key={course.id}><button className="course-cover" onClick={() => setModal({ kind: "course", id: course.id })} aria-label={`Conheça o curso ${course.title}`}><Image src={course.image} alt="" fill sizes="(max-width: 760px) 90vw, 40vw" /><span className="course-pill">{course.category}</span><span className="course-play"><Play size={17} fill="currentColor" /></span><span className="course-index">0{index + 1}</span></button><div className="course-content"><div className="course-meta"><span>{course.level.toUpperCase()}</span><span><Clock3 size={13} /> {course.length}</span></div><h3>{course.title}</h3><div className="course-bottom"><span>{course.lessons} aulas <span className="course-dot">·</span> {course.price}</span><button aria-label={`Ver curso ${course.title}`} onClick={() => setModal({ kind: "course", id: course.id })}><ArrowUpRight size={17} /></button></div></div></article>)}</div><div className="all-courses"><span>ESTUDE COM CALMA. CRESÇA NO SEU TEMPO.</span><Button className="btn-outline" onClick={() => navigate("/app")}>Acessar minha área <ArrowRight size={15} /></Button></div></section>
    <section className="classes-section" id="turmas"><div className="section-wrap"><SectionTitle eyebrow="APRENDER JUNTAS É OUTRA COISA" title="Encontros para sair do papel." copy="Turmas pequenas, muita prática e aquele espaço seguro para perguntar tudo." link="/turmas" /><div className="classes-list">{classes.map((classItem) => { const joined = data.bookings.includes(classItem.id); const waiting = data.waitlist.includes(classItem.id); return <article className="class-row" key={classItem.id}><div className="class-date"><span>{classItem.date.split(" ")[0]}</span><small>{classItem.date.split(" ")[1]}</small></div><div className="class-description"><span className="eyebrow">{classItem.label}</span><h3>{classItem.title}</h3><p><Clock3 size={14} /> {classItem.time} <span>·</span> {classItem.place}</p></div><div className="class-availability"><span>{Math.max(0, classItem.seats - classItem.booked - (joined ? 1 : 0))}</span> vagas</div><Button className={joined || waiting ? "joined-button" : "class-button"} onClick={() => bookClass(classItem)}>{joined ? <><Check size={14} /> Inscrita</> : waiting ? "Na lista de espera" : classItem.booked >= classItem.seats ? "Entrar na espera" : "Quero minha vaga"} {!joined && !waiting && <ArrowRight size={14} />}</Button></article>; })}</div><p className="class-timezone"><CalendarDays size={14} /> Horários no fuso de Cuiabá (America/Cuiaba).</p></div></section>
    <section className="journal-section section-wrap" id="blog"><div className="section-title"><div><span className="eyebrow">ANOTA AÍ</span><h2>Conversas de beleza.</h2><p>Ideias, descobertas e um pouquinho de inspiração pra levar com você.</p></div><Button className="btn-outline" onClick={() => navigate("/blog")}>Ir para o blog <ArrowRight size={15} /></Button></div><div className="journal-grid">{[...articles, ...(data.published ? [draftArticle] : [])].map((article, index) => <button className="journal-card" key={article.title} onClick={() => setModal({ kind: "article", id: article.title })}><span className={`journal-image journal-image-${index + 1}`}><Image src={article.image} alt="" fill sizes="(max-width: 760px) 90vw, 30vw" /><span><ArrowUpRight size={16} /></span></span><span className="journal-category">{article.category} <span>·</span> {article.time}</span><strong>{article.title}</strong><span className="journal-read">Ler artigo <ArrowRight size={14} /></span></button>)}</div></section>
    <section className="community-section" id="comunidade"><div className="community-text"><span className="eyebrow">A GENTE CRESCE JUNTA</span><h2>Um espaço seguro<br />pra <i>perguntar.</i></h2><p>Troque ideias, tire dúvidas e comemore cada conquista com mulheres que estão na mesma jornada que você.</p><Button onClick={() => navigate("/forum")}>Conheça a comunidade <ArrowRight size={15} /></Button><span className="community-count"><Users size={15} /> 284 alunas aprendendo juntas</span></div><div className="forum-preview"><div className="forum-topline"><span>CONVERSAS RECENTES</span><span>COMUNIDADE MAYARA</span></div>    {forumTopics.slice(0, 2).map((item) => <button className="forum-topic-preview" key={item.title} onClick={() => navigate("/forum")}><span className="forum-avatar">{item.author.split(" ").map((part) => part[0]).join("")}</span><span className="forum-preview-copy"><small>{item.tag} · {item.author}</small><strong>{item.title}</strong><span><MessageCircle size={13} /> {item.replies} respostas</span></span><ArrowUpRight size={16} /></button>)}<button className="forum-see-all" onClick={() => navigate("/forum")}>Ver todas as conversas <ArrowRight size={14} /></button><div className="forum-decoration">“</div></div></section>

    <section className="closing-cta"><div className="closing-flower">✳</div><span className="eyebrow">SEU PRÓXIMO CAPÍTULO</span><h2>Começa com um <i>sim.</i></h2><p>Sim para aprender. Sim para se celebrar. Sim para você.</p><Button onClick={() => goTo("cursos")}>Quero começar <ArrowRight size={15} /></Button><span className="closing-note">COM CARINHO, MAYARA</span></section>
    </div>
  </>;
}

function AdminPage({ data, update, notify, resetDemo }: { data: DemoState; update: (fn: (previous: DemoState) => DemoState) => void; notify: (message: string) => void; resetDemo: () => void }) {
  const [tab, setTab] = useState("Visão geral");
  const pending = data.requests.filter((item) => item.status === "Nova").length;
  const classRows = classes.map((item) => ({ ...item, booked: item.booked + data.bookings.filter((id) => id === item.id).length, waiting: data.waitlist.filter((id) => id === item.id).length }));
  return <div className="admin-layout">
    <aside className="admin-sidebar"><Link className="admin-brand" href="/"><Image src="/brand/logo-menu.png" alt="Mayara Strobel" width={2172} height={724} /></Link><span className="admin-label">ESPAÇO DA EQUIPE</span><nav>{["Visão geral", "Cursos e alunas", "Turmas", "Orçamentos", "Conteúdo", "Moderação"].map((item, i) => <button key={item} className={tab === item ? "selected" : ""} onClick={() => setTab(item)}>{[<LayoutDashboard key="dashboard" />, <GraduationCap key="grad" />, <CalendarDays key="calendar" />, <Sparkles key="spark" />, <BookOpen key="book" />, <ShieldCheck key="shield" />][i]}{item}{item === "Orçamentos" && pending > 0 && <span className="sidebar-badge">{pending}</span>}</button>)}</nav><div className="admin-profile"><span className="admin-avatar">MS</span><span><strong>Equipe Mayara</strong><small>Administradora</small></span><MoreHorizontal size={17} /></div></aside>
    <div className="admin-main"><header className="admin-topbar"><div><span className="admin-breadcrumb">ESPAÇO DA EQUIPE</span><h1>{tab}</h1></div><div className="admin-top-actions"><span className="demo-badge"><span /> DEMONSTRAÇÃO</span><button className="icon-btn" aria-label="Notificações"><Bell size={18} /><i /></button><span className="admin-top-avatar">MS</span></div></header>
      {tab === "Visão geral" && <><div className="admin-welcome"><div><span className="eyebrow">DOMINGO, 8 DE NOVEMBRO</span><h2>Um bom dia começa<br />com <i>boas histórias.</i></h2><p>Acompanhe o que está acontecendo no seu espaço.</p></div><div className="welcome-spark">✳</div></div><div className="stat-grid"><StatCard label="Alunas inscritas" value={String(128 + data.enrolled.length)} note="+12 este mês" icon={<Users />} /><StatCard label="Cursos ativos" value="02" note="Conteúdo publicado" icon={<BookOpen />} /><StatCard label="Próximas turmas" value="03" note={`${data.bookings.length} inscrições novas`} icon={<CalendarDays />} /><StatCard label="Pedidos de orçamento" value={String(data.requests.length)} note={pending ? `${pending} aguardando retorno` : "Tudo em dia"} icon={<Sparkles />} /></div><div className="admin-content-grid"><div className="admin-panel"><div className="panel-heading"><div><span className="eyebrow">ACOMPANHE DE PERTO</span><h3>Próximas turmas</h3></div><button onClick={() => setTab("Turmas")}>Ver agenda <ArrowRight size={14} /></button></div>{classRows.slice(0, 3).map((item) => <div className="admin-class-row" key={item.id}><span className="admin-date-chip">{item.date}</span><span><strong>{item.title}</strong><small>{item.time} · Cuiabá, MT</small></span><span className="seat-indicator"><i style={{ width: `${Math.min(100, item.booked / item.seats * 100)}%` }} />{item.booked}/{item.seats}</span></div>)}</div><div className="admin-panel requests-panel"><div className="panel-heading"><div><span className="eyebrow">NOVAS HISTÓRIAS</span><h3>Pedidos recentes</h3></div><span className="new-indicator">{pending} NOVO{pending === 1 ? "" : "S"}</span></div>{data.requests.length ? data.requests.slice(0, 3).map((request, i) => <div className="admin-request-row" key={`${request.name}-${i}`}><span className="request-avatar">{request.name.slice(0, 1).toUpperCase()}</span><span><strong>{request.name}</strong><small>{request.event} · {request.city}</small></span><span className="status-tag">{request.status}</span></div>) : <div className="admin-empty"><span>✳</span><p>Os próximos pedidos de orçamento<br />aparecerão aqui.</p></div>}</div></div><div className="admin-bottom-cards"><button onClick={() => setTab("Conteúdo")}><span className="quick-icon"><BookOpen /></span><strong>Conteúdo e inspiração</strong><small>{data.published ? "Seu novo artigo foi publicado." : "Seu próximo artigo está esperando."}</small><ArrowUpRight size={17} /></button><button onClick={() => setTab("Moderação")}><span className="quick-icon"><ShieldCheck /></span><strong>Comunidade acolhedora</strong><small>{data.reported ? "Uma denúncia aguarda revisão." : "Tudo tranquilo por aqui."}</small><ArrowUpRight size={17} /></button></div></>}
      {tab === "Orçamentos" && <div className="admin-panel full-panel"><div className="panel-heading"><div><span className="eyebrow">SEU PRÓXIMO GRANDE DIA</span><h3>Pedidos de orçamento</h3></div></div>{data.requests.length ? data.requests.map((request, i) => <div className="request-detail" key={`${request.name}-${i}`}><div className="request-avatar">{request.name.slice(0, 1).toUpperCase()}</div><div className="request-detail-copy"><strong>{request.name} · {request.event}</strong><span>{request.date} · {request.city} · {request.people} pessoa(s)</span><small>Solicitação recebida — não é uma reserva confirmada.</small></div><select aria-label={`Status do pedido de ${request.name}`} value={request.status} onChange={(e) => update((state) => ({ ...state, requests: state.requests.map((item, index) => index === i ? { ...item, status: e.target.value } : item) }))}>{["Nova", "Em análise", "Proposta enviada", "Confirmada", "Encerrada"].map((status) => <option key={status}>{status}</option>)}</select></div>) : <p className="admin-empty">Nenhum pedido ainda. Solicitações feitas no portal aparecerão aqui.</p>}</div>}
      {tab === "Turmas" && <div className="admin-panel full-panel"><div className="panel-heading"><div><span className="eyebrow">AGENDA · CUIABÁ</span><h3>Turmas e lista de espera</h3></div></div>{classRows.map((item) => <div className="request-detail" key={item.id}><span className="admin-date-chip">{item.date}</span><div className="request-detail-copy"><strong>{item.title}</strong><span>{item.booked}/{item.seats} vagas · {item.waiting} na lista de espera</span></div>{item.waiting > 0 && item.booked < item.seats && <Button onClick={() => { update((state) => ({ ...state, waitlist: state.waitlist.filter((id) => id !== item.id), bookings: [...state.bookings, item.id] })); notify("A primeira aluna da lista de espera foi promovida."); }}>Promover aluna <ArrowRight size={14} /></Button>}</div>)}</div>}
      {tab === "Cursos e alunas" && <div className="admin-panel full-panel"><div className="panel-heading"><div><span className="eyebrow">APRENDER E EVOLUIR</span><h3>Cursos e inscrições</h3></div></div>{courses.map((course) => <div className="request-detail" key={course.id}><div className="quick-icon"><BookOpen /></div><div className="request-detail-copy"><strong>{course.title}</strong><span>{course.lessons} aulas · {course.level} · {course.price}</span></div><span className="status-tag">{data.enrolled.includes(course.id) ? "Nova inscrição" : "Publicado"}</span></div>)}</div>}
      {tab === "Conteúdo" && <div className="admin-panel full-panel"><div className="panel-heading"><div><span className="eyebrow">DIÁRIO DE BELEZA</span><h3>Artigos do blog</h3></div></div>{[...articles, draftArticle].map((article, i) => <div className="request-detail" key={article.title}><div className="quick-icon"><BookOpen /></div><div className="request-detail-copy"><strong>{article.title}</strong><span>{article.category} · {article.time}</span></div><span className="status-tag">{i < 3 || data.published ? "Publicado" : "Rascunho"}</span>{i === 3 && <Button onClick={() => { update((state) => ({ ...state, published: !state.published })); notify(data.published ? "Artigo removido da publicação." : "Artigo publicado no blog."); }}>{data.published ? "Retirar" : "Publicar"} <ArrowRight size={14} /></Button>}</div>)}</div>}
      {tab === "Moderação" && <div className="admin-panel full-panel"><div className="panel-heading"><div><span className="eyebrow">CUIDANDO DA NOSSA COMUNIDADE</span><h3>Fila de moderação</h3></div></div>{data.reported && !data.hidden ? <div className="moderation-row"><div className="quick-icon"><MessageCircle /></div><div className="request-detail-copy"><strong>{forumTopics[0].title}</strong><span>Denúncia enviada por uma aluna · Tópico público</span></div><Button onClick={() => { update((state) => ({ ...state, hidden: true, moderationNote: "Conteúdo ocultado após análise da denúncia recebida." })); notify("Conteúdo ocultado. A decisão ficou registrada."); }}>Ocultar conteúdo</Button><button className="admin-text-btn" onClick={() => { update((state) => ({ ...state, reported: false })); notify("Denúncia revisada e arquivada."); }}>Arquivar denúncia</button></div> : <p className="admin-empty">{data.hidden ? `Denúncia resolvida. ${data.moderationNote}` : "Nenhuma denúncia pendente. Obrigada por manter esse espaço acolhedor."}</p>}</div>}
      <div className="admin-footer"><span>DEMONSTRAÇÃO · DADOS SALVOS NESTE NAVEGADOR</span><button onClick={resetDemo}>Restaurar dados de exemplo</button></div>
    </div>
  </div>;
}

function StatCard({ label, value, note, icon }: { label: string; value: string; note: string; icon: React.ReactNode }) {
  return <div className="stat-card"><span className="stat-icon">{icon}</span><span className="stat-label">{label}</span><strong>{value}</strong><span className="stat-note">{note}</span></div>;
}

function StudentPage({ data, update, navigate, notify, applyInstall }: { data: DemoState; update: (fn: (previous: DemoState) => DemoState) => void; navigate: (path: string) => void; notify: (message: string) => void; applyInstall: () => void }) {
  const [tab, setTab] = useState("Início");
  const myCourses = courses.filter((course) => data.enrolled.includes(course.id));
  const currentCourse = myCourses[0] ?? courses[0];
  const doneCount = data.completed.length;
  const progress = myCourses.length ? Math.min(100, Math.round(doneCount / currentCourse.lessons * 100)) : 0;
  return <div className="student-layout"><aside className="student-sidebar"><button className="student-logo" onClick={() => navigate("/")}><Image src="/brand/logo-menu.png" alt="Mayara Strobel" width={2172} height={724} /></button><span className="admin-label">MINHA JORNADA</span><nav>{["Início", "Meus cursos", "Agenda", "Comunidade"].map((item, i) => <button key={item} className={tab === item ? "selected" : ""} onClick={() => item === "Comunidade" ? navigate("/forum") : setTab(item)}>{[<LayoutDashboard key="dashboard" />, <BookOpen key="book" />, <CalendarDays key="calendar" />, <MessageCircle key="message" />][i]}{item}</button>)}</nav><button className="student-install" onClick={applyInstall}><Plus size={16} /> Instalar aplicativo</button><div className="admin-profile"><span className="admin-avatar student-avatar">AM</span><span><strong>Aluna Mayara</strong><small>Perfil demonstrativo</small></span><MoreHorizontal size={17} /></div></aside>
    <div className="student-main"><header className="student-topbar"><span className="eyebrow">ESPAÇO DA ALUNA</span><div><span className="demo-badge"><span /> DEMONSTRAÇÃO</span><button className="icon-btn" aria-label="Notificações"><Bell size={18} /></button><span className="admin-top-avatar student-avatar">AM</span></div></header>
      {tab === "Início" && <><div className="student-welcome"><div><span className="eyebrow">UM NOVO DIA, UMA NOVA DESCOBERTA</span><h1>Que bom ter você<br />por aqui, <i>aluna.</i></h1><p>Seu espaço, seu tempo, sua jornada de beleza.</p></div><span className="welcome-flower">✳</span></div><div className="student-course-feature"><div className="student-course-image"><Image src={currentCourse.image} alt="" fill sizes="(max-width: 760px) 90vw, 45vw" /><span>CONTINUE DE ONDE PAROU</span><button aria-label="Continuar curso" onClick={() => { setTab("Meus cursos"); }}><Play size={19} fill="currentColor" /></button></div><div className="student-course-info"><span className="eyebrow">SUA AULA TE ESPERA</span><h2>{data.enrolled.length ? currentCourse.title : "Seu primeiro capítulo começa aqui."}</h2><p>{data.enrolled.length ? data.lastLesson : "Inscreva-se em um curso e descubra tudo o que você é capaz de criar."}</p>{data.enrolled.length ? <><div className="progress-label"><span>Seu progresso</span><strong>{progress}%</strong></div><div className="progress-track"><span style={{ width: `${progress}%` }} /></div><div className="student-course-actions"><Button onClick={() => { update((state) => ({ ...state, lastLesson: "Aula seguinte: acabamento e fixação" })); notify("Aula aberta. Sua última aula ficou salva para continuar depois."); }}>{doneCount ? "Continuar aprendendo" : "Começar primeira aula"} <ArrowRight size={15} /></Button><button onClick={() => { if (data.completed.includes(data.lastLesson)) { notify("Esta aula já foi concluída."); return; } update((state) => ({ ...state, completed: [...state.completed, state.lastLesson] })); notify("Aula concluída! Seu progresso foi atualizado."); }}>Marcar aula concluída <Check size={14} /></button></div></> : <Button onClick={() => navigate("/")}>Explorar os cursos <ArrowRight size={15} /></Button>}</div></div><div className="student-lower-grid"><div className="admin-panel"><div className="panel-heading"><div><span className="eyebrow">APRENDEMOS MELHOR JUNTAS</span><h3>Próximo encontro</h3></div><CalendarDays size={18} /></div><strong>Automaquiagem sem mistério</strong><p className="student-detail"><Clock3 size={14} /> 22 de novembro · 09:00 · Cuiabá</p><Button className="btn-outline" onClick={() => setTab("Agenda")}>Ver agenda <ArrowRight size={14} /></Button></div><div className="student-community-card"><Sparkles size={18} /><span className="eyebrow">A GENTE CRESCE JUNTA</span><h3>Dúvida nenhuma<br />fica sem resposta.</h3><button onClick={() => navigate("/forum")}>Ir para a comunidade <ArrowRight size={14} /></button></div></div></>}
      {tab === "Meus cursos" && <section className="student-list"><span className="eyebrow">SEUS CURSOS, SEU TEMPO</span><h1>Meus cursos.</h1>{myCourses.length ? myCourses.map((course) => <article className="student-course-row" key={course.id}><div className="student-row-image"><Image src={course.image} alt="" fill sizes="120px" /></div><div><span className="eyebrow">{course.level}</span><h3>{course.title}</h3><p>{course.lessons} aulas · {course.length} · {progress}% concluído</p></div><Button onClick={() => { update((state) => ({ ...state, lastLesson: "Aula seguinte: prática guiada" })); notify("Aula aberta e progresso salvo."); }}>Continuar <ArrowRight size={14} /></Button></article>) : <div className="student-empty"><BookOpen /><p>Você ainda não começou nenhum curso.</p><Button onClick={() => navigate("/")}>Explorar cursos <ArrowRight size={14} /></Button></div>}</section>}
      {tab === "Agenda" && <section className="student-list"><span className="eyebrow">CUIABÁ · AMERICA/CUIABA</span><h1>Sua agenda.</h1>{classes.map((item) => { const booked = data.bookings.includes(item.id); const waiting = data.waitlist.includes(item.id); return <article className="student-course-row" key={item.id}><div className="student-agenda-date">{item.date}</div><div><span className="eyebrow">{item.time}</span><h3>{item.title}</h3><p>{item.place}</p></div><span className="status-tag">{booked ? "Inscrita" : waiting ? "Lista de espera" : "Disponível"}</span>{(booked || waiting) && <button className="admin-text-btn" onClick={() => { update((state) => ({ ...state, bookings: state.bookings.filter((id) => id !== item.id), waitlist: state.waitlist.filter((id) => id !== item.id) })); notify(booked ? "Inscrição cancelada. A vaga voltou a ficar disponível." : "Você saiu da lista de espera."); }}>Cancelar</button>}</article>; })}</section>}
    </div>
  </div>;
}

function ForumPage({ data, setData, notify }: { data: DemoState; setData: React.Dispatch<React.SetStateAction<DemoState>>; notify: (message: string) => void }) {
  const [selected, setSelected] = useState(0);
  const [category, setCategory] = useState("Todas");
  const [reply, setReply] = useState("");
  const topics = forumTopics.map((topic, index) => ({ ...topic, replies: topic.replies + (index === 0 ? data.replies.length : 0) }));
  const filteredTopics = (category === "Todas" ? topics : topics.filter((topic) => topic.tag === category.toLocaleUpperCase("pt-BR")))
    .filter((topic) => !(data.hidden && topic.title === forumTopics[0].title));
  const selectedTopic = filteredTopics[selected] ?? filteredTopics[0] ?? forumTopics[1];
  const hasReplies = selectedTopic.title === forumTopics[0].title;
  const categories = [
    { label: "Todas", count: "12" },
    { label: "Técnicas", count: "08" },
    { label: "Dúvidas de aula", count: "06" },
    { label: "Resultados", count: "04" },
  ];
  return <div className="forum-page"><div className="forum-page-heading"><span className="eyebrow">COMUNIDADE MAYARA · UM ESPAÇO SEGURO</span><h1>Aprender junto<br />é <i>mais gostoso.</i></h1><p>Troque ideias, tire dúvidas e comemore cada conquista com mulheres que estão na mesma jornada.</p><span className="community-count"><Users size={15} /> 284 alunas aprendendo juntas</span></div><div className="forum-layout"><aside className="forum-list"><div className="forum-list-top"><span>CONVERSAS</span><button onClick={() => notify("Entre na área da aluna para participar das conversas.")}><Plus size={15} /> Novo tópico</button></div><div className="forum-categories">{categories.map((item) => <button key={item.label} className={category === item.label ? "active" : ""} onClick={() => { setCategory(item.label); setSelected(0); }}>{item.label} <span>{item.count}</span></button>)}</div>{filteredTopics.map((item, i) => <button key={item.title} className={`forum-list-item ${selected === i ? "active" : ""}`} onClick={() => setSelected(i)}><span className="forum-list-tag">{item.tag}</span><strong>{item.title}</strong><span>{item.author} · {item.replies} respostas</span></button>)}</aside><section className="forum-thread"><div className="thread-heading"><div><span className="forum-list-tag">{selectedTopic.tag}</span><h2>{selectedTopic.title}</h2><span>Iniciado por {selectedTopic.author} · há 2 dias</span></div><button className="admin-text-btn" onClick={() => { setData((state) => ({ ...state, reported: true })); notify("Denúncia recebida. Nossa equipe vai revisar o conteúdo."); }}><ShieldCheck size={15} /> Denunciar</button></div><div className="thread-message"><span className="forum-avatar">CR</span><div><div className="thread-author"><strong>{selectedTopic.author}</strong><span>ALUNA · HÁ 2 DIAS</span></div><p>Oi, meninas! Estou praticando bastante e fiquei com uma dúvida sobre essa etapa da maquiagem. Qual produto vocês gostam de usar? Adoraria ouvir a experiência de vocês. 💕</p><button className="thread-like" onClick={() => notify("Que bom que você está gostando desta conversa.")}><Heart size={14} /> 4</button></div></div>    {hasReplies && <div className="thread-message thread-reply"><span className="forum-avatar forum-avatar-rose">LM</span><div><div className="thread-author"><strong>Luiza M.</strong><span>ALUNA · HÁ 1 DIA</span></div><p>Eu amo usar um hidratante mais leve e esperar absorver bem antes de começar! Na aula da pele blindada, a Mayara mostra uma sequência que me ajudou muito. ✨</p><button className="thread-like" onClick={() => notify("Que bom que você está gostando desta conversa.")}><Heart size={14} /> 2</button></div></div>}{data.replies.map((message, index) => <div className="thread-message thread-reply" key={`${message}-${index}`}><span className="forum-avatar forum-avatar-you">AM</span><div><div className="thread-author"><strong>Aluna Mayara</strong><span>AGORA</span></div><p>{message}</p></div></div>)}<form className="forum-reply-form" onSubmit={(e) => { e.preventDefault(); if (!reply.trim()) return; setData((state) => ({ ...state, replies: [...state.replies, reply.trim()] })); setReply(""); notify("Resposta publicada na comunidade."); }}><span className="forum-avatar forum-avatar-you">AM</span><input value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Compartilhe sua experiência..." aria-label="Sua resposta" /><button aria-label="Enviar resposta"><Send size={17} /></button></form><p className="forum-demo-note"><ShieldCheck size={13} /> Publicações são demonstrativas e ficam salvas neste navegador.</p></section></div></div>;
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section role="dialog" aria-modal="true" className="modal-shell"><button className="modal-close" onClick={onClose} aria-label="Fechar"><X size={19} /></button>{children}</section></div>;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}
