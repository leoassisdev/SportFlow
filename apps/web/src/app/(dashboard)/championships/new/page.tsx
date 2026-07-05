'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SPORTS, type SportKey } from '@/lib/constants';
import { useCreateChampionship } from '@/hooks/useChampionships';
import { asApiError } from '@/lib/api';

const STEPS = ['esporte', 'info', 'config', 'categorias', 'revisao'] as const;
type Step = (typeof STEPS)[number];

export default function NewChampionshipPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('esporte');
  const [sport, setSport] = useState<SportKey | null>(null);
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const create = useCreateChampionship();

  const currentIndex = STEPS.indexOf(step);
  const next = () => setStep(STEPS[Math.min(STEPS.length - 1, currentIndex + 1)] ?? step);
  const prev = () => setStep(STEPS[Math.max(0, currentIndex - 1)] ?? step);

  const submit = async () => {
    if (!sport || !name) return;
    setErrMsg(null);
    try {
      const created = await create.mutateAsync({
        name,
        sportType: sport,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      router.push(`/championships/${created.id}`);
    } catch (err) {
      setErrMsg(asApiError(err).message);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <p className="text-xs uppercase tracking-widest text-ink-100">Novo campeonato</p>
        <h1 className="font-display text-3xl font-black">Crie em 5 passos</h1>
      </div>

      <ol className="flex flex-wrap gap-2">
        {STEPS.map((s, i) => (
          <li
            key={s}
            className={`flex-1 rounded-xl border px-3 py-2 text-xs uppercase tracking-wide ${
              i === currentIndex
                ? 'border-brand-500 bg-brand-500/10 text-brand-300'
                : i < currentIndex
                  ? 'border-success/40 bg-success/10 text-success'
                  : 'border-ink-800 bg-ink-900 text-ink-400'
            }`}
          >
            {i + 1}. {s}
          </li>
        ))}
      </ol>

      {step === 'esporte' ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {SPORTS.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setSport(s.key)}
              className={`relative overflow-hidden rounded-2xl border p-6 text-left transition ${
                sport === s.key ? 'border-brand-500 shadow-glow' : 'border-ink-800 hover:border-ink-700'
              }`}
            >
              <Image
                src={`/imagens/v2/${s.key}/background-cards.png`}
                alt=""
                fill
                className="object-cover opacity-40"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/70 to-transparent" />
              <div className="relative">
                <span className="text-4xl">{s.icon}</span>
                <p className="mt-6 font-display text-xl font-bold">{s.label}</p>
              </div>
            </button>
          ))}
        </div>
      ) : null}

      {step === 'info' ? (
        <div className="card space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-100">
              Nome do campeonato
            </label>
            <input
              className="input-base"
              placeholder="Interbairros 2026"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-100">Inicio</label>
              <input type="date" className="input-base" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-100">Fim</label>
              <input type="date" className="input-base" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
        </div>
      ) : null}

      {step === 'config' ? (
        <div className="card space-y-4 text-sm text-ink-100">
          <p>
            Configuracao padrao para <b className="text-white">{sport}</b> ja aplicada. Ajustes finos na versao real.
          </p>
          <pre className="rounded-xl bg-ink-950 p-4 font-mono text-xs">
            {JSON.stringify(
              {
                sport,
                config:
                  sport === 'futebol'
                    ? { periods: 2, periodDuration: 45, hasTimer: true }
                    : sport === 'tenis'
                      ? { setsToWin: 2, gamesPerSet: 6, tieBreakAt: 6 }
                      : sport === 'volei'
                        ? { setsToWin: 3, pointsPerSet: 25 }
                        : { rounds: 3, maxScore: 100 },
              },
              null,
              2,
            )}
          </pre>
        </div>
      ) : null}

      {step === 'categorias' ? (
        <div className="card space-y-3">
          <p className="text-sm text-ink-100">Categorias sao opcionais no MVP.</p>
          <input className="input-base" placeholder="Ex: Masculino sub-17" />
          <button className="btn-ghost text-xs" type="button">
            + Adicionar categoria
          </button>
        </div>
      ) : null}

      {step === 'revisao' ? (
        <div className="card space-y-3">
          <h3 className="font-display text-xl font-bold">Confirme</h3>
          <ul className="text-sm text-ink-100">
            <li>Esporte: <b className="text-white">{sport ?? '—'}</b></li>
            <li>Nome: <b className="text-white">{name || '—'}</b></li>
            <li>Inicio: <b className="text-white">{startDate || '—'}</b></li>
            <li>Fim: <b className="text-white">{endDate || '—'}</b></li>
          </ul>
          {errMsg ? <p className="text-sm text-danger">{errMsg}</p> : null}
          <button className="btn-accent" onClick={submit} disabled={!sport || !name || create.isPending}>
            {create.isPending ? 'Criando...' : 'Criar campeonato'}
          </button>
        </div>
      ) : null}

      <div className="flex justify-between">
        <button className="btn-ghost" onClick={prev} disabled={currentIndex === 0} type="button">
          Voltar
        </button>
        {step !== 'revisao' ? (
          <button className="btn-primary" onClick={next} disabled={step === 'esporte' && !sport} type="button">
            Avancar
          </button>
        ) : null}
        <Link href="/championships" className="btn-ghost text-xs">
          Cancelar
        </Link>
      </div>
    </div>
  );
}
