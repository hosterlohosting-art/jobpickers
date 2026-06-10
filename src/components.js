// JOBPICKERS.COM DYNAMIC UI COMPONENTS BUILDER

// Helper: Format ISO date string into readable relative time
export function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  
  const diffMins = Math.floor(diffMs / (1000 * 60));
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 30) return `${diffDays} days ago`;
  
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

// Helper: Format numbers as salary strings (e.g., $120k)
export function formatSalary(amount) {
  if (!amount || amount === 0) return 'Undisclosed';
  return `$${Math.round(amount / 1000)}k`;
}

// Helper: Generate a consistent gradient based on company name string
function getCompanyGradient(name) {
  const colors = [
    ['#6366f1', '#8b5cf6'], // Indigo -> Violet
    ['#10b981', '#059669'], // Emerald -> Green
    ['#f59e0b', '#d97706'], // Amber -> Orange
    ['#0ea5e9', '#2563eb'], // Sky -> Blue
    ['#ec4899', '#db2777'], // Pink -> Deep Pink
    ['#8b5cf6', '#d946ef']  // Purple -> Fuchsia
  ];
  
  // Hash name string to pick index
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % colors.length;
  return `linear-gradient(135deg, ${colors[idx][0]}, ${colors[idx][1]})`;
}

// Update the Google Jobs Schema in the document head for SEO indexing
export function updateGoogleJobSchema(job) {
  const schemaScript = document.getElementById('google-job-schema');
  if (!schemaScript) return;
  
  if (!job) {
    schemaScript.textContent = '';
    return;
  }
  
  const schema = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": job.title,
    "description": job.description.replace(/<[^>]*>/g, ''), // Strip HTML tags for schema compliance
    "identifier": {
      "@type": "PropertyValue",
      "name": job.company,
      "value": job.id
    },
    "datePosted": job.date_posted,
    "validThrough": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    "employmentType": job.type === 'full-time' ? 'FULL_TIME' : job.type === 'part-time' ? 'PART_TIME' : job.type === 'contract' ? 'CONTRACT' : 'OTHER',
    "hiringOrganization": {
      "@type": "Organization",
      "name": job.company,
      "sameAs": job.company_url || "https://jobpickers.com"
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": job.location || "Remote",
        "addressCountry": "Global"
      }
    }
  };
  
  if (job.salary_min && job.salary_min > 0) {
    schema.baseSalary = {
      "@type": "MonetaryAmount",
      "currency": "USD",
      "value": {
        "@type": "QuantitativeValue",
        "minValue": job.salary_min,
        "maxValue": job.salary_max || job.salary_min,
        "unitText": "YEAR"
      }
    };
  }
  
  schemaScript.textContent = JSON.stringify(schema, null, 2);
}

