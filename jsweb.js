(function(){
  "use strict";

  /* ---------------- NAV MOBILE TOGGLE ---------------- */
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');
  navToggle.addEventListener('click', function(){
    navLinks.classList.toggle('open');
  });

  /* ---------------- PAGE WIPE NAV TRANSITION ---------------- */
  var wipe = document.getElementById('page-wipe');
  document.querySelectorAll('[data-nav]').forEach(function(link){
    link.addEventListener('click', function(e){
      e.preventDefault();
      var targetId = link.getAttribute('href');
      var target = document.querySelector(targetId);
      if(!target) return;
      navLinks.classList.remove('open');

      wipe.classList.remove('reveal');
      wipe.classList.add('cover');

      setTimeout(function(){
        target.scrollIntoView({ behavior:'instant' in document.documentElement.style ? 'instant' : 'auto', block:'start' });
        // replay reveal animations within the target section
        target.querySelectorAll('.rise').forEach(function(el){ el.classList.remove('in-view'); });
        target.querySelectorAll('.about-body').forEach(function(el){ el.classList.remove('in-view'); });
        void target.offsetWidth; // reflow
        setTimeout(function(){
          triggerReveal(target);
        }, 60);

        wipe.classList.remove('cover');
        wipe.classList.add('reveal');
      }, 560);
    });
  });

  function triggerReveal(scope){
    scope.querySelectorAll('.rise').forEach(function(el){ el.classList.add('in-view'); });
    scope.querySelectorAll('.about-body').forEach(function(el){ el.classList.add('in-view'); });
    scope.querySelectorAll('[data-project]').forEach(function(el){ el.classList.add('in-view'); });
  }

  /* ---------------- ACTIVE NAV LINK ON SCROLL ---------------- */
  var navAnchors = document.querySelectorAll('[data-nav]');
  var sections = ['about','project','gallery','resume','contact'].map(function(id){ return document.getElementById(id); });
  var navObserver = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        var id = entry.target.id;
        navAnchors.forEach(function(a){
          a.classList.toggle('active', a.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { rootMargin:'-45% 0px -45% 0px' });
  sections.forEach(function(s){ if(s) navObserver.observe(s); });

  /* ---------------- SCROLL REVEAL ---------------- */
  var revealObserver = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        entry.target.classList.add('in-view');
      }
    });
  }, { threshold:0.2 });

  document.querySelectorAll('.rise, .about-body, [data-project]').forEach(function(el){
    revealObserver.observe(el);
  });

  /* ---------------- HERO PARALLAX ---------------- */
  var scene = document.getElementById('scene');
  var heroSection = document.getElementById('home');
  if(scene && window.matchMedia('(pointer:fine)').matches){
    heroSection.addEventListener('mousemove', function(e){
      var rect = heroSection.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width - 0.5;
      var y = (e.clientY - rect.top) / rect.height - 0.5;
      scene.querySelectorAll('[data-depth]').forEach(function(el){
        var depth = parseFloat(el.getAttribute('data-depth'));
        var tx = x * depth * 40;
        var ty = y * depth * 24;
        el.style.transform = (el.classList.contains('grid-floor')
          ? 'perspective(500px) rotateX(58deg) translate(' + tx + 'px,' + ty + 'px)'
          : 'translate(' + tx + 'px,' + ty + 'px)');
      });
    });
  }

  /* ---------------- AMBIENT SOUND TOGGLE ---------------- */
  var soundToggle = document.getElementById('soundToggle');
  var iconOn = document.getElementById('soundIconOn');
  var iconOff = document.getElementById('soundIconOff');
  var audioCtx, gainNode, oscA, oscB, playing = false;

  function startAmbient(){
    try{
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      gainNode = audioCtx.createGain();
      gainNode.gain.value = 0;
      gainNode.connect(audioCtx.destination);

      oscA = audioCtx.createOscillator();
      oscA.type = 'sine';
      oscA.frequency.value = 55;
      oscA.connect(gainNode);

      oscB = audioCtx.createOscillator();
      oscB.type = 'sine';
      oscB.frequency.value = 110.5;
      oscB.connect(gainNode);

      oscA.start();
      oscB.start();
      gainNode.gain.linearRampToValueAtTime(0.035, audioCtx.currentTime + 1.2);
    }catch(err){ /* Web Audio unavailable — toggle is visual only */ }
  }

  function stopAmbient(){
    if(gainNode && audioCtx){
      gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.6);
      setTimeout(function(){
        if(oscA) oscA.stop();
        if(oscB) oscB.stop();
        if(audioCtx) audioCtx.close();
      }, 650);
    }
  }

  soundToggle.addEventListener('click', function(){
    playing = !playing;
    soundToggle.classList.toggle('on', playing);
    iconOn.style.display = playing ? 'block' : 'none';
    iconOff.style.display = playing ? 'none' : 'block';
    if(playing){ startAmbient(); } else { stopAmbient(); }
  });
