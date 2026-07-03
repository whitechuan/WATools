<template>
  <div class="neu-select" :class="{ 'neu-select--open': isOpen }" ref="selectRef">
    <div class="neu-select__trigger" @click="toggleDropdown">
      <span class="neu-select__value" :class="{ 'neu-select__placeholder': !selectedLabel }">
        {{ selectedLabel || placeholder }}
      </span>
      <span class="neu-select__arrow" :class="{ 'neu-select__arrow--up': isOpen }">&#9662;</span>
    </div>
    <transition name="slide-up">
      <div v-if="isOpen" class="neu-select__dropdown">
        <div
          v-for="option in options"
          :key="option.value"
          class="neu-select__option"
          :class="{ 'neu-select__option--active': option.value === modelValue }"
          @click="selectOption(option)"
        >
          {{ option.label }}
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

defineOptions({ name: 'NeuSelect' })

export interface SelectOption {
  label: string
  value: string | number
}

const props = withDefaults(defineProps<{
  modelValue?: string | number
  options?: SelectOption[]
  placeholder?: string
}>(), {
  modelValue: '',
  options: () => [],
  placeholder: '请选择',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
  (e: 'change', value: string | number): void
}>()

const isOpen = ref(false)
const selectRef = ref<HTMLElement | null>(null)

const selectedLabel = computed(() => {
  const found = props.options.find(o => o.value === props.modelValue)
  return found?.label || ''
})

function toggleDropdown() {
  isOpen.value = !isOpen.value
}

function selectOption(option: SelectOption) {
  emit('update:modelValue', option.value)
  emit('change', option.value)
  isOpen.value = false
}

function handleClickOutside(event: MouseEvent) {
  if (selectRef.value && !selectRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.neu-select {
  position: relative;
  width: 100%;
}

.neu-select__trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--neu-bg);
  border-radius: var(--neu-radius-sm);
  box-shadow: var(--neu-shadow-raised);
  cursor: pointer;
  transition: box-shadow var(--transition-normal);
  user-select: none;
}

.neu-select--open .neu-select__trigger {
  box-shadow: var(--neu-shadow-pressed);
}

.neu-select__value {
  color: var(--text-primary);
  font-size: var(--font-size-base);
}

.neu-select__placeholder {
  color: var(--text-muted);
}

.neu-select__arrow {
  font-size: 12px;
  color: var(--text-secondary);
  transition: transform var(--transition-fast);
}

.neu-select__arrow--up {
  transform: rotate(180deg);
}

.neu-select__dropdown {
  position: absolute;
  top: calc(100% + var(--spacing-sm));
  left: 0;
  right: 0;
  background: var(--neu-bg);
  border-radius: var(--neu-radius-sm);
  box-shadow: 8px 8px 16px var(--neu-shadow-dark), -8px -8px 16px var(--neu-shadow-light);
  z-index: 100;
  overflow: hidden;
  max-height: 200px;
  overflow-y: auto;
}

.neu-select__option {
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--text-primary);
  font-size: var(--font-size-base);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.neu-select__option:hover {
  background: var(--neu-bg-dark);
}

.neu-select__option--active {
  color: var(--color-primary);
  font-weight: 500;
  background: var(--neu-bg-dark);
}
</style>
