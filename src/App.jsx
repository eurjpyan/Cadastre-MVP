import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Sidebar from './components/Sidebar';
import Dashboard from './views/Dashboard';
import Properties from './views/Properties';
import Tenants from './views/Tenants';
import Renovations from './views/Renovations';
import Documents from './views/Documents';
import AdminPanel from './views/AdminPanel';

export default function App() {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) checkAdminRole(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) checkAdminRole(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminRole = async (userId) => {
    const { data } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();
    if (data) setIsAdmin(true);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAlertMsg('');
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setAlertMsg(error.message);
      else alert("Inscription réussie ! Connectez-vous.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setAlertMsg(error.message);
    }
  };

  if (!session) {
    return (
      <div class="auth-wrap">
        <div class="auth-card">
          <div class="auth-brand">Cadastre<span>Pro</span></div>
          <div class="auth-tabs">
            <div class={`auth-tab ${!isSignUp ? 'active' : ''}`} onClick={() => setIsSignUp(false)}>Connexion</div>
            <div class={`auth-tab ${isSignUp ? 'active' : ''}`} onClick={() => setIsSignUp(true)}>Nouveau Compte</div>
          </div>
          {alertMsg && <div class="auth-alert show error">{alertMsg}</div>}
          <form onSubmit={handleAuth}>
            <div class="field"><label>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
            <div class="field"><label>Mot de passe</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></div>
            <button type="submit" class="btn btn-primary btn-block">{isSignUp ? "S'inscrire" : "Se connecter"}</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div id="app-screen">
      <Sidebar 
        currentSection={currentSection} 
        setCurrentSection={setCurrentSection} 
        isAdmin={isAdmin} 
        userEmail={session.user.email} 
      />
      <main class="main-content">
        {currentSection === 'dashboard' && <Dashboard user={session.user} />}
        {currentSection === 'properties' && <Properties user={session.user} />}
        {currentSection === 'tenants' && <Tenants user={session.user} />}
        {currentSection === 'renovations' && <Renovations user={session.user} />}
        {currentSection === 'documents' && <Documents user={session.user} />}
        {currentSection === 'admin' && isAdmin && <AdminPanel />}
      </main>
    </div>
  );
}