/*---project carousel---*/
document.querySelectorAll(".carousel").forEach(carousel=>{

    const slides=carousel.querySelectorAll(".slide");

    let current=0;

    const next=carousel.querySelector(".next");

    const prev=carousel.querySelector(".prev");

    function showSlide(index){

        slides.forEach(slide=>slide.classList.remove("active"));

        slides[index].classList.add("active");

    }

    next.addEventListener("click",()=>{

        current++;

        if(current>=slides.length){

            current=0;

        }

        showSlide(current);

    });

    prev.addEventListener("click",()=>{

        current--;

        if(current<0){

            current=slides.length-1;

        }

        showSlide(current);

    });

});
  /* ---------------- GALLERY TILES + MARQUEE ---------------- */
  var imageIcon = '<svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.4"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5-9 9"/></svg>';
  var expandIcon = '<svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M9 3H3v6"/><path d="M15 21h6v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg>';

  function buildTiles(track, prefix, items, variantClasses){
    var html = '';
    var count = Array.isArray(items) ? items.length : items;

    for(var r = 0; r < 2; r++){
      for(var i = 0; i < count; i++){
        var v = variantClasses[i % variantClasses.length];
        var label = prefix + ' 0' + (i + 1);
        var imagePath = Array.isArray(items) ? items[i] : '';
        var imageMarkup = Array.isArray(items)
          ? '<img src="' + imagePath + '" alt="' + label + '" class="tile-img">'
          : imageIcon;

        html += '<div class="tile ' + v + '" data-label="' + label + '" data-image="' + imagePath + '">' +
                  imageMarkup +
                  '<div class="expand">' + expandIcon + '</div>' +
                  '<span class="idx">' + prefix + '_0' + (i + 1) + '</span>' +
                '</div>';
      }
    }
    track.innerHTML = html;
  }

  buildTiles(document.getElementById('track3d'), '3D', 6, ['', 'b', 'c']);
  buildTiles(document.getElementById('track2d'), '2D', [
    '2D Works/1.jpg',
    '2D Works/2.png',
    '2D Works/23.jpg',
    '2D Works/31.jpg',
    '2D Works/32_a.png',
    '2D Works/33.png',
    '2D Works/34_a.png',
    '2D Works/35.png',
    '2D Works/36.jpg',
    '2D Works/4.png'
  ], ['c', '', 'b']);

  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxLabel = document.getElementById('lightboxLabel');

  document.querySelectorAll('.tile').forEach(function(tile){
    tile.addEventListener('click', function(){
      if(lightboxImg){
        lightboxImg.src = tile.dataset.image || '';
      }
      if(lightboxLabel){
        lightboxLabel.textContent = tile.dataset.label || '';
      }
      if(lightbox){
        lightbox.classList.add('open');
      }
    });
  });

  document.getElementById('lightboxClose').addEventListener('click', function(){
    if(lightbox){
      lightbox.classList.remove('open');
    }
  });
  if(lightbox){
    lightbox.addEventListener('click', function(e){
      if(e.target === lightbox){
        lightbox.classList.remove('open');
      }
    });
  }
  /* ---------------- RESUME BUTTONS ---------------- */
  /* ---------------- CONTACT SOCIAL GRID ---------------- */
 var socials = [
  {
    name: 'Email',
    href: 'mailto:mnitish020604@gmail.com',
    svg: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>'
  },
  {
    name: 'Phone',
    href: 'tel:+919994026782',
    svg: '<path d="M6 4h4l2 5-2 2a14 14 0 0 0 5 5l2-2 5 2v4a2 2 0 0 1-2 2C10.3 22 2 13.7 2 4a2 2 0 0 1 2-2h2z"/>'
  },
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com/in/nitish-m-4310a532b',
    svg: '<rect x="3" y="3" width="18" height="18" rx="3"/><line x1="8" y1="10" x2="8" y2="16"/><circle cx="8" cy="7" r="1"/><path d="M12 16v-4a2 2 0 0 1 4 0v4"/>'
  },
  {
    name: 'ArtStation',
    href: 'https://artstation.com/mnitish',
    svg: '<path d="M3 16h18"/><path d="M8 4l7 12"/><path d="M13 20l1.5-3"/>'
  },
  {
    name: 'Behance',
    href: 'https://behance.net/__zero_art_vision__',
    svg: '<rect x="3" y="7" width="9" height="10" rx="2"/><path d="M14 10h7"/><path d="M14 14c0-2 2-3 4-3s4 1 4 3-2 3-4 3"/>'
  },
  {
    name: 'Dribbble',
    href: 'https://dribbble.com/zero-artvision',
    svg: '<circle cx="12" cy="12" r="9"/><path d="M5 12c3-1 8-1 14 2"/><path d="M7 7c4 2 8 7 10 13"/><path d="M12 3c2 3 3 8 2 18"/><path d="M18 7c-4 2-8 6-11 12"/>'
  },
  {
    name: 'YouTube',
    href: 'https://youtube.com/@zeroartvision',
    svg: '<rect x="3" y="6" width="18" height="12" rx="3"/><polygon points="10 9 15 12 10 15" fill="currentColor" stroke="none"/>'
  },
  {
    name: 'Instagram',
    href: 'https://instagram.com/__zero_art_vision__/',
    svg: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/>'
  },
  {
    name: 'X',
    href: 'https://x.com/zero_art_vision',
    svg: '<line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/>'
  },
  {
    name: 'Facebook',
    href: 'https://facebook.com/share/1cAAxBiFA2/', 
    svg: '<path d="M14 8h3V4h-3c-2.2 0-4 1.8-4 4v2H8v4h2v6h4v-6h3l1-4h-4V8c0-.6.4-1 1-1z"/>'
  }
];
  var grid = document.getElementById('socialGrid');
  grid.innerHTML = socials.map(function(s){
    return '<a class="social-tile" href="' + s.href + '" aria-label="' + s.name + '" title="' + s.name + '">' +
             '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6">' + s.svg + '</svg>' +
           '</a>';
  }).join('');

})();
