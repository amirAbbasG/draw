export const settingsSliders = [
  {
    key: "speed",
    titleKey: "movement_speed",
    value: 10,
    min: 5,
    max: 30,
    step: 1,
  },
  {
    key: "sensitivity",
    titleKey: "mouse_sensitivity",
    value: 0.002,
    min: 0.0005,
    max: 0.01,
    step: 0.0005,
  },
] as const;

export const settingsSwitches = [
  {
    key: "showOcean",
    titleKey: "show_ocean",
  },
  {
    key: "showPerformanceMonitor",
    titleKey: "performance_monitor",
  },
  {
    key: "wireframeMode",
    titleKey: "wireframe_mode",
  },
  {
    key: "axesHelper",
    titleKey: "axes_helper",
  },
] as const;

export const controlModes = [
  { key: "orbit", icon: "hugeicons:orbit-01" },
  {
    key: "first_person",
    icon: "hugeicons:user-03",
  },
] as const;
