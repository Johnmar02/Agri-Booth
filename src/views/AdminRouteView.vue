<script setup>
import { useRouter } from "vue-router";
import { useAdminController } from "@/controllers/useAdminController";
import { useContentStore } from "@/stores/contentStore";
import AdminDashboardView from "@/views/AdminDashboardView.vue";

const router = useRouter();
const admin = useAdminController();
const contentStore = useContentStore();

const handleLogout = () => {
  admin.logout();
  router.replace({ name: "Booth" });
};

const handleClose = () => {
  router.replace({ name: "Booth" });
};

const handleAddResource = () => {
  admin.startAddResource();
};

const handleCommitResource = async (moduleId) => {
  await admin.commitResource(moduleId);
};

const handleDeleteResource = async ({ moduleId, resourceId }) => {
  await admin.deleteResource(moduleId, resourceId);
};

const handleUpdateDraft = (payload) => {
  Object.assign(admin.resourceDraft, payload);
};
</script>

<template>
  <AdminDashboardView
    :analytics="admin.analyticsSummary.value"
    :modules="contentStore.modules"
    :visitor-logs="admin.visitorLogs.value"
    :is-adding-resource="admin.isAddingResource.value"
    :resource-draft="admin.resourceDraft"
    :upload-progress="admin.uploadProgress.value"
    @logout="handleLogout"
    @close-dashboard="handleClose"
    @start-add="handleAddResource"
    @cancel-add="() => (admin.isAddingResource.value = false)"
    @update-draft="handleUpdateDraft"
    @commit-resource="handleCommitResource"
    @delete-resource="handleDeleteResource"
  />
</template>