// 1. Create a single Job Listing Card DOM element
export function createJobCard(job, isActive, isBookmarked, onCardClick, onBookmarkClick) {
  const card = document.createElement('div');
  card.className = `job-card ${job.featured ? 'featured' : ''} ${isActive ? 'active' : ''}`;
  card.setAttribute('data-id', job.id);
  
  // Left: Company Logo / Initial Placeholder
  const logoCol = document.createElement('div');
  logoCol.className = 'comp-logo-container';
  if (job.company_logo) {
    const img = document.createElement('img');
    img.src = job.company_logo;
    img.alt = `${job.company} logo`;
    img.loading = 'lazy';
    img.onerror = () => {
      // Fallback if image fails to load
      img.remove();
      logoCol.textContent = job.company.charAt(0);
      logoCol.style.background = getCompanyGradient(job.company);
      logoCol.style.color = '#ffffff';
    };
    logoCol.appendChild(img);
  } else {
    logoCol.textContent = job.company.charAt(0);
    logoCol.style.background = getCompanyGradient(job.company);
    logoCol.style.color = '#ffffff';
  }
  card.appendChild(logoCol);
  
  // Right: Job Info
  const infoCol = document.createElement('div');
  infoCol.className = 'job-card-info';
  
  // Card Title & Bookmark Header
  const cardHeader = document.createElement('div');
  cardHeader.className = 'job-card-header';
  
  const title = document.createElement('h3');
  title.className = 'job-card-title';
  title.textContent = job.title;
  cardHeader.appendChild(title);
  
  const bookmarkBtn = document.createElement('button');
  bookmarkBtn.className = `bookmark-icon-btn ${isBookmarked ? 'active' : ''}`;
  bookmarkBtn.setAttribute('aria-label', isBookmarked ? 'Remove Bookmark' : 'Save Job');
  bookmarkBtn.innerHTML = isBookmarked ? '<i class="fa-solid fa-bookmark"></i>' : '<i class="fa-regular fa-bookmark"></i>';
  
  bookmarkBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    onBookmarkClick(job.id);
  });
  cardHeader.appendChild(bookmarkBtn);
  infoCol.appendChild(cardHeader);
  
  // Company details
  const company = document.createElement('div');
  company.className = 'job-card-company';
  company.textContent = job.company;
  infoCol.appendChild(company);
  
  // Tags
  const tagsContainer = document.createElement('div');
  tagsContainer.className = 'job-card-tags';
  
  const policyTag = document.createElement('span');
  policyTag.className = 'tag tag-primary';
  policyTag.textContent = job.policy;
  tagsContainer.appendChild(policyTag);
  
  const typeTag = document.createElement('span');
  typeTag.className = 'tag tag-secondary';
  typeTag.textContent = job.type.replace('-', ' ');
  tagsContainer.appendChild(typeTag);
  
  if (job.location && job.location.toLowerCase() !== 'remote') {
    const locTag = document.createElement('span');
    locTag.className = 'tag';
    locTag.textContent = job.location.split(',')[0]; // Short location name
    tagsContainer.appendChild(locTag);
  }
  infoCol.appendChild(tagsContainer);
  
  // Card Footer: Posted date & Salary Estimation
  const cardFooter = document.createElement('div');
  cardFooter.className = 'job-card-footer';
  
  const salaryEst = document.createElement('span');
  salaryEst.className = 'job-card-salary';
  if (job.salary_min && job.salary_min > 0) {
    salaryEst.textContent = `${formatSalary(job.salary_min)} - ${formatSalary(job.salary_max)}`;
  } else {
    salaryEst.textContent = 'Estimate Unavailable';
  }
  cardFooter.appendChild(salaryEst);
  
  const dateVal = document.createElement('span');
  dateVal.textContent = formatRelativeTime(job.date_posted);
  cardFooter.appendChild(dateVal);
  
  infoCol.appendChild(cardFooter);
  card.appendChild(infoCol);
  
  // Event handler for selection
  card.addEventListener('click', () => {
    onCardClick(job.id);
  });
  
  return card;
}

// 2. Create a Mock AdSense Feed Card element
export function createAdCard() {
  const adCard = document.createElement('div');
  adCard.className = 'adsense-slot ads-inline-card';
  
  const label = document.createElement('div');
  label.className = 'adsense-label';
  label.textContent = 'Sponsored';
  adCard.appendChild(label);
  
  const content = document.createElement('div');
  content.className = 'adsense-mock-content';
  
  const graphic = document.createElement('div');
  graphic.className = 'mock-ad-graphic';
  graphic.innerHTML = `
    <i class="fa-solid fa-graduation-cap" style="color: var(--accent-color);"></i>
    <div style="text-align: left;">
      <div style="font-weight: 700; color: var(--text-primary); font-size: 0.95rem;">Master Full-Stack Engineering</div>
      <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 2px;">Accelerate your coding career with UI Design bootcamps. 20% off coupon inside!</div>
    </div>
  `;
  content.appendChild(graphic);
  adCard.appendChild(content);
  
  return adCard;
}

