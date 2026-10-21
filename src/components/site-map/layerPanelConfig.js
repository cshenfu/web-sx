// 图层面板配置
// type 含义：
//   'whln'    交给 @whln/layer-control 管的层（id 必须与插件一致）
//   'terrain' 3D 地形 —— 自己处理
//   'custom'  业务自定义覆盖物（测风塔 / 升压塔 / 接入塔 / 道路 / 线路 / 噪音距离等）
//   'project' 项目图标显隐
// disabled: true 表示仅展示、不可点

export const PANEL_GROUPS = [
    {
      label: '底图',
      items: [
        { id: 'tdt-imagery',    name: '天地图影像', icon: 'Compass',     type: 'whln' },
        { id: 'tdt-annotation', name: '天地图注记', icon: 'MapLocation', type: 'whln' },
        { id: 'hd-imagery',     name: '高清影像',   icon: 'Camera',      type: 'whln' },
        { id: 'wind-resource',  name: '风资源图谱', icon: 'WindPower',   type: 'whln' },
        { id: 'solar-resource', name: '光资源图谱', icon: 'Sunny',       type: 'whln' },
        { id: 'road-network',   name: '路网',       icon: 'Guide',       type: 'whln' },
        { id: 'terrain-3d',     name: '3D地形',     icon: 'Grid',        type: 'terrain' },
      ],
    },
    {
      label: '规划元素',
      items: [
        { id: 'measure-tower', name: '测风塔',  icon: 'Odometer',   type: 'custom' },
        { id: 'wind-farm',     name: '风机',    icon: 'Picture',    type: 'project' },
        { id: 'booster',       name: '升压塔',  icon: 'Lightning',  type: 'project' },
        { id: 'access-tower',  name: '接入塔',  icon: 'Connection', type: 'custom' },
        { id: 'road',          name: '道路',    icon: 'Guide',      type: 'custom' },
        { id: 'line',          name: '线路',    icon: 'Share',      type: 'custom' },
        { id: 'noise',         name: '噪音距离', icon: 'Bell',      type: 'custom',
          input: { unit: 'm', default: 700, min: 0, max: 5000, step: 50 } },
      ],
    },
    {
      label: '地物元素',
      items: [
        { id: 'building',    name: '建筑物体',   color: '#1e40af', type: 'whln' },
        { id: 'forest',      name: '林地',       color: '#4ade80', type: 'whln' },
        { id: 'farmland',    name: '耕地',       color: '#14b8a6', type: 'whln' },
        { id: 'water',       name: '水系',       color: '#3b82f6', type: 'whln' },
        { id: 'unavailable', name: '不可用',                      type: 'whln', disabled: true },
        { id: 'reserve',     name: '自然保护区', color: '#a855f7', type: 'whln' },
        { id: 'mining',      name: '矿区',       color: '#eab308', type: 'whln' },
        { id: 'cemetery',    name: '坟地',       color: '#FF00FF', type: 'whln' },
        { id: 'scenic',      name: '景区',       color: '#14B8A6', type: 'whln' },
      ],
    },
  ]

  export const WHLN_LAYER_IDS = PANEL_GROUPS.flatMap(g => g.items)
    .filter(it => it.type === 'whln' && !it.disabled)
    .map(it => it.id)

  export const DEFAULT_VISIBLE = [
    'hd-imagery',
    'wind-farm',
    'booster',
  ]
