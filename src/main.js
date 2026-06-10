// JOBPICKERS.COM CONTROLLER AND STATE MANAGER
import { getJobs } from './api.js';
import { renderJobList, renderJobDetails, formatSalary, formatRelativeTime } from './components.js';

// 1. App State
const state = {
  jobs: [],
  filteredJobs: [],
  activeJob: null,
  bookmarks: JSON.parse(localStorage.getItem('jp_bookmarks')) || [],
  customListings: JSON.parse(localStorage.getItem('jp_custom_listings')) || [],
  currentView: 'jobs-view',
  theme: localStorage.getItem('jp_theme') || 'light',
  filters: {
    keyword: '',
    location: '',
    category: '',
    types: ['full-time'], // Checked by default
    policies: ['remote'], // Checked by default
    minSalary: 0
  },
  sort: 'newest'
};

// 2. DOM Elements Cache
const elements = {
  html: document.documentElement,
  logoBtn: document.getElementById('logo-btn'),
  navFindJobs: document.getElementById('nav-find-jobs'),
  navResumeBuilder: document.getElementById('nav-resume-builder'),
  navPostJob: document.getElementById('nav-post-job'),
  navBookmarks: document.getElementById('nav-bookmarks'),
  themeToggleBtn: document.getElementById('theme-toggle-btn'),
  postJobCta: document.getElementById('post-job-cta'),
  mobileMenuBtn: document.getElementById('mobile-menu-btn'),
  mobileNavMenu: document.getElementById('mobile-nav-menu'),
  mobileThemeBtn: document.getElementById('mobile-theme-btn'),
  bookmarkCount: document.getElementById('bookmark-count'),
  bookmarkCountMobile: document.querySelector('.bookmark-count-mobile'),
  
  // Views
  views: document.querySelectorAll('.app-view'),
  
  // Job Board Elements
  heroSearchForm: document.getElementById('hero-search-form'),
  searchKeyword: document.getElementById('search-keyword'),
  searchLocation: document.getElementById('search-location'),
  statJobs: document.getElementById('stat-jobs'),
  
  // Filters
  filterCategory: document.getElementById('filter-category'),
  clearFiltersBtn: document.getElementById('clear-filters-btn'),
  typeFullTime: document.getElementById('type-full-time'),
  typePartTime: document.getElementById('type-part-time'),
  typeContract: document.getElementById('type-contract'),
  typeInternship: document.getElementById('type-internship'),
  policyRemote: document.getElementById('policy-remote'),
  policyHybrid: document.getElementById('policy-hybrid'),
  policyOnsite: document.getElementById('policy-onsite'),
  filterSalary: document.getElementById('filter-salary'),
  salaryDisplay: document.getElementById('salary-display'),
  sortJobs: document.getElementById('sort-jobs'),
  jobResultsCount: document.getElementById('job-results-count'),
  jobCardsContainer: document.getElementById('job-cards-container'),
  jobDetailPanel: document.getElementById('job-detail-panel'),
  
  // Resume Builder Elements
  resumeForm: document.getElementById('resume-builder-form'),
  addExpBtn: document.getElementById('add-exp-btn'),
  addEduBtn: document.getElementById('add-edu-btn'),
  experienceList: document.getElementById('experience-list'),
  educationList: document.getElementById('education-list'),
  downloadResumeBtn: document.getElementById('download-resume-btn'),
  adResumeCta: document.getElementById('ad-resume-cta'),
  
  // Resume Document Preview Elements
  docName: document.getElementById('doc-name'),
  docTitle: document.getElementById('doc-title'),
  docEmail: document.getElementById('doc-email'),
  docPhone: document.getElementById('doc-phone'),
  docWebsite: document.getElementById('doc-website'),
  docSummary: document.getElementById('doc-summary'),
  docExperienceContainer: document.getElementById('doc-experience-container'),
  docEducationContainer: document.getElementById('doc-education-container'),
  docSkillsContainer: document.getElementById('doc-skills-container'),
  
  // Employer Portal Form Elements
  postJobForm: document.getElementById('post-job-form'),
  
  // Bookmarks Panel Elements
  bookmarkCardsContainer: document.getElementById('bookmark-cards-container'),
  bookmarkDetailPanel: document.getElementById('bookmark-detail-panel'),

  // Footer Form
  footerSubscribeForm: document.getElementById('footer-subscribe-form'),
  subscribeSuccessMsg: document.getElementById('subscribe-success-msg')
};

