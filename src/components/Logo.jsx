export default function Logo({ compact = false }) {
  return (
    <div className="flex items-center gap-2.5">
      <img
        src="/tala-mboka-logo.svg"
        alt="Tala Mboka"
        className={compact ? "h-10 w-10 rounded-xl object-contain" : "h-12 w-12 rounded-xl object-contain"}
      />
      <div className="leading-tight">
        <p className="font-heading text-lg font-black tracking-normal">
          <span className="text-[#062653]">TALA </span>
          <span className="text-[#15803d]">MBOKA</span>
        </p>
        <p className={`${compact ? "text-[11px]" : "hidden text-xs sm:block"} font-semibold text-slate-500`}>
          Signaler pour changer
        </p>
      </div>
    </div>
  );
}
