// src/views/xxx/paramsConfig.js

// 模块顺序（去掉了“地质”模块，按你原本的14个模块来）
export const MODULES = [
  '通用', '资源', '发电量', '电气一次', '电气二次', '集电线路', 
  '土建升压站', '风机基础', '道路', '土石方平衡', '用地面积', '环保水保', '概算', '财务'
]

// 字段中文名映射
export const LABELS = {
  '${project_name}': '项目名称', '${construct_project_name}': '投资（建设）单位',
  '${design_unit_name}': '设计单位', '${design_qualification_level}': '设计单位资质等级',
  '${project_city_name}': '项目所属市', '${district_site_belongs}': '项目所属县区', 
  '${project_township_name}': '项目所属乡镇', '${project_construction_site}': '项目详细地址',
  // 以下三个回归通用
  '${project_landform_type}': '项目地貌', '${project_field_elevation_range}': '场区海拔高度', '${project_horst_type}': '地垒类型',
  '${windPowerLevel}': '风功率密度等级', '${50_year_maximum_wind_speed}': '50年一遇最大风速', '${wind_farm_type}': '风电场类型',
  '${projectSelectedDeviceInstallCapacity}': '装机容量', '${rated_power}': '风机单机容量', '${total_turbine_count}': '风机台数',
  '${hub_height}': '轮毂高度', '${projectSelectedWakeReductionCoefficient}': '综合折减率',
  '${projectSelectedDeviceYearPower}': '年上网电量', '${projectSelectedDeviceFullLoadHours}': '等效满负荷小时数',
  '${booster_station_construction_type}': '升压站建设类型', '${expanded_booster_station}': '扩建升压站',
  '${booster_station_voltage_level}': '升压站电压等级', '${wire_type}': '升压站接线方式',
  '${current_outgoing_line_circuits}': '升压站本期出线回数', '${substation_future_outgoing_circuits}': '升压站远期出线回数',
  '${planned_main_connection_capacity}': '升压站总规划容量', '${current_main_connection_capacity}': '升压站本期规模',
  '${grid_station_name}': '接入站名称', '${station_voltage_level}': '接入站可接入电压', '${station_capacity_margin}': '接入站可接入容量',
  '${grid_connection_distance}': '接入距离', '${transmission_line_type}': '接入站送出线路方式',
  '${standalone_lightning_rod_count}': '独立避雷针座数', '${standalone_lightning_rod_height}': '独立避雷针高度',
  '${structure_lightning_rod_count}': '构架避雷针座数', '${structure_lightning_rod_height}': '构架避雷针高度',
  '${box_transformer_type}': '箱变类型', '${35kv_booster_model}': '箱变型号', '${box_transformer_voltage}': '箱变电压等级', '${box_transformer_capacity}': '箱变容量',
  '${high_voltage_side_configuration}': '高压侧配置信息', '${low_voltage_side_configuration}': '低压侧配置信息',
  '${gis_arrangement}': 'GIS类型', '${gis_model_information}': 'GIS型号信息', '${gis_quantity}': 'GIS数量', '${gis_unit}': 'GIS单位', '${gis_remarks}': 'GIS备注',
  '${circuit_breaker_model}': '断路器型号', '${disconnector_switch_model}': '隔离开关型号', '${current_transformer_model}': '电流互感器型号', '${voltage_transformer_signal}': '电压互感器信号',
  '${main_transformer_type}': '主变压器类型', '${main_transformer_model}': '主变压器型号', '${main_transformer_rated_capacity}': '主变压器额定容量',
  '${main_transformer_voltage_ratio}': '主变压器电压比', '${connection_group_type}': '接线组别',
  '${main_transformer_num}': '主变本期台数', '${future_main_transformer_count}': '主变远期台数',
  '${grounding_station_transformer_model}': '接地变兼站用变型号', '${grounding_station_transformer_voltage}': '接地变兼站用变电压',
  '${grounding_station_transformer_capacity}': '接地变兼站用变容量', '${grounding_station_transformer_quantity}': '接地变兼站用变数量',
  '${grounding_station_transformer_unit}': '接地变兼站用变单位', '${grounding_station_transformer_resistance}': '接地变兼站用变接地电阻',
  '${grounding_transformer_model}': '接地变型号', '${grounding_transformer_voltage}': '接地变电压', '${grounding_transformer_capacity}': '接地变容量',
  '${grounding_transformer_quantity}': '接地变数量', '${grounding_transformer_unit}': '接地变单位', '${small_resistance_value}': '接地变接地电阻',
  '${box_type_station_with_variable_models}': '备用站用变', '${svg_reactive_compensation_device}': 'SVG无功补偿装置',
  '${configuration_groups_transformer_booster_station}': '直流蓄电池', '${dc_battery_unit_type}': '直流蓄电池单位', '${dc_battery_quantity_value}': '直流蓄电池数量',
  '${ups_power_model_specification}': 'UPS电源配置', '${ups_power_unit_type}': 'UPS电源单位', '${ups_power_quantity_value}': 'UPS电源数量',
  '${communication_power_supply}': '通讯电源设计', '${communication_power_unit_type}': '通讯电源单位', '${communication_power_quantity_value}': '通讯电源数量', '${communication_power_supply_settings}': '通讯电源描述',
  '${circuits_collector_box_loops_desc}': '回路数', '${method_laying_collector_lines}': '敷设方式',
  '${total_line_route_length}': '线路路径总长度', '${new_overhead_line_length}': '新建架空线路长度',
  '${double_circuit_overhead_line_length}': '双回架空线路路径长度', '${single_circuit_overhead_line_length}': '单回架空线路路径长度',
  '${buried_cable_length}': '地埋电缆长度', '${cable_conductor_material}': '电缆电芯材质',
  '${total_land_area_booster_station_site}': '总占地面积', '${area_occupied_within_enclosure_booster_station}': '围墙内占地面积',
  '${wind_turbine_foundation_type}': '风机基础类型', '${turbine_foundation_excavation_volume}': '风机基础开挖量', '${turbine_foundation_backfill_volume}': '风机基础回填量',
  '${turbine_foundation_c15_concrete}': 'C15混凝土', '${turbine_foundation_c20_concrete}': 'C20混凝土',
  '${turbine_foundation_c40_concrete}': 'C40混凝土', '${turbine_foundation_c45_concrete}': 'C45混凝土',
  '${pedestal_column_height}': '台柱高度', '${burial_depth_fan_foundation}': '基础埋深',
  '${upper_pedestal_column_radius}': '上部台柱半径', '${flange_height_value}': '翼缘高度', '${bottom_diameter_fan_foundation}': '底板直径',
  '${length_entrance_road_booster_station}': '进站道路长度', '${entrance_road_subgrade_width}': '进站道路路基宽度', '${entrance_road_surface_width}': '进站道路路面宽度',
  '${new_road_length}': '新建道路长度', '${width_of_subgrade}': '运输道路路基宽度', '${pavement_width}': '运输道路路面宽度',
  '${access_road_length}': '进场道路长度', '${road_reconstruction_length}': '改扩建道路长度', '${maintenance_road_length}': '检修道路长度', '${maintenance_road_surface_width}': '检修道路路面宽度',
  '${external_transportation_conditions}': '场外交通运输条件描述',
  '${total_excavation}': '总开挖量', '${total_backfill}': '总回填量', '${waste_disposal_sites_num}': '弃渣场数量', '${waste_disposal_site_total_land_area}': '弃渣场面积',
  '${investment_amount_environmental_protection}': '环保总投资', '${investment_amount_soil_water_protection}': '水保总投资',
  '${cost_standard}': '费用标准', '${quota_system}': '定额体系', '${price_level}': '价格水平',
  '${period_depreciation}': '折旧年限', '${depreciation_residual}': '残值率', '${insurance_premium_rate}': '保险费率',
  '${land_use_tax}': '土地使用税(参数)', '${other_fee}': '其他费用', '${construction_phase}': '建设期',
  '${working_capital_per_kw}': '流动资金单位千瓦指标', '${working_capital_equity_ratio}': '流动资本金比例', '${working_capital_loan_ratio}': '流动资金贷款比例',
  '${project_funding_ratio}': '建设资本金比例', '${construction_loan_ratio}': '建设资金贷款比例', '${repayment_period}': '偿还年限',
  '${repayment_method}': '还款方式', '${fix_num_person}': '定员人数', '${employee_welfare_ratio}': '职工福利费及其他占比',
  '${grid_feed_in_tariff}': '上网电价', '${long_term_loan_rate}': '长期贷款利率', '${short_term_loan_rate}': '短期贷款利率',
  '${curtailment_rate_single}': '限电率（单一值）', '${curtailment_rate_segmented}': '限电率（分段值）',
  '${annual_grid_energy_curtailment}': '限电后年上网电量', '${curtailment_equivalent_full_load_hours}': '限电等效满负荷小时数', '${land_tax}': '土地使用税(成本表)',
  '${working_capital}': '流动资金', '${installed_capacity}': '装机容量', '${annual_grid_energy}': '年上网电量',
  '${equity_internal_return_rate}': '资本金财务内部收益率(不含送出)', '${equity_after_tax_internal_rate}': '资本金财务内部收益率',
  '${labor_wages_benefits}': '人工工资及福利费', '${insurance_cost}': '保险费', '${other_expenses}': '其他费用',
  '${fixed_asset_original_value}': '原值', '${income_tax}': '所得税',
  '${material_cost}': '材料费', '${repair_cost}': '修理费',
  '${net_electricity_price_excluding_value_added_tax}': '上网电价（不含税）',
  '${net_electricity_price_including_value_added_tax}': '上网电价（含税）',
  '${permanent_land_wind_farms}': '永久征地总面积', '${wind_turbine_foundation_land_area}': '风机基础征地面积', '${box_transformer_foundation_land_area}': '箱变基础征地面积',
  '${booster_station_land_area}': '升压站征地面积', '${entrance_road_land_area}': '进站道路征地面积',
  '${long_term_leasing_wind_farms}': '长期征地总面积', '${maintenance_road_total_land_area}': '检修道路征地总面积', 
  '${entrance_road_total_land_area}': '进站道路征地总面积', '${tower_foundation_total_land_area}': '铁塔基础征地总面积',
  '${temporary_lease_wind_farm_land}': '临时征地总面积', '${construction_lifting_platform_total_land_area}': '施工吊装平台征地总面积',
  '${construction_road_total_land_area}': '施工道路征地总面积', '${buried_cable_total_land_area}': '直埋电缆征地总面积', '${temporary_construction_area}': '临时施工区征地总面积'
}

