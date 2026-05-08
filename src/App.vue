<script setup>
import { onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAdminController } from "@/controllers/useAdminController";
import { useContentStore } from "@/stores/contentStore";
import { signalrService } from "@/services/signalrService";

const router = useRouter();
const route = useRoute();
const admin = useAdminController();
const contentStore = useContentStore();

onMounted(() => {
  contentStore.initialize();
  
  // Start SignalR connection for real-time notifications
  signalrService.on("ReceiveNotification", (message) => {
    contentStore.addNotification({
      type: "info",
      message: message
    });
  });

  signalrService.on("AdminAlert", (payload) => {
    contentStore.addNotification({
      type: "warning",
      title: "Admin Alert",
      message: payload
    });
  });

  signalrService.on("NewFeedback", (feedback) => {
    contentStore.addNotification({
      type: "feedback",
      title: "New Feedback Received",
      message: `${feedback.visitorName} rated ${feedback.rating} stars: "${feedback.message.substring(0, 40)}..."`,
      feedback: feedback
    });
  });

  signalrService.startConnection().catch(err => {
    console.warn("Initial SignalR connection failed (expected if not logged in):", err);
  });
});

watch(
  () => admin.isAuthenticated.value,
  (isAuthenticated) => {
    if (!isAuthenticated && route.meta.requiresAuth) {
      router.replace({
        name: "AdminLogin",
        query: { redirect: route.fullPath },
      });
    }
  },
);
</script>

<template>
  <router-view />
</template>

<style>
@import "./style.css";
</style>
