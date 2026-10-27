// ============================================================
// ICONS — inline SVG helpers（不需外部套件）
// ============================================================

const Icon = ({ d, size=20, stroke="currentColor", fill="none", strokeWidth=2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p,i)=><path key={i} d={p}/>) : <path d={d}/>}
  </svg>
);

export const SearchIcon = () => <Icon d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>;
export const MenuIcon = () => <Icon d="M3 12h18M3 6h18M3 18h18"/>;
export const XIcon = () => <Icon d="M18 6L6 18M6 6l12 12"/>;
export const HeartIcon = ({filled}) => <Icon d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" fill={filled?"#ef4444":"none"} stroke={filled?"#ef4444":"currentColor"}/>;
export const SendIcon = () => <Icon d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>;
export const UserIcon = () => <Icon d={["M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2","M12 11a4 4 0 100-8 4 4 0 000 8z"]}/>;
export const LogInIcon = () => <Icon d={["M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4","M10 17l5-5-5-5","M15 12H3"]}/>;
export const BriefcaseIcon = () => <Icon d={["M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z","M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"]}/>;
export const RefreshIcon = () => <Icon d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>;
export const ShoppingBagIcon = () => <Icon d={["M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z","M3 6h18","M16 10a4 4 0 01-8 0"]}/>;
export const FilterIcon = () => <Icon d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/>;
export const UploadIcon = () => <Icon d={["M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4","M17 8l-5-5-5 5","M12 3v12"]}/>;
export const ClockIcon = () => <Icon d={["M12 2a10 10 0 100 20A10 10 0 0012 2z","M12 6v6l4 2"]}/>;
export const TagIcon = () => <Icon d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01"/>;
export const MessageCircleIcon = () => <Icon d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>;
export const MailIcon = () => <Icon d={["M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z","M22 6l-10 7L2 6"]}/>;
export const MapPinIcon = () => <Icon d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z M12 10a2 2 0 100-4 2 2 0 000 4z"/>;
export const DollarIcon = () => <Icon d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>;
export const ImageIcon = () => <Icon d={["M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z","M12 17a4 4 0 100-8 4 4 0 000 8z"]}/>;
export const UsersIcon = () => <Icon d={["M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2","M9 11a4 4 0 100-8 4 4 0 000 8z","M23 21v-2a4 4 0 00-3-3.87","M16 3.13a4 4 0 010 7.75"]}/>;
export const EditIcon = () => <Icon d={["M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7","M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"]}/>;
export const Trash2Icon = () => <Icon d={["M3 6h18","M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2","M10 11v6","M14 11v6"]}/>;
