/**
 * Globe 光晕自定义图层
 *
 * 用法：
 *   import { GlobeHaloLayer } from '@/utils/globeHaloLayer'
 *   const halo = new GlobeHaloLayer({ maxOpacity: 0.35 })
 *   map.addLayer(halo)            // 或 map.addLayer(halo, beforeLayerId)
 *   map.removeLayer(halo)         // 自动清理 GL 资源
 *
 * 说明：
 *  - 光晕是屏幕空间效果，半径使用 MapLibre globe 内部固定公式：512 * 2^zoom / (2π)
 *  - 不依赖 map.transform._globeRadius，避免不同版本字段缺失导致报错
 *  - 可见区间（zoom <= fadeEnd）内自动锁定 maxPitch=0，保证球心 = 屏幕中心
 */

function smoothstep(e0, e1, x) {
  if (e1 <= e0) return x >= e1 ? 1 : 0
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)))
  return t * t * (3 - 2 * t)
}

export class GlobeHaloLayer {
  constructor(options = {}) {
    this.id = options.id || 'globe-halo'
    this.type = 'custom'
    this.renderingMode = '2d'

    // 视觉参数
    this.innerRatio = options.innerRatio ?? 0.86
    this.outerRatio = options.outerRatio ?? 1.55
    this.innerColor = options.innerColor ?? [140 / 255, 200 / 255, 255 / 255]
    this.outerColor = options.outerColor ?? [40 / 255, 80 / 255, 200 / 255]
    this.maxOpacity = options.maxOpacity ?? 0.35

    // zoom 淡出区间
    this.fadeStart = options.fadeStart ?? 2.8
    this.fadeEnd = options.fadeEnd ?? 3.5

    // 是否自动在光晕可见区间锁定 pitch=0（推荐 true）
    this.guardPitch = options.guardPitch ?? true

    // 内部状态
    this.map = null
    this.gl = null
    this.program = null
    this.buffers = null
    this._pitchHandler = null
  }

  onAdd(map, gl) {
    this.map = map
    this.gl = gl
    this._initBuffers(gl)
    this.program = this._compileProgram(gl)
    if (this.guardPitch) this._bindPitchGuard(map)
  }

  onRemove(map, gl) {
    if (this._pitchHandler && map) {
      map.off('zoom', this._pitchHandler)
      map.off('load', this._pitchHandler)
    }
    this._pitchHandler = null

    if (gl) {
      if (this.program) {
        gl.deleteProgram(this.program)
      }
      if (this.buffers) {
        gl.deleteVertexArray(this.buffers.vao)
        gl.deleteBuffer(this.buffers.vbo)
      }
    }
    this.program = null
    this.buffers = null
    this.map = null
    this.gl = null
  }

  render(gl) {
    if (!this.program || !this.map) return

    const map = this.map
    const canvas = map.getCanvas?.()
    if (!canvas) return

    const cssW = canvas.clientWidth
    const cssH = canvas.clientHeight
    if (!cssW || !cssH) return // 容器隐藏时 clientWidth/Height 为 0

    const zoom = map.getZoom?.() ?? 0
    const fade = 1 - smoothstep(this.fadeStart, this.fadeEnd, zoom)
    if (fade <= 0.001) return

    // 每帧从 clientWidth 重新计算 dpr，防止窗口缩放后错位
    const dpr = canvas.width / cssW

    // 光晕可见区间内 pitch 恒为 0，球心 = 屏幕中心
    const cx = canvas.width / 2
    const cy = canvas.height / 2

    // 半径：MapLibre globe 内部公式（tileSize=512），不依赖 transform
    const radiusCss = (512 * Math.pow(2, zoom)) / (2 * Math.PI)
    const radiusPx = radiusCss * dpr

    gl.useProgram(this.program)
    gl.bindVertexArray(this.buffers.vao)

    const u = (name) => gl.getUniformLocation(this.program, name)
    gl.uniform2f(u('u_center_px'), cx, cy)
    gl.uniform1f(u('u_radius_px'), radiusPx)
    gl.uniform1f(u('u_inner_ratio'), this.innerRatio)
    gl.uniform1f(u('u_outer_ratio'), this.outerRatio)
    gl.uniform3fv(u('u_inner_color'), this.innerColor)
    gl.uniform3fv(u('u_outer_color'), this.outerColor)
    gl.uniform1f(u('u_opacity'), fade * this.maxOpacity)

    // 保存 GL 状态
    const wasBlend = gl.isEnabled(gl.BLEND)
    const wasDepth = gl.isEnabled(gl.DEPTH_TEST)
    const bsR = gl.getParameter(gl.BLEND_SRC_RGB)
    const bdR = gl.getParameter(gl.BLEND_DST_RGB)
    const bsA = gl.getParameter(gl.BLEND_SRC_ALPHA)
    const bdA = gl.getParameter(gl.BLEND_DST_ALPHA)

    gl.enable(gl.BLEND)
    gl.blendFuncSeparate(
      gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA,
      gl.ONE, gl.ONE_MINUS_SRC_ALPHA
    )
    gl.disable(gl.DEPTH_TEST)

    gl.drawArrays(gl.TRIANGLES, 0, 6)

    // 恢复 GL 状态
    gl.bindVertexArray(null)
    if (!wasBlend) gl.disable(gl.BLEND)
    if (wasDepth) gl.enable(gl.DEPTH_TEST)
    gl.blendFuncSeparate(bsR, bdR, bsA, bdA)
  }

