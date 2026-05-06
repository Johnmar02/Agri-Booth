<script setup>
import { useRouter } from 'vue-router';
import { useBoothController } from '@/controllers/useBoothController';
import VisitorLoginForm from '@/components/VisitorLoginForm.vue';

const router = useRouter();
const booth = useBoothController();

const handleLogbookSubmit = async () => {
  await booth.submitLogbook();
  if (booth.visitorStatus.value.accessLabel.includes('unlocked') || booth.visitorStatus.value.accessLabel === 'Restricted modules unlocked') {
     router.replace({ name: 'Booth' });
  }
};

const handleLogbookLogin = async () => {
  await booth.loginLogbook();
  if (booth.visitorStatus.value.accessLabel.includes('unlocked') || booth.visitorStatus.value.accessLabel === 'Restricted modules unlocked') {
     router.replace({ name: 'Booth' });
  }
};

const openAdminLogin = () => {
  router.push({ name: 'AdminLogin' });
};
</script>

<template>
  <div class="visitor-auth-page">
    <div class="split-layout">
      <!-- Left Side: Branding -->
      <section class="branding-panel">
        <div class="branding-content">
          <img src="/be-booth.png" alt="ITCPH Logo" class="auth-logo" />
          <div class="text-group">
            <p class="eyebrow">{{ booth.brand.shortName }}</p>
            <h1>{{ booth.brand.name }}</h1>
            <p class="strapline">{{ booth.brand.strapline }}</p>
          </div>
          <p class="mission-text">{{ booth.brand.mission }}</p>
        </div>
      </section>

      <!-- Right Side: Login Form -->
      <section class="form-panel">
        <div class="form-wrapper">
          <VisitorLoginForm
            :form="booth.logbookForm"
            :errors="booth.logbookErrors"
            :is-submitting="booth.isLogbookSubmitting.value"
            @update-field="booth.updateLogbookField"
            @submit="handleLogbookSubmit"
            @login="handleLogbookLogin"
          />
        </div>
      </section>
    </div>

    <!-- Persistent Admin Access -->
    <button class="admin-access-btn" @click="openAdminLogin" aria-label="Administrator Login">
      Admin Access
    </button>
  </div>
</template>

<style scoped>
.visitor-auth-page {
  min-height: 100vh;
  width: 100%;
  background: #f8fafc;
  display: flex;
  position: relative;
  overflow: hidden;
}

.split-layout {
  display: flex;
  width: 100%;
  min-height: 100vh;
}

/* BRANDING PANEL (LEFT) */
.branding-panel {
  flex: 1.2;
  background: 
    radial-gradient(circle at top right, rgba(255, 224, 163, 0.4), transparent 40%),
    linear-gradient(135deg, #1a6ab4 0%, #124d85 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: white;
  position: relative;
}

.branding-content {
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.auth-logo {
  width: 120px;
  height: 120px;
  background: rgba(255, 255, 255, 0.9);
  padding: 1rem;
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.text-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.eyebrow {
  font-size: 0.85rem;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.branding-content h1 {
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 5vw, 3.5rem);
  margin: 0;
  line-height: 1.1;
  letter-spacing: -0.03em;
}

.strapline {
  font-size: 1.25rem;
  font-weight: 600;
  color: #ffca28; /* Gold/Yellow highlight */
  margin: 0;
}

.mission-text {
  font-size: 1.1rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  max-width: 45ch;
}

/* FORM PANEL (RIGHT) */
.form-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: #f8fafc;
}

.form-wrapper {
  width: 100%;
  max-width: 480px;
}

/* ADMIN ACCESS BUTTON */
.admin-access-btn {
  position: fixed;
  right: 2rem;
  bottom: 2rem;
  background: rgba(255, 255, 255, 0.95);
  color: #1a6ab4;
  border: 1px solid rgba(26, 106, 180, 0.2);
  padding: 0.8rem 1.6rem;
  border-radius: 99px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(8px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  z-index: 50;
}

.admin-access-btn:hover {
  background: #1a6ab4;
  color: white;
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 20px 25px -5px rgba(26, 106, 180, 0.3);
}

/* RESPONSIVE DESIGN */
@media (max-width: 1024px) {
  .branding-panel {
    padding: 3rem;
  }
}

@media (max-width: 900px) {
  .split-layout {
    flex-direction: column;
  }

  .branding-panel {
    flex: none;
    min-height: 40vh;
    padding: 3rem 2rem;
    text-align: center;
    align-items: center;
  }

  .branding-content {
    align-items: center;
  }

  .form-panel {
    padding: 3rem 1.5rem;
  }

  .admin-access-btn {
    right: 1.5rem;
    bottom: 1.5rem;
  }
}

@media (max-width: 600px) {
  .branding-content h1 {
    font-size: 2.2rem;
  }
  
  .strapline {
    font-size: 1rem;
  }

  .mission-text {
    font-size: 0.95rem;
  }
}
</style>
