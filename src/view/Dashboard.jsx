import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function Dashboard({ user }) {
  const [metrics, setMetrics] = useState({ rev: 0, cashflow: 0, invest: 0, occupancy: 0 });
  const [chartData, setChartData] = useState(null);
  const [occData, setOccData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const { data: properties } = await supabase.from('properties').select('*').order('created_at');
    if (!properties) return;

    let totalRev = 0, totalLoan = 0, totalInvest = 0, totalTax = 0, vacantCount = 0;
    let names = [], rents = [], loans = [];

    properties.forEach(p => {
      totalInvest += Number(p.purchase_price) || 0;
      totalTax += Number(p.property_tax) || 0;
      names.push(p.name);
      rents.push(Number(p.rent) || 0);
      loans.push(Number(p.loan_monthly) || 0);

      if (p.vacant) vacantCount++;
      else totalRev += Number(p.rent) || 0;
      totalLoan += Number(p.loan_monthly) || 0;
    });

    const calculatedCashflow = totalRev - totalLoan - (totalTax / 12);
    const occRate = properties.length ? Math.round(((properties.length - vacantCount) / properties.length) * 100) : 0;

    setMetrics({
      rev: totalRev,
      cashflow: calculatedCashflow,
      invest: totalInvest,
      occupancy: occRate
    });

    setChartData({
      labels: names,
      datasets: [
        { label: 'Loyer HC (€)', data: rents, backgroundColor: '#4F46E5', borderRadius: 4 },
        { label: 'Crédit Mensuel (€)', data: loans, backgroundColor: '#94A3B8', borderRadius: 4 }
      ]
    });

    setOccData({
      labels: ['Occupés', 'Vacants'],
      datasets: [{ data: [properties.length - vacantCount, vacantCount], backgroundColor: ['#10B981', '#EF4444'] }]
    });
  };

  return (
    <div>
      <div class="page-header">
        <div>
          <h1 class="page-title">Tableau de Bord</h1>
          <p class="page-sub">Performance financière de vos investissements personnels.</p>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card"><span class="stat-label">Loyers Mensuels</span><div class="stat-val">{metrics.rev.toLocaleString()} €</div></div>
        <div class="stat-card"><span class="stat-label">Cashflow Estimé</span><div class="stat-val" style={{ color: '#10B981' }}>{Math.round(metrics.cashflow).toLocaleString()} €/m</div></div>
        <div class="stat-card"><span class="stat-label">Patrimoine Engagé</span><div class="stat-val">{metrics.invest.toLocaleString()} €</div></div>
        <div class="stat-card"><span class="stat-label">Taux Occupation</span><div class="stat-val">{metrics.occupancy} %</div></div>
      </div>

      <div class="dashboard-grid">
        <div class="chart-card">
          <h4>Flux financiers</h4><br />
          {chartData && <Bar data={chartData} options={{ responsive: true }} />}
        </div>
        <div class="chart-card">
          <h4>Répartition Globale</h4><br />
          {occData && <Doughnut data={occData} options={{ responsive: true }} />}
        </div>
      </div>
    </div>
  );
}
