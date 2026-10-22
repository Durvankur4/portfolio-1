document.addEventListener('DOMContentLoaded', () => {
  const content = window.PORTFOLIO_CONTENT || { photos: [], projects: [] };

  const createHeroPhoto = () => {
    const container = document.querySelector('#hero-photo');
    const photo = content.photos?.[0];
    if (!photo) {
      container.textContent = 'Add a photo to assets/photos';
      return;
    }
    const image = document.createElement('img');
    image.src = photo.src;
    image.alt = photo.alt || 'Durvankur';
    image.decoding = 'async';
    image.fetchPriority = 'high';
    container.append(image);
  };

  const createProjectMarquee = () => {
    const track = document.querySelector('#project-track');
    const createCard = project => {
      const card = document.createElement('article');
      card.className = 'marquee-project-card';
      const tags = (project.tags || []).map(tag => `<span>${tag}</span>`).join('');
      const hasProjectLink = project.link && project.link !== '#';
      card.innerHTML = `<div class="marquee-project-image"><img src="${project.image}" alt="${project.title}" loading="lazy" decoding="async"></div><div class="marquee-project-content"><h3>${project.title}</h3><p>${project.description || ''}</p><div class="project-tags">${tags}</div><a class="project-link" href="${hasProjectLink ? project.link : project.image}" target="_blank" rel="noreferrer">${hasProjectLink ? 'View project' : 'View project image'} ↗</a></div>`;
      return card;
    };
    const cards = (content.projects || []).map(createCard);
    if (!cards.length) {
      track.innerHTML = '<p class="empty-card">Add projects to assets/projects</p>';
      return;
    }
    cards.forEach(card => track.append(card));
    cards.forEach(card => {
      const clone = card.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.querySelectorAll('a').forEach(link => { link.tabIndex = -1; });
      track.append(clone);
    });
  };

  const createSocialLinks = () => {
    const links = document.querySelector('#contact-links');
    const socials = (window.PORTFOLIO_SOCIALS || []).filter(social => social.url);
    links.innerHTML = socials.map(social => {
      const external = !social.url.startsWith('mailto:');
      return `<a href="${social.url}" class="contact-link"${external ? ' target="_blank" rel="noreferrer"' : ''}>${social.label} <span>↗</span></a>`;
    }).join('');
  };

  createHeroPhoto();
  createProjectMarquee();
  createSocialLinks();

  const navToggle = document.querySelector('#nav-toggle');
  const navLinks = document.querySelector('#nav-links');
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
  navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => navLinks.classList.remove('open')));
  window.addEventListener('scroll', () => {
    const height = document.documentElement.scrollHeight - innerHeight;
    document.querySelector('#scroll-progress').style.width = `${height ? scrollY / height * 100 : 0}%`;
  }, { passive: true });
  fetch('/.netlify/functions/visit-counter', { method: 'POST' })
    .then(response => response.ok ? response.json() : Promise.reject())
    .then(({ count }) => { document.querySelector('#visitor-count').textContent = Number(count).toLocaleString(); })
    .catch(() => { document.querySelector('#visitor-count').textContent = 'Available on live site'; });
});
