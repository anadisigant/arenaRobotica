"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Dices, Grid3X3, Lightbulb, RotateCcw, Timer } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "arena-robo-sorteios-v1";

type FlagOption = {
  id: string;
  name: string;
  kind: string;
  activation: string;
  activationHex: string;
  activationText: string;
  image: string;
  source: string;
  matrix: string[];
};

type DrawEntry = {
  id: string;
  flagId: string;
  round: number;
};

const NAVY = "#1f3f77";
const LIGHT_BLUE = "#72bfe9";
const BLACK = "#111827";
const RED = "#dc2626";
const WHITE = "#f8fafc";
const PINK = "#ef84b2";
const YELLOW = "#facc15";
const GREEN = "#168554";
const ORANGE = "#f97316";

const FLAGS: FlagOption[] = [
  {
    id: "franca",
    name: "França",
    kind: "País",
    activation: "Azul escuro",
    activationHex: NAVY,
    activationText: WHITE,
    image: "https://flagcdn.io/fr.svg",
    source: "FlagCDN",
    matrix: [NAVY, WHITE, RED, NAVY, WHITE, RED, NAVY, WHITE, RED],
  },
  {
    id: "islandia",
    name: "Islândia",
    kind: "País",
    activation: "Azul escuro",
    activationHex: NAVY,
    activationText: WHITE,
    image: "https://flagcdn.io/is.svg",
    source: "FlagCDN",
    matrix: [NAVY, RED, NAVY, RED, RED, RED, NAVY, RED, NAVY],
  },
  {
    id: "noruega",
    name: "Noruega",
    kind: "País",
    activation: "Azul escuro",
    activationHex: NAVY,
    activationText: WHITE,
    image: "https://flagcdn.io/no.svg",
    source: "FlagCDN",
    matrix: [RED, NAVY, RED, NAVY, NAVY, NAVY, RED, NAVY, RED],
  },
  {
    id: "australia",
    name: "Austrália",
    kind: "País",
    activation: "Azul escuro",
    activationHex: NAVY,
    activationText: WHITE,
    image: "https://flagcdn.io/au.svg",
    source: "FlagCDN",
    matrix: [RED, WHITE, NAVY, WHITE, NAVY, WHITE, NAVY, WHITE, NAVY],
  },
  {
    id: "argentina",
    name: "Argentina",
    kind: "País",
    activation: "Azul claro",
    activationHex: LIGHT_BLUE,
    activationText: BLACK,
    image: "https://flagcdn.io/ar.svg",
    source: "FlagCDN",
    matrix: [LIGHT_BLUE, LIGHT_BLUE, LIGHT_BLUE, WHITE, YELLOW, WHITE, LIGHT_BLUE, LIGHT_BLUE, LIGHT_BLUE],
  },
  {
    id: "uruguai",
    name: "Uruguai",
    kind: "País",
    activation: "Azul claro",
    activationHex: LIGHT_BLUE,
    activationText: BLACK,
    image: "https://flagcdn.io/uy.svg",
    source: "FlagCDN",
    matrix: [YELLOW, WHITE, LIGHT_BLUE, WHITE, LIGHT_BLUE, WHITE, LIGHT_BLUE, WHITE, LIGHT_BLUE],
  },
  {
    id: "guatemala",
    name: "Guatemala",
    kind: "País",
    activation: "Azul claro",
    activationHex: LIGHT_BLUE,
    activationText: BLACK,
    image: "https://flagcdn.io/gt.svg",
    source: "FlagCDN",
    matrix: [LIGHT_BLUE, WHITE, LIGHT_BLUE, LIGHT_BLUE, GREEN, LIGHT_BLUE, LIGHT_BLUE, WHITE, LIGHT_BLUE],
  },
  {
    id: "cazaquistao",
    name: "Cazaquistão",
    kind: "País",
    activation: "Azul claro",
    activationHex: LIGHT_BLUE,
    activationText: BLACK,
    image: "https://flagcdn.io/kz.svg",
    source: "FlagCDN",
    matrix: [LIGHT_BLUE, LIGHT_BLUE, LIGHT_BLUE, YELLOW, YELLOW, LIGHT_BLUE, LIGHT_BLUE, LIGHT_BLUE, LIGHT_BLUE],
  },
  {
    id: "alemanha",
    name: "Alemanha",
    kind: "País",
    activation: "Preto",
    activationHex: BLACK,
    activationText: WHITE,
    image: "https://flagcdn.io/de.svg",
    source: "FlagCDN",
    matrix: [BLACK, BLACK, BLACK, RED, RED, RED, YELLOW, YELLOW, YELLOW],
  },
  {
    id: "belgica",
    name: "Bélgica",
    kind: "País",
    activation: "Preto",
    activationHex: BLACK,
    activationText: WHITE,
    image: "https://flagcdn.io/be.svg",
    source: "FlagCDN",
    matrix: [BLACK, YELLOW, RED, BLACK, YELLOW, RED, BLACK, YELLOW, RED],
  },
  {
    id: "angola",
    name: "Angola",
    kind: "País",
    activation: "Preto",
    activationHex: BLACK,
    activationText: WHITE,
    image: "https://flagcdn.io/ao.svg",
    source: "FlagCDN",
    matrix: [RED, RED, RED, BLACK, YELLOW, BLACK, BLACK, BLACK, BLACK],
  },
  {
    id: "quenia",
    name: "Quênia",
    kind: "País",
    activation: "Preto",
    activationHex: BLACK,
    activationText: WHITE,
    image: "https://flagcdn.io/ke.svg",
    source: "FlagCDN",
    matrix: [BLACK, BLACK, BLACK, RED, WHITE, RED, GREEN, GREEN, GREEN],
  },
  {
    id: "japao",
    name: "Japão",
    kind: "País",
    activation: "Vermelho",
    activationHex: RED,
    activationText: WHITE,
    image: "https://flagcdn.io/jp.svg",
    source: "FlagCDN",
    matrix: [WHITE, WHITE, WHITE, WHITE, RED, WHITE, WHITE, WHITE, WHITE],
  },
  {
    id: "canada",
    name: "Canadá",
    kind: "País",
    activation: "Vermelho",
    activationHex: RED,
    activationText: WHITE,
    image: "https://flagcdn.io/ca.svg",
    source: "FlagCDN",
    matrix: [RED, WHITE, RED, RED, RED, RED, RED, WHITE, RED],
  },
  {
    id: "suica",
    name: "Suíça",
    kind: "País",
    activation: "Vermelho",
    activationHex: RED,
    activationText: WHITE,
    image: "https://flagcdn.io/ch.svg",
    source: "FlagCDN",
    matrix: [RED, WHITE, RED, WHITE, WHITE, WHITE, RED, WHITE, RED],
  },
  {
    id: "china",
    name: "China",
    kind: "País",
    activation: "Vermelho",
    activationHex: RED,
    activationText: WHITE,
    image: "https://flagcdn.io/cn.svg",
    source: "FlagCDN",
    matrix: [YELLOW, RED, RED, RED, YELLOW, RED, RED, RED, RED],
  },
  {
    id: "finlandia",
    name: "Finlândia",
    kind: "País",
    activation: "Branco",
    activationHex: WHITE,
    activationText: BLACK,
    image: "https://flagcdn.io/fi.svg",
    source: "FlagCDN",
    matrix: [WHITE, NAVY, WHITE, NAVY, NAVY, NAVY, WHITE, NAVY, WHITE],
  },
  {
    id: "polonia",
    name: "Polônia",
    kind: "País",
    activation: "Branco",
    activationHex: WHITE,
    activationText: BLACK,
    image: "https://flagcdn.io/pl.svg",
    source: "FlagCDN",
    matrix: [WHITE, WHITE, WHITE, WHITE, WHITE, WHITE, RED, RED, RED],
  },
  {
    id: "grecia",
    name: "Grécia",
    kind: "País",
    activation: "Branco",
    activationHex: WHITE,
    activationText: BLACK,
    image: "https://flagcdn.io/gr.svg",
    source: "FlagCDN",
    matrix: [NAVY, WHITE, NAVY, WHITE, NAVY, WHITE, NAVY, WHITE, NAVY],
  },
  {
    id: "espirito-santo",
    name: "Espírito Santo",
    kind: "Estado brasileiro",
    activation: "Rosa",
    activationHex: PINK,
    activationText: BLACK,
    image: "https://upload.wikimedia.org/wikipedia/commons/4/43/Bandeira_do_Esp%C3%ADrito_Santo.svg",
    source: "Wikimedia Commons",
    matrix: [LIGHT_BLUE, LIGHT_BLUE, LIGHT_BLUE, WHITE, WHITE, WHITE, PINK, PINK, PINK],
  },
  {
    id: "brasil",
    name: "Brasil",
    kind: "País",
    activation: "Amarelo",
    activationHex: YELLOW,
    activationText: BLACK,
    image: "https://flagcdn.io/br.svg",
    source: "FlagCDN",
    matrix: [GREEN, YELLOW, GREEN, YELLOW, NAVY, YELLOW, GREEN, YELLOW, GREEN],
  },
  {
    id: "colombia",
    name: "Colômbia",
    kind: "País",
    activation: "Amarelo",
    activationHex: YELLOW,
    activationText: BLACK,
    image: "https://flagcdn.io/co.svg",
    source: "FlagCDN",
    matrix: [YELLOW, YELLOW, YELLOW, YELLOW, YELLOW, YELLOW, NAVY, RED, RED],
  },
  {
    id: "suecia",
    name: "Suécia",
    kind: "País",
    activation: "Amarelo",
    activationHex: YELLOW,
    activationText: BLACK,
    image: "https://flagcdn.io/se.svg",
    source: "FlagCDN",
    matrix: [NAVY, YELLOW, NAVY, YELLOW, YELLOW, YELLOW, NAVY, YELLOW, NAVY],
  },
  {
    id: "ucrania",
    name: "Ucrânia",
    kind: "País",
    activation: "Amarelo",
    activationHex: YELLOW,
    activationText: BLACK,
    image: "https://flagcdn.io/ua.svg",
    source: "FlagCDN",
    matrix: [LIGHT_BLUE, LIGHT_BLUE, LIGHT_BLUE, LIGHT_BLUE, LIGHT_BLUE, LIGHT_BLUE, YELLOW, YELLOW, YELLOW],
  },
  {
    id: "nigeria",
    name: "Nigéria",
    kind: "País",
    activation: "Verde",
    activationHex: GREEN,
    activationText: WHITE,
    image: "https://flagcdn.io/ng.svg",
    source: "FlagCDN",
    matrix: [GREEN, WHITE, GREEN, GREEN, WHITE, GREEN, GREEN, WHITE, GREEN],
  },
  {
    id: "italia",
    name: "Itália",
    kind: "País",
    activation: "Verde",
    activationHex: GREEN,
    activationText: WHITE,
    image: "https://flagcdn.io/it.svg",
    source: "FlagCDN",
    matrix: [GREEN, WHITE, RED, GREEN, WHITE, RED, GREEN, WHITE, RED],
  },
  {
    id: "mexico",
    name: "México",
    kind: "País",
    activation: "Verde",
    activationHex: GREEN,
    activationText: WHITE,
    image: "https://flagcdn.io/mx.svg",
    source: "FlagCDN",
    matrix: [GREEN, WHITE, RED, GREEN, GREEN, RED, GREEN, WHITE, RED],
  },
  {
    id: "irlanda",
    name: "Irlanda",
    kind: "País",
    activation: "Verde",
    activationHex: GREEN,
    activationText: WHITE,
    image: "https://flagcdn.io/ie.svg",
    source: "FlagCDN",
    matrix: [GREEN, WHITE, ORANGE, GREEN, WHITE, ORANGE, GREEN, WHITE, ORANGE],
  },
];

