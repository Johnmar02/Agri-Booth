<script setup>
import { onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAdminController } from "@/controllers/useAdminController";
import AdminLoginOverlay from "@/views/AdminLoginOverlay.vue";

const router = useRouter();
const route = useRoute();
const admin = useAdminController();

const handleSubmit = async () => {
  const success = await admin.login();
  if (success) {
    const redirect =
      typeof route.query.redirect === "string"
        ? route.query.redirect
        : "/admin";
    router.replace(redirect);
  }
};

const closeLogin = () => {
  router.replace({ name: "Booth" });
};

onMounted(() => {
  admin.loginForm.error = "";
  admin.loginForm.key = "";
});
</script>

<template>
  <AdminLoginOverlay
    :is-visible="true"
    :form="admin.loginForm"
    @update-key="admin.loginForm.key = $event"
    @submit="handleSubmit"
    @close="closeLogin"
  />
</template>
