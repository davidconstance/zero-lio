import { Link, useLocation } from "react-router";
import styles from "./BottomNav.module.css";
import { IoSearch, IoCalendar, IoTicket } from "react-icons/io5";
import { IoChatboxEllipses, IoCog } from "react-icons/io5";

const navItems = [
  { path: "/canchas", icon: IoSearch, label: "Buscar" },
  { path: "/reservar", icon: IoCalendar, label: "Reservar" },
  { path: "/reservaciones", icon: IoTicket, label: "Mis Reservas" },
  { path: "/comentar", icon: IoChatboxEllipses, label: "Comentar" },
  { path: "/config", icon: IoCog, label: "Ajustes" },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className={styles.bottomNav} role="navigation" aria-label="Main navigation">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`${styles.navItem} ${isActive ? styles.active : ""}`}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon className={styles.icon} aria-hidden="true" />
            <span className={styles.label}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
