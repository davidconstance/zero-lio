import { Link, useLocation } from "react-router";
import styles from "./BottomNav.module.css";
import { IoMdCalendar, IoTicket, IoIosSearch } from "react-icons/io";
import { IoChatboxEllipses, IoIosCog } from "react-icons/io5";

const navItems = [
  { path: "/canchas", icon: IoIosSearch, label: "Buscar" },
  { path: "/reservar", icon: IoMdCalendar, label: "Reservar" },
  { path: "/reservaciones", icon: IoTicket, label: "Mis Reservas" },
  { path: "/comentar", icon: IoChatboxEllipses, label: "Comentar" },
  { path: "/config", icon: IoIosCog, label: "Ajustes" },
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
