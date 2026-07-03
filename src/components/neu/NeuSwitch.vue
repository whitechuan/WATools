<template>
  <div
    class="neu-switch"
    :class="{ 'neu-switch--active': modelValue }"
    :style="switchStyle"
    @click="toggle"
  >
    <div class="neu-switch__track">
      <div class="neu-switch__thumb"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ name: 'NeuSwitch' })

const props = withDefaults(defineProps<{
  modelValue?: boolean
  activeColor?: string
  inactiveColor?: string
}>(), {
  modelValue: false,
  activeColor: '',
  inactiveColor: '',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'change', value: boolean): void
}>()

const switchStyle = computed(() => {
  const styles: Record<string, string> = {}
  if (props.activeColor && props.modelValue) {
    styles['--switch-active-color'] = props.activeColor
  }
  if (props.inactiveColor && !props.modelValue) {
    styles['--switch-inactive-color'] = props.inactiveColor
  }
  return styles
})

function toggle() {
  const newValue = !props.modelValue
  emit('update:modelValue', newValue)
  emit('change', newValue)
}
</script>

<style scoped>
.neu-switch {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  --switch-active-color: var(--color-primary);
  --switch-inactive-color: var(--neu-bg-dark);
}

.neu-switch__track {
  position: relative;
  width: 48px;
  height: 26px;
  background: var(--neu-bg);
  border-radius: 13px;
  box-shadow: var(--neu-shadow-pressed);
  transition: background var(--transition-normal);
}

.neu-switch--active .neu-switch__track {
  background: var(--switch-active-color);
}

.neu-switch__thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  background: var(--neu-bg);
  border-radius: 50%;
  box-shadow: 2px 2px 4px var(--neu-shadow-dark), -1px -1px 3px var(--neu-shadow-light);
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
}

.neu-switch--active .neu-switch__thumb {
  transform: translateX(22px);
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}
</style>
