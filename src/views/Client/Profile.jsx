import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { useIsMobile } from '../../hooks/useIsMobile';
import { User, Phone, Shield, Key, Lock, Copy, Check, Save, AlertCircle, Mail, Calendar, Wallet2, Edit3 } from 'lucide-react';

const Profile = () => {
  const { user, profile, updateProfile, updatePassword, walletBalance, formatCost } = useContext(AppContext);
  const isMobile = useIsMobile();

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securitySaving, setSecuritySaving] = useState(false);
  const [securityError, setSecurityError] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState(false);

  const [copiedId, setCopiedId] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const handleCopyUserId = () => {
    if (!user) return;
    navigator.clipboard.writeText(user.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess(false);
    setProfileSaving(true);
    const result = await updateProfile(fullName, phoneNumber);
    setProfileSaving(false);
    if (result.success) {
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } else {
      setProfileError(result.msg || 'Failed to update profile.');
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setSecurityError('');
    setSecuritySuccess(false);
    if (!newPassword.trim()) { setSecurityError('Password cannot be empty.'); return; }
    if (newPassword.length < 6) { setSecurityError('Password must be at least 6 characters.'); return; }
    if (newPassword !== confirmPassword) { setSecurityError('Passwords do not match.'); return; }
    setSecuritySaving(true);
    const result = await updatePassword(newPassword);
    setSecuritySaving(false);
    if (result.success) {
      setSecuritySuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
      setTimeout(() => setSecuritySuccess(false), 4000);
    } else {
      setSecurityError(result.msg || 'Failed to update password.');
    }
  };

  const registrationDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A';

  // Avatar initials
  const initials = (profile?.full_name || user?.email || 'U')
    .split(' ').map(w => w[0]?.toUpperCase()).slice(0, 2).join('');

  return (
    <div className="animate-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 16 : 24 }}>

      {/* ── PROFILE HERO CARD ── */}
      <div className="glass-panel" style={{
        background: 'linear-gradient(135deg, rgba(127,0,255,0.1) 0%, rgba(0,242,254,0.08) 100%)',
        border: '1px solid rgba(0,242,254,0.15)',
        padding: isMobile ? '20px 16px' : '28px 24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 14 : 20, flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{
            width: isMobile ? 60 : 76, height: isMobile ? 60 : 76,
            borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, var(--color-violet), var(--color-turquoise))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: isMobile ? 22 : 28, fontWeight: 800, color: '#fff',
            fontFamily: 'var(--font-heading)', boxShadow: '0 0 0 3px rgba(0,242,254,0.2)',
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontSize: isMobile ? 18 : 22, margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {profile?.full_name || 'Unnamed Client'}
            </h2>
            <p style={{ margin: 0, fontSize: isMobile ? 12 : 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <Mail size={12} />
              <span style={{ wordBreak: 'break-all' }}>{user?.email}</span>
              <span className="badge badge-success" style={{ fontSize: 9, padding: '2px 6px' }}>Verified</span>
            </p>
          </div>
          <div style={{
            textAlign: isMobile ? 'left' : 'right', flexShrink: 0,
            padding: '12px 16px',
            background: 'rgba(0,255,135,0.06)',
            border: '1px solid rgba(0,255,135,0.15)',
            borderRadius: 12,
          }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Wallet Balance</div>
            <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, color: 'var(--color-green)', fontFamily: 'var(--font-heading)' }}>
              {formatCost(walletBalance)}
            </div>
          </div>
        </div>
      </div>

      {/* ── GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.1fr 1fr', gap: isMobile ? 16 : 24 }}>

        {/* LEFT: Account Info + Edit Profile */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 16 : 20 }}>

          {/* Account Metadata */}
          <div className="glass-panel" style={{ padding: isMobile ? 16 : 20 }}>
            <h4 style={{ fontSize: 14, margin: '0 0 14px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
              Account Details
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { icon: Mail, label: 'Email', value: user?.email },
                { icon: Phone, label: 'Phone', value: profile?.phone || 'Not set' },
                { icon: Calendar, label: 'Joined', value: registrationDate },
                { icon: Wallet2, label: 'Balance', value: formatCost(walletBalance), accent: 'var(--color-turquoise)' },
              ].map(({ icon: Icon, label, value, accent }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingBottom: 12, borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 13, flexShrink: 0 }}>
                    <Icon size={14} />
                    <span>{label}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: accent || 'var(--text-primary)', textAlign: 'right', wordBreak: 'break-all' }}>
                    {value}
                  </span>
                </div>
              ))}
              {/* User ID */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', flexShrink: 0 }}>User ID</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <code style={{ fontSize: 11, background: 'rgba(255,255,255,0.05)', padding: '3px 7px', borderRadius: 5, color: 'var(--text-muted)', maxWidth: isMobile ? 120 : 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                    {user ? `${user.id.slice(0, 8)}…${user.id.slice(-6)}` : 'N/A'}
                  </code>
                  <button onClick={handleCopyUserId} style={{ background: 'none', border: 'none', color: copiedId ? 'var(--color-green)' : 'var(--color-turquoise)', cursor: 'pointer', padding: 4, flexShrink: 0 }} title="Copy User ID">
                    {copiedId ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Profile Form */}
          <form className="glass-panel" onSubmit={handleUpdateProfile} style={{ padding: isMobile ? 16 : 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h4 style={{ fontSize: isMobile ? 14 : 15, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Edit3 size={15} style={{ color: 'var(--color-turquoise)' }} />
                Edit Personal Details
              </h4>
            </div>

            {profileError && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.2)', padding: '10px 12px', borderRadius: 8, fontSize: 13, color: 'var(--color-danger)' }}>
                <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{profileError}</span>
              </div>
            )}
            {profileSuccess && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,255,135,0.1)', border: '1px solid rgba(0,255,135,0.2)', padding: '10px 12px', borderRadius: 8, fontSize: 13, color: 'var(--color-green)' }}>
                <Check size={14} />
                <span>Profile saved successfully!</span>
              </div>
            )}

            <div>
              <label className="form-label" htmlFor="profile-fullname">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
                <input id="profile-fullname" type="text" className="form-input" style={{ paddingLeft: 40 }}
                  placeholder="e.g. John Doe" value={fullName} onChange={e => setFullName(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="form-label" htmlFor="profile-phone">Phone Number</label>
              <div style={{ position: 'relative' }}>
                <Phone size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
                <input id="profile-phone" type="tel" className="form-input" style={{ paddingLeft: 40 }}
                  placeholder="+234 801 234 5678" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={profileSaving}
              style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {profileSaving ? <><span className="spinner-loader" style={{ width: 14, height: 14 }} /><span>Saving…</span></> : <><Save size={15} /><span>Save Changes</span></>}
            </button>
          </form>
        </div>

        {/* RIGHT: Security */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 16 : 20 }}>

          {/* Security Panel */}
          <div className="glass-panel" style={{ padding: isMobile ? 16 : 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h4 style={{ fontSize: isMobile ? 14 : 15, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Shield size={15} style={{ color: 'var(--color-pink)' }} />
                Security Settings
              </h4>
            </div>

            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              Keep your account safe. Update your password regularly and never share it with anyone.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Two-Factor Auth', val: 'Email OTP', badge: 'badge-info' },
                { label: 'Last Login', val: new Date().toLocaleDateString(), badge: null },
                { label: 'Account Status', val: 'Active', badge: 'badge-success' },
              ].map(({ label, val, badge }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
                  {badge ? <span className={`badge ${badge}`} style={{ fontSize: 10 }}>{val}</span> : <span style={{ fontSize: 12, fontWeight: 600 }}>{val}</span>}
                </div>
              ))}
            </div>

            {/* Toggle Password Form */}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowPasswordForm(v => !v)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 14px', fontSize: 13 }}
            >
              <Lock size={14} />
              {showPasswordForm ? 'Cancel Password Change' : 'Change Password'}
            </button>

            {securitySuccess && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,255,135,0.1)', border: '1px solid rgba(0,255,135,0.2)', padding: '10px 12px', borderRadius: 8, fontSize: 13, color: 'var(--color-green)' }}>
                <Check size={14} /><span>Password updated!</span>
              </div>
            )}

            {showPasswordForm && (
              <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 4, borderTop: '1px solid var(--border-color)' }}>
                {securityError && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.2)', padding: '10px 12px', borderRadius: 8, fontSize: 13, color: 'var(--color-danger)' }}>
                    <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} /><span>{securityError}</span>
                  </div>
                )}

                <div>
                  <label className="form-label" htmlFor="security-password">New Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
                    <input id="security-password" type="password" className="form-input" style={{ paddingLeft: 40 }}
                      placeholder="Min. 6 characters" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className="form-label" htmlFor="security-confirm">Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <Key size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
                    <input id="security-confirm" type="password" className="form-input" style={{ paddingLeft: 40 }}
                      placeholder="Repeat new password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" disabled={securitySaving}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px 14px' }}>
                  {securitySaving ? <><span className="spinner-loader" style={{ width: 14, height: 14 }} /><span>Updating…</span></> : <><Shield size={14} /><span>Update Password</span></>}
                </button>
              </form>
            )}
          </div>

          {/* Privacy Notice */}
          <div className="glass-panel" style={{ padding: isMobile ? 14 : 18, background: 'rgba(127,0,255,0.04)', border: '1px solid rgba(127,0,255,0.1)' }}>
            <h5 style={{ fontSize: 12, margin: '0 0 8px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Privacy &amp; Data
            </h5>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.65, margin: 0 }}>
              Your personal data is encrypted and stored securely. We never sell or share your data with third parties. You can request a full account deletion at any time via support.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Profile;
