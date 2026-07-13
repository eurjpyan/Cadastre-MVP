import React from 'react';
import { supabase } from '../supabaseClient';

export default function Sidebar({ currentSection, setCurrentSection, isAdmin, userEmail }) {
  return (
    <div class="sidebar">
      <div class="sb-head">
        <div class="sb-logo">C</div>
        <span class="auth-brand" style={{ fontSize: '18px', marginBottom: 0 }}>Cadastre<span>Pro</span></span>
      </div>
      <div class="sb-nav">
        <div class={`sb-link ${currentSection === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentSection('dashboard')}>🏠 Vue d'ensemble</div>
        <div class={`sb-link ${currentSection === 'properties' ? 'active' : ''}`} onClick={() => setCurrentSection('properties')}>🏢 Patrimoine & Biens</div>
        <div class={`sb-link ${currentSection === 'tenants' ? 'active' : ''}`} onClick={() => setCurrentSection('tenants')}>👥 Profils Locataires</div>
        <div class={`sb-link ${currentSection === 'renovations' ? 'active' : ''}`} onClick={() => setCurrentSection('renovations')}>🛠️ Suivi Rénovations</div>
        <div class={`sb-link ${currentSection === 'documents' ? 'active' : ''}`} onClick={() => setCurrentSection('documents')}>📁 Gestion Documents</div>
        
        {isAdmin && (
          <div class={`sb-link admin-link ${currentSection === 'admin' ? 'active' : ''}`} onClick={() => setCurrentSection('admin')}>🛡️ Panel Administrateur</div>
        )}
      </div>
      <div class="sb-foot">
        <div class="sb-user">
          <div class="sb-avatar">{userEmail?.substring(0,2).toUpperCase()}</div>
          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{userEmail}</div>
        </div>
        <button class="btn btn-ghost btn-sm" onClick={() => supabase.auth.signOut()}>Déconnexion</button>
      </div>
    </div>
  );
}
