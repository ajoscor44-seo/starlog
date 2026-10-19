import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Copy, Gift, Share2, Users } from 'lucide-react';
import { AppContext } from '../../context/AppContext';
import { supabase } from '../../supabase';

const Referrals = () => {
  const { user, formatCost } = useContext(AppContext);
  const [referrals, setReferrals] = useState([]);
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from('profiles').select('referral_code').eq('id', user.id).single(),
      supabase.from('referrals').select('id,status,reward_amount,created_at,rewarded_at,referred:profiles!referrals_referred_id_fkey(full_name)').eq('referrer_id', user.id).order('created_at', { ascending: false })
    ]).then(([profileResult, referralResult]) => {
      if (profileResult.data) setCode(profileResult.data.referral_code || '');
      if (referralResult.data) setReferrals(referralResult.data);
    });
  }, [user]);

  const link = useMemo(() => code ? `${window.location.origin}/login?ref=${encodeURIComponent(code)}` : '', [code]);
  const earned = referrals.filter(r => r.status === 'rewarded').reduce((sum, r) => sum + Number(r.reward_amount || 0), 0);
  const copy = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return <div className="page-container" style={{ maxWidth: 900, margin: '0 auto' }}>
    <div className="glass-panel" style={{ padding: 28, marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}><Gift size={30} color="var(--color-turquoise)" /><h2 style={{ margin: 0 }}>Refer friends, earn wallet credit</h2></div>
      <p style={{ color: 'var(--text-secondary)', marginTop: 0 }}>Share your link. You receive {formatCost(500)} after your friend completes their first purchase.</p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <input className="form-input" readOnly value={link || 'Preparing your referral link…'} style={{ flex: '1 1 420px' }} />
        <button className="btn btn-primary" onClick={copy} disabled={!link}><Copy size={16} /> {copied ? 'Copied!' : 'Copy link'}</button>
        {navigator.share && <button className="btn btn-secondary" onClick={() => navigator.share({ title: 'Join StarLog', text: 'Join StarLog with my referral link', url: link })} disabled={!link}><Share2 size={16} /> Share</button>}
      </div>
      <div style={{ marginTop: 10, fontSize: 13, color: 'var(--text-secondary)' }}>Your code: <strong style={{ color: 'var(--text-primary)' }}>{code || '—'}</strong></div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14, marginBottom: 20 }}>
      <div className="glass-panel" style={{ padding: 20 }}><Users size={20} /><div style={{ fontSize: 28, fontWeight: 800 }}>{referrals.length}</div><div style={{ color: 'var(--text-secondary)' }}>Friends referred</div></div>
      <div className="glass-panel" style={{ padding: 20 }}><Gift size={20} /><div style={{ fontSize: 28, fontWeight: 800 }}>{formatCost(earned)}</div><div style={{ color: 'var(--text-secondary)' }}>Total earned</div></div>
    </div>
    <div className="glass-panel" style={{ padding: 22 }}><h3 style={{ marginTop: 0 }}>Referral activity</h3>
      {referrals.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>No referrals yet. Share your link to get started.</p> : referrals.map(item => <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '13px 0', borderBottom: '1px solid var(--border-color)' }}><span>{item.referred?.full_name || 'New member'}</span><span style={{ color: item.status === 'rewarded' ? 'var(--color-green)' : 'var(--text-secondary)', textTransform: 'capitalize' }}>{item.status === 'rewarded' ? `+${formatCost(item.reward_amount)}` : 'Awaiting first purchase'}</span></div>)}
    </div>
  </div>;
};

export default Referrals;