// 单位映射
export const UNITS = {
  '${project_field_elevation_range}': 'm', '${windPowerLevel}': '级', '${50_year_maximum_wind_speed}': 'm/s', '${wind_farm_type}': '级',
  '${projectSelectedDeviceInstallCapacity}': 'MW', '${rated_power}': 'KW', '${total_turbine_count}': '台',
  '${hub_height}': 'm', '${projectSelectedWakeReductionCoefficient}': '%', '${projectSelectedDeviceYearPower}': 'MWh', '${projectSelectedDeviceFullLoadHours}': 'h',
  '${booster_station_voltage_level}': 'KV', '${current_outgoing_line_circuits}': '回', '${substation_future_outgoing_circuits}': '回',
  '${planned_main_connection_capacity}': 'MW', '${current_main_connection_capacity}': 'MW', '${station_voltage_level}': 'KV', '${station_capacity_margin}': 'MW',
  '${grid_connection_distance}': 'km', '${standalone_lightning_rod_count}': '座', '${standalone_lightning_rod_height}': 'm',
  '${structure_lightning_rod_count}': '座', '${structure_lightning_rod_height}': 'm', '${box_transformer_voltage}': 'KV', '${box_transformer_capacity}': 'KVA',
  '${main_transformer_rated_capacity}': 'KVA', '${main_transformer_num}': '台', '${future_main_transformer_count}': '台',
  '${grounding_station_transformer_voltage}': 'KV', '${grounding_station_transformer_capacity}': 'KVA', '${grounding_station_transformer_quantity}': '台',
  '${grounding_transformer_voltage}': 'KV', '${grounding_transformer_capacity}': 'KVA', '${grounding_transformer_quantity}': '台',
  '${total_line_route_length}': 'km', '${new_overhead_line_length}': 'km',
  '${double_circuit_overhead_line_length}': 'km', '${single_circuit_overhead_line_length}': 'km', '${buried_cable_length}': 'km',
  '${total_land_area_booster_station_site}': '㎡', '${area_occupied_within_enclosure_booster_station}': '㎡',
  '${turbine_foundation_excavation_volume}': 'm³', '${turbine_foundation_backfill_volume}': 'm³',
  '${pedestal_column_height}': 'm', '${burial_depth_fan_foundation}': 'm', '${upper_pedestal_column_radius}': 'm', '${flange_height_value}': 'm', '${bottom_diameter_fan_foundation}': 'm',
  '${length_entrance_road_booster_station}': 'km', '${entrance_road_subgrade_width}': 'm', '${entrance_road_surface_width}': 'm',
  '${new_road_length}': 'km', '${width_of_subgrade}': 'm', '${pavement_width}': 'm', '${access_road_length}': 'km', '${road_reconstruction_length}': 'km', '${maintenance_road_length}': 'km', '${maintenance_road_surface_width}': 'm',
  '${total_excavation}': 'm³', '${total_backfill}': 'm³', '${waste_disposal_sites_num}': '个', '${waste_disposal_site_total_land_area}': '㎡',
  '${investment_amount_environmental_protection}': '万元', '${investment_amount_soil_water_protection}': '万元',
  '${period_depreciation}': '年', '${depreciation_residual}': '%', '${insurance_premium_rate}': '%', '${land_use_tax}': '万元', '${other_fee}': '元/KW',
  '${working_capital_per_kw}': '元/KW', '${working_capital_equity_ratio}': '%', '${working_capital_loan_ratio}': '%', '${project_funding_ratio}': '%', '${construction_loan_ratio}': '%',
  '${repayment_period}': '年', '${fix_num_person}': '人', '${employee_welfare_ratio}': '%', '${grid_feed_in_tariff}': '元/kWh', '${long_term_loan_rate}': '%', '${short_term_loan_rate}': '%',
  '${curtailment_rate_single}': '%', '${annual_grid_energy_curtailment}': 'MWh', '${curtailment_equivalent_full_load_hours}': 'h', '${land_tax}': '万元',
  '${working_capital}': '万元', '${installed_capacity}': 'MW', '${annual_grid_energy}': 'MWh',
  '${equity_internal_return_rate}': '%', '${equity_after_tax_internal_rate}': '%', '${labor_wages_benefits}': '万元', '${insurance_cost}': '万元', '${other_expenses}': '万元', '${fixed_asset_original_value}': '万元', '${income_tax}': '万元',
  '${permanent_land_wind_farms}': '㎡', '${wind_turbine_foundation_land_area}': '㎡', '${box_transformer_foundation_land_area}': '㎡',
  '${booster_station_land_area}': '㎡', '${entrance_road_land_area}': '㎡',
  '${long_term_leasing_wind_farms}': '㎡', '${maintenance_road_total_land_area}': '㎡', 
  '${entrance_road_total_land_area}': '㎡', '${tower_foundation_total_land_area}': '㎡',
  '${temporary_lease_wind_farm_land}': '㎡', '${construction_lifting_platform_total_land_area}': '㎡',
  '${construction_road_total_land_area}': '㎡', '${buried_cable_total_land_area}': '㎡', '${temporary_construction_area}': '㎡'
}

