/** AdminInviteSection — The "Invite Hostel Owners" form + Generated Invitations list + modal. */
import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import {
  sectionTitleStyle,
  tableContainerStyle,
  tableStyle,
  tableHeaderRowStyle,
  thStyle,
  tableRowStyle,
  tdStyle,
  tableBtnStyle,
  modalOverlayStyle,
  modalContentStyle,
} from '../../styles/commonStyles';
import * as adminApi from '../../api/adminApi';

export interface Invitation {
  token: string;
  email: string;
  is_used: boolean;
}

export const AdminInviteSection = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [invitedEmail, setInvitedEmail] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadInvitations = async () => {
    try {
      const data = await adminApi.fetchInvitations();
      setInvitations(data);
    } catch (err) {
      console.error('Error fetching invitations:', err);
    }
  };

  useEffect(() => {
    loadInvitations();
  }, []);

  const handleRevokeInvitation = async (token: string) => {
    try {
      await adminApi.revokeInvitation(token);
      loadInvitations();
    } catch (err) {
      console.error('Error revoking invitation:', err);
    }
  };

  const handleGenerateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError('');
    setGeneratedLink('');
    setInviteLoading(true);
    setCopied(false);

    try {
      const data = await adminApi.generateInvite(inviteEmail);
      setInvitedEmail(inviteEmail);
      setGeneratedLink(data.invite_link);
      setInviteEmail('');
      setShowModal(true);
      loadInvitations();
    } catch (err: any) {
      setInviteError(err.message || 'Error occurred');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={sectionTitleStyle}>
          <Users size={18} /> Invite Hostel Owners
        </h3>

        <form
          onSubmit={handleGenerateInvite}
          style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}
        >
          <div className="form-group" style={{ flex: 1, minWidth: '250px', marginBottom: 0 }}>
            <label className="form-label">Owner Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="owner@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={inviteLoading}
            style={{ height: '42px' }}
          >
            {inviteLoading ? 'Generating...' : 'Generate Invite Link'}
          </button>
        </form>

        {inviteError && (
          <p style={{ color: 'var(--danger)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            {inviteError}
          </p>
        )}

        {/* Active Invitations List */}
        <div style={{ marginTop: '1.5rem' }}>
          <h4
            style={{
              fontSize: '0.9rem',
              fontWeight: 600,
              marginBottom: '0.75rem',
              color: 'var(--muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Generated Invitations
          </h4>
          {invitations.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>
              No invitation links generated yet.
            </p>
          ) : (
            <div style={tableContainerStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr style={tableHeaderRowStyle}>
                    <th style={thStyle}>Recipient Email</th>
                    <th style={thStyle}>Invitation Token</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invitations.map((inv) => (
                    <tr key={inv.token} style={tableRowStyle}>
                      <td style={{ ...tdStyle, fontSize: '0.85rem' }}>{inv.email}</td>
                      <td
                        style={{
                          ...tdStyle,
                          fontSize: '0.75rem',
                          fontFamily: 'monospace',
                          color: 'var(--muted)',
                        }}
                      >
                        {inv.token.substring(0, 8)}...{inv.token.substring(inv.token.length - 8)}
                      </td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            color: inv.is_used ? 'var(--muted)' : 'var(--success)',
                          }}
                        >
                          {inv.is_used ? 'REVOKED / USED' : 'ACTIVE'}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        {!inv.is_used && (
                          <button
                            className="btn btn-danger"
                            style={{ ...tableBtnStyle, padding: '0.25rem 0.5rem' }}
                            onClick={() => handleRevokeInvitation(inv.token)}
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Generated Link Modal */}
      {showModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
              Invitation Link Generated
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--muted)', margin: 0 }}>
              An invitation email has been sent to <strong>{invitedEmail}</strong>.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
              <label
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--muted)',
                  textTransform: 'uppercase',
                }}
              >
                Copy Registration Link
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  readOnly
                  value={generatedLink}
                  className="form-input"
                  style={{ flex: 1, backgroundColor: 'var(--secondary)', cursor: 'default' }}
                />
                <button
                  onClick={handleCopyLink}
                  className={`btn ${copied ? 'btn-secondary' : 'btn-primary'}`}
                  style={{ whiteSpace: 'nowrap', minWidth: '80px' }}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button onClick={() => setShowModal(false)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
