import { CheckCircle2, Copy, ExternalLink, Mail, ShieldCheck, Target, UserRound } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import Logo from "../components/Logo.jsx";
import { VERSION } from "../config/version.js";

const features = [
  "Signaler un probleme en quelques secondes",
  "Voir les incidents autour de soi",
  "Suivre l'evolution des situations signalees",
  "Contribuer a rendre son quartier plus sur et plus propre",
  "Donner de la visibilite aux problemes souvent ignores"
];

export default function About() {
  const [copied, setCopied] = useState(false);

  async function copyVersion() {
    await navigator.clipboard?.writeText(VERSION);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Card className="w-full overflow-hidden">
        <div className="bg-white p-5 sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Logo />
              <h1 className="mt-5 font-heading text-3xl font-black leading-tight text-text">A propos</h1>
              <p className="mt-2 max-w-xl text-base font-bold leading-7 text-slate-700">
                Tala Mboka est une plateforme citoyenne qui permet a chacun de signaler facilement les problemes de son
                quartier : routes degradees, coupures d'electricite, insecurite, insalubrite, et bien plus.
              </p>
              <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-slate-600">
                Grace a Tala Mboka, chaque signalement devient visible, localise et suivi. Les citoyens peuvent ainsi
                alerter, informer et contribuer a ameliorer leur environnement au quotidien.
              </p>
            </div>
            <div className="rounded-2xl border border-white bg-white/85 p-3 shadow-sm">
              <p className="text-xs font-black uppercase text-slate-500">Version</p>
              <div className="mt-2 flex items-center gap-2">
                <Link
                  to="/about"
                  className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-blue-50 px-3 text-sm font-black text-primary"
                  title="Changelog a venir"
                >
                  v{VERSION}
                  <ExternalLink size={14} />
                </Link>
                <button
                  type="button"
                  onClick={copyVersion}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-primary/40 hover:bg-blue-50 hover:text-primary"
                  aria-label="Copier la version"
                  title="Copier la version"
                >
                  <Copy size={17} />
                </button>
              </div>
              {copied && <p className="mt-2 text-xs font-bold text-success">Version copiee</p>}
            </div>
          </div>
        </div>

        <div className="space-y-5 p-5 sm:p-7">
          <section>
            <div className="flex items-center gap-2">
              <Target className="text-primary" size={20} />
              <h2 className="font-heading text-lg font-black text-text">Pourquoi utiliser Tala Mboka ?</h2>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {features.map((feature) => (
                <div key={feature} className="flex items-start gap-2 rounded-2xl bg-slate-50 p-3 text-sm font-bold text-slate-700">
                  <CheckCircle2 className="mt-0.5 shrink-0 text-success" size={17} />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl bg-emerald-50 p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 shrink-0 text-success" size={22} />
              <div>
                <h2 className="font-heading text-lg font-black text-emerald-950">Impact</h2>
                <p className="mt-2 text-sm font-bold leading-6 text-emerald-900">
                  Tala Mboka donne une voix aux citoyens. Chaque signalement aide a mieux comprendre les realites du
                  terrain et a encourager des actions concretes pour ameliorer les conditions de vie.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-100 p-4">
            <h2 className="font-heading text-lg font-black text-text">Vision</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
              Notre ambition est de creer une communaute active ou chaque citoyen peut participer au changement de son
              environnement, simplement avec son telephone.
            </p>
          </section>

          <div className="grid gap-3 sm:grid-cols-2">
            <section className="rounded-2xl border border-slate-100 p-4">
              <div className="flex items-center gap-2">
                <Mail className="text-primary" size={20} />
                <h2 className="font-heading text-lg font-black text-text">Contact</h2>
              </div>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                Pour une assistance, une suggestion ou un partenariat, contactez l'equipe Tala Mboka.
              </p>
              <a href="mailto:contact@talamboka.app" className="mt-3 inline-flex text-sm font-black text-primary">
                contact@talamboka.app
              </a>
            </section>

            <section className="rounded-2xl border border-slate-100 p-4">
              <div className="flex items-center gap-2">
                <UserRound className="text-primary" size={20} />
                <h2 className="font-heading text-lg font-black text-text">Developpeur</h2>
              </div>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                Application developpee par Moise Mopepe pour encourager la participation citoyenne et moderniser le
                suivi des problemes urbains.
              </p>
            </section>
          </div>

          <Button as={Link} to="/profile" type="button" variant="ghost" className="w-full sm:w-auto">
            Retour au profil
          </Button>
        </div>
      </Card>
    </div>
  );
}
