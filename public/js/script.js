// Taalwissel functionaliteit
document.addEventListener('DOMContentLoaded', function() {
  // Taalwissel knoppen
  const langButtons = document.querySelectorAll('.lang-btn');
  langButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const lang = this.dataset.lang;
      switchLanguage(lang);
    });
  });

  // Drag and drop functionaliteit
  const uploadArea = document.querySelector('.upload-area');
  const fileInput = document.querySelector('.file-input');
  
  if (uploadArea && fileInput) {
    uploadArea.addEventListener('click', () => fileInput.click());
    
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
      uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('dragover');
      
      if (e.dataTransfer.files.length) {
        fileInput.files = e.dataTransfer.files;
        updateFileName();
      }
    });
    
    fileInput.addEventListener('change', updateFileName);
  }

  // Code tab functionaliteit
  const codeTabs = document.querySelectorAll('.code-tab');
  codeTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const target = this.dataset.target;
      switchCodeTab(target);
    });
  });

  // Form submission met loading state
  const analyzeForm = document.querySelector('#analyzeForm');
  if (analyzeForm) {
    analyzeForm.addEventListener('submit', function(e) {
      const submitBtn = this.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="loading"></span> Analyseren...';
      }
    });
  }
});

function switchLanguage(lang) {
  // Update actieve knop
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
  
  // Herlaad pagina met nieuwe taal parameter
  const url = new URL(window.location);
  url.searchParams.set('lang', lang);
  window.location.href = url.toString();
}

function updateFileName() {
  const fileInput = document.querySelector('.file-input');
  const fileNameDisplay = document.querySelector('#fileName');
  
  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    fileNameDisplay.textContent = file.name;
    fileNameDisplay.style.color = 'var(--text)';
  } else {
    fileNameDisplay.textContent = 'Klik of sleep een bestand hierheen';
    fileNameDisplay.style.color = 'var(--text-light)';
  }
}

function switchCodeTab(targetTab) {
  // Update actieve tab
  document.querySelectorAll('.code-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.target === targetTab);
  });
  
  // Toon juiste code content
  document.querySelectorAll('.code-content').forEach(content => {
    content.classList.toggle('hidden', content.id !== targetTab);
  });
}

// Code highlighting (verbeterde versie)
function highlightCode(element) {
  const code = element.textContent || element.innerText;
  
  // Alleen highlighting toepassen als er geen HTML tags zijn
  if (!code.includes('<') && !code.includes('>')) {
    // Eenvoudige syntax highlighting
    const highlighted = code
      .replace(/(\/\/.*$)/gm, '<span class="comment">$1</span>')
      .replace(/(\/\*[\s\S]*?\*\/)/gm, '<span class="comment">$1</span>')
      .replace(/(function|class|if|else|for|while|return|const|let|var|public|private|protected)\b/g, '<span class="keyword">$1</span>')
      .replace(/(\b\d+\b)/g, '<span class="number">$1</span>')
      .replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, '<span class="string">$&</span>');
    
    element.innerHTML = highlighted;
  }
}

// Initialiseer code highlighting wanneer pagina laadt
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.code-content').forEach(highlightCode);
});