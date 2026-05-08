<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAdminController } from "@/controllers/useAdminController";
import { useContentStore } from "@/stores/contentStore";
import AdminDashboardView from "@/views/AdminDashboardView.vue";

const router = useRouter();
const admin = useAdminController();
const contentStore = useContentStore();

onMounted(async () => {
  await Promise.all([
    contentStore.fetchBebuQuestions(),
    contentStore.fetchStats()
  ]);
});

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

const handleCreateAdmin = async (payload) => {
  return await admin.createAdmin(payload);
};

const handleDeleteAdmin = async (id) => {
  await admin.removeAdmin(id);
};

const handleFetchAdmins = async () => {
  await admin.fetchAdmins();
};

const handleFetchDetailedAnalytics = async () => {
  await admin.fetchDetailedAnalytics();
};

const handleFetchFeedbacks = async () => {
  await admin.fetchFeedbacks();
};
</script>

<template>
  <AdminDashboardView
    :analytics="admin.analyticsSummary.value"
    :detailed-analytics="admin.detailedAnalytics"
    :modules="contentStore.modules"
    :visitor-logs="admin.visitorLogs.value"
    :is-adding-resource="admin.isAddingResource.value"
    :resource-draft="admin.resourceDraft"
    :upload-progress="admin.uploadProgress.value"
    :admin-list="admin.adminList.value"
    :feedbacks-list="admin.feedbacksList.value"
    @logout="handleLogout"
    @close-dashboard="handleClose"
    @start-add="handleAddResource"
    @cancel-add="() => (admin.isAddingResource.value = false)"
    @update-draft="handleUpdateDraft"
    @commit-resource="handleCommitResource"
    @delete-resource="handleDeleteResource"
    @create-admin="handleCreateAdmin"
    @delete-admin="handleDeleteAdmin"
    @fetch-admins="handleFetchAdmins"
    @fetch-detailed-analytics="handleFetchDetailedAnalytics"
    @fetch-feedbacks="handleFetchFeedbacks"
  />
</template>
