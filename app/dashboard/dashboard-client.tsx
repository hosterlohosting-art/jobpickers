'use client';

import { useState } from 'react';
import JobCard from '../../components/job-card';
import { Bookmark, FileCheck, CheckCircle2, AlertTriangle, Cpu, Play } from 'lucide-react';

interface DashboardClientProps {
  savedJobs: any[];
  applications: any[];
}

export default function SeekerClientDashboard({ savedJobs, applications }: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<'saved' | 'apps' | 'ats'>('saved');
  
  // Resume Optimizer states
  const [resumeText, setResumeText] = useState('');
  const [jobKeywords, setJobKeywords] = useState('');
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [matchedSkills, setMatchedSkills] = useState<string[]>([]);
  const [missingSkills, setMissingSkills] = useState<string[]>([]);

  // Simple client-side ATS analysis logic
  const handleAtsAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText || !jobKeywords) return;

    const resumeLower = resumeText.toLowerCase();
    const targets = jobKeywords.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    
    if (targets.length === 0) return;

    const matched: string[] = [];
    const missing: string[] = [];

    targets.forEach(skill => {
      // Escape special regex characters
      const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // If the skill starts/ends with alphanumeric, enforce word boundary there.
      const startBoundary = /^[a-zA-Z0-9]/.test(skill) ? '\\b' : '';
      const endBoundary = /[a-zA-Z0-9]$/.test(skill) ? '\\b' : '';
      const regex = new RegExp(startBoundary + escaped + endBoundary, 'i');

      if (regex.test(resumeLower)) {
        matched.push(skill);
      } else {
        missing.push(skill);
      }
    });

    const score = Math.round((matched.length / targets.length) * 100);
    setAtsScore(score);
    setMatchedSkills(matched);
    setMissingSkills(missing);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'offered': return 'bg-accent-green/10 text-accent-green';
      case 'interviewing': return 'bg-blue-500/10 text-blue-500';
      case 'rejected': return 'bg-red-500/10 text-red-500';
      default: return 'bg-slateText-muted/10 text-slateText-secondary';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
      
      {/* Sidebar navigation list */}
      <nav className="lg:col-span-1 bg-white border border-grayBorder rounded-lg p-4 flex flex-col gap-1.5 shadow-sm">
        <button
          onClick={() => setActiveTab('saved')}
          className={`flex items-center gap-2.5 px-4 py-3 rounded text-left font-bold text-sm transition-colors ${
            activeTab === 'saved'
              ? 'bg-accent-green/10 text-accent-green'
              : 'text-slateText-secondary hover:bg-grayBg hover:text-slateText-primary'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Saved Bookmarks ({savedJobs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('apps')}
          className={`flex items-center gap-2.5 px-4 py-3 rounded text-left font-bold text-sm transition-colors ${
            activeTab === 'apps'
              ? 'bg-accent-green/10 text-accent-green'
              : 'text-slateText-secondary hover:bg-grayBg hover:text-slateText-primary'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Submitted Applications ({applications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ats')}
          className={`flex items-center gap-2.5 px-4 py-3 rounded text-left font-bold text-sm transition-colors ${
            activeTab === 'ats'
              ? 'bg-accent-green/10 text-accent-green'
              : 'text-slateText-secondary hover:bg-grayBg hover:text-slateText-primary'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>ATS Resume Checker</span>
        </button>
      </nav>

      {/* Primary Workspace panel */}
      <main className="lg:col-span-3">
        
        {/* Tab 1: Saved Jobs */}
        {activeTab === 'saved' && (
          <div className="space-y-4">
            <h2 className="text-base font-extrabold text-slateText-primary uppercase tracking-wider mb-2">Bookmarked Jobs</h2>
            {savedJobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedJobs.map((job) => (
                  <JobCard key={job.id} job={job} isSaved={true} />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-grayBorder rounded-lg p-10 text-center text-slateText-muted">
                You haven't bookmarked any jobs yet. Browse the listing feed and save interesting positions.
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Applications Tracker */}
        {activeTab === 'apps' && (
          <div className="bg-white border border-grayBorder rounded-lg p-6 shadow-sm space-y-4">
            <h2 className="text-base font-extrabold text-slateText-primary border-b border-grayBorder pb-3.5 mb-4">
              Submitted Applications
            </h2>
            {applications.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-grayBorder text-xs text-slateText-muted uppercase font-bold">
                      <th className="py-3 pr-4">Job Info</th>
                      <th className="py-3 px-4">Submitted Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 pl-4">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => (
                      <tr key={app.id} className="border-b border-grayBorder last:border-0 text-xs">
                        <td className="py-4 pr-4">
                          <div className="font-bold text-slateText-primary text-sm">{app.title}</div>
                          <div className="text-slateText-muted mt-0.5">{app.company.name}</div>
                        </td>
                        <td className="py-4 px-4 font-semibold text-slateText-secondary">
                          {new Date(app.appDate).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded-full font-bold uppercase tracking-wider text-[9px] ${getStatusBadgeColor(app.appStatus)}`}>
                            {app.appStatus}
                          </span>
                        </td>
                        <td className="py-4 pl-4 text-slateText-secondary max-w-xs truncate">
                          {app.appNotes || 'No notes added.'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-slateText-muted text-center py-6">No applications tracked yet. Set redirect apply status logs here.</p>
            )}
          </div>
        )}

        {/* Tab 3: Resume Optimizer (Original Value) */}
        {activeTab === 'ats' && (
          <div className="space-y-6">
            <div className="bg-white border border-grayBorder rounded-lg p-6 shadow-sm">
              <h2 className="text-base font-extrabold text-slateText-primary border-b border-grayBorder pb-3 mb-4 flex items-center gap-1.5">
                <Cpu className="w-5 h-5 text-accent-green" />
                <span>ATS Resume Compliance Audit</span>
              </h2>
              <p className="text-xs text-slateText-secondary leading-relaxed mb-6">
                Most medium/large companies filter resumes using automated keyword crawlers. Paste your resume and type the keywords from your target job posting to scan for missing keywords.
              </p>

              <form onSubmit={handleAtsAudit} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slateText-secondary uppercase">1. Paste Resume Text</label>
                  <textarea
                    rows={6}
                    required
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="John Doe&#10;Lead software architect with 5 years experience..."
                    className="bg-grayBg border border-grayBorder rounded p-3 text-xs outline-none focus:border-accent-green font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slateText-secondary uppercase">2. Target Job Keywords (Comma Separated)</label>
                  <input
                    type="text"
                    required
                    value={jobKeywords}
                    onChange={(e) => setJobKeywords(e.target.value)}
                    placeholder="e.g. React, Node.js, AWS, Postgres, TypeScript"
                    className="bg-grayBg border border-grayBorder rounded px-3 py-2 text-xs font-semibold outline-none focus:border-accent-green"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-accent-green hover:bg-accent-greenHover text-white font-bold px-6 py-2.5 rounded text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Scan Resume Keywords</span>
                </button>
              </form>
            </div>

            {/* Audit Output Results screen */}
            {atsScore !== null && (
              <div className="bg-white border border-grayBorder rounded-lg p-6 shadow-sm space-y-5 animate-fadeIn">
                <h3 className="font-extrabold text-sm text-slateText-primary border-b border-grayBorder pb-2">
                  Keywords Matching Results
                </h3>

                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full border-4 border-accent-green flex items-center justify-center font-extrabold text-lg text-accent-green bg-accent-green/10">
                    {atsScore}%
                  </div>
                  <div>
                    <h4 className="font-bold text-slateText-primary text-sm">Resume Match Index</h4>
                    <p className="text-xs text-slateText-secondary mt-1">
                      {atsScore >= 80 
                        ? 'Excellent keywords alignment! Your resume is ready to pass ATS filters.'
                        : 'Action Recommended: Match more exact terms from the listing to improve compliance.'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-grayBorder/60">
                  {/* Matched */}
                  <div>
                    <h5 className="font-bold text-xs text-accent-green flex items-center gap-1.5 uppercase mb-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Found in Resume ({matchedSkills.length})</span>
                    </h5>
                    {matchedSkills.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {matchedSkills.map(s => (
                          <span key={s} className="bg-accent-green/10 text-accent-green font-semibold text-[10px] px-2 py-0.5 rounded capitalize">
                            {s}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px] text-slateText-muted italic">No keywords matched.</span>
                    )}
                  </div>

                  {/* Missing */}
                  <div>
                    <h5 className="font-bold text-xs text-red-500 flex items-center gap-1.5 uppercase mb-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Missing from Resume ({missingSkills.length})</span>
                    </h5>
                    {missingSkills.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {missingSkills.map(s => (
                          <span key={s} className="bg-red-500/10 text-red-500 font-semibold text-[10px] px-2 py-0.5 rounded capitalize">
                            {s}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px] text-accent-green font-semibold italic">Perfect coverage! Zero keywords missing.</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

    </div>
  );
}
