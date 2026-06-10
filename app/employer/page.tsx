'use client';

import { useState } from 'react';
import { Briefcase, Building2, Send, PlusCircle, CheckCircle2, DollarSign } from 'lucide-react';

export default function EmployerDashboard() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/employer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({
          companyName: '', companyLogo: '', companyWebsite: '',
          title: '', category: 'Software', remoteType: 'remote',
          employmentType: 'full-time', experienceLevel: 'mid',
          location: '', salary: '', skills: '', description: '',
          applyUrl: '', featured: 'free', companyHoneypot: ''
        });
        setTimeout(() => setSubmitted(false), 8000);
      } else {
        alert('Failed to publish listing. Please make sure the backend database seed has run.');
      }
    } catch (err) {
      console.error('Error posting employer job:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Software', 'Marketing', 'Finance', 'Sales', 'Customer Support', 'Design', 'Data', 'HR'];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      
      <div className="bg-white border border-grayBorder rounded-lg p-6 mb-8 shadow-sm flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slateText-primary">Employer Services Portal</h1>
          <p className="text-xs text-slateText-muted mt-1">Publish fresh vacancies, choose pricing packages, and manage candidates flow.</p>
        </div>
        <div className="text-xs bg-accent-green/10 text-accent-green font-bold px-3 py-1.5 rounded-full">
          Partner Account: Stripe Recruiter
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Form panel Column (Col span 2) */}
        <main className="lg:col-span-2">
          {submitted ? (
            <div className="bg-accent-green/10 border border-accent-green/30 text-accent-green rounded-lg p-8 flex items-start gap-4 animate-pulse">
              <CheckCircle2 className="w-8 h-8 flex-shrink-0" />
              <div>
                <h3 className="font-extrabold text-base">Job Listing Published Live!</h3>
                <p className="text-sm text-slateText-secondary mt-1 leading-relaxed">
                  Your job vacancy has been approved and published to the database. Seekers can immediately view, bookmark, and apply.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white border border-grayBorder rounded-lg p-6 shadow-sm space-y-6">
              <h2 className="text-base font-extrabold text-slateText-primary border-b border-grayBorder pb-3 flex items-center gap-1.5">
                <PlusCircle className="w-5 h-5 text-accent-green" />
                <span>Publish a Job Opening</span>
              </h2>

              {/* 1. Company details */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slateText-muted uppercase tracking-wider flex items-center gap-1">
                  <Building2 className="w-4 h-4" /> 1. Company details
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
                <h3 className="text-xs font-bold text-slateText-muted uppercase tracking-wider flex items-center gap-1">
                  <Briefcase className="w-4 h-4" /> 2. Job specifications
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
                <h3 className="text-xs font-bold text-slateText-muted uppercase tracking-wider flex items-center gap-1">
                  <DollarSign className="w-4 h-4" /> 3. Select Listing Package
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
                      className="mt-1"
                    />
                    <div>
                      <span className="block font-bold text-slateText-primary text-sm">Free standard post</span>
                      <span className="block text-slateText-muted text-[10px] mt-0.5 leading-snug">
                        Job is published on the board for 30 days. Standard ranking in search.
                      </span>
                      <span className="block font-extrabold text-accent-green text-sm mt-2">$0</span>
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
                      className="mt-1"
                    />
                    <div>
                      <span className="block font-bold text-slateText-primary text-sm">Premium highlighted</span>
                      <span className="block text-slateText-muted text-[10px] mt-0.5 leading-snug">
                        Job remains featured at the top of category feeds, styled with an accent border.
                      </span>
                      <span className="block font-extrabold text-accent-green text-sm mt-2">$99</span>
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

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-accent-green hover:bg-accent-greenHover text-white font-bold py-3 rounded-md transition-colors text-sm shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Publishing...' : 'Publish Vacancy'}</span>
              </button>
            </form>
          )}
        </main>

        {/* Sidebar Info Column */}
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
            <li>Track application clicks</li>
          </ul>
        </aside>

      </div>
    </div>
  );
}