// 核心表单配置
export const MODULE_CONFIG = {
  // 通用模块恢复包含这 3 个地质字段（现在总共 11 个字段，使用 2 列布局）
  '通用': [
    { title: '', cols: 2, fields: [
      '${project_name}', '${construct_project_name}', '${design_unit_name}', '${design_qualification_level}',
      '${project_city_name}', '${district_site_belongs}', '${project_township_name}', '${project_construction_site}',
      '${project_landform_type}', '${project_horst_type}', '${project_field_elevation_range}'
    ]}
  ],
  '资源': [
    { title: '基础参数', cols: 3, fields: ['${windPowerLevel}', '${50_year_maximum_wind_speed}', '${wind_farm_type}'] },
    { title: '', type: 'table', fieldKey: '${windTowerDatumTable}' },
    { title: '空气密度参数', type: 'table', fieldKey: '${hubHeightAirDensityRange}' },
    { title: '湍流强度参数', type: 'turbulence' }
  ],
  '发电量': [
    { title: '基础参数', cols: 3, fields: [
      '${projectSelectedDeviceInstallCapacity}', '${rated_power}', '${total_turbine_count}',
      '${hub_height}', '${projectSelectedWakeReductionCoefficient}', '',
      '${projectSelectedDeviceYearPower}', '${projectSelectedDeviceFullLoadHours}'
    ]},
    { title: '发电量表参数', type: 'table', fieldKey: '${projectWindPowerFarmPowerTableData}' }
  ],
  '电气一次': [
    { title: '升压站参数', cols: 3, fields: [
      '${booster_station_construction_type}', '${expanded_booster_station}', '${booster_station_voltage_level}',
      { key: '${wire_type}', type: 'textarea', span: 2 }, '${current_outgoing_line_circuits}', '${substation_future_outgoing_circuits}',
      '${planned_main_connection_capacity}', ''
    ]},
    { title: '接入站参数', cols: 3, fields: [
      '${grid_station_name}', '${station_voltage_level}', '${station_capacity_margin}',
      '${grid_connection_distance}', '${transmission_line_type}', ''
    ]},
    { title: '避雷针参数', cols: 4, fields: [
      '${standalone_lightning_rod_count}', '${standalone_lightning_rod_height}', '${structure_lightning_rod_count}', '${structure_lightning_rod_height}'
    ]},
    { title: '箱变参数', cols: 4, fields: [
      '${box_transformer_type}', '${35kv_booster_model}', '${box_transformer_voltage}', '${box_transformer_capacity}',
      { key: '${high_voltage_side_configuration}', type: 'textarea', span: 4 },
      { key: '${low_voltage_side_configuration}', type: 'textarea', span: 4 }
    ]},
    { title: 'GIS参数', cols: 3, fields: [
      '${gis_arrangement}', '${gis_model_information}', '${gis_quantity}', '${gis_unit}', '${gis_remarks}',
      { key: '${circuit_breaker_model}', type: 'textarea', span: 3 },
      { key: '${disconnector_switch_model}', type: 'textarea', span: 3 },
      { key: '${current_transformer_model}', type: 'textarea', span: 3 },
      { key: '${voltage_transformer_signal}', type: 'textarea', span: 3 }
    ]},
    { title: '主变压器参数', cols: 3, fields: [
      { key: '${main_transformer_type}', type: 'textarea', span: 2 }, '${main_transformer_model}', 
      '${main_transformer_rated_capacity}', '${main_transformer_voltage_ratio}', '${connection_group_type}',
      '${main_transformer_num}', '${future_main_transformer_count}', ''
    ]},
    { title: '接地变兼站用变参数', cols: 3, fields: [
      '${grounding_station_transformer_model}', '${grounding_station_transformer_voltage}', '${grounding_station_transformer_capacity}',
      '${grounding_station_transformer_quantity}', '${grounding_station_transformer_unit}', '${grounding_station_transformer_resistance}'
    ]},
    { title: '接地变参数', cols: 3, fields: [
      '${grounding_transformer_model}', '${grounding_transformer_voltage}', '${grounding_transformer_capacity}',
      '${grounding_transformer_quantity}', '${grounding_transformer_unit}', '${small_resistance_value}'
    ]},
    { title: '其他参数', cols: 2, fields: [
      '${box_type_station_with_variable_models}', '${svg_reactive_compensation_device}'
    ]}
  ],
  '电气二次': [
    { title: '直流系统', cols: 3, fields: [
      '${configuration_groups_transformer_booster_station}', '${dc_battery_unit_type}', '${dc_battery_quantity_value}'
    ]},
    { title: 'UPS电源', cols: 3, fields: [
      '${ups_power_model_specification}', '${ups_power_unit_type}', '${ups_power_quantity_value}'
    ]},
    { title: '通讯电源', cols: 3, fields: [
      '${communication_power_supply}', '${communication_power_unit_type}', '${communication_power_quantity_value}',
      { key: '${communication_power_supply_settings}', type: 'textarea', span: 3 }
    ]}
  ],
  '集电线路': [
    { title: '', cols: 3, fields: [
      '${box_transformer_voltage}', '${circuits_collector_box_loops_desc}', '${method_laying_collector_lines}',
      '${total_line_route_length}', '', '',
      '${new_overhead_line_length}', '${double_circuit_overhead_line_length}', '${single_circuit_overhead_line_length}',
      '${buried_cable_length}', { key: '${cable_conductor_material}', type: 'textarea', span: 2 }
    ]}
  ],
  '土建升压站': [
    { title: '', cols: 2, fields: ['${total_land_area_booster_station_site}', '${area_occupied_within_enclosure_booster_station}'] }
  ],
  '风机基础': [
    { title: '', cols: 3, fields: [
      '${wind_turbine_foundation_type}', '${turbine_foundation_excavation_volume}', '${turbine_foundation_backfill_volume}',
      { key: '${turbine_foundation_c15_concrete}', disabledIfEmpty: true },
      { key: '${turbine_foundation_c20_concrete}', disabledIfEmpty: true },
      { key: '${turbine_foundation_c40_concrete}', disabledIfEmpty: true },
      { key: '${turbine_foundation_c45_concrete}', disabledIfEmpty: true },
      '${pedestal_column_height}', '${burial_depth_fan_foundation}',
      '${upper_pedestal_column_radius}', '${flange_height_value}', '${bottom_diameter_fan_foundation}'
    ]}
  ],
  '道路': [
    { title: '', cols: 3, fields: [
      '${length_entrance_road_booster_station}', '${entrance_road_subgrade_width}', '${entrance_road_surface_width}',
      '${new_road_length}', '${width_of_subgrade}', '${pavement_width}',
      '${access_road_length}', '${road_reconstruction_length}', '${maintenance_road_length}', '${maintenance_road_surface_width}',
      { key: '${external_transportation_conditions}', type: 'textarea', span: 3 }
    ]}
  ],
  '土石方平衡': [
    { title: '', cols: 3, fields: [
      '${total_excavation}', '${total_backfill}', '${waste_disposal_sites_num}', '${waste_disposal_site_total_land_area}'
    ]},
    { title: '土石方平衡表', type: 'table', fieldKey: '${statistics_earthwork_volume_site_table}' }
  ],
  '用地面积': [
    { title: '永久征地', cols: 3, fields: [
      '${permanent_land_wind_farms}', '${wind_turbine_foundation_land_area}', '${box_transformer_foundation_land_area}',
      '${booster_station_land_area}', '${entrance_road_land_area}'
    ]},
    { title: '长期租地', cols: 3, fields: [
      '${long_term_leasing_wind_farms}', '${maintenance_road_total_land_area}', '${entrance_road_total_land_area}',
      '${tower_foundation_total_land_area}'
    ]},
    { title: '临时征地', cols: 3, fields: [
      '${temporary_lease_wind_farm_land}', '${construction_lifting_platform_total_land_area}',
      '${construction_road_total_land_area}', '${buried_cable_total_land_area}', '${temporary_construction_area}'
    ]},
    { title: '', type: 'table', fieldKey: '${wind_farm_engineering_land_area_table}' }
  ],
  '环保水保': [
    { title: '', cols: 2, fields: ['${investment_amount_environmental_protection}', '${investment_amount_soil_water_protection}'] }
  ],
  '概算': [
    { title: '基础参数', cols: 3, fields: ['${cost_standard}', '${quota_system}', '${price_level}'] },
    { title: '总概算表中参数', type: 'table', fieldKey: '${engineering_estimate_table}' },
    { title: '施工辅助工程概算表', type: 'table', fieldKey: '${construction_auxiliary_table}' },
    { title: '设备及安装工程概算表', type: 'table', fieldKey: '${installation_engineering_budgets_table}' },
    { title: '建筑工程概算表', type: 'table', fieldKey: '${engineering_build_estimate_table}' },
    { title: '其他费用概算表', type: 'table', fieldKey: '${other_cost_estimates_table}' }
  ],
  '财务': [
    { title: '基础参数', cols: 3, fields: [
      '${period_depreciation}', '${depreciation_residual}', '${insurance_premium_rate}',
      '${land_use_tax}', '${other_fee}', '${construction_phase}',
      '${working_capital_per_kw}', '${working_capital_equity_ratio}', '${working_capital_loan_ratio}',
      '${project_funding_ratio}', '${construction_loan_ratio}', '${repayment_period}',
      { key: '${repayment_method}', type: 'textarea' }, '${fix_num_person}', '${employee_welfare_ratio}',
      '${grid_feed_in_tariff}', '${long_term_loan_rate}', '${short_term_loan_rate}'
    ]},
    { title: '限电参数', cols: 3, fields: [
      '${curtailment_rate_single}', { key: '${curtailment_rate_segmented}', span: 2 },
      '${annual_grid_energy_curtailment}', '${curtailment_equivalent_full_load_hours}', '${land_tax}'
    ]},
    { title: '财务指标汇总表参数', cols: 3, fields: [
      '${working_capital}', '${installed_capacity}', '${annual_grid_energy}',
      '${equity_internal_return_rate}', '${equity_after_tax_internal_rate}'
    ]},
    { title: '总成本费用估算表参数', cols: 3, fields: [
      '${labor_wages_benefits}', '${insurance_cost}', '${other_expenses}'
    ]},
    { title: '', type: 'financial', fieldKeys: ['${material_cost}', '${repair_cost}'] },
    { title: '', cols: 3, fields: ['${fixed_asset_original_value}'] },
    { title: '利润与利润分配表参数', cols: 3, fields: ['${income_tax}'] },
    { title: '', type: 'financial', fieldKeys: ['${net_electricity_price_excluding_value_added_tax}', '${net_electricity_price_including_value_added_tax}'] }
  ]
}