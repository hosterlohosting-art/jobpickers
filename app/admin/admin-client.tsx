'use client';

import { useState } from 'react';
import { 
  Play, 
  Settings, 
  ShieldCheck, 
  Cpu, 
  ScrollText, 
  DollarSign, 
  CheckCircle2, 
  XCircle, 
  Save, 
  AlertCircle, 
  RefreshCw,
  Trash2,
  Lock,
  ListFilter,
  Users
} from 'lucide-react';

interface AdminClientDashboardProps {
  stats: {
    total: number;
    active: number;
    drafts: number;
    expired: number;
    imported: number;
    clicks: number;
    activeSources: number;
    failedSyncs: number;
  };
  connectors: Array<{
    id: string;
    name: string;
    type: string;
    apiBaseUrl: string | null;
    isActive: boolean;
    dailyLimit: number;
    syncFrequency: string;
    lastSyncedAt: string | null;
  }>;
  logs: Array<{
    id: string;
    status: string;
    fetchedCount: number;
    importedCount: number;
    duplicateCount: number;
    rejectedCount: number;
    errorMessage: string | null;
    startedAt: string;
    finishedAt: string | null;
    source: { name: string };
  }>;
  adPlacements: Array<{
    id: string;
    name: string;
    page: string;
    position: string;
    adCode: string;
    isActive: boolean;
  }>;
  recentJobs: Array<{
    id: string;
    title: string;
    slug: string;
    category: string;
    remoteType: string;
    status: string;
    salaryMin: number | null;
    salaryMax: number | null;
    applyUrl: string;
    applyClicks: number;
    createdAt: string;
    company: { name: string };
  }>;
  employerSubmissions: Array<{
    id: string;
    title: string;
    slug: string;
    status: string;
    applyUrl: string;
    createdAt: string;
    company: { name: string };
  }>;
}

