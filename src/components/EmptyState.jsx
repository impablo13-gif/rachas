function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="empty-state">
      {Icon && <div className="empty-state-icon"><Icon size={28} strokeWidth={2} /></div>}
      <h3 style={{ fontSize: 17, color: 'var(--text)' }}>{title}</h3>
      {description && <p style={{ fontSize: 14.5, maxWidth: 320, lineHeight: 1.5 }}>{description}</p>}
      {action}
    </div>
  );
}

export default EmptyState;
