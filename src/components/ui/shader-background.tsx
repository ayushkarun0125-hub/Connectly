import { useEffect, useRef } from 'react'
import { cn } from '@/lib/cn'

const VS_SOURCE = `
  attribute vec4 aVertexPosition;
  void main() {
    gl_Position = aVertexPosition;
  }
`

const FS_SOURCE = `
  precision highp float;
  uniform vec2 iResolution;
  uniform float iTime;

  const float overallSpeed = 0.2;
  const float gridSmoothWidth = 0.015;
  const float axisWidth = 0.05;
  const float majorLineWidth = 0.025;
  const float minorLineWidth = 0.0125;
  const float majorLineFrequency = 5.0;
  const float minorLineFrequency = 1.0;
  const vec4 gridColor = vec4(0.5);
  const float scale = 5.0;
  /* Cyan / electric blue accent — aligned with #38BDF8 / #1D4ED8 */
  const vec4 lineColor = vec4(0.15, 0.55, 0.96, 1.0);
  const float minLineWidth = 0.01;
  const float maxLineWidth = 0.2;
  const float lineSpeed = 1.0 * overallSpeed;
  const float lineAmplitude = 1.0;
  const float lineFrequency = 0.2;
  const float warpSpeed = 0.2 * overallSpeed;
  const float warpFrequency = 0.5;
  const float warpAmplitude = 1.0;
  const float offsetFrequency = 0.5;
  const float offsetSpeed = 1.33 * overallSpeed;
  const float minOffsetSpread = 0.6;
  const float maxOffsetSpread = 2.0;
  const int linesPerGroup = 16;

  #define drawCircle(pos, radius, coord) smoothstep(radius + gridSmoothWidth, radius, length(coord - (pos)))
  #define drawSmoothLine(pos, halfWidth, t) smoothstep(halfWidth, 0.0, abs(pos - (t)))
  #define drawCrispLine(pos, halfWidth, t) smoothstep(halfWidth + gridSmoothWidth, halfWidth, abs(pos - (t)))
  #define drawPeriodicLine(freq, width, t) drawCrispLine(freq / 2.0, width, abs(mod(t, freq) - (freq) / 2.0))

  float drawGridLines(float axis) {
    return drawCrispLine(0.0, axisWidth, axis)
      + drawPeriodicLine(majorLineFrequency, majorLineWidth, axis)
      + drawPeriodicLine(minorLineFrequency, minorLineWidth, axis);
  }

  float drawGrid(vec2 space) {
    return min(1.0, drawGridLines(space.x) + drawGridLines(space.y));
  }

  float random(float t) {
    return (cos(t) + cos(t * 1.3 + 1.3) + cos(t * 1.4 + 1.4)) / 3.0;
  }

  float getPlasmaY(float x, float horizontalFade, float offset) {
    return random(x * lineFrequency + iTime * lineSpeed) * horizontalFade * lineAmplitude + offset;
  }

  void main() {
    vec2 fragCoord = gl_FragCoord.xy;
    vec4 fragColor;
    vec2 uv = fragCoord.xy / iResolution.xy;
    vec2 space = (fragCoord - iResolution.xy / 2.0) / iResolution.x * 2.0 * scale;

    float horizontalFade = 1.0 - (cos(uv.x * 6.28) * 0.5 + 0.5);
    float verticalFade = 1.0 - (cos(uv.y * 6.28) * 0.5 + 0.5);

    space.y += random(space.x * warpFrequency + iTime * warpSpeed) * warpAmplitude * (0.5 + horizontalFade);
    space.x += random(space.y * warpFrequency + iTime * warpSpeed + 2.0) * warpAmplitude * horizontalFade;

    vec4 lines = vec4(0.0);

    for(int l = 0; l < linesPerGroup; l++) {
      float normalizedLineIndex = float(l) / float(linesPerGroup);
      float offsetTime = iTime * offsetSpeed;
      float offsetPosition = float(l) + space.x * offsetFrequency;
      float rand = random(offsetPosition + offsetTime) * 0.5 + 0.5;
      float halfWidth = mix(minLineWidth, maxLineWidth, rand * horizontalFade) / 2.0;
      float offset = random(offsetPosition + offsetTime * (1.0 + normalizedLineIndex)) * mix(minOffsetSpread, maxOffsetSpread, horizontalFade);
      float linePosition = getPlasmaY(space.x, horizontalFade, offset);
      float line = drawSmoothLine(linePosition, halfWidth, space.y) / 2.0 + drawCrispLine(linePosition, halfWidth * 0.15, space.y);

      float circleX = mod(float(l) + iTime * lineSpeed, 25.0) - 12.0;
      vec2 circlePosition = vec2(circleX, getPlasmaY(circleX, horizontalFade, offset));
      float circle = drawCircle(circlePosition, 0.01, space) * 2.0;

      line = line + circle;
      lines += line * lineColor * rand;
    }

    /* Deep navy base — #020617 → #081225 / #0A1A3A */
    vec4 bgColor1 = vec4(0.008, 0.024, 0.090, 1.0);
    vec4 bgColor2 = vec4(0.039, 0.082, 0.180, 1.0);

    fragColor = mix(bgColor1, bgColor2, uv.x);
    fragColor *= verticalFade;
    fragColor.a = 1.0;
    /* Keep motion readable: lines stay atmospheric */
    fragColor += lines * 0.34;

    gl_FragColor = fragColor;
  }
`

function loadShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error: ', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function initShaderProgram(
  gl: WebGLRenderingContext,
  vsSource: string,
  fsSource: string,
): WebGLProgram | null {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource)
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource)
  if (!vertexShader || !fragmentShader) return null

  const shaderProgram = gl.createProgram()
  if (!shaderProgram) return null
  gl.attachShader(shaderProgram, vertexShader)
  gl.attachShader(shaderProgram, fragmentShader)
  gl.linkProgram(shaderProgram)

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error('Shader program link error: ', gl.getProgramInfoLog(shaderProgram))
    gl.deleteProgram(shaderProgram)
    return null
  }

  gl.deleteShader(vertexShader)
  gl.deleteShader(fragmentShader)
  return shaderProgram
}

export type ShaderBackgroundProps = {
  className?: string
}

/** Full-viewport WebGL plasma/grid background. Non-interactive; keep dashboard content in a higher z-index layer. */
export default function ShaderBackground({ className }: ShaderBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl', { alpha: false, antialias: false })
    if (!gl) {
      console.warn('WebGL not supported.')
      return
    }

    const shaderProgram = initShaderProgram(gl, VS_SOURCE, FS_SOURCE)
    if (!shaderProgram) return

    const positionBuffer = gl.createBuffer()
    if (!positionBuffer) {
      gl.deleteProgram(shaderProgram)
      return
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    const positions = [-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0]
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

    const attribVertexPosition = gl.getAttribLocation(shaderProgram, 'aVertexPosition')
    const uniformResolution = gl.getUniformLocation(shaderProgram, 'iResolution')
    const uniformTime = gl.getUniformLocation(shaderProgram, 'iTime')

    const resizeCanvas = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      canvas.width = w
      canvas.height = h
      gl.viewport(0, 0, w, h)
    }

    window.addEventListener('resize', resizeCanvas)
    resizeCanvas()

    let raf = 0
    let startTime = Date.now()
    let cancelled = false

    const render = () => {
      if (cancelled) return
      const currentTime = (Date.now() - startTime) / 1000

      gl.clearColor(2 / 255, 6 / 255, 23 / 255, 1.0)
      gl.clear(gl.COLOR_BUFFER_BIT)

      gl.useProgram(shaderProgram)
      if (uniformResolution) gl.uniform2f(uniformResolution, canvas.width, canvas.height)
      if (uniformTime) gl.uniform1f(uniformTime, currentTime)

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
      gl.vertexAttribPointer(attribVertexPosition, 2, gl.FLOAT, false, 0, 0)
      gl.enableVertexAttribArray(attribVertexPosition)

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      raf = requestAnimationFrame(render)
    }

    raf = requestAnimationFrame(render)

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resizeCanvas)
      gl.deleteBuffer(positionBuffer)
      gl.deleteProgram(shaderProgram)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn(
        'pointer-events-none fixed inset-0 z-0 h-full w-full opacity-[0.42] saturate-[0.95]',
        className,
      )}
    />
  )
}
