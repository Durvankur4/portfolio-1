document.addEventListener('DOMContentLoaded', () => {
  const content = window.PORTFOLIO_CONTENT || { photos: [], projects: [] };

  const createPhotoStack = () => {
    const stack = document.querySelector('#photo-stack');
    const position = document.querySelector('#photo-position');
    const items = content.photos || [];
    let currentIndex = 0;
    let startX = 0;
    let didSwipe = false;
    const render = () => {
      stack.innerHTML = '';
      if (!items.length) {
        stack.innerHTML = '<div class="stack-card is-top empty-card">Add photos to assets/photos</div>';
        return;
      }
      // Always render three cards. When fewer than three photos are supplied,
      // repeat the available photo so the stack keeps its intended shape.
      const visibleIndexes = Array.from({ length: 3 }, (_, depth) =>
        (currentIndex + depth) % items.length
      );
      [...visibleIndexes].reverse().forEach((itemIndex, depth) => {
        const photo = items[itemIndex];
        const card = document.createElement('article');
        card.className = `stack-card photo-card stack-depth-${depth} is-entering`;
        if (depth === visibleIndexes.length - 1) card.classList.add('is-top');
        const isTopCard = depth === visibleIndexes.length - 1;
        card.innerHTML = `<img src="${photo.src}" alt="${photo.alt || 'Durvankur'}" decoding="async" loading="${isTopCard ? 'eager' : 'lazy'}"${isTopCard ? ' fetchpriority="high"' : ''}>`;
        card.addEventListener('click', () => {
          if (!didSwipe && isTopCard) shuffle(1);
        });
        stack.append(card);
        requestAnimationFrame(() => card.classList.remove('is-entering'));
      });
      position.textContent = `${currentIndex + 1} / ${items.length}`;
    };
    const shuffle = direction => {
      if (items.length < 2) return;
      currentIndex = (currentIndex + direction + items.length) % items.length;
      render();
    };
    document.querySelector('#photo-previous').addEventListener('click', () => shuffle(-1));
    document.querySelector('#photo-next').addEventListener('click', () => shuffle(1));
    stack.addEventListener('pointerdown', event => {
      didSwipe = false;
      startX = event.clientX;
      stack.setPointerCapture?.(event.pointerId);
    });
    stack.addEventListener('pointerup', event => {
      const delta = event.clientX - startX;
      if (Math.abs(delta) > 45) {
        didSwipe = true;
        shuffle(delta < 0 ? 1 : -1);
      }
    });
    stack.addEventListener('pointercancel', () => { didSwipe = false; });
    stack.addEventListener('keydown', event => {
      if (event.key === 'ArrowRight') shuffle(1);
      if (event.key === 'ArrowLeft') shuffle(-1);
    });
    render();
  };

  const createProjectMarquee = () => {
    const track = document.querySelector('#project-track');
    const createCard = project => {
      const card = document.createElement('article');
      card.className = 'marquee-project-card';
      const tags = (project.tags || []).map(tag => `<span>${tag}</span>`).join('');
      card.innerHTML = `<div class="marquee-project-image"><img src="${project.image}" alt="${project.title}" loading="lazy" decoding="async"></div><div class="marquee-project-content"><h3>${project.title}</h3><p>${project.description || ''}</p><div class="project-tags">${tags}</div><a class="project-link" href="${project.link || '#'}" target="_blank" rel="noreferrer">View project ↗</a></div>`;
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

  createPhotoStack();
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