const ACTIVATION_GROUPS = [
  { name: "Azul escuro", hex: NAVY },
  { name: "Azul claro", hex: LIGHT_BLUE },
  { name: "Preto", hex: BLACK },
  { name: "Vermelho", hex: RED },
  { name: "Branco", hex: WHITE },
  { name: "Rosa", hex: PINK },
  { name: "Amarelo", hex: YELLOW },
  { name: "Verde", hex: GREEN },
].map((color) => ({ ...color, count: FLAGS.filter((flag) => flag.activation === color.name).length }));

export default function FlagDrawPage() {
  const [history, setHistory] = useState<DrawEntry[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: DrawEntry[] = JSON.parse(saved);
        setHistory(parsed);
        setCurrentId(parsed[0]?.flagId ?? null);
      }
    } catch {
      // O sorteio continua mesmo sem armazenamento local.
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (loaded) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history, loaded]);

  const currentFlag = useMemo(() => FLAGS.find((flag) => flag.id === currentId) ?? null, [currentId]);
  const currentRound = history[0]?.round ?? 0;

  function drawFlag() {
    const available = FLAGS.filter((flag) => flag.id !== currentId);
    const random = new Uint32Array(1);
    window.crypto.getRandomValues(random);
    const selected = available[random[0] % available.length];
    const entry: DrawEntry = {
      id: `${Date.now()}-${selected.id}`,
      flagId: selected.id,
      round: currentRound + 1,
    };
    setCurrentId(selected.id);
    setHistory((entries) => [entry, ...entries]);
  }

  function resetDraws() {
    setHistory([]);
    setCurrentId(null);
  }

  return (
    <main className="arena-shell flag-shell">
      <div className="arena-grid" aria-hidden="true" />
      <div className="relative mx-auto w-full max-w-[1320px] px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <nav className="app-nav" aria-label="Ferramentas do campeonato">
          <Link href="/" className="app-nav-link"><Timer /> Cronômetro</Link>
          <Link href="/bandeiras" className="app-nav-link app-nav-link-active"><Grid3X3 /> Sorteador de bandeiras</Link>
        </nav>

        <header className="flag-header">
          <div>
            <p className="eyebrow">Desafio da matriz LED 3×3</p>
            <h1>Sorteador de <span>bandeiras</span></h1>
            <p>{FLAGS.length} bandeiras oficiais distribuídas entre oito cores de acionamento. Uma combinação por rodada.</p>
          </div>
          <div className="draw-controls">
            <div className="round-chip round-chip-wide"><span>Próxima rodada</span><strong>{currentRound + 1}</strong></div>
            <Button onClick={drawFlag} className="draw-button h-14 rounded-xl px-7 text-base font-black uppercase tracking-[0.06em]">
              <Dices /> {currentFlag ? "Sortear próxima" : "Sortear bandeira"}
            </Button>
          </div>
        </header>

        {currentFlag ? (
          <section className="flag-result" aria-live="polite">
            <article className="flag-panel official-flag-panel">
              <div className="panel-label"><span>01</span> Bandeira oficial</div>
              <div className="official-flag-frame">
                <img src={currentFlag.image} alt={`Bandeira oficial de ${currentFlag.name}`} />
              </div>
              <div className="flag-identity">
                <div><p>{currentFlag.kind}</p><h2>{currentFlag.name}</h2></div>
                <strong>Rodada {currentRound}</strong>
              </div>
            </article>

            <article className="flag-panel matrix-panel">
              <div className="panel-label"><span>02</span> Matriz LED 3×3</div>
              <div className="led-board" role="img" aria-label={`Representação simplificada da bandeira de ${currentFlag.name} em nove LEDs`}>
                {currentFlag.matrix.map((color, index) => (
                  <span key={`${currentFlag.id}-${index}`} className="led-cell" style={{ backgroundColor: color, boxShadow: `inset 0 0 0 2px rgba(255,255,255,.12), 0 0 18px ${color}66` }} />
                ))}
              </div>
              <p className="matrix-hint">Reproduza as nove posições na mesma ordem.</p>
            </article>

            <article className="flag-panel sensor-panel" style={{ backgroundColor: currentFlag.activationHex, color: currentFlag.activationText }}>
              <div className="panel-label panel-label-sensor"><span>03</span> Cor de acionamento</div>
              <div className="sensor-orbit"><Lightbulb /></div>
              <div className="sensor-copy"><p>Mostre ao sensor de luz</p><h2>{currentFlag.activation}</h2></div>
              <div className="color-code"><span style={{ backgroundColor: currentFlag.activationHex }} /> {currentFlag.activationHex.toUpperCase()}</div>
            </article>
          </section>
        ) : (
          <section className="draw-empty">
            <div className="draw-empty-icon"><Dices /></div>
            <p className="eyebrow">Rodada 1 preparada</p>
            <h2>{FLAGS.length} bandeiras estão no jogo.</h2>
            <p>Use “Sortear bandeira” para revelar simultaneamente a referência oficial, a matriz 3×3 e a cor que acionará o sensor.</p>
            <div className="color-counts" aria-label="Quantidade de bandeiras por cor">
              {ACTIVATION_GROUPS.map((color) => (
                <span className="color-count-chip" key={color.name}>
                  <i style={{ backgroundColor: color.hex }} /> {color.name} <strong>{color.count}</strong>
                </span>
              ))}
            </div>
          </section>
        )}

        {history.length > 0 && (
          <section className="draw-history" aria-labelledby="history-title">
            <div className="history-heading">
              <div><p className="eyebrow">Registro da sessão</p><h2 id="history-title">Últimas rodadas</h2></div>
              <AlertDialog>
                <AlertDialogTrigger asChild><Button variant="ghost" className="text-slate-400 hover:bg-red-500/10 hover:text-red-300"><RotateCcw /> Reiniciar</Button></AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader><AlertDialogTitle>Reiniciar o sorteador?</AlertDialogTitle><AlertDialogDescription>O histórico será apagado e a próxima bandeira voltará a ser a rodada 1.</AlertDialogDescription></AlertDialogHeader>
                  <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction variant="destructive" onClick={resetDraws}>Reiniciar sorteio</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            <div className="history-list">
              {history.slice(0, 8).map((entry) => {
                const flag = FLAGS.find((item) => item.id === entry.flagId)!;
                return <div className="history-item" key={entry.id}><strong>#{entry.round}</strong><img src={flag.image} alt="" /><span>{flag.name}</span><em style={{ color: flag.activationHex }}>{flag.activation}</em></div>;
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
