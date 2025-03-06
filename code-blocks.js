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
  
  // Convert all pre > code blocks to our styled code blocks
  convertCodeBlocks();
});

// Function to convert regular code blocks to styled code blocks
function convertCodeBlocks() {
  const codeBlocks = document.querySelectorAll('pre > code');
  
  codeBlocks.forEach(codeBlock => {
    const pre = codeBlock.parentNode;
    let content = codeBlock.innerHTML;
    
    // Preserve original content without HTML entity conversions
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    content = tempDiv.textContent || tempDiv.innerText;
    
    // Create the new structure
    const container = document.createElement('div');
    container.className = 'code-container';
    
    const styledBlock = document.createElement('div');
    styledBlock.className = 'code-block';
    
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
      
      // Check if line starts with spaces or tabs for indentation
      if (line.match(/^(\s+)/)) {
        codeLine.className += ' indented';
      }
      
      // Preserve whitespace
      const codeContent = document.createElement('code');
      codeContent.textContent = line;
      codeLine.appendChild(codeContent);
      
      styledBlock.appendChild(codeLine);
      
      // Add line break except for the last line
      if (i < lines.length - 1) {
        styledBlock.appendChild(document.createElement('br'));
      }
    }
    
    // Add copy button
    const copyButton = document.createElement('button');
    copyButton.className = 'copy-button';
    copyButton.textContent = 'Copy';
    copyButton.onclick = function() { copyCode(this.parentElement); };
    styledBlock.appendChild(copyButton);
    
    // Replace the original pre with our new structure
    container.appendChild(styledBlock);
    pre.parentNode.replaceChild(container, pre);
  });
}

function copyCode(element) {
  // Extract the text content from all code spans
  let textToCopy = '';
  const codeLines = element.querySelectorAll('.code-line code');
  
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