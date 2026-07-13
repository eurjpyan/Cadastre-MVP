import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function AdminPanel() {
  const [stats, setStats] = useState([]);
  const [logs, setLogs] = useState([]);
  const [totals, setTotals] = useState({ users: 0, props: 0, rents: 0, storage: 0 });

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    const { data: usersStats } = await supabase.rpc('get_admin_users_stats');
    const { data: activityLogs } = await supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(20);
    const { data: allProps } = await supabase.from('properties').select('rent, vacant');
    const { data: allDocs } = await supabase.from('document_explorer').select('content, file_url');

    if (usersStats) setStats(usersStats);
    if (activityLogs) setLogs(activityLogs);

    let totalRents = 0, totalBytes = 0;
    allProps?.forEach(p => { if (!p.vacant) totalRents += Number(p.rent) || 0; });
    allDocs?.forEach(d => { totalBytes += (d.content?.length || 0) + (d.file_url?.length || 0); });

    setTotals({
      users: usersStats?.length || 0,
      props: allProps?.length || 0,
      rents: totalRents,
      storage: (totalBytes / (1024 * 1024)).toFixed(2)
    });
  };

  return (
    <div>
      <div class="page-header">
        <div>
          <h1 class="page-title" style={{ color: '#F59E0B' }}>Supervision SaaS Global</h1>
          <p class="page-sub">Métriques serveurs et annuaire des comptes de la plateforme.</p>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card" style={{ borderTop: '4px solid #4F46E5' }}><span class="stat-label">Comptes Clients</span><div class="stat-val">{totals.users}</div></div>
        <div class="stat-card" style={{ borderTop: '4px solid #10B981' }}><span class="stat-label">Biens Hébergés</span><div class="stat-val">{totals.props}</div></div>
        <div class="stat-card" style={{ borderTop: '4px solid #F59E0B' }}><span class="stat-label">Flux Financier SaaS</span><div class="stat-val">{totals.rents.toLocaleString()} €</div></div>
        <div class="stat-card" style={{ borderTop: '4px solid #EF4444' }}><span class="stat-label">Stockage Base Data</span><div class="stat-val">{totals.storage} Mo</div></div>
      </div>

      <div class="dashboard-grid" style={{ gridTemplateColumns: '3fr 2fr' }}>
        <div class="table-box">
          <div style={{ padding: '16px', fontWeight: 700 }}>Répertoire Global des Utilisateurs</div>
          <table>
            <thead>
              <tr><th>Email</th><th>Inscription</th><th>Biens</th><th>Loyer Cumulé</th></tr>
            </thead>
            <tbody>
              {stats.map(u => (
                <tr key={u.id}>
                  <td><b>{u.email}</b></td>
                  <td>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td><span class="badge success">{u.properties_count}</span></td>
                  <td><b>{u.total_rent} €</b></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div class="chart-card">
          <h4>Journal de Bord de l'écosystème</h4><br />
          <div class="log-feed">
            {logs.map(l => (
              <div class="log-item" key={l.id}>
                <span style={{ fontWeight: 700, color: '#4F46E5' }}>{l.user_email}</span> — {l.action}
                <i style={{ display: 'block', fontSize: '11px', color: '#475569' }}>{l.details}</i>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
