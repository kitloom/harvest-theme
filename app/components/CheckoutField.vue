<script setup lang="ts">
import type { CheckoutField } from '#shared/types/kitloom'

/**
 * One field of the checkout form as the shop configured it: a text, a country picked from
 * those the shop sells or ships to, a state picked from the country's list or typed where the
 * country has none, with the country's own words for state and postcode.
 */
const props = defineProps<{
  name: string
  field: CheckoutField
  modelValue: string
  country: string
  countries?: Record<string, string>
  states?: Record<string, Record<string, string>>
  statesOptional?: string[]
  labels?: Record<string, { state: string; postcode: string }>
  error?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const isPostcode = computed(() => props.name.endsWith('_postcode'))

const label = computed(() => {
  const own = props.labels?.[props.country]
  if (props.field.type === 'state' && own) return own.state
  if (isPostcode.value && own) return own.postcode
  return props.field.label
})

const stateOptions = computed(() => props.field.type === 'state' ? props.states?.[props.country] ?? null : null)

const required = computed(() => {
  if (props.field.type === 'state') return !!stateOptions.value && !props.statesOptional?.includes(props.country)
  return props.field.required
})

const inputType = computed(() => (['email', 'tel'].includes(props.field.type) ? props.field.type : 'text'))

const update = (event: Event) => emit('update:modelValue', (event.target as HTMLInputElement | HTMLSelectElement).value)
</script>

<template>
  <label class="field" :class="{ wide: field.wide, invalid: error }">
    <span class="label">{{ label }}<sup v-if="required" aria-hidden="true">*</sup></span>

    <select v-if="field.type === 'country'" :value="modelValue" :name="name" :autocomplete="field.autocomplete" :required="required" @change="update">
      <option value="">Select a country…</option>
      <option v-for="(title, code) in countries" :key="code" :value="code">{{ title }}</option>
    </select>

    <select v-else-if="stateOptions" :value="modelValue" :name="name" :autocomplete="field.autocomplete" :required="required" @change="update">
      <option value="">Select an option…</option>
      <option v-for="(title, code) in stateOptions" :key="code" :value="code">{{ title }}</option>
    </select>

    <input v-else :type="inputType" :value="modelValue" :name="name" :autocomplete="field.autocomplete" :required="required" @input="update">

    <small v-if="error" class="error">{{ error }}</small>
  </label>
</template>

<style scoped>
.field { display: flex; flex-direction: column; gap: 0.3rem; }
.field.wide { grid-column: 1 / -1; }
.label { font-size: 0.9rem; color: var(--ink-soft); font-weight: 600; }
sup { color: var(--rust); margin-left: 2px; }
input, select { font: inherit; color: var(--ink); background: var(--bg); border: 1px solid var(--line); border-radius: 10px; padding: 0.65rem 0.8rem; }
input:focus, select:focus { outline: 2px solid var(--pumpkin); outline-offset: 1px; border-color: transparent; }
.invalid input, .invalid select { border-color: var(--wine); }
.error { color: var(--wine); font-size: 0.85rem; }
</style>
