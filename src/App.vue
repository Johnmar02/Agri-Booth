<script setup>
import { useRouter, useRoute } from "vue-router";
import { watch } from "vue";
import { useAdminController } from "@/controllers/useAdminController";

const router = useRouter();
const route = useRoute();
const admin = useAdminController();

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
