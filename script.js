document.addEventListener('DOMContentLoaded', () => {
  const content = window.PORTFOLIO_CONTENT || { projects: [] };
  const socials = (window.PORTFOLIO_SOCIALS || []).filter(({ url }) => url);
  const profileLinks = document.querySelector('#profile-links');
  const projectGrid = document.querySelector('#project-grid');
  const email = socials.find(({ url }) => url.startsWith('mailto:'))?.url.replace('mailto:', '') || 'durvankurchavan9@gmail.com';

  const profileLinkOrder = ['GitHub', 'LinkedIn', 'Resume', 'YouTube', 'Substack', 'X'];
  const profileLinksByLabel = new Map([
    ...socials.map(social => [social.label, social]),
    ['Resume', { label: 'Resume', url: 'assets/Durvankur_Resume.pdf' }]
  ]);

  profileLinks.innerHTML = profileLinkOrder.map(label => {
    const social = profileLinksByLabel.get(label);
    if (!social) return '';
    const displayLabel = label === 'Substack' ? 'Substacks' : label;
    return `<a href="${social.url}"${social.url.startsWith('mailto:') ? '' : ' target="_blank" rel="noreferrer"'}>${displayLabel} ↗</a>`;
  }).join('');

  projectGrid.innerHTML = (content.projects || []).map(project => {
    const href = project.link || '#';
    const action = project.download ? 'View PDF' : 'GitHub';
    const tags = (project.tags || []).join(' · ');
    return `<article class="project-card">
      <div class="project-card-header">
        <h3>${project.title}</h3>
        <a href="${href}"${project.download ? ' download' : ' target="_blank" rel="noreferrer"'}>${action} ↗</a>
      </div>
      <p>${project.description || ''}</p>
      <p class="tags">${tags}</p>
    </article>`;
  }).join('');

  document.querySelector('#message-form').addEventListener('submit', event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = form.get('name').trim();
    const organization = form.get('organization').trim();
    const message = form.get('message').trim();
    const subject = encodeURIComponent(`Portfolio enquiry${name ? ` from ${name}` : ''}`);
    const body = encodeURIComponent([organization && `Organization: ${organization}`, message].filter(Boolean).join('\n\n'));
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  });

  fetch('/.netlify/functions/visit-counter', { method: 'POST' })
    .then(response => response.ok ? response.json() : Promise.reject())
    .then(({ count }) => {
      document.querySelectorAll('[data-visitor-count]').forEach(counter => {
        counter.textContent = Number(count).toLocaleString();
      });
    })
    .catch(() => {
      document.querySelectorAll('[data-visitor-count]').forEach(counter => {
        counter.textContent = 'Live on Netlify';
      });
    });
});
