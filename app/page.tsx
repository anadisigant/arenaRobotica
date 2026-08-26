"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Download, Flag, Grid3X3, Play, RotateCcw, Square, Timer, Trophy } from "lucide-react";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const CLASSES = ["G4/G5", "1º ano", "2º ano", "3º ano", "4º ano", "5º ano"];
const STORAGE_KEY = "arena-robo-resultados-v1";

type Team = "Amarelo" | "Laranja";
type Result = {
  id: string;
  className: string;
  round: number;
  team: Team;
  milliseconds: number;
  recordedAt: string;
};
type RaceState = "ready" | "running" | "finished";

function formatTime(milliseconds: number) {
  const safe = Math.max(0, milliseconds);
  const minutes = Math.floor(safe / 60000);
  const seconds = Math.floor((safe % 60000) / 1000);
  const hundredths = Math.floor((safe % 1000) / 10);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(hundredths).padStart(2, "0")}`;
}

function formatRecordedAt(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function csvCell(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

export default function Home() {
  const [selectedClass, setSelectedClass] = useState(CLASSES[0]);
  const [raceState, setRaceState] = useState<RaceState>("ready");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const [yellowTime, setYellowTime] = useState<number | null>(null);
  const [orangeTime, setOrangeTime] = useState<number | null>(null);
  const [activeRound, setActiveRound] = useState(1);
  const [results, setResults] = useState<Result[]>([]);
  const [loaded, setLoaded] = useState(false);
  const startedAtRef = useRef<number | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setResults(JSON.parse(saved));
    } catch {
      // A disputa continua mesmo quando o navegador bloqueia o armazenamento.
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
  }, [results, loaded]);

  useEffect(() => {
    if (raceState !== "running") return;
    const timer = window.setInterval(() => setNow(performance.now()), 20);
    return () => window.clearInterval(timer);
  }, [raceState]);

  const currentRound = useMemo(() => {
    const rounds = results.filter((result) => result.className === selectedClass).map((result) => result.round);
    return (rounds.length ? Math.max(...rounds) : 0) + 1;
  }, [results, selectedClass]);

  const liveElapsed = startedAt === null ? 0 : now - startedAt;
  const yellowDisplay = yellowTime ?? liveElapsed;
  const orangeDisplay = orangeTime ?? liveElapsed;
  const bothStopped = yellowTime !== null && orangeTime !== null;

  function startRace() {
    const start = performance.now();
    setActiveRound(currentRound);
    startedAtRef.current = start;
    setStartedAt(start);
    setNow(start);
    setYellowTime(null);
    setOrangeTime(null);
    setRaceState("running");
  }

  function stopTeam(team: Team) {
    const start = startedAtRef.current;
    if (raceState !== "running" || start === null) return;
    const elapsed = performance.now() - start;
    const result: Result = {
      id: `${Date.now()}-${team}`,
      className: selectedClass,
      round: activeRound,
      team,
      milliseconds: Math.round(elapsed),
      recordedAt: new Date().toISOString(),
    };
    if (team === "Amarelo" && yellowTime === null) {
      setYellowTime(elapsed);
      setResults((current) => [result, ...current]);
    }
    if (team === "Laranja" && orangeTime === null) {
      setOrangeTime(elapsed);
      setResults((current) => [result, ...current]);
    }
  }

  useEffect(() => {
    if (raceState === "running" && bothStopped) {
      setRaceState("finished");
      startedAtRef.current = null;
    }
  }, [bothStopped, raceState]);

  function exportCsv() {
    if (!results.length) return;
    const header = ["Turma", "Rodada", "Time", "Tempo", "Milissegundos", "Registrado em"];
    const rows = [...results].reverse().map((result) => [result.className, result.round, result.team, formatTime(result.milliseconds), result.milliseconds, new Date(result.recordedAt).toLocaleString("pt-BR")]);
    const csv = [header, ...rows].map((row) => row.map(csvCell).join(";")).join("\n");
    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `resultados-robotica-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function clearCompetition() {
    setResults([]);
    setRaceState("ready");
    setStartedAt(null);
    startedAtRef.current = null;
    setYellowTime(null);
    setOrangeTime(null);
    setNow(0);
  }

  return (
    <main className="arena-shell">
      <div className="arena-grid" aria-hidden="true" />
      <div className="relative mx-auto w-full max-w-[1480px] px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <nav className="app-nav" aria-label="Ferramentas do campeonato">
          <Link href="/" className="app-nav-link app-nav-link-active"><Timer /> Cronômetro</Link>
          <Link href="/bandeiras" className="app-nav-link"><Grid3X3 /> Sorteador de bandeiras</Link>
        </nav>
        <header className="mb-5 flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-slate-400"><span className="status-dot" /> Arena de desafios</div>
            <h1 className="text-3xl font-black uppercase tracking-[-0.04em] text-white sm:text-4xl">Cronômetro <span className="text-orange-400">Robótica</span></h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="class-picker">
              <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Turma da rodada</label>
              <Select value={selectedClass} onValueChange={setSelectedClass} disabled={raceState === "running"}>
                <SelectTrigger className="mt-1 h-10 w-40 border-white/10 bg-white/5 font-bold text-white shadow-none"><SelectValue /></SelectTrigger>
                <SelectContent>{CLASSES.map((className) => <SelectItem key={className} value={className}>{className}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="round-chip"><span>Rodada</span><strong>{raceState === "running" ? activeRound : currentRound}</strong></div>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-2" aria-label="Cronômetros dos times">
          <TeamTimer team="Amarelo" time={yellowDisplay} stopped={yellowTime !== null} running={raceState === "running"} onStop={() => stopTeam("Amarelo")} />
          <TeamTimer team="Laranja" time={orangeDisplay} stopped={orangeTime !== null} running={raceState === "running"} onStop={() => stopTeam("Laranja")} />
        </section>

        <section className="control-strip" aria-label="Controles da rodada">
          <div className="hidden items-center gap-3 text-sm text-slate-400 md:flex">
            <Flag className="size-5 text-slate-500" />
            <span>{raceState === "running" ? "Cronômetros em andamento" : raceState === "finished" ? "Rodada registrada. Prontos para a próxima?" : "Selecione a turma e posicione os robôs"}</span>
          </div>
          <Button onClick={startRace} disabled={raceState === "running"} className="start-button h-14 w-full rounded-xl bg-white px-8 text-base font-black uppercase tracking-[0.08em] text-slate-950 hover:bg-slate-100 md:w-auto">
            <Play className="fill-current" />{raceState === "finished" ? "Iniciar nova rodada" : "Iniciar os dois"}
          </Button>
          <p className="text-center text-xs text-slate-500 md:hidden">{raceState === "running" ? "Cronômetros em andamento" : "Um toque inicia os dois times"}</p>
        </section>

        <section className="results-panel mt-6" aria-labelledby="results-title">
          <div className="flex flex-col gap-4 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <p className="eyebrow">Histórico da competição</p>
              <h2 id="results-title" className="mt-1 text-xl font-black text-white">Tempos registrados <span className="text-slate-500">({results.length})</span></h2>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportCsv} disabled={!results.length} className="border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"><Download /> Exportar CSV</Button>
              <AlertDialog>
                <AlertDialogTrigger asChild><Button variant="ghost" disabled={!results.length || raceState === "running"} className="text-slate-400 hover:bg-red-500/10 hover:text-red-300" aria-label="Limpar todos os resultados"><RotateCcw /></Button></AlertDialogTrigger>
                <AlertDialogContent className="border-slate-200">
                  <AlertDialogHeader><AlertDialogTitle>Começar uma nova competição?</AlertDialogTitle><AlertDialogDescription>Todos os tempos registrados serão apagados deste dispositivo. Exporte o CSV antes, se precisar guardar os resultados.</AlertDialogDescription></AlertDialogHeader>
                  <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction variant="destructive" onClick={clearCompetition}>Limpar resultados</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {results.length ? (
            <Table>
              <TableHeader><TableRow className="border-white/10 hover:bg-transparent"><TableHead className="px-5 text-xs uppercase tracking-widest text-slate-500">Turma</TableHead><TableHead className="text-xs uppercase tracking-widest text-slate-500">Rodada</TableHead><TableHead className="text-xs uppercase tracking-widest text-slate-500">Time</TableHead><TableHead className="text-xs uppercase tracking-widest text-slate-500">Registro</TableHead><TableHead className="px-5 text-right text-xs uppercase tracking-widest text-slate-500">Tempo</TableHead></TableRow></TableHeader>
              <TableBody>{results.map((result) => (
                <TableRow key={result.id} className="border-white/[0.07] hover:bg-white/[0.03]">
                  <TableCell className="px-5 font-bold text-white">{result.className}</TableCell><TableCell className="text-slate-400">#{result.round}</TableCell>
                  <TableCell><span className={`team-pill ${result.team === "Amarelo" ? "team-pill-yellow" : "team-pill-orange"}`}><span /> {result.team}</span></TableCell>
                  <TableCell className="text-slate-500">{formatRecordedAt(result.recordedAt)}</TableCell><TableCell className="px-5 text-right font-mono text-lg font-black tabular-nums text-white">{formatTime(result.milliseconds)}</TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          ) : (
            <Empty className="min-h-56 border-0 text-slate-400"><EmptyHeader><EmptyMedia variant="icon" className="bg-white/5 text-slate-400"><Trophy /></EmptyMedia><EmptyTitle className="text-white">A pista está pronta</EmptyTitle><EmptyDescription className="text-slate-500">O primeiro tempo aparecerá aqui assim que um dos times parar o cronômetro.</EmptyDescription></EmptyHeader></Empty>
          )}
        </section>
      </div>
    </main>
  );
}

function TeamTimer({ team, time, stopped, running, onStop }: { team: Team; time: number; stopped: boolean; running: boolean; onStop: () => void }) {
  const yellow = team === "Amarelo";
  return (
    <article className={`timer-card ${yellow ? "timer-yellow" : "timer-orange"}`}>
      <div className="timer-card-top">
        <div className="flex items-center gap-3"><span className="team-beacon" aria-hidden="true" /><div><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-950/55">Time</p><h2 className="text-2xl font-black uppercase tracking-tight text-slate-950">{team}</h2></div></div>
        <span className="timer-status">{stopped ? "Finalizado" : running ? "Em pista" : "Aguardando"}</span>
      </div>
      <div className="timer-display" aria-live="off" aria-label={`Tempo do time ${team}: ${formatTime(time)}`}>{formatTime(time)}</div>
      <Button onClick={onStop} disabled={!running || stopped} className="stop-button h-16 w-full rounded-xl border-2 border-slate-950 bg-slate-950 text-base font-black uppercase tracking-[0.1em] text-white hover:bg-slate-900 disabled:border-slate-950/20 disabled:bg-slate-950/15 disabled:text-slate-950/40"><Square className="fill-current" />{stopped ? "Tempo registrado" : `Parar ${team}`}</Button>
    </article>
  );
}
