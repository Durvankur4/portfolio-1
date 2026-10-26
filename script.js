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
    const marquee = document.querySelector('.project-marquee');
    const pauseButton = document.querySelector('#project-pause');
    pauseButton.addEventListener('click', () => {
      const paused = marquee.classList.toggle('is-paused');
      pauseButton.setAttribute('aria-pressed', String(paused));
      pauseButton.textContent = paused ? 'Resume motion' : 'Pause motion';
    });
    const move = pixels => {
      const animation = track.getAnimations()[0];
      if (!animation) {
        marquee.scrollBy({ left: pixels, behavior: 'auto' });
        return;
      }
      const distance = cards[cards.length - 1].nextElementSibling.offsetLeft - cards[0].offsetLeft;
      if (!distance) return;
      const duration = animation.effect.getTiming().duration;
      const time = animation.currentTime + pixels / distance * duration;
      animation.currentTime = ((time % duration) + duration) % duration;
    };
    let pointerId;
    let previousX;
    let dragged = false;
    marquee.tabIndex = 0;
    marquee.setAttribute('aria-label', 'Projects: drag left or right, or use the arrow keys');
    marquee.addEventListener('pointerdown', event => {
      if (!event.isPrimary || event.button !== 0 || (event.pointerType === 'touch' && matchMedia('(max-width: 760px)').matches)) return;
      pointerId = event.pointerId;
      previousX = event.clientX;
      dragged = false;
      marquee.classList.add('is-dragging');
    });
    marquee.addEventListener('pointermove', event => {
      if (event.pointerId !== pointerId) return;
      const delta = previousX - event.clientX;
      if (!dragged && Math.abs(delta) < 5) return;
      dragged = true;
      marquee.setPointerCapture(pointerId);
      move(delta);
      previousX = event.clientX;
    });
    const stop = event => {
      if (event.pointerId !== pointerId) return;
      if (marquee.hasPointerCapture(pointerId)) marquee.releasePointerCapture(pointerId);
      pointerId = undefined;
      marquee.classList.remove('is-dragging');
    };
    marquee.addEventListener('pointerup', stop);
    marquee.addEventListener('pointercancel', stop);
    marquee.addEventListener('lostpointercapture', stop);
    marquee.addEventListener('pointerleave', event => { if (!dragged) stop(event); });
    marquee.addEventListener('dragstart', event => event.preventDefault());
    marquee.addEventListener('click', event => {
      if (!dragged) return;
      event.preventDefault();
      event.stopPropagation();
      dragged = false;
    }, true);
    marquee.addEventListener('keydown', event => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      move((event.key === 'ArrowLeft' ? -1 : 1) * (cards[0].getBoundingClientRect().width + 20));
    });
    track.addEventListener('focusin', event => {
      const card = event.target.closest('.marquee-project-card');
      const animation = track.getAnimations()[0];
      if (!card || !animation) return;
      const distance = cards[cards.length - 1].nextElementSibling.offsetLeft - cards[0].offsetLeft;
      if (!distance) return;
      marquee.scrollLeft = 0;
      animation.currentTime = (card.offsetLeft - cards[0].offsetLeft) / distance * animation.effect.getTiming().duration;
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
  const closeNavigation = () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  };
  navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', closeNavigation));
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !navLinks.classList.contains('open')) return;
    closeNavigation();
    navToggle.focus();
  });
  window.addEventListener('scroll', () => {
    const height = document.documentElement.scrollHeight - innerHeight;
    document.querySelector('#scroll-progress').style.width = `${height ? scrollY / height * 100 : 0}%`;
  }, { passive: true });
  fetch('/.netlify/functions/visit-counter', { method: 'POST' })
    .then(response => response.ok ? response.json() : Promise.reject())
    .then(({ count }) => { document.querySelector('#visitor-count').textContent = Number(count).toLocaleString(); })
    .catch(() => { document.querySelector('#visitor-count').textContent = 'Available on live site'; });
});
