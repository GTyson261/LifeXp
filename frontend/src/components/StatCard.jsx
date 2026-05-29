export default function StatCard({ icon = "✨", label, value, detail, accent }) {
  return (
    <div className="stat-card" style={accent ? { "--stat-accent": accent } : undefined}>
      <div className="stat-icon">{icon}</div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        {detail && <p>{detail}</p>}
      </div>
    </div>
  );
}