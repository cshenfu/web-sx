<!-- components/report-wizard/shared/RadioOptionGroup.vue -->
<template>
    <div class="radio-group" :class="{ inline }">
      <label
        v-for="opt in options"
        :key="opt.value"
        class="radio-option"
        :class="{ checked: modelValue === opt.value }"
      >
        <input
          type="radio"
          :name="name"
          :value="opt.value"
          :checked="modelValue === opt.value"
          @change="$emit('update:modelValue', opt.value)"
        />
        <span class="dot" />
        {{ opt.label }}
      </label>
    </div>
  </template>
  
  <script setup>
  defineProps({
    modelValue: { type: [String, Number], default: null },
    options: { type: Array, required: true }, // [{label, value}]
    name: { type: String, default: () => `radio-${Math.random().toString(36).slice(2)}` },
    inline: { type: Boolean, default: true },
  })
  
  defineEmits(['update:modelValue'])
  </script>
  
  <style scoped>
  .radio-group {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
  }
  
  .radio-group:not(.inline) {
    flex-direction: column;
    gap: 10px;
  }
  
  .radio-option {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    color: #4b5563;
    font-size: 13px;
  }
  
  .radio-option input {
    position: absolute;
    width: 0;
    height: 0;
    opacity: 0;
  }
  
  .dot {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 15px;
    height: 15px;
    border: 1px solid #c7ccd4;
    border-radius: 50%;
    flex-shrink: 0;
  }
  
  .radio-option.checked .dot {
    border-color: #2f8dff;
  }
  
  .radio-option.checked .dot::after {
    content: '';
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #2f8dff;
  }
  
  .radio-option.checked {
    color: #1f2937;
  }
  </style>