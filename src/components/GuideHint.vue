<script setup>
import { computed } from 'vue'
import GuideGroupCard from '@/components/guide/GuideGroupCard.vue'
import { lookupGuideHint, getGuideGroup } from '@/scripts/guide_lookup'

const props = defineProps({ pllCase: { type: Object, required: true } })

const hint = computed(() => lookupGuideHint(props.pllCase))
const guideGroup = computed(() => hint.value ? getGuideGroup(hint.value.groupId) : null)
</script>

<template>
  <div v-if="hint && guideGroup" class="guide-hint">
    <GuideGroupCard
      :group="guideGroup"
      :highlightRowIndex="hint.rowIndex"
      :defaultPatternColumns="6"
    />
  </div>
</template>
