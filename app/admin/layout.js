import './admin.css';

export const metadata = {
  title: 'ניהול | תיאטרונית',
  description: 'אזור ניהול תיאטרונית',
};

export default function AdminLayout({ children }) {
  return (
    <div className="admin-layout">
      {children}
    </div>
  );
}