// 3. Navigation View Routing
function switchView(viewId) {
  state.currentView = viewId;
  
  // Toggle Active Views
  elements.views.forEach(view => {
    if (view.id === viewId) {
      view.classList.add('active');
    } else {
      view.classList.remove('active');
    }
  });

  // Toggle Header Navigation Highlighting
  const headerLinks = [elements.navFindJobs, elements.navResumeBuilder, elements.navPostJob, elements.navBookmarks];
  headerLinks.forEach(link => {
    if (link.getAttribute('data-view') === viewId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Toggle Mobile Navigation Menu Links
  const mobileLinks = elements.mobileNavMenu.querySelectorAll('.mobile-nav-link');
  mobileLinks.forEach(link => {
    if (link.getAttribute('data-view') === viewId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Hide mobile menu dropdown on navigate
  elements.mobileNavMenu.classList.remove('active');
  elements.mobileNavMenu.style.display = 'none';

  // If switching to Bookmarks, render them
  if (viewId === 'bookmarks-view') {
    renderBookmarksView();
  }

  // Scroll to top of window
  window.scrollTo(0, 0);
}

// 4. Light/Dark Theme Controller
function applyTheme(theme) {
  state.theme = theme;
  localStorage.setItem('jp_theme', theme);
  elements.html.setAttribute('data-theme', theme);
  
  // Update header button icon
  const icon = elements.themeToggleBtn.querySelector('i');
  if (theme === 'light') {
    icon.className = 'fa-solid fa-sun';
    elements.mobileThemeBtn.querySelector('i').className = 'fa-solid fa-sun';
    elements.mobileThemeBtn.querySelector('span').textContent = 'Light Mode';
  } else {
    icon.className = 'fa-solid fa-moon';
    elements.mobileThemeBtn.querySelector('i').className = 'fa-solid fa-moon';
    elements.mobileThemeBtn.querySelector('span').textContent = 'Dark Mode';
  }
}

// 5. Job Search & Filtering logic
function applyFiltersAndSort() {
  let results = [...state.jobs];

  // A. Keywords Filter (Title, Company, Description)
  if (state.filters.keyword) {
    const q = state.filters.keyword.toLowerCase().trim();
    results = results.filter(job => 
      job.title.toLowerCase().includes(q) || 
      job.company.toLowerCase().includes(q) || 
      job.description.toLowerCase().includes(q)
    );
  }

  // B. Location Filter
  if (state.filters.location) {
    const loc = state.filters.location.toLowerCase().trim();
    results = results.filter(job => 
      job.location.toLowerCase().includes(loc) ||
      (loc === 'remote' && job.policy === 'remote')
    );
  }

  // C. Category Filter
  if (state.filters.category) {
    results = results.filter(job => job.category === state.filters.category);
  }

  // D. Job Type Filter
  if (state.filters.types.length > 0) {
    results = results.filter(job => state.filters.types.includes(job.type));
  }

  // E. Workplace Policy Filter
  if (state.filters.policies.length > 0) {
    results = results.filter(job => state.filters.policies.includes(job.policy));
  }

  // F. Salary Slider Filter
  if (state.filters.minSalary > 0) {
    results = results.filter(job => job.salary_min >= state.filters.minSalary);
  }

  // G. Sort Logic
  if (state.sort === 'newest') {
    results.sort((a, b) => new Date(b.date_posted) - new Date(a.date_posted));
  } else if (state.sort === 'salary-desc') {
    results.sort((a, b) => b.salary_max - a.salary_max);
  } else if (state.sort === 'company') {
    results.sort((a, b) => a.company.localeCompare(b.company));
  }

  // Always keep featured jobs at the top of the feed
  results.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  state.filteredJobs = results;
  
  // Update counter UI
  elements.jobResultsCount.textContent = results.length;
  
  // Check active job still exists in results, else pick first
  const activeExists = results.some(j => j.id === state.activeJob?.id);
  if (!activeExists && results.length > 0) {
    state.activeJob = results[0];
  } else if (results.length === 0) {
    state.activeJob = null;
  }

  // Render Left List Column
  renderJobList(
    elements.jobCardsContainer, 
    state.filteredJobs, 
    state.activeJob?.id, 
    state.bookmarks, 
    handleSelectJob, 
    handleToggleBookmark
  );

  // Render Right Details Panel
  renderJobDetails(
    elements.jobDetailPanel, 
    state.activeJob, 
    state.activeJob ? state.bookmarks.includes(state.activeJob.id) : false, 
    handleToggleBookmark, 
    handleApplyJob
  );
}

// 6. Action Handlers
function handleSelectJob(jobId) {
  const job = state.jobs.find(j => j.id === jobId);
  if (!job) return;
  
  state.activeJob = job;
  
  // Re-render list to show active highlight
  renderJobList(
    elements.jobCardsContainer, 
    state.filteredJobs, 
    state.activeJob.id, 
    state.bookmarks, 
    handleSelectJob, 
    handleToggleBookmark
  );
  
  // Re-render detail
  renderJobDetails(
    elements.jobDetailPanel, 
    state.activeJob, 
    state.bookmarks.includes(state.activeJob.id), 
    handleToggleBookmark, 
    handleApplyJob
  );
  
  // Support Mobile View: display detail panel full-screen overlay if screen size is narrow
  if (window.innerWidth <= 992) {
    elements.jobDetailPanel.classList.add('mobile-active');
    
    // Add close button to details panel in mobile view
    let closeBtn = elements.jobDetailPanel.querySelector('.mobile-detail-close');
    if (!closeBtn) {
      closeBtn = document.createElement('button');
      closeBtn.className = 'btn btn-secondary mobile-detail-close';
      closeBtn.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 1100; border-radius: 50px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);';
      closeBtn.innerHTML = '<i class="fa-solid fa-arrow-left"></i> Back to List';
      closeBtn.addEventListener('click', () => {
        elements.jobDetailPanel.classList.remove('mobile-active');
        closeBtn.remove();
      });
      elements.jobDetailPanel.appendChild(closeBtn);
    }
  }
}

function handleToggleBookmark(jobId) {
  const index = state.bookmarks.indexOf(jobId);
  if (index === -1) {
    state.bookmarks.push(jobId);
  } else {
    state.bookmarks.splice(index, 1);
  }
  
  // Save state
  localStorage.setItem('jp_bookmarks', JSON.stringify(state.bookmarks));
  
  // Update Bookmarks badge count
  elements.bookmarkCount.textContent = state.bookmarks.length;
  elements.bookmarkCountMobile.textContent = state.bookmarks.length;
  
  // Re-render current panels
  if (state.currentView === 'jobs-view') {
    applyFiltersAndSort();
  } else if (state.currentView === 'bookmarks-view') {
    renderBookmarksView();
  }
}

function handleApplyJob(applyUrl) {
  if (applyUrl.startsWith('mailto:')) {
    window.location.href = applyUrl;
  } else {
    window.open(applyUrl, '_blank', 'noopener,noreferrer');
  }
}

// 7. Bookmarks Panel Renderer
function renderBookmarksView() {
  const bookmarkedJobs = state.jobs.filter(j => state.bookmarks.includes(j.id));
  elements.bookmarkCardsContainer.innerHTML = '';
  
  if (bookmarkedJobs.length === 0) {
    elements.bookmarkCardsContainer.innerHTML = `
      <div class="detail-placeholder">
        <i class="fa-solid fa-bookmark" style="opacity: 0.2;"></i>
        <h3>No Saved Jobs</h3>
        <p>Bookmark jobs from the main feed using the icon on any listing card to see them here.</p>
      </div>
    `;
    elements.bookmarkDetailPanel.innerHTML = `
      <div class="detail-placeholder">
        <i class="fa-solid fa-circle-info"></i>
        <h3>Select a Saved Job</h3>
        <p>Click on any job in your saved list to display details and apply.</p>
      </div>
    `;
    return;
  }

  // Render Bookmarked List
  bookmarkedJobs.forEach((job) => {
    const card = document.createElement('div');
    card.className = `job-card ${job.featured ? 'featured' : ''}`;
    card.innerHTML = `
      <div class="comp-logo-container" style="background: linear-gradient(135deg, var(--primary), var(--accent-color)); color: white;">
        ${job.company.charAt(0)}
      </div>
      <div class="job-card-info">
        <div class="job-card-header">
          <h3 class="job-card-title">${job.title}</h3>
          <button class="bookmark-icon-btn active"><i class="fa-solid fa-bookmark"></i></button>
        </div>
        <div class="job-card-company">${job.company}</div>
        <div class="job-card-footer">
          <span class="job-card-salary">${job.salary_min ? formatSalary(job.salary_min) + ' - ' + formatSalary(job.salary_max) : 'Estimates unavailable'}</span>
          <span>${formatRelativeTime(job.date_posted)}</span>
        </div>
      </div>
    `;
    
    // Wire up event click
    card.addEventListener('click', () => {
      renderJobDetails(elements.bookmarkDetailPanel, job, true, handleToggleBookmark, handleApplyJob);
      
      // Highlight selection
      elements.bookmarkCardsContainer.querySelectorAll('.job-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      
      // Mobile Support for Bookmarks detail
      if (window.innerWidth <= 992) {
        elements.bookmarkDetailPanel.classList.add('mobile-active');
        let closeBtn = elements.bookmarkDetailPanel.querySelector('.mobile-detail-close');
        if (!closeBtn) {
          closeBtn = document.createElement('button');
          closeBtn.className = 'btn btn-secondary mobile-detail-close';
          closeBtn.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 1100; border-radius: 50px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);';
          closeBtn.innerHTML = '<i class="fa-solid fa-arrow-left"></i> Back to Saved';
          closeBtn.addEventListener('click', () => {
            elements.bookmarkDetailPanel.classList.remove('mobile-active');
            closeBtn.remove();
          });
          elements.bookmarkDetailPanel.appendChild(closeBtn);
        }
      }
    });

    // Wire up Bookmark delete
    card.querySelector('.bookmark-icon-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      handleToggleBookmark(job.id);
    });

    elements.bookmarkCardsContainer.appendChild(card);
  });
  
  // Trigger click first saved item
  elements.bookmarkCardsContainer.querySelector('.job-card').click();
}

// 8. Real-time Resume Builder synchronizer
function syncResumePreview() {
  elements.docName.textContent = document.getElementById('res-fullname').value || 'John Doe';
  elements.docTitle.textContent = document.getElementById('res-title').value || 'Professional Title';
  
  const email = document.getElementById('res-email').value;
  elements.docEmail.innerHTML = email ? `<i class="fa-solid fa-envelope"></i> ${email}` : '';
  
  const phone = document.getElementById('res-phone').value;
  elements.docPhone.innerHTML = phone ? `<i class="fa-solid fa-phone"></i> ${phone}` : '';
  
  const site = document.getElementById('res-website').value;
  elements.docWebsite.innerHTML = site ? `<i class="fa-solid fa-globe"></i> ${site}` : '';
  
  elements.docSummary.textContent = document.getElementById('res-summary').value || 'Write a brief description of your career achievements and specialization...';
  
  // A. Sync Experience Items
  elements.docExperienceContainer.innerHTML = '';
  const expItems = elements.experienceList.querySelectorAll('.experience-item');
  expItems.forEach(item => {
    const comp = item.querySelector('.exp-company').value;
    const role = item.querySelector('.exp-role').value;
    const duration = item.querySelector('.exp-duration').value;
    const desc = item.querySelector('.exp-details').value;
    
    if (comp || role) {
      const docItem = document.createElement('div');
      docItem.className = 'doc-item';
      docItem.innerHTML = `
        <div class="doc-item-header">
          <span><span class="doc-item-company">${comp || 'Company'}</span> - ${role || 'Role'}</span>
          <span class="doc-item-duration">${duration || 'Duration'}</span>
        </div>
        <p class="doc-item-desc">${desc.replace(/\n/g, '<br>') || 'Responsibility points...'}</p>
      `;
      elements.docExperienceContainer.appendChild(docItem);
    }
  });

  // B. Sync Education Items
  elements.docEducationContainer.innerHTML = '';
  const eduItems = elements.educationList.querySelectorAll('.education-item');
  eduItems.forEach(item => {
    const school = item.querySelector('.edu-school').value;
    const degree = item.querySelector('.edu-degree').value;
    const year = item.querySelector('.edu-year').value;
    
    if (school || degree) {
      const docItem = document.createElement('div');
      docItem.className = 'doc-item';
      docItem.innerHTML = `
        <div class="doc-item-header">
          <span><span class="doc-item-company">${school || 'School'}</span> - ${degree || 'Degree'}</span>
          <span class="doc-item-duration">${year || 'Year'}</span>
        </div>
      `;
      elements.docEducationContainer.appendChild(docItem);
    }
  });

  // C. Sync Skills
  elements.docSkillsContainer.innerHTML = '';
  const skillsStr = document.getElementById('res-skills').value;
  if (skillsStr) {
    skillsStr.split(',').forEach(skill => {
      const trimmed = skill.trim();
      if (trimmed) {
        const tag = document.createElement('span');
        tag.className = 'doc-skill-tag';
        tag.textContent = trimmed;
        elements.docSkillsContainer.appendChild(tag);
      }
    });
  } else {
    elements.docSkillsContainer.innerHTML = '<span class="doc-skill-tag">Skill 1</span><span class="doc-skill-tag">Skill 2</span>';
  }
}

function handlePrintResume() {
  const resumeContent = document.getElementById('resume-document-capture').innerHTML;
  const printWindow = window.open('', '_blank');
  if (!printWindow) return alert("Please allow popups to download/print your resume.");
  
  printWindow.document.write(`
    <html>
      <head>
        <title>Resume - JobPickers</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <style>
          body {
            font-family: 'Inter', sans-serif;
            color: #2d2d2d;
            background: #ffffff;
            padding: 40px;
            margin: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .resume-document {
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
          }
          .doc-header {
            border-bottom: 2px solid #2557a7;
            padding-bottom: 16px;
            margin-bottom: 24px;
          }
          .doc-header h2 {
            font-size: 2.1rem;
            color: #0f172a;
            margin: 0;
          }
          .doc-header h3 {
            font-size: 1.15rem;
            color: #2557a7;
            margin: 4px 0 0 0;
            font-weight: 600;
          }
          .doc-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            margin-top: 12px;
            font-size: 0.8rem;
            color: #64748b;
          }
          .doc-meta span {
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .doc-meta i {
            color: #2557a7;
          }
          .doc-section {
            margin-bottom: 24px;
          }
          .doc-section-title {
            font-size: 0.95rem;
            text-transform: uppercase;
            color: #0f172a;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 6px;
            margin-bottom: 12px;
            letter-spacing: 0.05em;
            font-weight: 700;
          }
          .doc-text {
            font-size: 0.85rem;
            color: #334155;
            line-height: 1.6;
            margin: 0;
          }
          .doc-item {
            margin-bottom: 16px;
          }
          .doc-item-header {
            display: flex;
            justify-content: space-between;
            font-weight: 700;
            font-size: 0.9rem;
            color: #0f172a;
          }
          .doc-item-company {
            color: #2557a7;
          }
          .doc-item-duration {
            color: #64748b;
            font-size: 0.8rem;
          }
          .doc-item-desc {
            font-size: 0.82rem;
            color: #475569;
            line-height: 1.5;
            margin: 4px 0 0 0;
          }
          .doc-skills-list {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
          }
          .doc-skill-tag {
            background-color: #f1f5f9;
            color: #2557a7;
            font-size: 0.75rem;
            font-weight: 700;
            padding: 4px 10px;
            border-radius: 4px;
            display: inline-block;
          }
        </style>
      </head>
      <body>
        <div class="resume-document">${resumeContent}</div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

// 9. Event Listeners Setup
function initEventListeners() {
  // A. Header Navigation Click Events
  const navTrigger = (el, viewName) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      switchView(viewName);
    });
  };
  
  navTrigger(elements.navFindJobs, 'jobs-view');
  navTrigger(elements.logoBtn, 'jobs-view');
  navTrigger(elements.navResumeBuilder, 'resume-view');
  navTrigger(elements.navPostJob, 'post-view');
  navTrigger(elements.navBookmarks, 'bookmarks-view');
  navTrigger(elements.postJobCta, 'post-view');
  navTrigger(elements.adResumeCta, 'resume-view');

  // Link in footer
  document.querySelectorAll('.footer-col a[data-target]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.getAttribute('data-target');
      switchView(target);
    });
  });

  // B. Theme Switcher Click Events
  elements.themeToggleBtn.addEventListener('click', () => {
    applyTheme(state.theme === 'dark' ? 'light' : 'dark');
  });

  elements.mobileThemeBtn.addEventListener('click', () => {
    applyTheme(state.theme === 'dark' ? 'light' : 'dark');
  });

  // C. Mobile Hamburger Menu Toggle
  elements.mobileMenuBtn.addEventListener('click', () => {
    const isOpen = elements.mobileNavMenu.classList.contains('active');
    if (isOpen) {
      elements.mobileNavMenu.classList.remove('active');
      elements.mobileNavMenu.style.display = 'none';
    } else {
      elements.mobileNavMenu.classList.add('active');
      elements.mobileNavMenu.style.display = 'flex';
    }
  });

  // Mobile navigation list clicks
  elements.mobileNavMenu.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const view = link.getAttribute('data-view');
      switchView(view);
    });
  });

  // D. Hero Search Form Submissions
  elements.heroSearchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    state.filters.keyword = elements.searchKeyword.value;
    state.filters.location = elements.searchLocation.value;
    applyFiltersAndSort();
  });

  // E. Sidebar Dynamic Filters
  elements.filterCategory.addEventListener('change', (e) => {
    state.filters.category = e.target.value;
    applyFiltersAndSort();
  });

  // Checkbox group filters helper
  const handleCheckboxGroup = (checkboxes, filterStateArray) => {
    checkboxes.forEach(cb => {
      cb.addEventListener('change', () => {
        // Collect checked inputs
        const checked = [];
        checkboxes.forEach(c => {
          if (c.checked) checked.push(c.value);
        });
        // Mutate array
        filterStateArray.length = 0;
        filterStateArray.push(...checked);
        applyFiltersAndSort();
      });
    });
  };

  handleCheckboxGroup(
    [elements.typeFullTime, elements.typePartTime, elements.typeContract, elements.typeInternship],
    state.filters.types
  );

  handleCheckboxGroup(
    [elements.policyRemote, elements.policyHybrid, elements.policyOnsite],
    state.filters.policies
  );

  // Salary Slider Event
  elements.filterSalary.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    state.filters.minSalary = val;
    elements.salaryDisplay.textContent = val === 0 ? 'Any' : formatSalary(val);
    applyFiltersAndSort();
  });

  // Clear all Filters Button
  elements.clearFiltersBtn.addEventListener('click', () => {
    elements.searchKeyword.value = '';
    elements.searchLocation.value = '';
    elements.filterCategory.value = '';
    elements.filterSalary.value = 0;
    elements.salaryDisplay.textContent = 'Any';
    
    // Check default values
    elements.typeFullTime.checked = true;
    elements.typePartTime.checked = false;
    elements.typeContract.checked = false;
    elements.typeInternship.checked = false;
    elements.policyRemote.checked = true;
    elements.policyHybrid.checked = false;
    elements.policyOnsite.checked = false;
    
    state.filters = {
      keyword: '',
      location: '',
      category: '',
      types: ['full-time'],
      policies: ['remote'],
      minSalary: 0
    };
    
    applyFiltersAndSort();
  });

  // Sort selectors
  elements.sortJobs.addEventListener('change', (e) => {
    state.sort = e.target.value;
    applyFiltersAndSort();
  });

  // F. Employer Portal Form Submission handler
  elements.postJobForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const company = document.getElementById('post-company').value;
    const title = document.getElementById('post-title').value;
    const logoUrl = document.getElementById('post-logo').value;
    const companyUrl = document.getElementById('post-comp-site').value;
    const category = document.getElementById('post-category').value;
    const type = document.getElementById('post-type').value;
    const policy = document.getElementById('post-policy').value;
    const location = document.getElementById('post-location').value;
    const salary = parseInt(document.getElementById('post-salary').value) || 0;
    const descriptionText = document.getElementById('post-description').value;
    const applyUrl = document.getElementById('post-apply').value;
    const tier = elements.postJobForm.querySelector('input[name="listing-tier"]:checked').value;
    
    // Format description text to HTML representation
    const htmlDesc = `
      <h3>Role Description</h3>
      <p>${descriptionText.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>
    `;

    // Package Job Object
    const newJob = {
      id: `custom-job-${Date.now()}`,
      title,
      company,
      company_logo: logoUrl || '',
      company_url: companyUrl || '',
      category,
      type,
      policy,
      location,
      salary_min: salary ? Math.max(0, salary - 15000) : 0,
      salary_max: salary ? salary + 15000 : 0,
      description: htmlDesc,
      apply_url: applyUrl,
      date_posted: new Date().toISOString(),
      featured: tier === 'premium'
    };

    // Store State
    state.customListings.unshift(newJob);
    localStorage.setItem('jp_custom_listings', JSON.stringify(state.customListings));

    // Alert User & Reset
    alert(`Successfully posted job listing: "${title}" at "${company}"! Job is now live on the feed.`);
    elements.postJobForm.reset();
    
    // Merge into core jobs stack and refresh UI
    state.jobs = [...state.customListings, ...state.jobs.filter(j => !j.id.startsWith('custom-job-'))];
    applyFiltersAndSort();
    
    // Navigate back to listings
    switchView('jobs-view');
  });

  // G. Dynamic form creation (Experience/Education) inside Resume Builder
  elements.addExpBtn.addEventListener('click', () => {
    const div = document.createElement('div');
    div.className = 'experience-item card-sub';
    div.innerHTML = `
      <div class="form-row">
        <div class="form-field">
          <label>Company</label>
          <input type="text" class="exp-company" placeholder="Acme Tech" required>
        </div>
        <div class="form-field">
          <label>Role</label>
          <input type="text" class="exp-role" placeholder="Senior Frontend Developer" required>
        </div>
      </div>
      <div class="form-row">
        <div class="form-field">
          <label>Duration</label>
          <input type="text" class="exp-duration" placeholder="Jan 2022 - Present" required>
        </div>
      </div>
      <div class="form-field">
        <label>Responsibilities & Achievements</label>
        <textarea class="exp-details" rows="2" placeholder="Led developer squads..."></textarea>
      </div>
      <button type="button" class="btn btn-secondary btn-sm remove-item-btn" style="position: absolute; top: 12px; right: 12px; padding: 4px 8px; border-radius: 4px; color: var(--danger);"><i class="fa-solid fa-trash"></i></button>
    `;
    
    div.querySelector('.remove-item-btn').addEventListener('click', () => {
      div.remove();
      syncResumePreview();
    });
    
    // Wire up inputs to sync on type
    div.querySelectorAll('input, textarea').forEach(input => {
      input.addEventListener('input', syncResumePreview);
    });
    
    elements.experienceList.appendChild(div);
    syncResumePreview();
  });

  elements.addEduBtn.addEventListener('click', () => {
    const div = document.createElement('div');
    div.className = 'education-item card-sub';
    div.innerHTML = `
      <div class="form-row">
        <div class="form-field">
          <label>School / University</label>
          <input type="text" class="edu-school" placeholder="Stanford University" required>
        </div>
        <div class="form-field">
          <label>Degree</label>
          <input type="text" class="edu-degree" placeholder="B.S. in Computer Science" required>
        </div>
      </div>
      <div class="form-row">
        <div class="form-field">
          <label>Year</label>
          <input type="text" class="edu-year" placeholder="2018 - 2021" required>
        </div>
      </div>
      <button type="button" class="btn btn-secondary btn-sm remove-item-btn" style="position: absolute; top: 12px; right: 12px; padding: 4px 8px; border-radius: 4px; color: var(--danger);"><i class="fa-solid fa-trash"></i></button>
    `;
    
    div.querySelector('.remove-item-btn').addEventListener('click', () => {
      div.remove();
      syncResumePreview();
    });
    
    div.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', syncResumePreview);
    });
    
    elements.educationList.appendChild(div);
    syncResumePreview();
  });

  // Watch typing in main resume fields to update paper preview instantly
  elements.resumeForm.querySelectorAll('input, textarea').forEach(input => {
    input.addEventListener('input', syncResumePreview);
  });

  // Printing/PDF download
  elements.downloadResumeBtn.addEventListener('click', handlePrintResume);

  // Pricing highlight toggle in job publisher
  const pricingCards = elements.postJobForm.querySelectorAll('.pricing-card');
  pricingCards.forEach(card => {
    card.addEventListener('click', () => {
      pricingCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      card.querySelector('input').checked = true;
    });
  });

  // Footer Newsletter form
  elements.footerSubscribeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    elements.footerSubscribeForm.reset();
    elements.subscribeSuccessMsg.classList.remove('hidden');
    setTimeout(() => {
      elements.subscribeSuccessMsg.classList.add('hidden');
    }, 4000);
  });
}

// 10. App Initialization
async function initApp() {
  // Apply visual theme
  applyTheme(state.theme);
  
  // Set bookmarks badges
  elements.bookmarkCount.textContent = state.bookmarks.length;
  elements.bookmarkCountMobile.textContent = state.bookmarks.length;
  
  // Bind UI Events
  initEventListeners();
  
  // Sync the Resume Preview once initially to fill placeholder values
  syncResumePreview();

  // Load Job listings
  try {
    const allJobs = await getJobs(state.customListings);
    state.jobs = allJobs;
    
    // Update Stats UI
    elements.statJobs.textContent = allJobs.length.toLocaleString();
    
    // Apply filters (which does first render)
    applyFiltersAndSort();
  } catch (error) {
    console.error("Critical error starting application job feed:", error);
    elements.jobCardsContainer.innerHTML = `
      <div class="detail-placeholder">
        <i class="fa-solid fa-triangle-exclamation" style="color: var(--danger); opacity: 1;"></i>
        <h3>Error Launching Feed</h3>
        <p>There was a problem loading jobs. Please check your network connection and reload the page.</p>
      </div>
    `;
  }
}

// Fire!
document.addEventListener('DOMContentLoaded', initApp);
