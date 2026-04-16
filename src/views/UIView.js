export class UIView {
  constructor() {
    this.chatContainer = document.getElementById('chat-container');
    this.chatLog = document.getElementById('chat-log');
    this.loadingIndicator = document.getElementById('loading-indicator');
    this.inputField = document.getElementById('chat-input');
    this.sendBtn = document.getElementById('chat-send-btn');
    
    this.infoCardContainer = document.getElementById('info-card-container');
    this.infoCardCloseBtn = document.getElementById('info-card-close-btn');
    this.infoCardTitle = document.getElementById('info-card-title');
    this.infoCardContent = document.getElementById('info-card-content');
    
    // Callbacks provided by the Controller
    this.onSendCallback = null;
    this.onCloseInfoCallback = null;
    
    this.bindInternalEvents();
  }
  
  bindInternalEvents() {
    // Both button click and Enter key trigger the send action
    this.sendBtn.addEventListener('click', () => this.handleSend());
    this.inputField.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.handleSend();
      }
    });

    if (this.infoCardCloseBtn) {
        this.infoCardCloseBtn.addEventListener('click', () => {
            if (this.onCloseInfoCallback) this.onCloseInfoCallback();
        });
    }
  }

  setCloseInfoCallback(callback) {
      this.onCloseInfoCallback = callback;
  }

  setSendCallback(callback) {
    this.onSendCallback = callback;
  }

  handleSend() {
    const text = this.inputField.value.trim();
    if (text && this.onSendCallback) {
      this.inputField.value = ''; // clear
      this.appendMessage('You', text, 'user');
      this.onSendCallback(text);
      this.inputField.focus();
    }
  }

  showChatContainer() {
    this.chatContainer.classList.add('visible');
    this.chatContainer.classList.remove('hidden');
    // Once open, auto-focus input
    setTimeout(() => this.inputField.focus(), 300);
  }
  
  hideChatContainer() {
    this.chatContainer.classList.remove('visible');
    this.chatContainer.classList.add('hidden');
  }
  
  isChatContainerVisible() {
      return this.chatContainer.classList.contains('visible');
  }

  showInfoCard(title, htmlContent) {
      this.infoCardTitle.textContent = title;
      this.infoCardContent.innerHTML = htmlContent;
      this.infoCardContainer.classList.add('visible');
      this.infoCardContainer.classList.remove('hidden');
  }

  hideInfoCard() {
      this.infoCardContainer.classList.remove('visible');
      this.infoCardContainer.classList.add('hidden');
  }
  
  isInfoCardVisible() {
      return this.infoCardContainer.classList.contains('visible');
  }

  showLoadingState() {
    this.loadingIndicator.style.display = 'block';
    this.chatLog.scrollTop = this.chatLog.scrollHeight;
  }

  hideLoadingState() {
    this.loadingIndicator.style.display = 'none';
  }

  appendMessage(name, text, senderType = 'npc') {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message message-${senderType}`;
    
    const nameSpan = document.createElement('span');
    nameSpan.className = 'name';
    nameSpan.textContent = name + ':';
    
    const textSpan = document.createElement('span');
    textSpan.className = 'text';
    // No typing effect for history
    textSpan.textContent = text;
    
    msgDiv.appendChild(nameSpan);
    msgDiv.appendChild(textSpan);
    
    this.chatLog.appendChild(msgDiv);
    
    // Ensure the loading indicator is beneath messages
    this.chatLog.parentElement.insertBefore(this.chatLog, this.loadingIndicator);
    
    // Auto scroll to bottom
    setTimeout(() => {
        this.chatLog.scrollTop = this.chatLog.scrollHeight;
    }, 10);
  }

  showNPCMessage(data) {
    this.hideLoadingState();
    
    const msgDiv = document.createElement('div');
    msgDiv.className = `message message-npc`;
    
    const nameSpan = document.createElement('span');
    nameSpan.className = 'name';
    nameSpan.textContent = data.name + ':';
    
    const textSpan = document.createElement('span');
    textSpan.className = 'text';
    
    msgDiv.appendChild(nameSpan);
    msgDiv.appendChild(textSpan);
    
    this.chatLog.appendChild(msgDiv);
    
    // Typewriter effect
    let i = 0;
    const speed = 25;
    const type = () => {
      if (i < data.text.length) {
        textSpan.textContent += data.text.charAt(i);
        i++;
        // Keep scrolling down as it types if at bottom
        this.chatLog.scrollTop = this.chatLog.scrollHeight;
        setTimeout(type, speed);
      }
    };
    type();
  }
}
