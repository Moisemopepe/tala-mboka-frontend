import { ArrowLeft, ChevronDown, ChevronUp, Mail, ShieldCheck, UserRound } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button.jsx";
import Logo from "../components/Logo.jsx";
import { VERSION } from "../config/version.js";

const faqs = [
  {
    question: "À quoi sert Tala Mboka ?",
    answer:
      "Tala Mboka permet aux citoyens de signaler les problèmes rencontrés dans leur quartier afin de les rendre visibles, localisés et plus faciles à suivre. L’objectif est de donner une voix aux habitants et de mieux comprendre les réalités du terrain."
  },
  {
    question: "Comment signaler un incident ?",
    answer:
      "Il suffit d’appuyer sur « Signaler », de choisir le type de problème, d’ajouter une courte description, une photo si possible, puis de confirmer l’emplacement. Le signalement est ensuite publié ou vérifié selon votre statut de connexion."
  },
  {
    question: "Pourquoi activer la géolocalisation ?",
    answer:
      "La géolocalisation permet de placer le signalement au bon endroit. Si elle ne fonctionne pas, vous pouvez sélectionner manuellement la province, la commune et ajuster la position sur la carte."
  },
  {
    question: "Dois-je créer un compte pour signaler ?",
    answer:
      "Non. Vous pouvez envoyer un signalement sans compte. Les signalements envoyés comme invité peuvent être vérifiés avant publication. Avec un compte, vous pouvez suivre plus facilement vos alertes."
  },
  {
    question: "Que deviennent les signalements ?",
    answer:
      "Chaque signalement contribue à rendre un problème visible. Il peut être consulté dans le fil citoyen, affiché sur la carte et suivi selon son évolution."
  }
];

export default function About() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="mx-auto w-full max-w-[920px] pb-8">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-800 shadow-sm transition hover:bg-slate-50 active:scale-95"
        aria-label="Retour"
      >
        <ArrowLeft size={22} />
      </button>

      <section className="rounded-[28px] bg-white px-5 py-9 text-center shadow-sm ring-1 ring-slate-200 sm:px-8 md:py-12">
        <div className="flex justify-center">
          <Logo />
        </div>

        <h1 className="mx-auto mt-8 max-w-2xl font-heading text-3xl font-black leading-tight text-[#071066] sm:text-4xl md:text-5xl">
          Votre allié pour un quartier plus propre, plus sûr et mieux suivi
        </h1>

        <p className="mx-auto mt-8 max-w-2xl text-lg font-medium leading-8 text-slate-800 md:text-xl md:leading-9">
          Grâce à Tala Mboka, chaque citoyen peut contribuer activement à l’amélioration de son cadre de vie.
        </p>

        <p className="mx-auto mt-16 max-w-3xl text-base font-medium leading-8 text-slate-700 md:text-lg md:leading-9">
          Où que vous soyez, signalez en toute simplicité depuis votre smartphone, votre tablette ou votre ordinateur :
          route dégradée, coupure d’électricité, problème d’eau, insalubrité, insécurité, escroquerie ou tout autre
          incident qui mérite d’être vu.
        </p>

        <p className="mx-auto mt-6 max-w-3xl text-base font-medium leading-8 text-slate-700 md:text-lg md:leading-9">
          Il vous suffit de vous géolocaliser, d’ajouter une photo, de décrire la situation et d’envoyer votre
          signalement. Chaque alerte devient visible, localisée et suivie pour aider la communauté à mieux comprendre
          les problèmes du quotidien.
        </p>

        <h2 className="mx-auto mt-14 max-w-2xl text-2xl font-semibold leading-snug text-slate-950 md:text-3xl">
          Avec Tala Mboka, engagez-vous dans une démarche citoyenne simple, utile et moderne.
        </h2>
      </section>

      <section className="mt-6 rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-8">
        <div className="rounded-3xl bg-[#071066] px-6 py-6 text-white">
          <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">Les questions les plus fréquentes.</h2>
        </div>

        <div className="mt-6 divide-y divide-slate-200">
          {faqs.map((item, index) => {
            const isOpen = openFaq === index;
            return (
              <div key={item.question} className="py-5">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? -1 : index)}
                  className="flex w-full items-center justify-between gap-4 text-left text-xl font-semibold leading-8 text-[#071066] transition hover:text-primary"
                >
                  <span>{item.question}</span>
                  {isOpen ? <ChevronUp className="shrink-0 text-slate-300" size={30} /> : <ChevronDown className="shrink-0 text-slate-300" size={30} />}
                </button>
                {isOpen && <p className="mt-5 text-base font-medium leading-8 text-slate-600 md:text-lg">{item.answer}</p>}
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <ShieldCheck className="text-primary" size={24} />
          <h3 className="mt-3 text-lg font-black text-text">Impact</h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
            Tala Mboka donne une voix aux citoyens et aide à rendre les problèmes locaux plus visibles.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <Mail className="text-primary" size={24} />
          <h3 className="mt-3 text-lg font-black text-text">Contact</h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">Une suggestion, une question ou un partenariat ?</p>
          <a href="mailto:contact@talamboka.app" className="mt-2 inline-flex text-sm font-black text-primary">
            contact@talamboka.app
          </a>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <UserRound className="text-primary" size={24} />
          <h3 className="mt-3 text-lg font-black text-text">Développeur</h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
            Application développée par Moïse Mopepe pour encourager la participation citoyenne.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-2xl bg-white p-5 text-center shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-black text-text">Un problème dans votre quartier ?</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm font-semibold leading-6 text-slate-600">
          Décrivez la situation, ajoutez une photo si possible et localisez le problème en quelques secondes.
        </p>
        <div className="mt-4 flex justify-center">
          <Button as={Link} to="/report" type="button" variant="success">
            Signaler maintenant
          </Button>
        </div>
      </section>

      <p className="mt-5 text-center text-xs font-semibold text-slate-400">Tala Mboka · Version {VERSION}</p>
    </div>
  );
}
