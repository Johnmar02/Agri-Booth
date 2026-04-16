export class UIView {
  constructor() {
    this.infoCardContainer = document.getElementById('info-card-container');
    this.infoCardCloseBtn  = document.getElementById('info-card-close-btn');
    this.infoCardTitle     = document.getElementById('info-card-title');
    this.infoCardContent   = document.getElementById('info-card-content');

    this.onCloseInfoCallback = null;

    this.bindInternalEvents();
  }

  bindInternalEvents() {
    if (this.infoCardCloseBtn) {
      this.infoCardCloseBtn.addEventListener('click', () => {
        if (this.onCloseInfoCallback) this.onCloseInfoCallback();
      });
    }
  }

  setCloseInfoCallback(callback) {
    this.onCloseInfoCallback = callback;
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
}
