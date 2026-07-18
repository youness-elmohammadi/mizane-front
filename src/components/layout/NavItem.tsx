import { NavLink } from "react-router-dom";

type NavItemProps = {
    icon : string;
    label: string;
} & (
    | { to: string; onClick?: never }
    | { onClick: () => void; to?: never}
);

const BASE =
'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm cursor-pointer ' +
  'transition-all duration-150 border-l-[3px] w-full text-left';

const INACTIF = 'border-transparent text-slate-400 hover:bg-white/[0.08]';
const ACTIF = 'border-indigo-500 bg-indigo-500/30 text-slate-200';

export default function NavItem({ icon, label, to, onClick}: NavItemProps) {
    const contenu = (
        <>
        <i className={`fa-solid ${icon} w-4 text-center`} aria-hidden="true" />
        {label}
        </>
    );

    if(to) {
        return (
            <NavLink
            to={to}
            className={({isActive}) => `${BASE} ${isActive ? ACTIF : INACTIF}`}
            >
                {contenu}
            </NavLink>
        );
    }

    return(
        <button type="button" onClick={onClick} className={`${BASE} ${INACTIF}`}>
            {contenu}
        </button>
    );
}