  setOptions(partial = {}) {
    Object.assign(this, partial)
    this.map?.triggerRepaint?.()
  }

  // ---------- 内部方法 ----------

  _initBuffers(gl) {
    // 覆盖整个裁剪空间的四边形（两个三角形）
    const positions = new Float32Array([
      -1, -1, 1, -1, 1, 1,
      -1, -1, 1, 1, -1, 1,
    ])
    const vao = gl.createVertexArray()
    gl.bindVertexArray(vao)
    const vbo = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
    gl.bindVertexArray(null)
    this.buffers = { vao, vbo }
  }

  _compileProgram(gl) {
    const vsSource = `#version 300 es
in vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`

    const fsSource = `#version 300 es
precision highp float;
out vec4 fragColor;

uniform vec2  u_center_px;
uniform float u_radius_px;
uniform float u_inner_ratio;
uniform float u_outer_ratio;
uniform vec3  u_inner_color;
uniform vec3  u_outer_color;
uniform float u_opacity;

void main() {
  if (u_opacity <= 0.001) discard;

  float dist  = distance(gl_FragCoord.xy, u_center_px);
  float inner = u_radius_px * u_inner_ratio;
  float outer = u_radius_px * u_outer_ratio;
  float t     = clamp((dist - inner) / (outer - inner), 0.0, 1.0);
  float halo  = (1.0 - t) * (1.0 - t);

  vec3 color = mix(u_inner_color, u_outer_color, t);
  fragColor  = vec4(color, halo * u_opacity);
}`

    const compile = (type, src) => {
      const sh = gl.createShader(type)
      gl.shaderSource(sh, src)
      gl.compileShader(sh)
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.error('[GlobeHaloLayer] shader compile failed:', gl.getShaderInfoLog(sh))
        gl.deleteShader(sh)
        return null
      }
      return sh
    }

    const vs = compile(gl.VERTEX_SHADER, vsSource)
    const fs = compile(gl.FRAGMENT_SHADER, fsSource)
    if (!vs || !fs) return null

    const program = gl.createProgram()
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    gl.deleteShader(vs)
    gl.deleteShader(fs)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('[GlobeHaloLayer] program link failed:', gl.getProgramInfoLog(program))
      gl.deleteProgram(program)
      return null
    }
    return program
  }

  _bindPitchGuard(map) {
    const sync = () => {
      const z = map.getZoom?.() ?? 0
      if (z <= this.fadeEnd) {
        // 光晕可见期间：锁死 pitch=0，保证球心 = 屏幕中心
        if (map.getMaxPitch() !== 0) map.setMaxPitch(0)
        if (map.getPitch() > 0.5) map.easeTo({ pitch: 0, duration: 200 })
      } else {
        // 光晕已完全淡出，恢复可倾斜
        if (map.getMaxPitch() !== 60) map.setMaxPitch(60)
      }
    }
    this._pitchHandler = sync
    map.on('zoom', sync)
    map.on('load', sync)
    sync()
  }
}

export function createGlobeHaloLayer(options) {
  return new GlobeHaloLayer(options)
}

export default GlobeHaloLayer