document.addEventListener('DOMContentLoaded', function() {
  // Add clipboard notification element if it doesn't exist
  if (!document.getElementById('clipboard-notification')) {
    const notification = document.createElement('div');
    notification.id = 'clipboard-notification';
    notification.className = 'clipboard-notification'; // Make sure it starts with just this class
    notification.innerHTML = `
      <span class="clipboard-notification-icon"></span>
      <span>Copied to your clipboard</span>
    `;
    document.body.appendChild(notification);
  } else {
    // Ensure existing notification has the correct classes
    const notification = document.getElementById('clipboard-notification');
    notification.className = 'clipboard-notification'; // Reset to just this class, removing any 'show' class
  }
  
  // Load Highlight.js if it's not already loaded
  if (typeof hljs === 'undefined') {
    // Load highlight.js script
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js';
    script.onload = function() {
      // Load language files (Python, R, and Rust)
      const languagesToLoad = ['python', 'r', 'rust'];
      let loadedLanguages = 0;
      
      languagesToLoad.forEach(lang => {
        const langScript = document.createElement('script');
        langScript.src = `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/${lang}.min.js`;
        langScript.onload = function() {
          loadedLanguages++;
          if (loadedLanguages === languagesToLoad.length) {
            // All languages loaded, now highlight and convert code blocks
            highlightAndConvertCodeBlocks();
          }
        };
        document.head.appendChild(langScript);
      });
      
      // Load default stylesheet
      const stylesheet = document.createElement('link');
      stylesheet.rel = 'stylesheet';
      stylesheet.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/tokyo-night-dark.min.css';
      document.head.appendChild(stylesheet);
    };
    document.head.appendChild(script);
  } else {
    // highlight.js is already loaded, just convert code blocks
    highlightAndConvertCodeBlocks();
  }
});

// Function to highlight code with highlight.js and then convert to our styled blocks
function highlightAndConvertCodeBlocks() {
  // First apply highlighting to standard code blocks
  document.querySelectorAll('pre > code').forEach(block => {
    // Check for language class
    const classMatch = block.className.match(/language-(\w+)/);
    if (classMatch) {
      // Apply highlighting only for supported languages
      const language = classMatch[1];
      if (['python', 'r', 'rust'].includes(language.toLowerCase())) {
        hljs.highlightElement(block);
      }
      // For plaintext/text, we don't need to apply highlighting
    }
  });
  
  // Then convert to our styled blocks
  convertCodeBlocks();
}

// Function to convert regular code blocks to styled code blocks
function convertCodeBlocks() {
  const codeBlocks = document.querySelectorAll('pre > code');
  
  codeBlocks.forEach(codeBlock => {
    const pre = codeBlock.parentNode;
    let content = codeBlock.innerHTML;
    
    // Get language if specified
    let language = '';
    const classMatch = codeBlock.className.match(/language-(\w+)/);
    if (classMatch) {
      language = classMatch[1].toLowerCase();
    } else if (codeBlock.classList.contains('hljs')) {
      // If hljs already applied highlighting, try to detect language from class
      for (const cls of codeBlock.classList) {
        if (['python', 'r', 'rust'].includes(cls.toLowerCase())) {
          language = cls.toLowerCase();
          break;
        }
      }
    }
    
    // Create the new structure
    const container = document.createElement('div');
    container.className = 'code-container';
    
    const styledBlock = document.createElement('div');
    styledBlock.className = 'code-block';
    
    // Create a header div for the language indicator and copy button
    const codeHeader = document.createElement('div');
    codeHeader.style.display = 'flex';
    codeHeader.style.justifyContent = 'space-between';
    codeHeader.style.alignItems = 'center';
    codeHeader.style.position = 'sticky';
    codeHeader.style.left = '0';
    codeHeader.style.right = '0';
    codeHeader.style.width = '100%';
    codeHeader.style.marginBottom = '15px';
    codeHeader.style.zIndex = '10';
    codeHeader.style.backgroundColor = '#1a1b26';
    
    // Add language indicator if available
    if (language) {
      const langIndicator = document.createElement('div');
      langIndicator.className = 'language-indicator';
      langIndicator.textContent = language;
      codeHeader.appendChild(langIndicator);
    } else {
      // Add an empty spacer div if no language indicator
      const spacer = document.createElement('div');
      codeHeader.appendChild(spacer);
    }
    
    // Add copy button
    const copyButton = document.createElement('button');
    copyButton.className = 'copy-button';
    copyButton.textContent = 'Copy';
    copyButton.onclick = function() { copyCode(this.closest('.code-block')); };
    codeHeader.appendChild(copyButton);
    
    // Add the header to the styled block
    styledBlock.appendChild(codeHeader);
    
    // Create a content wrapper for the code
    const contentWrapper = document.createElement('div');
    contentWrapper.style.overflow = 'auto';
    contentWrapper.style.lineHeight = '1'; // Match the CSS line-height
    
    // Process content line by line
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (i === lines.length - 1 && line.trim() === '') {
        // Skip empty last line
        continue;
      }
      
      const codeLine = document.createElement('span');
      codeLine.className = 'code-line';
      codeLine.style.margin = '0'; // Ensure no margin
      codeLine.style.padding = '0'; // Ensure no padding
      
      // Check if line starts with spaces or tabs for indentation
      if (line.match(/^(\s+)/)) {
        codeLine.className += ' indented';
      }
      
      // Keep the HTML structure generated by highlight.js
      codeLine.innerHTML = line;
      
      contentWrapper.appendChild(codeLine);
      
      // Add line break except for the last line
      if (i < lines.length - 1) {
        const lineBreak = document.createElement('br');
        lineBreak.style.margin = '0'; // Ensure no margin on line breaks
        contentWrapper.appendChild(lineBreak);
      }
    }
    
    // Add the content wrapper to the styled block
    styledBlock.appendChild(contentWrapper);
    
    // Replace the original pre with our new structure
    container.appendChild(styledBlock);
    pre.parentNode.replaceChild(container, pre);
  });
}

function copyCode(element) {
  // Extract the text content from all code spans
  let textToCopy = '';
  const codeLines = element.querySelectorAll('.code-line');
  
  codeLines.forEach((line, index) => {
    if (index > 0) {
      textToCopy += '\n';
    }
    textToCopy += line.textContent;
  });
  
  const button = element.querySelector('.copy-button');
  
  navigator.clipboard.writeText(textToCopy).then(() => {
    // Change button text to "Done!"
    const originalText = button.textContent;
    button.textContent = 'Done!';
    
    // Show notification
    const notification = document.getElementById('clipboard-notification');
    notification.classList.add('show');
    
    // Hide notification after 2 seconds
    setTimeout(() => {
      notification.classList.remove('show');
    }, 2000);
    
    // Reset button text after 2 seconds
    setTimeout(() => {
      button.textContent = originalText;
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy text: ', err);
  });
}