document.addEventListener('DOMContentLoaded', function() {
  // Add clipboard notification element if it doesn't exist
  if (!document.getElementById('clipboard-notification')) {
    const notification = document.createElement('div');
    notification.id = 'clipboard-notification';
    notification.className = 'clipboard-notification';
    notification.innerHTML = `
      <span class="clipboard-notification-icon"></span>
      <span>Copied to your clipboard</span>
    `;
    document.body.appendChild(notification);
  }
  
  // Convert all pre > code blocks to our styled code blocks
  convertCodeBlocks();
});

// Function to convert regular code blocks to styled code blocks
function convertCodeBlocks() {
  const codeBlocks = document.querySelectorAll('pre > code');
  
  codeBlocks.forEach(codeBlock => {
    const pre = codeBlock.parentNode;
    const content = codeBlock.innerHTML;
    
    // Create the new structure
    const container = document.createElement('div');
    container.className = 'code-container';
    
    const styledBlock = document.createElement('div');
    styledBlock.className = 'code-block';
    
    // Process content line by line
    const lines = content.split('\n');
    lines.forEach(line => {
      if (line.trim() !== '') {
        const codeLine = document.createElement('span');
        codeLine.className = 'code-line';
        
        // Check if line starts with spaces or tabs for indentation
        if (line.match(/^(\s+)/)) {
          codeLine.className += ' indented';
        }
        
        codeLine.innerHTML = line;
        styledBlock.appendChild(codeLine);
      } else {
        // Add empty lines
        styledBlock.appendChild(document.createElement('br'));
      }
    });
    
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
  const codeBlock = element;
  const textToCopy = codeBlock.textContent.replace('Copy', '').replace('Done!', '').trim();
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