// 3. Render the full Job Listings column
export function renderJobList(container, jobs, activeJobId, bookmarks, onCardClick, onBookmarkClick) {
  container.innerHTML = '';
  
  if (jobs.length === 0) {
    const placeholder = document.createElement('div');
    placeholder.className = 'detail-placeholder';
    placeholder.innerHTML = `
      <i class="fa-solid fa-circle-exclamation"></i>
      <h3>No Jobs Match</h3>
      <p>Try clearing some filters, expanding your salary range, or typing another keyword search.</p>
    `;
    container.appendChild(placeholder);
    return;
  }
  
  jobs.forEach((job, index) => {
    // Inject AdSense card every 5 jobs to simulate monetized list placements
    if (index > 0 && index % 5 === 0) {
      container.appendChild(createAdCard());
    }
    
    const isBookmarked = bookmarks.includes(job.id);
    const isActive = job.id === activeJobId;
    const cardElement = createJobCard(job, isActive, isBookmarked, onCardClick, onBookmarkClick);
    container.appendChild(cardElement);
  });
}

// 4. Render Job Details Pane (Right hand panel)
export function renderJobDetails(container, job, isBookmarked, onBookmarkClick, onApply) {
  container.innerHTML = '';
  
  if (!job) {
    container.innerHTML = `
      <div class="detail-placeholder">
        <i class="fa-solid fa-briefcase"></i>
        <h3>Select a Job</h3>
        <p>Click on any job card to view the description, salary analysis, company background, and apply directly.</p>
      </div>
    `;
    updateGoogleJobSchema(null);
    return;
  }
  
  // Inject SEO metadata schema inside the head
  updateGoogleJobSchema(job);
  
  // Container wrapper
  const wrapper = document.createElement('div');
  wrapper.className = 'detail-wrapper';
  
  // Detail Header
  const header = document.createElement('div');
  header.className = 'detail-header';
  
  const logo = document.createElement('div');
  logo.className = 'detail-logo';
  if (job.company_logo) {
    const img = document.createElement('img');
    img.src = job.company_logo;
    img.alt = `${job.company} logo`;
    img.onerror = () => {
      img.remove();
      logo.textContent = job.company.charAt(0);
      logo.style.background = getCompanyGradient(job.company);
      logo.style.color = '#ffffff';
    };
    logo.appendChild(img);
  } else {
    logo.textContent = job.company.charAt(0);
    logo.style.background = getCompanyGradient(job.company);
    logo.style.color = '#ffffff';
  }
  header.appendChild(logo);
  
  const headerInfo = document.createElement('div');
  headerInfo.className = 'detail-header-info';
  
  const title = document.createElement('h2');
  title.textContent = job.title;
  headerInfo.appendChild(title);
  
  const meta = document.createElement('div');
  meta.className = 'detail-company-meta';
  
  const compName = document.createElement('span');
  compName.textContent = job.company;
  meta.appendChild(compName);
  
  if (job.company_url) {
    const compLink = document.createElement('a');
    compLink.href = job.company_url;
    compLink.target = '_blank';
    compLink.rel = 'noopener noreferrer';
    compLink.innerHTML = 'Visit Website <i class="fa-solid fa-up-right-from-square" style="font-size: 0.75rem;"></i>';
    meta.appendChild(compLink);
  }
  headerInfo.appendChild(meta);
  header.appendChild(headerInfo);
  wrapper.appendChild(header);
  
  // Metadata Details grid
  const metaGrid = document.createElement('div');
  metaGrid.className = 'detail-meta-grid';
  
  // Meta Item: Location
  const itemLoc = document.createElement('div');
  itemLoc.className = 'detail-meta-item';
  itemLoc.innerHTML = `
    <div class="detail-meta-icon"><i class="fa-solid fa-location-dot"></i></div>
    <div>
      <div class="detail-meta-label">Location</div>
      <div class="detail-meta-val">${job.location}</div>
    </div>
  `;
  metaGrid.appendChild(itemLoc);
  
  // Meta Item: Job Type
  const itemType = document.createElement('div');
  itemType.className = 'detail-meta-item';
  itemType.innerHTML = `
    <div class="detail-meta-icon"><i class="fa-solid fa-clock"></i></div>
    <div>
      <div class="detail-meta-label">Job Type</div>
      <div class="detail-meta-val" style="text-transform: capitalize;">${job.type.replace('-', ' ')}</div>
    </div>
  `;
  metaGrid.appendChild(itemType);
  
  // Meta Item: Workplace Policy
  const itemPol = document.createElement('div');
  itemPol.className = 'detail-meta-item';
  itemPol.innerHTML = `
    <div class="detail-meta-icon"><i class="fa-solid fa-house-laptop"></i></div>
    <div>
      <div class="detail-meta-label">Workplace</div>
      <div class="detail-meta-val" style="text-transform: capitalize;">${job.policy}</div>
    </div>
  `;
  metaGrid.appendChild(itemPol);
  
  // Meta Item: Posted Date
  const itemDate = document.createElement('div');
  itemDate.className = 'detail-meta-item';
  itemDate.innerHTML = `
    <div class="detail-meta-icon"><i class="fa-solid fa-calendar-day"></i></div>
    <div>
      <div class="detail-meta-label">Posted Date</div>
      <div class="detail-meta-val">${new Date(job.date_posted).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
    </div>
  `;
  metaGrid.appendChild(itemDate);
  wrapper.appendChild(metaGrid);
  
  // CTA Actions Panel
  const actions = document.createElement('div');
  actions.className = 'detail-actions';
  
  // Apply Button
  const applyBtn = document.createElement('button');
  applyBtn.className = 'btn btn-primary';
  applyBtn.innerHTML = 'Apply Now <i class="fa-solid fa-arrow-trend-up"></i>';
  applyBtn.addEventListener('click', () => {
    onApply(job.apply_url);
  });
  actions.appendChild(applyBtn);
  
  // Bookmark details Button
  const saveBtn = document.createElement('button');
  saveBtn.className = `btn btn-save ${isBookmarked ? 'active' : ''}`;
  saveBtn.setAttribute('aria-label', isBookmarked ? 'Remove Bookmark' : 'Save Job');
  saveBtn.innerHTML = isBookmarked ? '<i class="fa-solid fa-bookmark"></i>' : '<i class="fa-regular fa-bookmark"></i>';
  saveBtn.addEventListener('click', () => {
    onBookmarkClick(job.id);
  });
  actions.appendChild(saveBtn);
  wrapper.appendChild(actions);
  
  // Interactive Salary trends/Market Comparison
  if (job.salary_min && job.salary_min > 0) {
    const marketAvg = 115000; // General market baseline
    const jobAvg = Math.round((job.salary_min + job.salary_max) / 2);
    
    // Percent ratios
    const capMax = 220000;
    const marketPercent = Math.min(100, Math.round((marketAvg / capMax) * 100));
    const jobPercent = Math.min(100, Math.round((jobAvg / capMax) * 100));
    
    const salaryWidget = document.createElement('div');
    salaryWidget.className = 'salary-trends-widget';
    salaryWidget.innerHTML = `
      <h4><i class="fa-solid fa-chart-simple"></i> Salary Benchmark Tool</h4>
      <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 12px;">Comparing this position's average (${formatSalary(jobAvg)}) to the global software sector median.</p>
      
      <div class="chart-bar-container">
        <div class="chart-row">
          <div class="chart-label">Sector Mid</div>
          <div class="chart-bar-wrapper">
            <div class="chart-fill secondary" style="width: ${marketPercent}%;"></div>
          </div>
          <div class="chart-val">${formatSalary(marketAvg)}</div>
        </div>
        <div class="chart-row">
          <div class="chart-label">This Job</div>
          <div class="chart-bar-wrapper">
            <div class="chart-fill" style="width: ${jobPercent}%;"></div>
          </div>
          <div class="chart-val">${formatSalary(jobAvg)}</div>
        </div>
      </div>
    `;
    wrapper.appendChild(salaryWidget);
  }
  
  // HTML Content body
  const desc = document.createElement('div');
  desc.className = 'detail-description';
  desc.innerHTML = job.description;
  wrapper.appendChild(desc);
  
  container.appendChild(wrapper);
  
  // Active classes for animations
  setTimeout(() => {
    const fills = salaryWidget ? salaryWidget.querySelectorAll('.chart-fill') : [];
    fills.forEach(fill => {
      const w = fill.style.width;
      fill.style.width = '0%';
      setTimeout(() => fill.style.width = w, 50);
    });
  }, 100);
}
