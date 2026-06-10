'use client';

import { useState, useEffect } from 'react';
import { 
  Briefcase, Building2, Send, PlusCircle, CheckCircle2, DollarSign, 
  Trash2, Edit, BarChart3, RefreshCw, XCircle, AlertCircle 
} from 'lucide-react';

export default function EmployerDashboardClient({ initialUser }: { initialUser: any }) {
  const [tab, setTab] = useState<'post' | 'manage'>('post');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Job history list state
  const [jobs, setJobs] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    companyName: '',
    companyLogo: '',
    companyWebsite: '',
    title: '',
    category: 'Software',
    remoteType: 'remote',
    employmentType: 'full-time',
    experienceLevel: 'mid',
    location: '',
    salary: '',
    skills: '',
    description: '',
    applyUrl: '',
    featured: 'free',
    companyHoneypot: ''
  });

  const fetchJobs = async () => {
    setLoadingJobs(true);
    try {
      const res = await fetch('/api/employer');
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    // Fetch count initially to show in tabs
    fetchJobs();
  }, []);

  const handleTabChange = (newTab: 'post' | 'manage') => {
    setTab(newTab);
    if (newTab === 'manage') {
      fetchJobs();
    }
  };

  const handleEditClick = (job: any) => {
    setEditingJobId(job.id);
    setFormData({
      companyName: job.company?.name || '',
      companyLogo: job.company?.logo || '',
      companyWebsite: job.company?.website || '',
      title: job.title,
      category: job.category,
      remoteType: job.remoteType,
      employmentType: job.employmentType,
      experienceLevel: job.experienceLevel,
      location: job.location,
      salary: job.salaryMin ? String(job.salaryMin) : '',
      skills: job.skills || '',
      description: job.description,
      applyUrl: job.applyUrl,
      featured: job.featured ? 'premium' : 'free',
      companyHoneypot: ''
    });
    setTab('post'); // Switch to form tab
  };

  const handleCancelEdit = () => {
    setEditingJobId(null);
    setFormData({
      companyName: '', companyLogo: '', companyWebsite: '',
      title: '', category: 'Software', remoteType: 'remote',
      employmentType: 'full-time', experienceLevel: 'mid',
      location: '', salary: '', skills: '', description: '',
      applyUrl: '', featured: 'free', companyHoneypot: ''
    });
    setTab('manage');
  };

  const handleDeleteClick = async (jobId: string) => {
    if (!confirm('Are you sure you want to permanently delete this job listing?')) return;
    
    try {
      const res = await fetch(`/api/employer/${jobId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchJobs();
      } else {
        alert('Failed to delete job listing.');
      }
    } catch (err) {
      console.error('Error deleting job:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingJobId ? `/api/employer/${editingJobId}` : '/api/employer';
      const method = editingJobId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSubmitted(true);
        setEditingJobId(null);
        setFormData({
          companyName: '', companyLogo: '', companyWebsite: '',
          title: '', category: 'Software', remoteType: 'remote',
          employmentType: 'full-time', experienceLevel: 'mid',
          location: '', salary: '', skills: '', description: '',
          applyUrl: '', featured: 'free', companyHoneypot: ''
        });
        setTimeout(() => setSubmitted(false), 5000);
        fetchJobs(); // Update count and cache list
        if (editingJobId) {
          setTab('manage');
        }
      } else {
        alert(`Failed to ${editingJobId ? 'update' : 'publish'} listing. Please make sure the database is active.`);
      }
    } catch (err) {
      console.error('Error posting employer job:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Software', 'Marketing', 'Finance', 'Sales', 'Customer Support', 'Design', 'Data', 'HR'];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      
      {/* Header */}
      <div className="bg-white border border-grayBorder rounded-lg p-6 mb-8 shadow-sm flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slateText-primary flex items-center gap-2">
            <Building2 className="w-6 h-6 text-accent-green" />
            <span>Employer Services Portal</span>
          </h1>
          <p className="text-xs text-slateText-muted mt-1">Publish vacancies, choose packages, and track candidate metrics from your dashboard.</p>
        </div>
        <div className="text-xs bg-accent-green/10 text-accent-green font-bold px-3 py-1.5 rounded-full">
          Partner Account: {initialUser?.name || 'Recruiter'}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-grayBorder pb-px">
        <button
          onClick={() => handleTabChange('post')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 outline-none flex items-center gap-1.5 -mb-px ${
            tab === 'post' 
              ? 'border-accent-green text-accent-green' 
              : 'border-transparent text-slateText-muted hover:text-slateText-primary'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>{editingJobId ? 'Edit Vacancy' : 'Publish a Job'}</span>
        </button>
        <button
          onClick={() => handleTabChange('manage')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 outline-none flex items-center gap-1.5 -mb-px ${
            tab === 'manage' 
              ? 'border-accent-green text-accent-green' 
              : 'border-transparent text-slateText-muted hover:text-slateText-primary'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Manage Vacancies ({jobs.length})</span>
        </button>
      </div>

      {/* Workspace Grid */}
      <div className={tab === 'post' ? "grid grid-cols-1 lg:grid-cols-3 gap-8 items-start" : "w-full"}>
        
        {/* Main Column */}
        <main className={tab === 'post' ? "lg:col-span-2" : "w-full"}>
          
          {/* POST TAB */}
          {tab === 'post' && (
            submitted ? (
              <div className="bg-accent-green/10 border border-accent-green/20 text-accent-green rounded-lg p-8 flex items-start gap-4 shadow-sm">
                <CheckCircle2 className="w-8 h-8 flex-shrink-0 text-accent-green" />
                <div>
                  <h3 className="font-extrabold text-base">Job Listing Saved!</h3>
                  <p className="text-xs text-slateText-secondary mt-1.5 leading-relaxed">
                    Your vacancy has been successfully saved to the database. Seekers can search, view details, and apply immediately.
                  </p>
                  <button 
                    onClick={() => setTab('manage')}
                    className="mt-4 px-4 py-2 bg-accent-green hover:bg-accent-greenHover text-white text-xs font-bold rounded transition-colors"
                  >
                    View History Dashboard
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white border border-grayBorder rounded-lg p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-grayBorder pb-3">
                  <h2 className="text-sm font-extrabold text-slateText-primary flex items-center gap-1.5">
                    <PlusCircle className="w-4 h-4 text-accent-green" />
                    <span>{editingJobId ? 'Edit Job Opening' : 'Publish a Job Opening'}</span>
                  </h2>
                  {editingJobId && (
                    <button 
                      type="button" 
                      onClick={handleCancelEdit}
                      className="text-xs text-slateText-muted hover:text-red-500 font-semibold flex items-center gap-1"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                {/* 1. Company details */}
                <div className="space-y-4">
                  <h3 className="text-[10px] font-extrabold text-slateText-muted uppercase tracking-wider flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" /> 1. Company details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slateText-secondary">Company Name</label>
                      <input
                        type="text" required
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        placeholder="e.g. Stripe"
                        className="bg-grayBg border border-grayBorder rounded px-3 py-2 text-xs font-semibold outline-none focus:border-accent-green"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slateText-secondary">Logo URL</label>
                      <input
                        type="url"
                        value={formData.companyLogo}
                        onChange={(e) => setFormData({ ...formData, companyLogo: e.target.value })}
                        placeholder="https://example.com/logo.png"
                        className="bg-grayBg border border-grayBorder rounded px-3 py-2 text-xs font-semibold outline-none focus:border-accent-green"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slateText-secondary">Company Website URL</label>
                    <input
                      type="url"
                      value={formData.companyWebsite}
                      onChange={(e) => setFormData({ ...formData, companyWebsite: e.target.value })}
                      placeholder="https://stripe.com"
                      className="bg-grayBg border border-grayBorder rounded px-3 py-2 text-xs font-semibold outline-none focus:border-accent-green"
                    />
                  </div>
                </div>

                {/* 2. Job specifications */}
                <div className="space-y-4 pt-4 border-t border-grayBorder/60">
                  <h3 className="text-[10px] font-extrabold text-slateText-muted uppercase tracking-wider flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5" /> 2. Job specifications
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slateText-secondary">Job Title</label>
                      <input
                        type="text" required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g. Lead Fullstack Engineer"
                        className="bg-grayBg border border-grayBorder rounded px-3 py-2 text-xs font-semibold outline-none focus:border-accent-green"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slateText-secondary">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="bg-grayBg border border-grayBorder rounded px-3 py-2 text-xs font-semibold outline-none focus:border-accent-green"
                      >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slateText-secondary">Workplace policy</label>
                      <select
                        value={formData.remoteType}
                        onChange={(e) => setFormData({ ...formData, remoteType: e.target.value })}
                        className="bg-grayBg border border-grayBorder rounded p-2 text-xs font-semibold outline-none focus:border-accent-green"
                      >
                        <option value="remote">Remote Only</option>
                        <option value="hybrid">Hybrid</option>
                        <option value="onsite">On-Site</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slateText-secondary">Job Type</label>
                      <select
                        value={formData.employmentType}
                        onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                        className="bg-grayBg border border-grayBorder rounded p-2 text-xs font-semibold outline-none focus:border-accent-green"
                      >
                        <option value="full-time">Full-Time</option>
                        <option value="part-time">Part-Time</option>
                        <option value="contract">Contract</option>
                        <option value="internship">Internship</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slateText-secondary">Experience</label>
                      <select
                        value={formData.experienceLevel}
                        onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                        className="bg-grayBg border border-grayBorder rounded p-2 text-xs font-semibold outline-none focus:border-accent-green"
                      >
                        <option value="entry">Entry Level</option>
                        <option value="mid">Mid Level</option>
                        <option value="senior">Senior Level</option>
                        <option value="lead">Lead/Principal</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slateText-secondary">Location (City, Country)</label>
                      <input
                        type="text" required
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g. San Francisco, US or 'Remote'"
                        className="bg-grayBg border border-grayBorder rounded px-3 py-2 text-xs font-semibold outline-none focus:border-accent-green"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slateText-secondary">Estimated Annual Salary (USD)</label>
                      <input
                        type="number"
                        value={formData.salary}
                        onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                        placeholder="e.g. 135000"
                        className="bg-grayBg border border-grayBorder rounded px-3 py-2 text-xs font-semibold outline-none focus:border-accent-green"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slateText-secondary">Target Skills (Comma Separated)</label>
                    <input
                      type="text"
                      value={formData.skills}
                      onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                      placeholder="e.g. Next.js, TypeScript, PostgreSQL"
                      className="bg-grayBg border border-grayBorder rounded px-3 py-2 text-xs font-semibold outline-none focus:border-accent-green"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slateText-secondary">Job Description (Basic HTML or Text)</label>
                    <textarea
                      rows={6} required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter detailed job description, expectations, candidate requirements..."
                      className="bg-grayBg border border-grayBorder rounded p-3 text-xs outline-none focus:border-accent-green font-sans"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slateText-secondary">Application Link or Email</label>
                    <input
                      type="text" required
                      value={formData.applyUrl}
                      onChange={(e) => setFormData({ ...formData, applyUrl: e.target.value })}
                      placeholder="https://careers.company.com/jobs/1 or jobs@company.com"
                      className="bg-grayBg border border-grayBorder rounded px-3 py-2 text-xs font-semibold outline-none focus:border-accent-green"
                    />
                  </div>
                </div>

                {/* 3. Pricing packages */}
                <div className="space-y-4 pt-4 border-t border-grayBorder/60">
                  <h3 className="text-[10px] font-extrabold text-slateText-muted uppercase tracking-wider flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5" /> 3. Select Listing Package
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className={`border rounded-lg p-4 cursor-pointer flex gap-3 transition-colors ${
                      formData.featured === 'free' ? 'border-accent-green bg-accent-green/[0.03]' : 'border-grayBorder hover:bg-grayBg'
                    }`}>
                      <input
                        type="radio"
                        name="featured"
                        value="free"
                        checked={formData.featured === 'free'}
                        onChange={() => setFormData({ ...formData, featured: 'free' })}
                        className="mt-1 accent-accent-green"
                      />
                      <div>
                        <span className="block font-bold text-slateText-primary text-xs">Free standard post</span>
                        <span className="block text-slateText-muted text-[10px] mt-0.5 leading-snug">
                          Job is published on the board for 30 days. Standard ranking in search results.
                        </span>
                        <span className="block font-extrabold text-accent-green text-xs mt-2">$0</span>
                      </div>
                    </label>

                    <label className={`border rounded-lg p-4 cursor-pointer flex gap-3 transition-colors ${
                      formData.featured === 'premium' ? 'border-accent-green bg-accent-green/[0.03]' : 'border-grayBorder hover:bg-grayBg'
                    }`}>
                      <input
                        type="radio"
                        name="featured"
                        value="premium"
                        checked={formData.featured === 'premium'}
                        onChange={() => setFormData({ ...formData, featured: 'premium' })}
                        className="mt-1 accent-accent-green"
                      />
                      <div>
                        <span className="block font-bold text-slateText-primary text-xs">Premium highlighted</span>
                        <span className="block text-slateText-muted text-[10px] mt-0.5 leading-snug">
                          Job remains featured at the top of category feeds, styled with an accent border.
                        </span>
                        <span className="block font-extrabold text-accent-green text-xs mt-2">$99</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Honeypot hidden input field for spam prevention */}
                <div className="hidden" aria-hidden="true">
                  <input
                    type="text"
                    name="companyHoneypot"
                    value={formData.companyHoneypot}
                    onChange={(e) => setFormData({ ...formData, companyHoneypot: e.target.value })}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                <div className="flex gap-4">
                  {editingJobId && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-6 py-3 border border-grayBorder text-slateText-secondary font-bold rounded-md hover:bg-grayBg transition-colors text-xs"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-accent-green hover:bg-accent-greenHover text-white font-bold py-3 rounded-md transition-colors text-xs shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{loading ? 'Processing...' : (editingJobId ? 'Save Vacancy Changes' : 'Publish Vacancy')}</span>
                  </button>
                </div>
              </form>
            )
          )}

          {/* MANAGE TAB */}
          {tab === 'manage' && (
            <div className="bg-white border border-grayBorder rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-grayBorder">
                <h2 className="text-sm font-extrabold text-slateText-primary flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-accent-green" />
                  <span>Posted Vacancies History</span>
                </h2>
                <button 
                  onClick={fetchJobs} 
                  disabled={loadingJobs}
                  className="p-1.5 hover:bg-grayBg rounded-full transition-colors text-slateText-muted hover:text-slateText-primary disabled:opacity-50"
                  title="Reload jobs list"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingJobs ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {loadingJobs && jobs.length === 0 ? (
                <div className="space-y-4 py-8">
                  <div className="h-12 bg-grayBg rounded animate-pulse" />
                  <div className="h-12 bg-grayBg rounded animate-pulse" />
                  <div className="h-12 bg-grayBg rounded animate-pulse" />
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-grayBorder rounded-lg bg-grayBg/30">
                  <AlertCircle className="w-8 h-8 text-slateText-muted mx-auto mb-3" />
                  <h3 className="font-extrabold text-slateText-primary text-sm">No listings found</h3>
                  <p className="text-xs text-slateText-muted mt-1 max-w-sm mx-auto">
                    You haven't posted any jobs under this account yet. Click on the "Publish a Job" tab to post one!
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-grayBorder text-slateText-muted uppercase tracking-wider font-extrabold text-[10px]">
                        <th className="py-3 px-4">Role & Company</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Package</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-center">Clicks</th>
                        <th className="py-3 px-4">Posted Date</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-grayBorder/60">
                      {jobs.map((job) => {
                        const isPremium = job.featured;
                        const postedDate = new Date(job.createdAt).toLocaleDateString(undefined, { 
                          year: 'numeric', month: 'short', day: 'numeric' 
                        });

                        return (
                          <tr key={job.id} className="hover:bg-grayBg/20 transition-colors">
                            <td className="py-3.5 px-4 font-semibold text-slateText-primary">
                              <div className="flex items-center gap-2.5">
                                {job.company?.logo ? (
                                  <img 
                                    src={job.company.logo} 
                                    alt={job.company.name} 
                                    className="w-6 h-6 rounded object-cover border border-grayBorder bg-white"
                                  />
                                ) : (
                                  <div className="w-6 h-6 rounded bg-accent-green/10 flex items-center justify-center font-bold text-accent-green text-[10px]">
                                    {job.company?.name?.slice(0,2) || 'JP'}
                                  </div>
                                )}
                                <div>
                                  <span className="block font-bold hover:text-accent-green transition-colors">
                                    {job.title}
                                  </span>
                                  <span className="block text-[10px] text-slateText-muted font-medium mt-0.5">
                                    {job.company?.name || 'My Company'} &bull; {job.location}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-semibold text-slateText-secondary">{job.category}</td>
                            <td className="py-3.5 px-4">
                              {isPremium ? (
                                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-accent-green/10 text-accent-green">
                                  <DollarSign className="w-2.5 h-2.5" /> Premium
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-slateText-primary/10 text-slateText-secondary">
                                  Standard
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              {job.status === 'published' && (
                                <span className="inline-flex items-center gap-1 text-accent-green font-bold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-accent-green" /> Published
                                </span>
                              )}
                              {job.status === 'draft' && (
                                <span className="inline-flex items-center gap-1 text-amber-500 font-bold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Pending Review
                                </span>
                              )}
                              {job.status === 'expired' && (
                                <span className="inline-flex items-center gap-1 text-red-500 font-bold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Expired
                                </span>
                              )}
                              {job.status === 'archived' && (
                                <span className="inline-flex items-center gap-1 text-slateText-muted font-bold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-slateText-muted" /> Archived
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-center font-bold text-slateText-primary">
                              <span className="inline-flex items-center gap-1 bg-grayBg px-2 py-1 rounded">
                                <BarChart3 className="w-3 h-3 text-slateText-muted" />
                                <span>{job.applyClicks}</span>
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-semibold text-slateText-muted">{postedDate}</td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleEditClick(job)}
                                  className="p-1.5 hover:bg-grayBg rounded text-slateText-muted hover:text-accent-green transition-colors"
                                  title="Edit listing details"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(job.id)}
                                  className="p-1.5 hover:bg-red-50 rounded text-slateText-muted hover:text-red-500 transition-colors"
                                  title="Permanently delete vacancy"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Sidebar Info Column */}
        {tab === 'post' && (
          <aside className="lg:col-span-1 bg-white border border-grayBorder rounded-lg p-5 shadow-sm space-y-4">
            <h2 className="text-xs font-bold text-slateText-primary uppercase tracking-wider border-b border-grayBorder pb-2 mb-3">
              Hiring Help
            </h2>
            <p className="text-xs text-slateText-secondary leading-relaxed">
              By publishing a job vacancy on JobPickers, you gain direct access to thousands of qualified developers and growth marketers daily.
            </p>
            <ul className="text-xs font-semibold text-slateText-secondary space-y-2 list-inside list-disc">
              <li>Instant listing approval</li>
              <li>ATS-compliant parsing matches</li>
              <li>Google Jobs structured data indexing</li>
              <li>Track application clicks & analytics</li>
            </ul>
          </aside>
        )}

      </div>
    </div>
  );
}