export default function AdminClientDashboard({ 
  stats, 
  connectors: initialConnectors, 
  logs: initialLogs, 
  adPlacements: initialAds,
  recentJobs: initialRecentJobs,
  employerSubmissions: initialEmployerSubmissions
}: AdminClientDashboardProps) {
  const [activeTab, setActiveTab] = useState<'connectors' | 'jobs' | 'submissions' | 'logs' | 'ads'>('connectors');
  const [connectors, setConnectors] = useState(initialConnectors);
  const [logs, setLogs] = useState(initialLogs);
  const [adPlacements, setAdPlacements] = useState(initialAds);
  const [recentJobs, setRecentJobs] = useState(initialRecentJobs);
  const [employerSubmissions, setEmployerSubmissions] = useState(initialEmployerSubmissions);
  
  // Local state for actions feedback
  const [syncingSourceId, setSyncingSourceId] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [updatingAdId, setUpdatingAdId] = useState<string | null>(null);
  const [actionLoadingJobId, setActionLoadingJobId] = useState<string | null>(null);
  
  // Edited ad codes state
  const [editedAdCode, setEditedAdCode] = useState<{ [key: string]: string }>({});

  const handleToggleConnector = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggleSource',
          sourceId: id,
          isActive: !currentStatus
        })
      });

      if (response.ok) {
        setConnectors(prev => 
          prev.map(c => c.id === id ? { ...c, isActive: !currentStatus } : c)
        );
      } else {
        alert('Failed to update connector status.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateLimit = async (id: string, limit: number) => {
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateLimit',
          sourceId: id,
          dailyLimit: limit
        })
      });

      if (response.ok) {
        setConnectors(prev => 
          prev.map(c => c.id === id ? { ...c, dailyLimit: limit } : c)
        );
      } else {
        alert('Failed to update daily limit.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTriggerSync = async (id: string) => {
    setSyncingSourceId(id);
    setSyncMessage(null);
    try {
      const response = await fetch('/api/jobs/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceId: id })
      });
      
      const result = await response.json();
      if (response.ok) {
        setSyncMessage({
          text: `Success: Fetched ${result.fetched || 0}, Imported ${result.imported || 0} jobs.`,
          isError: false
        });
        
        // Refresh connectors sync time
        setConnectors(prev => 
          prev.map(c => c.id === id ? { ...c, lastSyncedAt: new Date().toISOString() } : c)
        );

        // Prepend new sync log
        const newLog = {
          id: Math.random().toString(),
          status: 'success',
          fetchedCount: result.fetched || 0,
          importedCount: result.imported || 0,
          duplicateCount: result.duplicates || 0,
          rejectedCount: result.rejected || 0,
          errorMessage: null,
          startedAt: new Date().toISOString(),
          finishedAt: new Date().toISOString(),
          source: { name: connectors.find(c => c.id === id)?.name || 'Feed' }
        };
        setLogs(prev => [newLog, ...prev.slice(0, 7)]);
      } else {
        setSyncMessage({
          text: `Failed: ${result.error || 'Unknown error occurred during sync.'}`,
          isError: true
        });
      }
    } catch (err) {
      console.error(err);
      setSyncMessage({
        text: 'Error contacting server sync endpoint.',
        isError: true
      });
    } finally {
      setSyncingSourceId(null);
    }
  };

  const handleUpdateAd = async (id: string, adCode: string, isActive: boolean) => {
    setUpdatingAdId(id);
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateAd',
          adId: id,
          adCode,
          isActive
        })
      });

      if (response.ok) {
        setAdPlacements(prev => 
          prev.map(a => a.id === id ? { ...a, adCode, isActive } : a)
        );
        alert('Ad placement updated successfully!');
      } else {
        alert('Failed to update ad placement.');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating ad placement.');
    } finally {
      setUpdatingAdId(null);
    }
  };

  // Job Actions
  const handleJobStatusAction = async (jobId: string, action: 'approveJob' | 'rejectJob' | 'expireJob' | 'deleteJob') => {
    setActionLoadingJobId(jobId);
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          jobId
        })
      });

      if (response.ok) {
        // Update local views state
        if (action === 'deleteJob') {
          setRecentJobs(prev => prev.filter(j => j.id !== jobId));
          setEmployerSubmissions(prev => prev.filter(j => j.id !== jobId));
        } else {
          const statusMap = {
            approveJob: 'published',
            rejectJob: 'rejected',
            expireJob: 'expired'
          };
          const nextStatus = statusMap[action];

          setRecentJobs(prev => 
            prev.map(j => j.id === jobId ? { ...j, status: nextStatus } : j)
          );
          setEmployerSubmissions(prev => 
            prev.map(j => j.id === jobId ? { ...j, status: nextStatus } : j)
          );
        }
      } else {
        alert(`Failed to execute action: ${action}`);
      }
    } catch (err) {
      console.error(err);
      alert('Error communicating with database action route.');
    } finally {
      setActionLoadingJobId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Numerical Aggregates row */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-grayBorder p-4 rounded-lg shadow-sm">
          <span className="block text-[10px] uppercase font-bold text-slateText-muted tracking-wider">Total Database Jobs</span>
          <span className="block text-2xl font-extrabold text-slateText-primary mt-1">{stats.total}</span>
        </div>
        <div className="bg-white border border-grayBorder p-4 rounded-lg shadow-sm">
          <span className="block text-[10px] uppercase font-bold text-slateText-muted tracking-wider">Active Published</span>
          <span className="block text-2xl font-extrabold text-accent-green mt-1">{stats.active}</span>
        </div>
        <div className="bg-white border border-grayBorder p-4 rounded-lg shadow-sm">
          <span className="block text-[10px] uppercase font-bold text-slateText-muted tracking-wider">Draft Review Listings</span>
          <span className="block text-2xl font-extrabold text-amber-500 mt-1">{stats.drafts}</span>
        </div>
        <div className="bg-white border border-grayBorder p-4 rounded-lg shadow-sm">
          <span className="block text-[10px] uppercase font-bold text-slateText-muted tracking-wider">Expired Listings</span>
          <span className="block text-2xl font-extrabold text-slateText-muted mt-1">{stats.expired}</span>
        </div>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-grayBorder p-4 rounded-lg shadow-sm">
          <span className="block text-[10px] uppercase font-bold text-slateText-muted tracking-wider">Conversion Click Events</span>
          <span className="block text-2xl font-extrabold text-accent-teal mt-1">{stats.clicks}</span>
        </div>
        <div className="bg-white border border-grayBorder p-4 rounded-lg shadow-sm">
          <span className="block text-[10px] uppercase font-bold text-slateText-muted tracking-wider">Crawl Imports Today</span>
          <span className="block text-2xl font-extrabold text-accent-green mt-1">+{stats.imported}</span>
        </div>
        <div className="bg-white border border-grayBorder p-4 rounded-lg shadow-sm">
          <span className="block text-[10px] uppercase font-bold text-slateText-muted tracking-wider">Active Feed Connectors</span>
          <span className="block text-2xl font-extrabold text-slateText-primary mt-1">{stats.activeSources}</span>
        </div>
        <div className="bg-white border border-grayBorder p-4 rounded-lg shadow-sm">
          <span className="block text-[10px] uppercase font-bold text-slateText-muted tracking-wider">Failed Syncs (24h)</span>
          <span className={`block text-2xl font-extrabold mt-1 ${stats.failedSyncs > 0 ? 'text-red-500 animate-pulse' : 'text-slateText-muted'}`}>
            {stats.failedSyncs}
          </span>
        </div>
      </section>

      {/* 2. Navigation Tabs */}
      <nav className="flex border-b border-grayBorder gap-2 overflow-x-auto">
        <button
          onClick={() => { setActiveTab('connectors'); setSyncMessage(null); }}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'connectors' 
              ? 'border-accent-green text-accent-green bg-white' 
              : 'border-transparent text-slateText-secondary hover:text-slateText-primary'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Ingest Connectors</span>
        </button>
        <button
          onClick={() => { setActiveTab('jobs'); setSyncMessage(null); }}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'jobs' 
              ? 'border-accent-green text-accent-green bg-white' 
              : 'border-transparent text-slateText-secondary hover:text-slateText-primary'
          }`}
        >
          <ListFilter className="w-4 h-4" />
          <span>Recent Job Listings</span>
        </button>
        <button
          onClick={() => { setActiveTab('submissions'); setSyncMessage(null); }}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'submissions' 
              ? 'border-accent-green text-accent-green bg-white' 
              : 'border-transparent text-slateText-secondary hover:text-slateText-primary'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Employer Posts</span>
        </button>
        <button
          onClick={() => { setActiveTab('logs'); setSyncMessage(null); }}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'logs' 
              ? 'border-accent-green text-accent-green bg-white' 
              : 'border-transparent text-slateText-secondary hover:text-slateText-primary'
          }`}
        >
          <ScrollText className="w-4 h-4" />
          <span>Ingestion Logs</span>
        </button>
        <button
          onClick={() => { setActiveTab('ads'); setSyncMessage(null); }}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'ads' 
              ? 'border-accent-green text-accent-green bg-white' 
              : 'border-transparent text-slateText-secondary hover:text-slateText-primary'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>AdSense Placements</span>
        </button>
      </nav>

      {/* Sync Alert message banner */}
      {syncMessage && (
        <div className={`p-4 rounded-md border flex items-start gap-2.5 text-xs ${
          syncMessage.isError 
            ? 'bg-red-50 border-red-200 text-red-700' 
            : 'bg-green-50 border-green-200 text-green-700'
        }`}>
          {syncMessage.isError ? (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          )}
          <p className="font-semibold">{syncMessage.text}</p>
        </div>
      )}

      {/* 3. Panel Container */}
      <div className="bg-white border border-grayBorder rounded-lg p-6 shadow-sm min-h-[300px]">
        
        {/* Tab A: Connectors */}
        {activeTab === 'connectors' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-extrabold text-slateText-primary">Job Ingestors Config</h2>
              <p className="text-xs text-slateText-muted mt-1">Configure active channels for job collection. RSS aggregates immediately, while external partners skip when credential keys are missing.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead>
                  <tr className="border-b border-grayBorder text-slateText-muted font-bold">
                    <th className="pb-3 w-1/4">Connector Channel</th>
                    <th className="pb-3 w-1/6">Type</th>
                    <th className="pb-3 w-1/6">Daily Fetch Limit</th>
                    <th className="pb-3 w-1/6">Last Action</th>
                    <th className="pb-3 w-1/12 text-center">Status</th>
                    <th className="pb-3 w-1/6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-grayBorder/60">
                  {connectors.map(c => (
                    <tr key={c.id} className="hover:bg-grayBg/30">
                      <td className="py-4">
                        <span className="font-extrabold text-slateText-primary block">{c.name}</span>
                        <span className="text-[10px] text-slateText-muted block mt-0.5 max-w-[200px] truncate">
                          {c.apiBaseUrl || 'Custom local endpoint / RSS'}
                        </span>
                      </td>
                      <td className="py-4 font-semibold text-slateText-secondary uppercase text-[10px]">
                        {c.type}
                      </td>
                      <td className="py-4">
                        <select
                          value={c.dailyLimit}
                          onChange={(e) => handleUpdateLimit(c.id, parseInt(e.target.value))}
                          className="bg-grayBg border border-grayBorder rounded px-2 py-1 font-bold text-slateText-secondary"
                        >
                          <option value="10">10 jobs</option>
                          <option value="30">30 jobs</option>
                          <option value="50">50 jobs</option>
                          <option value="100">100 jobs</option>
                          <option value="200">200 jobs</option>
                        </select>
                      </td>
                      <td className="py-4 font-semibold text-slateText-muted">
                        {c.lastSyncedAt ? new Date(c.lastSyncedAt).toLocaleString() : 'Never Synced'}
                      </td>
                      <td className="py-4 text-center">
                        <button
                          onClick={() => handleToggleConnector(c.id, c.isActive)}
                          className={`px-3 py-1 rounded-full text-[10px] font-extrabold shadow-sm ${
                            c.isActive 
                              ? 'bg-accent-green/10 text-accent-green border border-accent-green/30' 
                              : 'bg-slateText-muted/10 text-slateText-muted border border-slateText-muted/20'
                          }`}
                        >
                          {c.isActive ? 'Active' : 'Disabled'}
                        </button>
                      </td>
                      <td className="py-4 text-right">
                        <button
                          disabled={syncingSourceId !== null || c.type === 'manual'}
                          onClick={() => handleTriggerSync(c.id)}
                          className="bg-slateText-primary hover:bg-slateText-primary/95 text-white font-bold px-3 py-1.5 rounded inline-flex items-center gap-1 hover:shadow-sm disabled:opacity-40 transition-opacity"
                        >
                          {syncingSourceId === c.id ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Play className="w-3.5 h-3.5" />
                          )}
                          <span>Sync Now</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab B: Recent Jobs list & direct actions */}
        {activeTab === 'jobs' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-extrabold text-slateText-primary">Recent Job Listings</h2>
              <p className="text-xs text-slateText-muted mt-1">Directly control active database jobs. Approve pending drafts, manually force expiration, or delete entries.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[900px]">
                <thead>
                  <tr className="border-b border-grayBorder text-slateText-muted font-bold">
                    <th className="pb-3">Job Title & Company</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Workplace</th>
                    <th className="pb-3">Conversion Clicks</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Created</th>
                    <th className="pb-3 text-right">Database Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-grayBorder/60">
                  {recentJobs.map(job => (
                    <tr key={job.id} className="hover:bg-grayBg/30">
                      <td className="py-3">
                        <span className="font-extrabold text-slateText-primary block">{job.title}</span>
                        <span className="text-[10px] text-slateText-muted block">{job.company.name}</span>
                      </td>
                      <td className="py-3 font-semibold text-slateText-secondary">{job.category}</td>
                      <td className="py-3 font-semibold text-slateText-muted uppercase text-[10px]">{job.remoteType}</td>
                      <td className="py-3 font-extrabold text-accent-teal">{job.applyClicks} clicks</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          job.status === 'published' 
                            ? 'bg-accent-green/10 text-accent-green border border-accent-green/20' 
                            : job.status === 'draft'
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                            : 'bg-slateText-muted/10 text-slateText-muted border border-slateText-muted/20'
                        }`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="py-3 text-slateText-muted font-semibold">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-right space-x-1 whitespace-nowrap">
                        {job.status !== 'published' && (
                          <button
                            disabled={actionLoadingJobId === job.id}
                            onClick={() => handleJobStatusAction(job.id, 'approveJob')}
                            className="bg-accent-green hover:bg-accent-greenHover text-white text-[10px] font-bold px-2.5 py-1 rounded disabled:opacity-50"
                          >
                            Approve
                          </button>
                        )}
                        {job.status === 'draft' && (
                          <button
                            disabled={actionLoadingJobId === job.id}
                            onClick={() => handleJobStatusAction(job.id, 'rejectJob')}
                            className="bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold px-2.5 py-1 rounded disabled:opacity-50"
                          >
                            Reject
                          </button>
                        )}
                        {job.status === 'published' && (
                          <button
                            disabled={actionLoadingJobId === job.id}
                            onClick={() => handleJobStatusAction(job.id, 'expireJob')}
                            className="bg-slateText-secondary hover:bg-slateText-primary text-white text-[10px] font-bold px-2.5 py-1 rounded disabled:opacity-50"
                          >
                            Expire
                          </button>
                        )}
                        <button
                          disabled={actionLoadingJobId === job.id}
                          onClick={() => handleJobStatusAction(job.id, 'deleteJob')}
                          className="bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold p-1.5 rounded inline-flex items-center disabled:opacity-50"
                          title="Delete permanently"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab C: Employer Submissions */}
        {activeTab === 'submissions' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-extrabold text-slateText-primary">Employer Form Submissions</h2>
              <p className="text-xs text-slateText-muted mt-1">Audit job listings posted directly by hiring partners. Run approvals to make them visible to seekers.</p>
            </div>

            {employerSubmissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slateText-muted/50">
                <Users className="w-12 h-12 stroke-[1.5]" />
                <p className="text-xs font-bold mt-2">No employer submissions recorded yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[700px]">
                  <thead>
                    <tr className="border-b border-grayBorder text-slateText-muted font-bold">
                      <th className="pb-3">Vacancy & Employer</th>
                      <th className="pb-3">Posted Link</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Date Submitted</th>
                      <th className="pb-3 text-right">Approve Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-grayBorder/60">
                    {employerSubmissions.map(sub => (
                      <tr key={sub.id} className="hover:bg-grayBg/30">
                        <td className="py-3">
                          <span className="font-extrabold text-slateText-primary block">{sub.title}</span>
                          <span className="text-[10px] text-slateText-muted block">{sub.company.name}</span>
                        </td>
                        <td className="py-3 font-semibold text-accent-green hover:underline">
                          <a href={sub.applyUrl} target="_blank" rel="noopener noreferrer">
                            Open Application Portal
                          </a>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            sub.status === 'published' 
                              ? 'bg-accent-green/10 text-accent-green border border-accent-green/20' 
                              : sub.status === 'draft'
                              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                              : 'bg-red-50 text-red-500 border border-red-100'
                          }`}>
                            {sub.status}
                          </span>
                        </td>
                        <td className="py-3 text-slateText-muted font-semibold">
                          {new Date(sub.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 text-right space-x-1.5">
                          {sub.status !== 'published' && (
                            <button
                              disabled={actionLoadingJobId === sub.id}
                              onClick={() => handleJobStatusAction(sub.id, 'approveJob')}
                              className="bg-accent-green hover:bg-accent-greenHover text-white text-[10px] font-bold px-2.5 py-1 rounded"
                            >
                              Approve Post
                            </button>
                          )}
                          {sub.status === 'draft' && (
                            <button
                              disabled={actionLoadingJobId === sub.id}
                              onClick={() => handleJobStatusAction(sub.id, 'rejectJob')}
                              className="bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold px-2.5 py-1 rounded"
                            >
                              Reject
                            </button>
                          )}
                          <button
                            disabled={actionLoadingJobId === sub.id}
                            onClick={() => handleJobStatusAction(sub.id, 'deleteJob')}
                            className="bg-red-500 hover:bg-red-600 text-white p-1 rounded inline-flex items-center"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab D: Logs */}
        {activeTab === 'logs' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-extrabold text-slateText-primary">Audit Log Ledger</h2>
              <p className="text-xs text-slateText-muted mt-1">Audit results of recent crawler operations. Failed API runs write logs detailed reports with the error feedback.</p>
            </div>

            {logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slateText-muted/50">
                <ScrollText className="w-12 h-12 stroke-[1.5]" />
                <p className="text-xs font-bold mt-2">No crawl logs recorded in the database yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {logs.map(log => (
                  <div 
                    key={log.id} 
                    className="border border-grayBorder rounded-md p-4 bg-grayBg/20 hover:bg-grayBg/40 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center gap-2">
                        {log.status === 'success' ? (
                          <CheckCircle2 className="w-5 h-5 text-accent-green" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                        <div>
                          <h4 className="font-extrabold text-slateText-primary text-xs">
                            Sync: {log.source.name}
                          </h4>
                          <span className="text-[10px] text-slateText-muted">
                            Executed {log.startedAt ? new Date(log.startedAt).toLocaleString() : ''}
                          </span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        log.status === 'success' 
                          ? 'bg-accent-green/10 text-accent-green border border-accent-green/20' 
                          : 'bg-red-50 text-red-600 border border-red-100'
                      }`}>
                        {log.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 border-t border-grayBorder/40 mt-3 pt-3 text-center">
                      <div>
                        <span className="block text-[9px] uppercase font-bold text-slateText-muted">Fetched</span>
                        <span className="block text-xs font-extrabold text-slateText-primary">{log.fetchedCount}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase font-bold text-slateText-muted">Imported</span>
                        <span className="block text-xs font-extrabold text-accent-green">{log.importedCount}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase font-bold text-slateText-muted">Duplicates</span>
                        <span className="block text-xs font-extrabold text-slateText-secondary">{log.duplicateCount}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase font-bold text-slateText-muted">Rejected</span>
                        <span className="block text-xs font-extrabold text-red-500">{log.rejectedCount}</span>
                      </div>
                    </div>

                    {log.errorMessage && (
                      <div className="mt-3 bg-red-50 border border-red-100 p-2.5 rounded text-[10px] font-bold text-red-700">
                        Error log: {log.errorMessage}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab E: Ads */}
        {activeTab === 'ads' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-extrabold text-slateText-primary">AdSense Placement Units</h2>
              <p className="text-xs text-slateText-muted mt-1">Copy-paste script snippets from Google AdSense. Inactive slots fall back to rendering default placeholder cards.</p>
            </div>

            <div className="space-y-6">
              {adPlacements.map(ad => {
                const draftCode = editedAdCode[ad.id] !== undefined ? editedAdCode[ad.id] : ad.adCode;
                const isDraftDirty = editedAdCode[ad.id] !== undefined && editedAdCode[ad.id] !== ad.adCode;

                return (
                  <div key={ad.id} className="border border-grayBorder rounded-md p-5 flex flex-col gap-4 bg-white shadow-sm hover:border-grayBorder/80">
                    <div className="flex justify-between items-center border-b border-grayBorder/60 pb-3">
                      <div>
                        <h3 className="font-extrabold text-slateText-primary text-sm uppercase">{ad.name}</h3>
                        <span className="text-[10px] text-slateText-muted mt-0.5 block">
                          Page: {ad.page} &bull; Position: {ad.position}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 text-xs font-bold text-slateText-secondary cursor-pointer">
                          <input 
                            type="checkbox"
                            checked={ad.isActive}
                            onChange={(e) => handleUpdateAd(ad.id, ad.adCode, e.target.checked)}
                            className="rounded border-gray-300 text-accent-green focus:ring-accent-green"
                          />
                          <span>Active / Display</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold uppercase text-slateText-muted">Script Tag Code (HTML)</label>
                      <textarea
                        rows={4}
                        value={draftCode}
                        onChange={(e) => setEditedAdCode({ ...editedAdCode, [ad.id]: e.target.value })}
                        placeholder="<!-- Google AdSense script code -->"
                        className="bg-grayBg text-slateText-primary border border-grayBorder rounded p-3 font-mono text-[10px] outline-none focus:border-accent-green w-full"
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      {isDraftDirty && (
                        <button
                          onClick={() => {
                            const newDrafts = { ...editedAdCode };
                            delete newDrafts[ad.id];
                            setEditedAdCode(newDrafts);
                          }}
                          className="px-3 py-1.5 rounded border border-grayBorder text-slateText-secondary text-xs hover:bg-grayBg font-semibold"
                        >
                          Discard
                        </button>
                      )}
                      <button
                        disabled={updatingAdId === ad.id}
                        onClick={() => handleUpdateAd(ad.id, draftCode, ad.isActive)}
                        className="bg-accent-green hover:bg-accent-greenHover text-white font-bold px-4 py-1.5 rounded text-xs flex items-center gap-1 shadow-sm disabled:opacity-50"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{updatingAdId === ad.id ? 'Saving...' : 'Save Script Changes'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
