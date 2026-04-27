type UniformValue =
  | number
  | boolean
  | number[]
  | number[][]
  | HTMLImageElement
  | HTMLCanvasElement
  | HTMLVideoElement;

export type UniformMap = Record<string, UniformValue>;

const vertexShaderSource = `#version 300 es
precision mediump float;
layout(location = 0) in vec4 a_position;
uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform float u_imageAspectRatio;
uniform float u_originX;
uniform float u_originY;
uniform float u_worldWidth;
uniform float u_worldHeight;
uniform float u_fit;
uniform float u_scale;
uniform float u_rotation;
uniform float u_offsetX;
uniform float u_offsetY;
out vec2 v_objectUV;
out vec2 v_objectBoxSize;
out vec2 v_responsiveUV;
out vec2 v_responsiveBoxGivenSize;
out vec2 v_patternUV;
out vec2 v_patternBoxSize;
out vec2 v_imageUV;
vec3 getBoxSize(float boxRatio, vec2 givenBoxSize) {
  vec2 box = vec2(0.);
  box.x = boxRatio * min(givenBoxSize.x / boxRatio, givenBoxSize.y);
  float noFitBoxWidth = box.x;
  if (u_fit == 1.) { box.x = boxRatio * min(u_resolution.x / boxRatio, u_resolution.y); }
  else if (u_fit == 2.) { box.x = boxRatio * max(u_resolution.x / boxRatio, u_resolution.y); }
  box.y = box.x / boxRatio;
  return vec3(box, noFitBoxWidth);
}
void main() {
  gl_Position = a_position;
  vec2 uv = gl_Position.xy * .5;
  vec2 boxOrigin = vec2(.5 - u_originX, u_originY - .5);
  vec2 givenBoxSize = max(vec2(u_worldWidth, u_worldHeight), vec2(1.)) * u_pixelRatio;
  float r = u_rotation * 3.14159265358979323846 / 180.;
  mat2 graphicRotation = mat2(cos(r), sin(r), -sin(r), cos(r));
  vec2 graphicOffset = vec2(-u_offsetX, u_offsetY);
  vec2 fixedRatioBoxGivenSize = vec2(
    (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
    (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y);
  v_objectBoxSize = getBoxSize(1., fixedRatioBoxGivenSize).xy;
  vec2 objectWorldScale = u_resolution.xy / v_objectBoxSize;
  v_objectUV = uv * objectWorldScale + boxOrigin * (objectWorldScale - 1.) + graphicOffset;
  v_objectUV /= u_scale;
  v_objectUV = graphicRotation * v_objectUV;
  v_responsiveBoxGivenSize = vec2(
    (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
    (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y);
  float responsiveRatio = v_responsiveBoxGivenSize.x / v_responsiveBoxGivenSize.y;
  vec2 responsiveBoxSize = getBoxSize(responsiveRatio, v_responsiveBoxGivenSize).xy;
  vec2 responsiveBoxScale = u_resolution.xy / responsiveBoxSize;
  v_responsiveUV = uv * responsiveBoxScale + boxOrigin * (responsiveBoxScale - 1.) + graphicOffset;
  v_responsiveUV /= u_scale;
  v_responsiveUV.x *= responsiveRatio;
  v_responsiveUV = graphicRotation * v_responsiveUV;
  v_responsiveUV.x /= responsiveRatio;
  vec2 patternBoxGivenSize = vec2(
    (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
    (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y);
  float patternBoxRatio = patternBoxGivenSize.x / patternBoxGivenSize.y;
  vec3 boxSizeData = getBoxSize(patternBoxRatio, patternBoxGivenSize);
  v_patternBoxSize = boxSizeData.xy;
  float patternBoxNoFitBoxWidth = boxSizeData.z;
  vec2 patternBoxScale = u_resolution.xy / v_patternBoxSize;
  v_patternUV = uv + graphicOffset / patternBoxScale + boxOrigin - boxOrigin / patternBoxScale;
  v_patternUV *= u_resolution.xy / u_pixelRatio;
  if (u_fit > 0.) { v_patternUV *= (patternBoxNoFitBoxWidth / v_patternBoxSize.x); }
  v_patternUV /= u_scale;
  v_patternUV = graphicRotation * v_patternUV;
  v_patternUV += boxOrigin / patternBoxScale - boxOrigin;
  v_patternUV *= .01;
  vec2 imageBoxSize;
  if (u_fit == 1.) { imageBoxSize.x = min(u_resolution.x / u_imageAspectRatio, u_resolution.y) * u_imageAspectRatio; }
  else if (u_fit == 2.) { imageBoxSize.x = max(u_resolution.x / u_imageAspectRatio, u_resolution.y) * u_imageAspectRatio; }
  else { imageBoxSize.x = min(10.0, 10.0 / u_imageAspectRatio * u_imageAspectRatio); }
  imageBoxSize.y = imageBoxSize.x / u_imageAspectRatio;
  vec2 imageBoxScale = u_resolution.xy / imageBoxSize;
  v_imageUV = uv * imageBoxScale + boxOrigin * (imageBoxScale - 1.) + graphicOffset;
  v_imageUV /= u_scale;
  v_imageUV.x *= u_imageAspectRatio;
  v_imageUV = graphicRotation * v_imageUV;
  v_imageUV.x /= u_imageAspectRatio;
  v_imageUV += .5;
  v_imageUV.y = 1. - v_imageUV.y;
}`;

const _declarePI = `
#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846
`;
const _rotation2 = `
vec2 rotate(vec2 uv, float th) {
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}
`;
const _hash21 = `
float hash21(vec2 p) {
  p = fract(p * vec2(0.3183099, 0.3678794)) + 0.1;
  p += dot(p, p + 19.19);
  return fract(p.x * p.y);
}
`;
const _simplexNoise = `
vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
    -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
`;

export const flutedGlassFragmentShader = `#version 300 es
precision mediump float;
uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform float u_rotation;
uniform vec4 u_colorBack;
uniform vec4 u_colorShadow;
uniform vec4 u_colorHighlight;
uniform sampler2D u_image;
uniform float u_imageAspectRatio;
uniform float u_size;
uniform float u_shadows;
uniform float u_angle;
uniform float u_stretch;
uniform float u_shape;
uniform float u_distortion;
uniform float u_highlights;
uniform float u_distortionShape;
uniform float u_shift;
uniform float u_blur;
uniform float u_edges;
uniform float u_marginLeft;
uniform float u_marginRight;
uniform float u_marginTop;
uniform float u_marginBottom;
uniform float u_grainMixer;
uniform float u_grainOverlay;
in vec2 v_imageUV;
out vec4 fragColor;
${_declarePI}
${_rotation2}
${_hash21}
float valueNoise(vec2 st) {
  vec2 i = floor(st); vec2 f = fract(st);
  float a = hash21(i); float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0)); float d = hash21(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float getUvFrame(vec2 uv, float softness) {
  float aax = 2. * fwidth(uv.x); float aay = 2. * fwidth(uv.y);
  return smoothstep(0., aax + softness, uv.x) *
         (1. - smoothstep(1. - softness - aax, 1., uv.x)) *
         smoothstep(0., aay + softness, uv.y) *
         (1. - smoothstep(1. - softness - aay, 1., uv.y));
}
const int MAX_RADIUS = 50;
vec4 samplePM(sampler2D tex, vec2 uv) { vec4 c = texture(tex, uv); c.rgb *= c.a; return c; }
vec4 getBlur(sampler2D tex, vec2 uv, vec2 texelSize, vec2 dir, float sigma) {
  if (sigma <= .5) return texture(tex, uv);
  int radius = int(min(float(MAX_RADIUS), ceil(3.0 * sigma)));
  float twoSigma2 = 2.0 * sigma * sigma;
  float gaussianNorm = 1.0 / sqrt(TWO_PI * sigma * sigma);
  vec4 sum = samplePM(tex, uv) * gaussianNorm; float weightSum = gaussianNorm;
  for (int i = 1; i <= MAX_RADIUS; i++) {
    if (i > radius) break;
    float x = float(i); float w = exp(-(x * x) / twoSigma2) * gaussianNorm;
    vec2 offset = dir * texelSize * x;
    sum += (samplePM(tex, uv + offset) + samplePM(tex, uv - offset)) * w;
    weightSum += 2.0 * w;
  }
  vec4 result = sum / weightSum;
  if (result.a > 0.) result.rgb /= result.a;
  return result;
}
vec2 rotateAspect(vec2 p, float a, float aspect) {
  p.x *= aspect; p = rotate(p, a); p.x /= aspect; return p;
}
float smoothFract(float x) {
  float f = fract(x); float w = fwidth(x);
  float edge = abs(f - 0.5) - 0.5;
  return mix(f, 1.0 - f, smoothstep(-w, w, edge));
}
void main() {
  float patternRotation = -u_angle * PI / 180.;
  float patternSize = mix(200., 5., u_size);
  vec2 uv = v_imageUV;
  vec2 uvMask = gl_FragCoord.xy / u_resolution.xy;
  vec2 sw = vec2(.005);
  vec4 margins = vec4(u_marginLeft, u_marginTop, u_marginRight, u_marginBottom);
  float mask =
    smoothstep(margins[0], margins[0] + sw.x, uvMask.x + sw.x) *
    smoothstep(margins[2], margins[2] + sw.x, 1.0 - uvMask.x + sw.x) *
    smoothstep(margins[1], margins[1] + sw.y, uvMask.y + sw.y) *
    smoothstep(margins[3], margins[3] + sw.y, 1.0 - uvMask.y + sw.y);
  float maskOuter =
    smoothstep(margins[0] - sw.x, margins[0], uvMask.x + sw.x) *
    smoothstep(margins[2] - sw.x, margins[2], 1.0 - uvMask.x + sw.x) *
    smoothstep(margins[1] - sw.y, margins[1], uvMask.y + sw.y) *
    smoothstep(margins[3] - sw.y, margins[3], 1.0 - uvMask.y + sw.y);
  float maskStroke = maskOuter - mask;
  float maskInner =
    smoothstep(margins[0] - 2. * sw.x, margins[0], uvMask.x) *
    smoothstep(margins[2] - 2. * sw.x, margins[2], 1.0 - uvMask.x) *
    smoothstep(margins[1] - 2. * sw.y, margins[1], uvMask.y) *
    smoothstep(margins[3] - 2. * sw.y, margins[3], 1.0 - uvMask.y);
  float maskStrokeInner = maskInner - mask;
  vec2 uvImgCentered = uv - .5;
  uv -= .5; uv *= patternSize;
  uv = rotateAspect(uv, patternRotation, u_imageAspectRatio);
  float curve = 0.;
  float patternY = uv.y / u_imageAspectRatio;
  if (u_shape > 5.5)      { vec2 c = uvImgCentered * vec2(u_imageAspectRatio, 1.0); float r = length(c) * patternSize; curve = r - uv.x; }
  else if (u_shape > 4.5) { curve = .5 + .5 * sin(.5 * PI * uv.x) * cos(.5 * PI * patternY); }
  else if (u_shape > 3.5) { curve = 10. * abs(fract(.1 * patternY) - .5); }
  else if (u_shape > 2.5) { curve = 4. * sin(.23 * patternY); }
  else if (u_shape > 1.5) { curve = .5 + .5 * sin(.5 * uv.x) * sin(1.7 * uv.x); }
  vec2 UvToFract = uv + curve;
  vec2 fractOrigUV = fract(uv); vec2 floorOrigUV = floor(uv);
  float x = smoothFract(UvToFract.x);
  float xNonSmooth = fract(UvToFract.x) + .0001;
  float highlightsWidth = 2. * max(.001, fwidth(UvToFract.x)) + 2. * maskStrokeInner;
  float highlights = 1. - smoothstep(0., highlightsWidth, xNonSmooth) * smoothstep(1., 1. - highlightsWidth, xNonSmooth);
  highlights = clamp(highlights * u_highlights, 0., 1.) * mask;
  float shadows = pow(x, 1.3);
  float distortion = 0.; float fadeX = 1.; float frameFade = 0.;
  float aa = max(max(fwidth(xNonSmooth), fwidth(uv.x)), max(fwidth(UvToFract.x), .0001));
  if (u_distortionShape == 1.) {
    distortion = -pow(1.5 * x, 3.) + (.5 - u_shift);
    frameFade = pow(1.5 * x, 3.);
    aa = max(.2, aa) + mix(.2, 0., u_size);
    fadeX = smoothstep(0., aa, xNonSmooth) * smoothstep(1., 1. - aa, xNonSmooth);
    distortion = mix(.5, distortion, fadeX);
  } else if (u_distortionShape == 2.) {
    distortion = 2. * pow(x, 2.) - (.5 + u_shift);
    frameFade = pow(abs(x - .5), 4.);
    aa = max(.2, aa) + mix(.2, 0., u_size);
    fadeX = smoothstep(0., aa, xNonSmooth) * smoothstep(1., 1. - aa, xNonSmooth);
    distortion = mix(.5, distortion, fadeX);
    frameFade = mix(1., frameFade, .5 * fadeX);
  } else if (u_distortionShape == 3.) {
    distortion = pow(2. * (xNonSmooth - .5), 6.) - .25 - u_shift;
    frameFade = 1. - 2. * pow(abs(x - .4), 2.);
    aa = max(.15, aa) + mix(.1, 0., u_size);
    fadeX = smoothstep(0., aa, xNonSmooth) * smoothstep(1., 1. - aa, xNonSmooth);
    frameFade = mix(1., frameFade, fadeX);
  } else if (u_distortionShape == 4.) {
    x = xNonSmooth;
    distortion = sin((x + .25) * TWO_PI);
    shadows = .5 + .5 * asin(distortion) / (.5 * PI);
    distortion = distortion * .5 - u_shift;
    frameFade = .5 + .5 * sin(x * TWO_PI);
  } else if (u_distortionShape == 5.) {
    distortion = (-pow(abs(x), .2) * x + .33 - 3. * u_shift) * .33;
    frameFade = .3 * smoothstep(.0, 1., x);
    shadows = pow(x, 2.5);
    aa = max(.1, aa) + mix(.1, 0., u_size);
    fadeX = smoothstep(0., aa, xNonSmooth) * smoothstep(1., 1. - aa, xNonSmooth);
    distortion *= fadeX;
  }
  vec2 dudx = dFdx(v_imageUV); vec2 dudy = dFdy(v_imageUV);
  vec2 grainUV = v_imageUV - .5;
  grainUV *= (.8 / vec2(length(dudx), length(dudy)));
  grainUV += .5;
  float grain = smoothstep(.4, .7, valueNoise(grainUV)) * u_grainMixer;
  distortion = mix(distortion, 0., grain);
  shadows = clamp(min(shadows + maskStrokeInner, 1.) * mask * pow(u_shadows, 2.), 0., 1.);
  distortion *= 3. * u_distortion;
  frameFade *= u_distortion;
  fractOrigUV.x += distortion;
  floorOrigUV = rotateAspect(floorOrigUV, -patternRotation, u_imageAspectRatio);
  fractOrigUV = rotateAspect(fractOrigUV, -patternRotation, u_imageAspectRatio);
  uv = (floorOrigUV + fractOrigUV) / patternSize + pow(maskStroke, 4.) + vec2(.5);
  uv = mix(v_imageUV, uv, smoothstep(0., .7, mask));
  float blur = mix(0., 50., u_blur) * smoothstep(.5, 1., mask);
  float edgeDistortion = (mix(.0, .04, u_edges) + .06 * frameFade * u_edges) * mask;
  float inBounds = step(0.0, v_imageUV.x) * step(v_imageUV.x, 1.0) * step(0.0, v_imageUV.y) * step(v_imageUV.y, 1.0);
  float frame = max(getUvFrame(uv, edgeDistortion), inBounds);
  float stretch = pow(1. - smoothstep(0., .5, xNonSmooth) * smoothstep(1., .5, xNonSmooth), 2.) * mask;
  stretch *= getUvFrame(uv, .1 + .05 * mask * frameFade);
  uv.y = mix(uv.y, .5, u_stretch * stretch);
  vec4 image = getBlur(u_image, clamp(uv, vec2(0.0), vec2(1.0)), 1. / u_resolution / u_pixelRatio, vec2(0., 1.), blur);
  image.rgb *= image.a;
  vec4 backColor = u_colorBack; backColor.rgb *= backColor.a;
  vec4 highlightColor = u_colorHighlight; highlightColor.rgb *= highlightColor.a;
  vec4 shadowColor = u_colorShadow;
  vec3 color = highlightColor.rgb * highlights;
  float opacity = highlightColor.a * highlights;
  shadows = mix(shadows * shadowColor.a, 0., highlights);
  color = mix(color, shadowColor.rgb * shadowColor.a, .5 * shadows);
  color += .5 * pow(shadows, .5) * shadowColor.rgb;
  opacity += shadows;
  color = clamp(color, vec3(0.), vec3(1.));
  opacity = clamp(opacity, 0., 1.);
  color += image.rgb * (1. - opacity) * frame;
  opacity += image.a * (1. - opacity) * frame;
  color += backColor.rgb * (1. - opacity);
  opacity += backColor.a * (1. - opacity);
  float grainOverlay = mix(valueNoise(rotate(grainUV, 1.) + vec2(3.)), valueNoise(rotate(grainUV, 2.) + vec2(-1.)), .5);
  grainOverlay = pow(grainOverlay, 1.3);
  float grainOverlayV = grainOverlay * 2. - 1.;
  float grainOverlayStrength = pow(u_grainOverlay * abs(grainOverlayV), .8) * mask;
  color = mix(color, vec3(step(0., grainOverlayV)), .35 * grainOverlayStrength);
  opacity = clamp(opacity + .5 * grainOverlayStrength, 0., 1.);
  fragColor = vec4(color, opacity) * image.a * frame;
}`;

export const GlassGridShapes = {
  lines: 1,
  linesIrregular: 2,
  wave: 3,
  zigzag: 4,
  pattern: 5,
  circles: 6,
} as const;

export const waterFragmentShader = `#version 300 es
precision mediump float;
uniform float u_time;
uniform vec4 u_colorBack;
uniform vec4 u_colorHighlight;
uniform sampler2D u_image;
uniform float u_imageAspectRatio;
uniform float u_size;
uniform float u_highlights;
uniform float u_layering;
uniform float u_edges;
uniform float u_caustic;
uniform float u_waves;
in vec2 v_imageUV;
out vec4 fragColor;
${_declarePI}
${_rotation2}
${_simplexNoise}
float getUvFrame(vec2 uv) {
  float aax = 2. * fwidth(uv.x);
  float aay = 2. * fwidth(uv.y);
  float left   = smoothstep(0., aax, uv.x);
  float right  = 1.0 - smoothstep(1. - aax, 1., uv.x);
  float bottom = smoothstep(0., aay, uv.y);
  float top    = 1.0 - smoothstep(1. - aay, 1., uv.y);
  return left * right * bottom * top;
}
mat2 rotate2D(float r) { return mat2(cos(r), sin(r), -sin(r), cos(r)); }
float getCausticNoise(vec2 uv, float t, float scale) {
  vec2 n = vec2(.1);
  vec2 N = vec2(.1);
  mat2 m = rotate2D(.5);
  for (int j = 0; j < 6; j++) {
    uv *= m; n *= m;
    vec2 q = uv * scale + float(j) + n + (.5 + .5 * float(j)) * (mod(float(j), 2.) - 1.) * t;
    n += sin(q);
    N += cos(q) / scale;
    scale *= 1.1;
  }
  return (N.x + N.y + 1.);
}
void main() {
  vec2 imageUV = v_imageUV;
  vec2 patternUV = v_imageUV - .5;
  patternUV = (patternUV * vec2(u_imageAspectRatio, 1.));
  patternUV /= (.01 + .09 * u_size);
  float t = u_time;
  float wavesNoise = snoise((.3 + .1 * sin(t)) * .1 * patternUV + vec2(0., .4 * t));
  float causticNoise = getCausticNoise(patternUV + u_waves * vec2(1., -1.) * wavesNoise, 2. * t, 1.5);
  causticNoise += u_layering * getCausticNoise(patternUV + 2. * u_waves * vec2(1., -1.) * wavesNoise, 1.5 * t, 2.);
  float causticNoiseCentered = causticNoise - 1.0;
  causticNoise = causticNoise * causticNoise;
  float edgesDistortion = smoothstep(0., .1, imageUV.x);
  edgesDistortion *= smoothstep(0., .1, imageUV.y);
  edgesDistortion *= (smoothstep(1., 1.1, imageUV.x) + (1.0 - smoothstep(.8, .95, imageUV.x)));
  edgesDistortion *= (1.0 - smoothstep(.9, 1., imageUV.y));
  edgesDistortion = mix(edgesDistortion, 1., u_edges);
  float causticNoiseDistortion = .02 * causticNoiseCentered * edgesDistortion;
  float wavesDistortion = .1 * u_waves * wavesNoise;
  imageUV += vec2(wavesDistortion, -wavesDistortion);
  imageUV += (u_caustic * causticNoiseDistortion);
  float frame = getUvFrame(imageUV);
  vec4 image = texture(u_image, imageUV);
  vec4 backColor = u_colorBack;
  backColor.rgb *= backColor.a;
  vec3 color = mix(backColor.rgb, image.rgb, image.a * frame);
  float opacity = backColor.a + image.a * frame;
  causticNoise = max(-.2, causticNoise);
  float hightlight = .025 * u_highlights * causticNoise;
  hightlight *= u_colorHighlight.a;
  color = mix(color, u_colorHighlight.rgb, .05 * u_highlights * causticNoise);
  opacity += hightlight;
  color += hightlight * (.5 + .5 * wavesNoise);
  opacity += hightlight * (.5 + .5 * wavesNoise);
  opacity = clamp(opacity, 0., 1.);
  fragColor = vec4(color, opacity) * image.a * frame;
}`;

export const glitchyFragmentShader = `#version 300 es
precision highp float;
uniform sampler2D u_image;
uniform float u_time;
uniform float u_glitchForm;
uniform float u_crtScale;
uniform float u_glow;
uniform float u_vhsDistortion;
uniform float u_vhsWaveStrength;
uniform float u_vhsBandOpacity;
uniform float u_vhsNoiseLevel;
uniform float u_vhsBandHeight;
uniform float u_scanlineScale;
uniform float u_glitchStrength;
uniform float u_glitchAmount;
uniform float u_glitchMode;
in vec2 v_imageUV;
out vec4 fragColor;
float rand(vec2 co) {
  return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}
void main() {
  float inBounds = float(v_imageUV.x >= 0.0 && v_imageUV.x <= 1.0 && v_imageUV.y >= 0.0 && v_imageUV.y <= 1.0);
  vec2 uv = v_imageUV;

  // VHS: stepped tape wobble warp before sampling
  if (u_vhsDistortion > 0.5) {
    float ws = u_vhsWaveStrength;
    // Layer 1: slow wide bands, coarsely quantized
    float s1 = floor(sin(uv.y * 18.0 + u_time * 1.8) * 4.0) / 4.0;
    // Layer 2: faster mid-frequency, more steps
    float s2 = floor(sin(uv.y * 47.0 - u_time * 3.1) * 7.0) / 7.0;
    // Layer 3: high-frequency fine detail
    float s3 = floor(sin(uv.y * 110.0 + u_time * 5.5) * 3.0) / 3.0;
    // Layer 4: low drift — shifts the whole frame slowly
    float s4 = floor(sin(uv.y * 6.0 + u_time * 0.7) * 2.0) / 2.0;
    uv.x += (s1 * 0.018 + s2 * 0.009 + s3 * 0.004 + s4 * 0.012) * ws;
  }

  // Shared timing seeds used by color modes too
  float glitchT = floor(u_time * 6.0);
  float glitchRow = floor(v_imageUV.y * 64.0);
  float glitchSeed = rand(vec2(glitchRow, glitchT));

  bool inGlitch = false;
  bool wrapUV = false;

  if (u_glitchForm < 0.5) {
    // Bands: horizontal row tears, partial width
    float glitchThresh = 1.0 - u_glitchAmount * 0.85;
    if (glitchSeed > glitchThresh) {
      float gStart = rand(vec2(glitchSeed, glitchT + 3.0));
      float gWidth = 0.07 + rand(vec2(glitchSeed, glitchT + 4.0)) * 0.6;
      if (v_imageUV.x >= gStart && v_imageUV.x <= gStart + gWidth) {
        inGlitch = true;
        uv.x += (rand(vec2(glitchSeed, glitchT + 1.0)) * 2.0 - 1.0) * u_glitchStrength * 0.22;
      }
    }
    float fineT = floor(u_time * 18.0);
    float fineSeed = rand(vec2(floor(v_imageUV.y * 256.0) + 33.0, fineT));
    if (fineSeed > (1.0 - u_glitchAmount * 0.5)) {
      float fStart = rand(vec2(fineSeed, fineT + 5.0));
      float fWidth = 0.04 + rand(vec2(fineSeed, fineT + 6.0)) * 0.4;
      if (v_imageUV.x >= fStart && v_imageUV.x <= fStart + fWidth) {
        uv.x += (rand(vec2(fineSeed, fineT + 2.0)) - 0.5) * u_glitchStrength * 0.1;
      }
    }
    float blockT = floor(u_time * 3.0);
    float blockSeed = rand(vec2(floor(v_imageUV.y * 18.0) + floor(v_imageUV.x * 12.0) * 0.31, blockT + 17.0));
    if (blockSeed > 0.94 - u_glitchAmount * 0.12) {
      uv.x += (rand(vec2(blockSeed, 0.5)) - 0.5) * u_glitchStrength * 0.35;
    }
  } else if (u_glitchForm < 1.5) {
    // Wide: thick slabs — few rows, large shift, image wraps (repeats)
    float wideT = floor(u_time * 3.0);
    float wideRow = floor(v_imageUV.y * 10.0);
    float wideSeed = rand(vec2(wideRow, wideT));
    if (wideSeed > (1.0 - u_glitchAmount * 0.75)) {
      inGlitch = true;
      wrapUV = true;
      uv.x += (rand(vec2(wideSeed, 1.1)) * 2.0 - 1.0) * u_glitchStrength * 0.55;
    }
    float fineT2 = floor(u_time * 14.0);
    float fineSeed2 = rand(vec2(floor(v_imageUV.y * 140.0) + 7.0, fineT2));
    if (fineSeed2 > (1.0 - u_glitchAmount * 0.4)) {
      uv.x += (rand(vec2(fineSeed2, 5.5)) * 2.0 - 1.0) * u_glitchStrength * 0.1;
    }
  } else if (u_glitchForm < 2.5) {
    // Mosaic: small independent square blocks displaced in x and y
    float mosaicT = floor(u_time * 10.0);
    float bx = floor(v_imageUV.x * 30.0);
    float by = floor(v_imageUV.y * 30.0);
    float mosaicSeed = rand(vec2(bx * 0.1 + by * 0.371, mosaicT));
    if (mosaicSeed > (1.0 - u_glitchAmount * 0.7)) {
      inGlitch = true;
      uv.x += (rand(vec2(mosaicSeed, 2.2)) * 2.0 - 1.0) * u_glitchStrength * 0.28;
      uv.y += (rand(vec2(mosaicSeed, 3.3)) * 2.0 - 1.0) * u_glitchStrength * 0.18;
    }
    // Fine mosaic layer
    float bx2 = floor(v_imageUV.x * 80.0);
    float by2 = floor(v_imageUV.y * 80.0);
    float fineMosaic = rand(vec2(bx2 * 0.07 + by2 * 0.23, mosaicT + 3.0));
    if (fineMosaic > (1.0 - u_glitchAmount * 0.4)) {
      uv.x += (rand(vec2(fineMosaic, 6.6)) - 0.5) * u_glitchStrength * 0.1;
      uv.y += (rand(vec2(fineMosaic, 7.7)) - 0.5) * u_glitchStrength * 0.06;
    }
  } else {
    // Compress: JPEG-style — bands repeat/fold, heavy horizontal shift
    float compT = floor(u_time * 5.0);
    float compRow = floor(v_imageUV.y * 16.0);
    float compSeed = rand(vec2(compRow, compT + 99.0));
    if (compSeed > (1.0 - u_glitchAmount * 0.7)) {
      inGlitch = true;
      wrapUV = true;
      float period = 0.04 + rand(vec2(compSeed, 7.7)) * 0.14;
      uv.y = floor(v_imageUV.y / period) * period + rand(vec2(compSeed, 8.8)) * period * 0.6;
      uv.x += (rand(vec2(compSeed, 9.9)) * 2.0 - 1.0) * u_glitchStrength * 0.35;
    }
    float cbT = floor(u_time * 7.0);
    float cbx = floor(v_imageUV.x * 14.0);
    float cby = floor(v_imageUV.y * 14.0);
    float cbSeed = rand(vec2(cbx * 0.13 + cby * 0.47, cbT + 5.0));
    if (cbSeed > 0.88 - u_glitchAmount * 0.15) {
      uv.x += (rand(vec2(cbSeed, 4.4)) - 0.5) * u_glitchStrength * 0.18;
    }
  }

  vec2 uvG = wrapUV ? fract(uv) : clamp(uv, 0.0, 1.0);
  vec4 tex = texture(u_image, uvG);
  float a_ch = tex.a;
  vec3 color = tex.rgb;

  // Glitch mode: color effect applied within active bands
  if (inGlitch && u_glitchMode > 0.5) {
    if (u_glitchMode < 1.5) {
      // Invert
      color = 1.0 - color;
    } else if (u_glitchMode < 2.5) {
      // Data Corrupt: inject colored noise
      float n = rand(vec2(v_imageUV.x * 500.0 + glitchT, glitchRow));
      color = vec3(n, rand(vec2(n, 0.77)), rand(vec2(n, 1.33)));
    } else if (u_glitchMode < 3.5) {
      // Smear: sample from vertically shifted position
      float smearOff = rand(vec2(glitchSeed, 9.9)) * u_glitchStrength * 0.2;
      color = texture(u_image, clamp(vec2(uvG.x, uvG.y - smearOff), 0.0, 1.0)).rgb;
    } else if (u_glitchMode < 4.5) {
      // Channel Swap: rotate RGB
      color = color.gbr;
    } else {
      // Bleach: blow out to white
      color = mix(color, vec3(1.0), 0.78);
    }
  }

  if (u_glow > 0.001) {
    float s = 0.004 + u_glow * 0.01;
    vec3 bloom = vec3(0.0);
    vec4 gs;
    gs = texture(u_image, clamp(uvG + vec2( s,  0.0), 0.0, 1.0)); bloom += gs.rgb * gs.a;
    gs = texture(u_image, clamp(uvG + vec2(-s,  0.0), 0.0, 1.0)); bloom += gs.rgb * gs.a;
    gs = texture(u_image, clamp(uvG + vec2( 0.0,  s), 0.0, 1.0)); bloom += gs.rgb * gs.a;
    gs = texture(u_image, clamp(uvG + vec2( 0.0, -s), 0.0, 1.0)); bloom += gs.rgb * gs.a;
    gs = texture(u_image, clamp(uvG + vec2( s,  s), 0.0, 1.0)); bloom += gs.rgb * gs.a;
    gs = texture(u_image, clamp(uvG + vec2(-s,  s), 0.0, 1.0)); bloom += gs.rgb * gs.a;
    gs = texture(u_image, clamp(uvG + vec2( s, -s), 0.0, 1.0)); bloom += gs.rgb * gs.a;
    gs = texture(u_image, clamp(uvG + vec2(-s, -s), 0.0, 1.0)); bloom += gs.rgb * gs.a;
    bloom /= 8.0;
    bloom = max(vec3(0.0), bloom - 0.3) * (1.0 / 0.7);
    color = clamp(color + bloom * u_glow * 2.0, 0.0, 1.0);
  }

  // CRT: RGB phosphor square dots + vignette
  if (u_crtScale > 0.001) {
    float scanFreq = 40.0 + u_scanlineScale * 460.0;
    float spIdx = mod(floor(v_imageUV.x * scanFreq * 3.0), 3.0);
    vec3 rgbMask;
    rgbMask.r = spIdx < 0.5 ? 1.0 : 0.08;
    rgbMask.g = (spIdx >= 0.5 && spIdx < 1.5) ? 1.0 : 0.08;
    rgbMask.b = spIdx >= 1.5 ? 1.0 : 0.08;
    vec2 cellUV = fract(v_imageUV * vec2(scanFreq * 3.0, scanFreq));
    vec2 d = abs(cellUV - 0.5);
    float sq = 1.0 - smoothstep(0.28, 0.42, max(d.x, d.y));
    float shapeDim = sq * 0.8 + 0.2;
    vec3 crtColor = color * rgbMask * 3.0 * shapeDim;
    color = mix(color, crtColor, u_crtScale * 0.7);
    vec2 vigUV = v_imageUV - 0.5;
    float vignette = clamp(1.0 - dot(vigUV, vigUV) * 1.8 * u_crtScale, 0.0, 1.0);
    color *= vignette;
  }

  // VHS: color-space effects
  if (u_vhsDistortion > 0.5) {
    // Black gradient bands — drifting vertically, height controlled
    float bandFreq = 1.0 + u_vhsBandHeight * 19.0;
    float bandPhase = v_imageUV.y * bandFreq - u_time * 1.2;
    float bandGrad = fract(bandPhase);
    bandGrad = smoothstep(0.0, 0.45, bandGrad) * smoothstep(1.0, 0.55, bandGrad);
    color = mix(color, vec3(0.0), bandGrad * u_vhsBandOpacity);
    // Signal distortion: white fringe bursts
    float sigSeed = rand(vec2(floor(v_imageUV.y * 10.0 + u_time * 0.25), 3.3));
    if (sigSeed > 0.55) {
      float caAmt = abs(rand(vec2(sigSeed, 0.7)) - 0.5) * 0.014;
      float fringeR = texture(u_image, clamp(uvG + vec2(caAmt, 0.0), 0.0, 1.0)).r;
      float fringeG = texture(u_image, clamp(uvG + vec2(caAmt * 0.5, 0.0), 0.0, 1.0)).g;
      float fringeB = texture(u_image, clamp(uvG, 0.0, 1.0)).b;
      color = mix(color, vec3(fringeR, fringeG, fringeB), 0.5);
    }
    // Film grain noise
    float grain = rand(vec2(v_imageUV.x * 1000.0 + u_time * 13.7, v_imageUV.y * 800.0 + u_time * 9.3)) * 2.0 - 1.0;
    color = clamp(color + grain * u_vhsNoiseLevel, 0.0, 1.0);
  }

  fragColor = vec4(color * a_ch, a_ch) * inBounds;
}`;

export const DitheringTypes = {
  random: 1,
  '2x2': 2,
  '4x4': 3,
  '8x8': 4,
} as const;

export const imageDitheringFragmentShader = `#version 300 es
precision mediump float;
uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform float u_originX;
uniform float u_originY;
uniform float u_worldWidth;
uniform float u_worldHeight;
uniform float u_fit;
uniform float u_scale;
uniform float u_rotation;
uniform float u_offsetX;
uniform float u_offsetY;
uniform vec4 u_colorShadow;
uniform vec4 u_colorFront;
uniform vec4 u_colorLight;
uniform vec4 u_colorHighlight;
uniform sampler2D u_image;
uniform float u_imageAspectRatio;
uniform float u_type;
uniform float u_pxSize;
uniform bool u_originalColors;
uniform bool u_inverted;
uniform float u_colorSteps;
out vec4 fragColor;
#define PI 3.14159265358979323846
float hash21(vec2 p) {
  p = fract(p * vec2(0.3183099, 0.3678794)) + 0.1;
  p += dot(p, p + 19.19);
  return fract(p.x * p.y);
}
float getUvFrame(vec2 uv, vec2 pad) {
  float aa = 0.0001;
  return smoothstep(-pad.x, -pad.x + aa, uv.x) * smoothstep(1.0 + pad.x, 1.0 + pad.x - aa, uv.x)
       * smoothstep(-pad.y, -pad.y + aa, uv.y) * smoothstep(1.0 + pad.y, 1.0 + pad.y - aa, uv.y);
}
vec2 getImageUV(vec2 uv) {
  vec2 boxOrigin = vec2(.5 - u_originX, u_originY - .5);
  float r = u_rotation * PI / 180.;
  mat2 rot = mat2(cos(r), sin(r), -sin(r), cos(r));
  vec2 graphicOffset = vec2(-u_offsetX, u_offsetY);
  vec2 imageBoxSize;
  if (u_fit == 1.) { imageBoxSize.x = min(u_resolution.x / u_imageAspectRatio, u_resolution.y) * u_imageAspectRatio; }
  else if (u_fit == 2.) { imageBoxSize.x = max(u_resolution.x / u_imageAspectRatio, u_resolution.y) * u_imageAspectRatio; }
  else { imageBoxSize.x = min(10.0, 10.0 / u_imageAspectRatio * u_imageAspectRatio); }
  imageBoxSize.y = imageBoxSize.x / u_imageAspectRatio;
  vec2 imageBoxScale = u_resolution.xy / imageBoxSize;
  vec2 imageUV = uv * imageBoxScale + boxOrigin * (imageBoxScale - 1.) + graphicOffset;
  imageUV /= u_scale;
  imageUV.x *= u_imageAspectRatio;
  imageUV = rot * imageUV;
  imageUV.x /= u_imageAspectRatio;
  imageUV += .5;
  imageUV.y = 1. - imageUV.y;
  return imageUV;
}
const int bayer2x2[4]  = int[4](0,2,3,1);
const int bayer4x4[16] = int[16](0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5);
const int bayer8x8[64] = int[64](
  0,32,8,40,2,34,10,42,48,16,56,24,50,18,58,26,
  12,44,4,36,14,46,6,38,60,28,52,20,62,30,54,22,
  3,35,11,43,1,33,9,41,51,19,59,27,49,17,57,25,
  15,47,7,39,13,45,5,37,63,31,55,23,61,29,53,21);
float getBayerValue(vec2 uv, int size) {
  ivec2 pos = ivec2(fract(uv / float(size)) * float(size));
  int idx = pos.y * size + size;
  idx -= size - pos.x;
  if (size == 2) return float(bayer2x2[idx]) / 4.0;
  else if (size == 4) return float(bayer4x4[idx]) / 16.0;
  else return float(bayer8x8[idx]) / 64.0;
}
void main() {
  float pxSize = u_pxSize * u_pixelRatio;
  vec2 pxSizeUV = gl_FragCoord.xy - .5 * u_resolution;
  pxSizeUV /= pxSize;
  vec2 canvasPixelizedUV = (floor(pxSizeUV) + .5) * pxSize;
  vec2 normalizedUV = canvasPixelizedUV / u_resolution;
  vec2 imageUV = getImageUV(normalizedUV);
  vec4 image = texture(u_image, imageUV);
  if (u_inverted) image.rgb = 1.0 - image.rgb;
  float frame = getUvFrame(imageUV, pxSize / u_resolution);
  float lum = dot(vec3(.2126, .7152, .0722), image.rgb);
  int type = int(floor(u_type));
  float dithering = 0.0;
  if (type == 1) { dithering = step(hash21(canvasPixelizedUV), lum); }
  else if (type == 2) { dithering = getBayerValue(pxSizeUV, 2); }
  else if (type == 3) { dithering = getBayerValue(pxSizeUV, 4); }
  else { dithering = getBayerValue(pxSizeUV, 8); }
  float colorSteps = max(floor(u_colorSteps), 1.);
  dithering -= .5;
  float brightness = clamp(lum + dithering / colorSteps, 0.0, 1.0);
  brightness = mix(0.0, brightness, frame) * image.a;
  float quantLum = floor(brightness * colorSteps + 0.5) / colorSteps;
  quantLum = mix(0.0, quantLum, frame);
  vec3 color = vec3(0.0);
  float opacity = 1.;
  if (u_originalColors) {
    color = (image.rgb / max(lum, 0.001)) * quantLum;
    opacity = mix(quantLum, 1., floor(image.a * colorSteps + 0.5) / colorSteps);
  } else {
    vec4 fgVec;
    if      (quantLum >= 0.75) fgVec = u_colorHighlight;
    else if (quantLum >= 0.50) fgVec = u_colorLight;
    else if (quantLum >= 0.25) fgVec = u_colorFront;
    else                        fgVec = u_colorShadow;
    color   = fgVec.rgb;
    opacity = fgVec.a;
  }
  fragColor = vec4(color, opacity) * image.a * frame;
}`;

export const halftoneFragmentShader = `#version 300 es
precision mediump float;
uniform sampler2D u_image;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_dotScale;
uniform float u_bw;
uniform float u_originalColors;
uniform float u_inverted;
uniform float u_pattern;
uniform float u_contrast;
uniform float u_brightness;
uniform vec4 u_colorBack;
uniform vec4 u_color1;
uniform vec4 u_color2;
uniform vec4 u_color3;
uniform vec4 u_color4;
uniform float u_angle;
uniform float u_blobThreshold;
uniform float u_grainOverlay;
in vec2 v_imageUV;
out vec4 fragColor;
float hash21(vec2 p) {
  p = fract(p * vec2(0.3183099, 0.3678794)) + 0.1;
  p += dot(p, p + 19.19);
  return fract(p.x * p.y);
}
void main() {
  float inBounds = float(v_imageUV.x >= 0.0 && v_imageUV.x <= 1.0 &&
                         v_imageUV.y >= 0.0 && v_imageUV.y <= 1.0);
  int iPattern = int(u_pattern);

  // Derive how many screen pixels span the full image width from the UV derivative.
  // This is automatically correct for any DPR, fit/fill mode, and zoom level,
  // so dots stay anchored to image content regardless of display or canvas size.
  float imageBoxWidth = abs(1.0 / dFdx(v_imageUV.x));
  float cellPx = imageBoxWidth / u_dotScale;
  const float C45 = 0.70711;

  // Grid rotation — rotate fragment coords by u_angle before snapping to grid.
  // cosA/sinA unrotate standard-grid localShape back to screen space for UV sampling.
  // cosT/sinT unrotate the combined (45° + u_angle) space used by print/lines.
  float cosA = cos(u_angle);
  float sinA = sin(u_angle);
  vec2 rotCoord = vec2(cosA * gl_FragCoord.x - sinA * gl_FragCoord.y,
                       sinA * gl_FragCoord.x + cosA * gl_FragCoord.y);
  float cosT = cos(0.7853982 - u_angle);
  float sinT = sin(0.7853982 - u_angle);

  // localPx  — offset from cell center in screen space (used for UV extrapolation)
  // localShape — offset in pattern space (used for the shape test)
  vec2 localPx;
  vec2 localShape;

  if (iPattern == 1) {
    // Print: 45°-rotated grid on top of u_angle rotation
    vec2 rc = vec2( C45 * rotCoord.x + C45 * rotCoord.y,
                   -C45 * rotCoord.x + C45 * rotCoord.y);
    vec2 lr = (fract(rc / cellPx) - 0.5) * cellPx;
    localShape = lr;
    localPx = vec2(cosT * lr.x - sinT * lr.y,
                   sinT * lr.x + cosT * lr.y);
  } else if (iPattern == 2) {
    // Lines: vertical at 0°, horizontal at 90°
    float localRX = (fract(rotCoord.x / cellPx) - 0.5) * cellPx;
    localShape = vec2(0.0, localRX);
    localPx    = vec2(cosA * localRX, -sinA * localRX);
  } else {
    // Dots, Cross, Grunge, Blob: rotated square grid
    localShape = (fract(rotCoord / cellPx) - 0.5) * cellPx;
    localPx    = vec2( cosA * localShape.x + sinA * localShape.y,
                      -sinA * localShape.x + cosA * localShape.y);
  }

  // Sample image at the cell center via screen-pixel → UV conversion
  vec2 cellImageUV = v_imageUV - dFdx(v_imageUV) * localPx.x - dFdy(v_imageUV) * localPx.y;
  bool cellInBounds = cellImageUV.x >= 0.0 && cellImageUV.x <= 1.0 &&
                      cellImageUV.y >= 0.0 && cellImageUV.y <= 1.0;
  vec4 tex = texture(u_image, clamp(cellImageUV, 0.0, 1.0));
  if (u_inverted > 0.5) tex.rgb = 1.0 - tex.rgb;
  tex.rgb = clamp(tex.rgb + u_brightness, 0.0, 1.0);
  tex.rgb = clamp((tex.rgb - 0.5) * u_contrast + 0.5, 0.0, 1.0);
  float a_ch = cellInBounds ? tex.a : 0.0;
  float lum = dot(tex.rgb, vec3(0.299, 0.587, 0.114));

  // Cell index for per-cell randomness (in rotated grid space)
  vec2 cellIdx = floor(rotCoord / cellPx);

  // Area-proportional halftone: ink coverage = 1 - lum.
  // For a circular dot: coverage = π*r²/cell² → r = cell * sqrt(coverage/π) = cell * 0.5642 * sqrt(1-lum).
  // Inversion at lum=0.5 (50% coverage): switch from growing dot to shrinking hole so
  // dark areas stay solid without leaving white corner gaps (corner = 0.707*cell > max r = 0.564*cell).
  // At crossover both radius formulas give the same value for a seamless transition.
  float inkCoverage = 1.0 - lum;
  float insideDot;
  if (iPattern == 0 || iPattern == 1) {
    float dist = length(localShape);
    if (lum >= 0.5) {
      // Light area: small dot growing as image darkens
      float dotR = cellPx * 0.5642 * sqrt(inkCoverage);
      insideDot = step(dist, dotR);
    } else {
      // Dark area: solid field with shrinking hole as image lightens
      float holeR = cellPx * 0.5642 * sqrt(lum);
      insideDot = step(holeR, dist);
    }
  } else if (iPattern == 2) {
    float lineH = cellPx * 0.5 * inkCoverage;
    insideDot = step(abs(localShape.y), lineH);
  } else if (iPattern == 3) {
    float arm = cellPx * 0.35 * inkCoverage;
    insideDot = max(step(abs(localShape.x), arm), step(abs(localShape.y), arm));
  } else if (iPattern == 4) {
    // Blob — metaball dots: nearby dots merge into organic blob shapes.
    vec2 blobCellCenter = (cellIdx + 0.5) * cellPx;
    float metaSum = 0.0;
    float dominantLum = lum;
    float maxContrib = 0.0;
    for (int dx = -2; dx <= 2; dx++) {
      for (int dy = -2; dy <= 2; dy++) {
        vec2 nIdx = cellIdx + vec2(float(dx), float(dy));
        vec2 nCenter = (nIdx + 0.5) * cellPx;
        vec2 nOffset = nCenter - blobCellCenter;
        vec2 nOffsetScreen = vec2( cosA * nOffset.x + sinA * nOffset.y,
                                  -sinA * nOffset.x + cosA * nOffset.y);
        vec2 nUV = clamp(cellImageUV + dFdx(v_imageUV) * nOffsetScreen.x + dFdy(v_imageUV) * nOffsetScreen.y, 0.0, 1.0);
        vec4 nTex = texture(u_image, nUV);
        if (u_inverted > 0.5) nTex.rgb = 1.0 - nTex.rgb;
        nTex.rgb = clamp(nTex.rgb + u_brightness, 0.0, 1.0);
        nTex.rgb = clamp((nTex.rgb - 0.5) * u_contrast + 0.5, 0.0, 1.0);
        float nLum = dot(nTex.rgb, vec3(0.299, 0.587, 0.114));
        float nr = (1.0 - nLum) * cellPx * 0.5642;
        float dist = max(length(rotCoord - nCenter), 0.001);
        float contrib = (nr * nr) / (dist * dist);
        metaSum += contrib;
        if (contrib > maxContrib) {
          maxContrib = contrib;
          dominantLum = nLum;
        }
      }
    }
    insideDot = step(u_blobThreshold, metaSum);
    lum = dominantLum;
  }

  // Color selection
  vec4 bgColor = u_colorBack;
  vec4 dotColor;
  if (u_originalColors > 0.5) {
    dotColor = vec4(tex.rgb, 1.0);
  } else if (u_bw > 0.5) {
    dotColor = u_color1;
  } else {
    if      (lum >= 0.75) dotColor = u_color1;
    else if (lum >= 0.50) dotColor = u_color2;
    else if (lum >= 0.25) dotColor = u_color3;
    else                  dotColor = u_color4;
  }
  // Premultiplied blend
  vec3 color = mix(bgColor.rgb * bgColor.a, dotColor.rgb * dotColor.a, insideDot);
  float opacity = mix(bgColor.a, dotColor.a, insideDot);
  // Grain overlay
  if (u_grainOverlay > 0.001) {
    float grain = hash21(v_imageUV * u_resolution) * 2.0 - 1.0;
    color = clamp(color + grain * u_grainOverlay * 0.3, 0.0, 1.0);
  }
  fragColor = vec4(color * a_ch, opacity * a_ch) * inBounds;
}`;

function createShader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function createProgram(gl: WebGL2RenderingContext, vsSource: string, fsSource: string) {
  const format = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT);
  let vertexSource = vsSource;
  let fragmentSource = fsSource;

  if (format && format.precision < 23) {
    vertexSource = vertexSource.replace(/precision\s+(lowp|mediump)\s+float;/g, 'precision highp float;');
    fragmentSource = fragmentSource
      .replace(/precision\s+(lowp|mediump)\s+float/g, 'precision highp float')
      .replace(/\b(uniform|varying|attribute)\s+(lowp|mediump)\s+(\w+)/g, '$1 highp $3');
  }

  const vs = createShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  if (!vs || !fs) return null;

  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Shader link error: ' + gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    return null;
  }

  gl.detachShader(program, vs);
  gl.detachShader(program, fs);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  return program;
}

function isSafari() {
  const userAgent = navigator.userAgent.toLowerCase();
  return userAgent.includes('safari') && !userAgent.includes('chrome') && !userAgent.includes('android');
}

function bestGuessBrowserZoom(doc: Document) {
  const viewportWidth =
    (window.visualViewport?.width ?? window.innerWidth) * (window.visualViewport?.scale ?? 1) +
    (window.innerWidth - doc.documentElement.clientWidth);
  const ratio = outerWidth / viewportWidth;
  const rounded = Math.round(100 * ratio);
  if (rounded % 5 === 0) return rounded / 100;
  if (rounded === 33) return 1 / 3;
  if (rounded === 67) return 2 / 3;
  if (rounded === 133) return 4 / 3;
  return ratio;
}

const DEFAULT_MAX_PX = 1920 * 1080 * 4;

const defaultShaderStyle = `@layer paper-shaders {
  :where([data-paper-shader]) { isolation: isolate; position: relative; }
  :where([data-paper-shader]) canvas {
    contain: strict; display: block; position: absolute; inset: 0;
    z-index: -1; width: 100%; height: 100%; border-radius: inherit;
  }
}`;

export const symbolEdgesFragmentShader = `#version 300 es
precision mediump float;
uniform sampler2D u_image;
uniform sampler2D u_fontAtlas;
uniform float u_cellSize;
uniform float u_numSymbols;
uniform float u_threshold;
uniform vec4 u_symbolColor;
uniform vec4 u_bgColor;
uniform float u_mode;
uniform vec3 u_targetColor;
uniform float u_invert;
uniform float u_hideImage;
uniform float u_seGlow;
in vec2 v_imageUV;
out vec4 fragColor;

float lum(vec4 c) { return dot(c.rgb, vec3(0.299, 0.587, 0.114)); }

float hash21(vec2 p) {
  p = fract(p * vec2(0.3183099, 0.3678794)) + 0.1;
  p += dot(p, p + 19.19);
  return fract(p.x * p.y);
}

void main() {
  bool outOfBounds = v_imageUV.x < 0.0 || v_imageUV.x > 1.0 ||
                     v_imageUV.y < 0.0 || v_imageUV.y > 1.0;
  vec2 uv = clamp(v_imageUV, 0.001, 0.999);
  vec4 imgColor = texture(u_image, uv);

  vec2 cell = floor(gl_FragCoord.xy / u_cellSize);
  vec2 localUV = fract(gl_FragCoord.xy / u_cellSize);

  // Image UV at cell center
  vec2 cellCenter = (cell + 0.5) * u_cellSize;
  vec2 dxUV = dFdx(v_imageUV);
  vec2 dyUV = dFdy(v_imageUV);
  vec2 cUV = clamp(uv + dxUV*(cellCenter.x - gl_FragCoord.x) + dyUV*(cellCenter.y - gl_FragCoord.y), 0.001, 0.999);

  // Sobel using screen-space derivatives — works regardless of image resolution.
  // Scale by 3 display pixels so edges span enough distance to register.
  vec2 sx = dxUV * 3.0;
  vec2 sy = dyUV * 3.0;
  float s00 = lum(texture(u_image, clamp(cUV - sx - sy, 0.001, 0.999)));
  float s10 = lum(texture(u_image, clamp(cUV      - sy, 0.001, 0.999)));
  float s20 = lum(texture(u_image, clamp(cUV + sx - sy, 0.001, 0.999)));
  float s01 = lum(texture(u_image, clamp(cUV - sx     , 0.001, 0.999)));
  float s21 = lum(texture(u_image, clamp(cUV + sx     , 0.001, 0.999)));
  float s02 = lum(texture(u_image, clamp(cUV - sx + sy, 0.001, 0.999)));
  float s12 = lum(texture(u_image, clamp(cUV      + sy, 0.001, 0.999)));
  float s22 = lum(texture(u_image, clamp(cUV + sx + sy, 0.001, 0.999)));

  float cellOn = 0.0;
  if (u_mode < 0.5) {
    // Edges mode
    float gx = -s00 - 2.0*s01 - s02 + s20 + 2.0*s21 + s22;
    float gy = -s00 - 2.0*s10 - s20 + s02 + 2.0*s12 + s22;
    float edge = clamp(length(vec2(gx,gy)) / 4.0, 0.0, 1.0);
    float prob = smoothstep(1.0-u_threshold-0.15, 1.0-u_threshold+0.15, edge);
    cellOn = step(hash21(cell), prob);
  } else {
    // Color mode — match selected color/shade only
    vec3 pixelColor = texture(u_image, cUV).rgb;
    float dist = length(pixelColor - u_targetColor) / 1.732;
    float prob = 1.0 - smoothstep(u_threshold * 0.4, u_threshold * 0.6, dist);
    cellOn = step(hash21(cell), prob);
  }
  if (u_invert > 0.5) cellOn = 1.0 - cellOn;

  // Sample glyph from font atlas (white text on black, any Unicode)
  // Flip X and Y: canvas coords (origin top-left) vs gl_FragCoord (origin bottom-left)
  float charIdx = floor(mod(hash21(cell + vec2(13.7, 47.3)) * u_numSymbols, u_numSymbols));
  vec2 atlasUV = vec2((charIdx + localUV.x) / u_numSymbols, 1.0 - localUV.y);
  float glyph = texture(u_fontAtlas, atlasUV).r;

  bool hiding = u_hideImage > 0.5;
  vec4 base = hiding ? vec4(0.0) : imgColor;

  if (outOfBounds) {
    fragColor = hiding ? vec4(0.0) : u_bgColor;
  } else if (cellOn < 0.5) {
    fragColor = base;
  } else {
    fragColor = mix(base, u_symbolColor, glyph);
  }

  if (u_seGlow > 0.001 && !outOfBounds) {
    // Tight Gaussian halo — sigma stays small so glow hugs each symbol
    float sigma = u_cellSize * (0.15 + u_seGlow * 0.25);
    float glowAmt = 0.0;
    for (int di = -1; di <= 1; di++) {
      for (int dj = -1; dj <= 1; dj++) {
        vec2 nCell = cell + vec2(float(di), float(dj));
        vec2 nCenter = (nCell + 0.5) * u_cellSize;
        vec2 ncUV = clamp(uv + dxUV*(nCenter.x - gl_FragCoord.x) + dyUV*(nCenter.y - gl_FragCoord.y), 0.001, 0.999);
        float nCellOn;
        if (u_mode < 0.5) {
          float gxN = lum(texture(u_image, clamp(ncUV + sx, 0.001, 0.999)))
                    - lum(texture(u_image, clamp(ncUV - sx, 0.001, 0.999)));
          float gyN = lum(texture(u_image, clamp(ncUV + sy, 0.001, 0.999)))
                    - lum(texture(u_image, clamp(ncUV - sy, 0.001, 0.999)));
          float edgeN = clamp(length(vec2(gxN, gyN)) / 2.0, 0.0, 1.0);
          float probN = smoothstep(1.0-u_threshold-0.15, 1.0-u_threshold+0.15, edgeN);
          nCellOn = step(hash21(nCell), probN);
        } else {
          vec3 nColor = texture(u_image, ncUV).rgb;
          float nDist = length(nColor - u_targetColor) / 1.732;
          float probN = 1.0 - smoothstep(u_threshold * 0.4, u_threshold * 0.6, nDist);
          nCellOn = step(hash21(nCell), probN);
        }
        if (u_invert > 0.5) nCellOn = 1.0 - nCellOn;
        float d = length(gl_FragCoord.xy - nCenter);
        glowAmt = max(glowAmt, nCellOn * exp(-d * d / (2.0 * sigma * sigma)));
      }
    }
    vec3 glowCol = u_symbolColor.rgb * glowAmt * u_seGlow * 0.5;
    fragColor = vec4(clamp(fragColor.rgb + glowCol, 0.0, 1.0), fragColor.a);
  }
}`;

export const paperFragmentShader = `#version 300 es
precision mediump float;
uniform sampler2D u_image;
uniform sampler2D u_scanTexture;
uniform vec2 u_resolution;
uniform float u_noiseStrength;
uniform float u_diffuse;
uniform float u_paperNoise;
uniform float u_inkBleed;
uniform float u_angle;
uniform bool u_xerox;
uniform float u_xeroxAmount;
uniform float u_xeroxOpacity;
uniform float u_xeroxThreshold;
uniform float u_hasScan;
uniform float u_scanOpacity;
uniform float u_scanScale;
in vec2 v_imageUV;
out vec4 fragColor;
${_hash21}
float valueNoise(vec2 st) {
  vec2 i = floor(st); vec2 f = fract(st);
  float a = hash21(i); float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0)); float d = hash21(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
void main() {
  float inBounds = float(v_imageUV.x >= 0.0 && v_imageUV.x <= 1.0 &&
                         v_imageUV.y >= 0.0 && v_imageUV.y <= 1.0);
  vec2 uv = clamp(v_imageUV, 0.0, 1.0);

  // Diffuse: scatter image pixels by noise-based UV displacement (like Affinity Live Diffuse).
  // Each pixel samples a randomly offset position in the source image, breaking up edges.
  if (u_diffuse > 0.001) {
    vec2 pixelUV = gl_FragCoord.xy;
    float nx = valueNoise(pixelUV * 0.24) - 0.5;
    float ny = valueNoise(pixelUV * 0.24 + vec2(17.3, 5.7)) - 0.5;
    vec2 pixelSize = vec2(length(dFdx(uv)), length(dFdy(uv)));
    uv = clamp(uv + vec2(nx, ny) * pixelSize * u_diffuse * 7.5, 0.0, 1.0);
  }

  vec4 img = texture(u_image, uv);
  float alpha = img.a;
  vec3 color = img.rgb;

  // Rotation for noise and scan textures
  float cosA = cos(u_angle);
  float sinA = sin(u_angle);
  vec2 screenCenter = u_resolution * 0.5;
  vec2 rotated = gl_FragCoord.xy - screenCenter;
  rotated = vec2(rotated.x * cosA - rotated.y * sinA, rotated.x * sinA + rotated.y * cosA);
  vec2 pUV = rotated + screenCenter;

  // Ink bleed: morphological dilation — dark regions expand outward with sharp edges.
  // Noise-perturbed sampling creates organic irregular bleed boundary.
  if (u_inkBleed > 0.001) {
    vec2 dx = dFdx(v_imageUV);
    vec2 dy = dFdy(v_imageUV);
    float radius = u_inkBleed * 6.0;
    vec3 darkest = color;
    float darkestLum = dot(color, vec3(0.299, 0.587, 0.114));
    for (int ix = -3; ix <= 3; ix++) {
      for (int iy = -3; iy <= 3; iy++) {
        if (length(vec2(float(ix), float(iy))) > 3.2) continue;
        float noisePert = valueNoise(gl_FragCoord.xy * 0.8 + vec2(float(ix) * 4.1, float(iy) * 3.7)) * 0.4 + 0.8;
        vec2 sampleUV = clamp(uv + dx * float(ix) * radius * noisePert + dy * float(iy) * radius * noisePert, 0.0, 1.0);
        vec3 s = texture(u_image, sampleUV).rgb;
        float lum = dot(s, vec3(0.299, 0.587, 0.114));
        if (lum < darkestLum) { darkest = s; darkestLum = lum; }
      }
    }
    color = darkest;
  }

  // Film grain (Lightroom-style): per-pixel hash for crisp specks + slight
  // value noise clumping to mimic silver halide crystal aggregation.
  float g1 = hash21(pUV);
  float g2 = valueNoise(pUV * 3.5 + vec2(7.3, 13.1));
  float grain = (g1 * 0.65 + g2 * 0.35) - 0.5;
  color = clamp(color + vec3(grain) * u_noiseStrength * 0.45, 0.0, 1.0);

  // Paper texture: multi-octave value noise, soft-overlay blend
  if (u_paperNoise > 0.001) {
    float f1 = valueNoise(pUV * 0.028);
    float f2 = valueNoise(pUV * 0.18 + vec2(7.3, 13.1));
    float f3 = valueNoise(pUV * 0.44 + vec2(3.1, 27.5));
    float f4 = valueNoise(pUV * 0.96 + vec2(19.7, 5.9));
    float f5 = valueNoise(pUV * 2.08 + vec2(41.3, 11.7));
    float paperTex = f1 * 0.10 + f2 * 0.25 + f3 * 0.31 + f4 * 0.21 + f5 * 0.13 - 0.5;
    vec3 overlay = vec3(0.5 + paperTex);
    vec3 overlayBlend = mix(
      2.0 * color * overlay,
      1.0 - 2.0 * (1.0 - color) * (1.0 - overlay),
      step(0.5, overlay)
    );
    color = mix(color, clamp(overlayBlend, 0.0, 1.0), u_paperNoise * 0.5);
  }
  // Subtle warm tint
  color = mix(color, color * vec3(1.02, 1.0, 0.965), u_noiseStrength * 0.25);

  // Xerox effect: hard threshold with noisy edges and dropout
  if (u_xerox) {
    float lum = dot(color, vec3(0.299, 0.587, 0.114));
    float edgeNoise = (valueNoise(pUV * 0.22 + vec2(37.3, 12.7)) * 0.13
                    + valueNoise(pUV * 0.64 + vec2(5.1, 28.9)) * 0.06) * u_xeroxAmount;
    float dropout = valueNoise(pUV * 0.52 + vec2(41.7, 66.3));
    float dropAmt = step(0.87, dropout) * max(0.0, 0.7 - lum) * 0.55 * u_xeroxAmount;
    float adjusted = lum + edgeNoise + dropAmt;
    float bw = step(u_xeroxThreshold, adjusted);
    vec3 xeroxColor = mix(vec3(0.04, 0.03, 0.02), vec3(0.97, 0.97, 0.93), bw);
    color = mix(color, xeroxColor, u_xeroxOpacity);
  }

  // Scan texture overlay — screen blend lightens the image, rotated and scaled
  if (u_hasScan > 0.5 && u_scanOpacity > 0.001) {
    vec2 scanUV = (gl_FragCoord.xy - screenCenter) / u_resolution;
    scanUV = vec2(scanUV.x * cosA - scanUV.y * sinA, scanUV.x * sinA + scanUV.y * cosA);
    scanUV = scanUV / u_scanScale + 0.5;
    vec3 scan = texture(u_scanTexture, scanUV).rgb;
    vec3 screened = 1.0 - (1.0 - color) * (1.0 - scan);
    color = mix(color, screened, u_scanOpacity * 0.6);
  }

  fragColor = vec4(color * alpha, alpha) * inBounds;
}`;

export const heatmapFragmentShader = `#version 300 es
precision mediump float;
uniform sampler2D u_image;
uniform float u_imageAspectRatio;
uniform float u_fit;
uniform float u_scale;
uniform float u_rotation;
uniform float u_offsetX;
uniform float u_offsetY;
uniform float u_originX;
uniform float u_originY;
uniform float u_worldWidth;
uniform float u_worldHeight;
uniform float u_palette;
uniform float u_intensity;
uniform float u_blend;
uniform float u_grain;
uniform float u_blur;
uniform float u_customGradient;
uniform float u_customStopCount;
uniform vec4 u_customStops[8];
in vec2 v_imageUV;
out vec4 fragColor;

float hmHash(vec2 p) {
  p = fract(p * vec2(0.3183099, 0.3678794)) + 0.1;
  p += dot(p, p + 19.19);
  return fract(p.x * p.y);
}

vec3 customPaletteColor(float t) {
  t = clamp(t, 0.0, 1.0);
  int count = int(u_customStopCount);
  if (count <= 0) return vec3(0.0);
  if (count == 1) return u_customStops[0].rgb;
  vec3 lastColor = u_customStops[0].rgb;
  for (int i = 1; i < 8; i++) {
    if (i >= count) break;
    float p0 = u_customStops[i - 1].a;
    float p1 = u_customStops[i].a;
    if (t <= p1) {
      float localT = (p1 > p0) ? (t - p0) / (p1 - p0) : 0.0;
      return mix(u_customStops[i - 1].rgb, u_customStops[i].rgb, clamp(localT, 0.0, 1.0));
    }
    lastColor = u_customStops[i].rgb;
  }
  return lastColor;
}

vec3 paletteColor(float t) {
  t = clamp(t, 0.0, 1.0);
  if (u_customGradient > 0.5) return customPaletteColor(t);
  if (u_palette < 0.5) {
    if (t < 0.2) return mix(vec3(0.0, 0.0, 0.0), vec3(0.0, 0.0, 1.0), t / 0.2);
    if (t < 0.4) return mix(vec3(0.0, 0.0, 1.0), vec3(0.0, 1.0, 1.0), (t - 0.2) / 0.2);
    if (t < 0.6) return mix(vec3(0.0, 1.0, 1.0), vec3(1.0, 1.0, 0.0), (t - 0.4) / 0.2);
    if (t < 0.8) return mix(vec3(1.0, 1.0, 0.0), vec3(1.0, 0.0, 0.0), (t - 0.6) / 0.2);
    return mix(vec3(1.0, 0.0, 0.0), vec3(1.0, 1.0, 1.0), (t - 0.8) / 0.2);
  }
  if (u_palette < 1.5) {
    if (t < 0.33) return mix(vec3(0.0, 0.0, 0.0), vec3(0.35, 0.0, 0.65), t / 0.33);
    if (t < 0.66) return mix(vec3(0.35, 0.0, 0.65), vec3(0.9, 0.35, 0.0), (t - 0.33) / 0.33);
    return mix(vec3(0.9, 0.35, 0.0), vec3(0.98, 0.95, 0.2), (t - 0.66) / 0.34);
  }
  if (u_palette < 2.5) {
    if (t < 0.5) return mix(vec3(0.0, 0.0, 0.15), vec3(0.0, 0.3, 0.9), t / 0.5);
    if (t < 0.75) return mix(vec3(0.0, 0.3, 0.9), vec3(0.0, 0.8, 1.0), (t - 0.5) / 0.25);
    return mix(vec3(0.0, 0.8, 1.0), vec3(0.8, 1.0, 1.0), (t - 0.75) / 0.25);
  }
  if (u_palette < 3.5) {
    if (t < 0.5) return mix(vec3(0.05, 0.0, 0.1), vec3(0.0, 0.7, 0.1), t / 0.5);
    return mix(vec3(0.0, 0.7, 0.1), vec3(0.7, 1.0, 0.0), (t - 0.5) / 0.5);
  }
  if (t < 0.33) return mix(vec3(0.051, 0.0, 0.125), vec3(0.612, 0.106, 0.353), t / 0.33);
  if (t < 0.66) return mix(vec3(0.612, 0.106, 0.353), vec3(0.941, 0.384, 0.165), (t - 0.33) / 0.33);
  return mix(vec3(0.941, 0.384, 0.165), vec3(0.988, 0.898, 0.639), (t - 0.66) / 0.34);
}

void main() {
  vec2 uv = v_imageUV;
  float inBounds = step(0.0, uv.x) * step(uv.x, 1.0) * step(0.0, uv.y) * step(uv.y, 1.0);
  if (inBounds < 0.5) { fragColor = vec4(0.0); return; }

  vec4 tex;
  if (u_blur > 0.001) {
    // 17×17 separable-style Gaussian — 289 taps.
    // Step adapts so samples never exceed ~2.5 px apart → no visible grid.
    float r = u_blur * 20.0;
    float stepPx = max(1.0, r / 8.0);
    vec2 texelSize = 1.0 / vec2(textureSize(u_image, 0));
    float sigma2 = 2.0 * (r * 0.5) * (r * 0.5); // 2σ², σ = r/2
    vec4 blurred = vec4(0.0);
    float wTotal = 0.0;
    for (int xi = -8; xi <= 8; xi++) {
      for (int yi = -8; yi <= 8; yi++) {
        float dpx2 = float(xi * xi + yi * yi) * stepPx * stepPx;
        float w = exp(-dpx2 / sigma2);
        blurred += texture(u_image, uv + vec2(float(xi), float(yi)) * stepPx * texelSize) * w;
        wTotal += w;
      }
    }
    tex = blurred / wTotal;
  } else {
    tex = texture(u_image, uv);
  }
  if (tex.a < 0.01) { fragColor = vec4(0.0); return; }

  float lum = dot(tex.rgb, vec3(0.299, 0.587, 0.114));
  lum = clamp((lum - 0.5) * u_intensity + 0.5, 0.0, 1.0);

  vec3 heatColor = paletteColor(lum);
  vec3 finalColor = mix(tex.rgb, heatColor, u_blend);

  if (u_grain > 0.0) {
    vec2 grainUV = gl_FragCoord.xy;
    float noise = hmHash(grainUV) * 2.0 - 1.0;
    finalColor += noise * u_grain * 0.25;
  }

  fragColor = vec4(clamp(finalColor, 0.0, 1.0), tex.a);
}`;

export class ShaderMount {
  parentElement: HTMLElement;
  canvasElement: HTMLCanvasElement;
  gl: WebGL2RenderingContext;
  program: WebGLProgram | null = null;
  uniformLocations: Record<string, WebGLUniformLocation | null> = {};
  fragmentShader: string;
  rafId: number | null = null;
  lastRenderTime = 0;
  currentFrame = 0;
  speed = 0;
  currentSpeed = 0;
  providedUniforms: UniformMap;
  mipmaps: unknown[] = [];
  hasBeenDisposed = false;
  resolutionChanged = true;
  textures = new Map<string, WebGLTexture>();
  textureUnitMap = new Map<string, number>();
  videoElements = new Map<string, HTMLVideoElement>();
  canvasElements = new Map<string, HTMLCanvasElement>();
  minPixelRatio: number;
  maxPixelCount: number;
  uniformCache: Record<string, unknown> = {};
  isSafariFlag = isSafari();
  ownerDocument: Document;
  renderScale = 1;
  parentWidth = 0;
  parentHeight = 0;
  parentDevicePixelWidth = 0;
  parentDevicePixelHeight = 0;
  devicePixelsSupported = false;
  resizeObserver: ResizeObserver | null = null;

  constructor(
    parentElement: HTMLElement,
    fragmentShader: string,
    uniforms: UniformMap,
    webGlContextAttributes?: WebGLContextAttributes,
    speed = 0,
    frame = 0,
    minPixelRatio = 2,
    maxPixelCount = DEFAULT_MAX_PX,
  ) {
    if (parentElement.nodeType !== 1) {
      throw new Error('Paper Shaders: parent must be HTMLElement');
    }

    this.parentElement = parentElement;
    this.ownerDocument = parentElement.ownerDocument;
    this.canvasElement = this.ownerDocument.createElement('canvas');
    this.fragmentShader = fragmentShader;
    this.providedUniforms = uniforms;
    this.currentFrame = frame;
    this.minPixelRatio = minPixelRatio;
    this.maxPixelCount = maxPixelCount;

    if (!this.ownerDocument.querySelector('style[data-paper-shader]')) {
      const style = this.ownerDocument.createElement('style');
      style.innerHTML = defaultShaderStyle;
      style.setAttribute('data-paper-shader', '');
      this.ownerDocument.head.prepend(style);
    }

    this.parentElement.prepend(this.canvasElement);
    const gl = this.canvasElement.getContext('webgl2', webGlContextAttributes);
    if (!gl) {
      throw new Error('Paper Shaders: WebGL2 not supported');
    }

    this.gl = gl;
    this.initProgram();
    this.setupPositionAttribute();
    this.setupUniforms();
    this.setUniformValues(this.providedUniforms);
    this.setupResizeObserver();

    window.visualViewport?.addEventListener('resize', this.handleVisualViewportChange);
    this.setSpeed(speed);
    this.parentElement.setAttribute('data-paper-shader', '');
    this.ownerDocument.addEventListener('visibilitychange', this.handleDocumentVisibilityChange);
  }

  initProgram = () => {
    this.program = createProgram(this.gl, vertexShaderSource, this.fragmentShader);
  };

  setupPositionAttribute = () => {
    if (!this.program) return;
    const location = this.gl.getAttribLocation(this.program, 'a_position');
    const buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      this.gl.STATIC_DRAW,
    );
    this.gl.enableVertexAttribArray(location);
    this.gl.vertexAttribPointer(location, 2, this.gl.FLOAT, false, 0, 0);
  };

  setupUniforms = () => {
    const program = this.program;
    if (!program) return;
    const locations: Record<string, WebGLUniformLocation | null> = {
      u_time: this.gl.getUniformLocation(program, 'u_time'),
      u_pixelRatio: this.gl.getUniformLocation(program, 'u_pixelRatio'),
      u_resolution: this.gl.getUniformLocation(program, 'u_resolution'),
    };

    Object.entries(this.providedUniforms).forEach(([key, value]) => {
      locations[key] = this.gl.getUniformLocation(program, key);
      if (value instanceof HTMLImageElement || value instanceof HTMLVideoElement || value instanceof HTMLCanvasElement) {
        locations[`${key}AspectRatio`] = this.gl.getUniformLocation(program, `${key}AspectRatio`);
      }
    });

    this.uniformLocations = locations;
  };

  setupResizeObserver = () => {
    this.resizeObserver = new ResizeObserver(([entry]) => {
      const borderBox = entry?.borderBoxSize?.[0];
      if (borderBox) {
        const physical = entry.devicePixelContentBoxSize?.[0];
        if (physical !== undefined) {
          this.devicePixelsSupported = true;
          this.parentDevicePixelWidth = physical.inlineSize;
          this.parentDevicePixelHeight = physical.blockSize;
        }

        this.parentWidth = borderBox.inlineSize;
        this.parentHeight = borderBox.blockSize;
      }

      this.handleResize();
    });

    this.resizeObserver.observe(this.parentElement);
  };

  handleVisualViewportChange = () => {
    this.resizeObserver?.disconnect();
    this.setupResizeObserver();
  };

  handleResize = () => {
    const devicePixelRatio = Math.max(1, window.devicePixelRatio);
    const pinch = window.visualViewport?.scale ?? 1;
    let targetWidth: number;
    let targetHeight: number;

    if (this.devicePixelsSupported) {
      const scale = Math.max(1, this.minPixelRatio / devicePixelRatio);
      targetWidth = this.parentDevicePixelWidth * scale * pinch;
      targetHeight = this.parentDevicePixelHeight * scale * pinch;
    } else {
      let renderScale = Math.max(devicePixelRatio, this.minPixelRatio) * pinch;
      if (this.isSafariFlag) {
        renderScale *= Math.max(1, bestGuessBrowserZoom(this.ownerDocument));
      }
      targetWidth = Math.round(this.parentWidth) * renderScale;
      targetHeight = Math.round(this.parentHeight) * renderScale;
    }

    const cap = Math.min(1, Math.sqrt(this.maxPixelCount) / Math.sqrt(targetWidth * targetHeight));
    const nextWidth = Math.round(targetWidth * cap);
    const nextHeight = Math.round(targetHeight * cap);
    const nextRenderScale = nextWidth / Math.max(1, Math.round(this.parentWidth));

    if (
      this.canvasElement.width !== nextWidth ||
      this.canvasElement.height !== nextHeight ||
      this.renderScale !== nextRenderScale
    ) {
      this.renderScale = nextRenderScale;
      this.canvasElement.width = nextWidth;
      this.canvasElement.height = nextHeight;
      this.resolutionChanged = true;
      this.gl.viewport(0, 0, nextWidth, nextHeight);
      this.render(performance.now());
    }
  };

  render = (time: number) => {
    if (this.hasBeenDisposed || this.program === null) return;
    const delta = time - this.lastRenderTime;
    this.lastRenderTime = time;

    if (this.currentSpeed !== 0) {
      this.currentFrame += delta * this.currentSpeed;
    }

    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.gl.useProgram(this.program);
    this.gl.uniform1f(this.uniformLocations.u_time, this.currentFrame * 1e-3);

    if (this.resolutionChanged) {
      this.gl.uniform2f(this.uniformLocations.u_resolution, this.gl.canvas.width, this.gl.canvas.height);
      this.gl.uniform1f(this.uniformLocations.u_pixelRatio, this.renderScale);
      this.resolutionChanged = false;
    }

    this.videoElements.forEach((video, name) => {
      if (video.readyState < 2) return;
      const unit = this.textureUnitMap.get(name);
      if (unit === undefined) return;
      const texture = this.textures.get(name);
      if (!texture) return;
      this.gl.activeTexture(this.gl.TEXTURE0 + unit);
      this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, video);
    });

    this.canvasElements.forEach((canvas, name) => {
      const unit = this.textureUnitMap.get(name);
      if (unit === undefined) return;
      const texture = this.textures.get(name);
      if (!texture) return;
      this.gl.activeTexture(this.gl.TEXTURE0 + unit);
      this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, canvas);
    });

    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    if (this.currentSpeed !== 0 || this.videoElements.size > 0 || this.canvasElements.size > 0) {
      this.requestRender();
    } else {
      this.rafId = null;
    }
  };

  requestRender = () => {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
    }
    this.rafId = requestAnimationFrame(this.render);
  };

  setTextureUniform = (name: string, source: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement) => {
    if (source instanceof HTMLImageElement && (!source.complete || source.naturalWidth === 0)) {
      source.addEventListener('load', () => {
        delete this.uniformCache[name];
        this.setTextureUniform(name, source);
        this.requestRender();
      }, { once: true });
      return;
    }

    const existing = this.textures.get(name);
    if (existing) {
      this.gl.deleteTexture(existing);
    }

    if (!this.textureUnitMap.has(name)) {
      this.textureUnitMap.set(name, this.textureUnitMap.size);
    }

    const unit = this.textureUnitMap.get(name)!;
    this.gl.activeTexture(this.gl.TEXTURE0 + unit);
    const texture = this.gl.createTexture();
    if (!texture) return;
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, source);

    if (this.gl.getError() !== this.gl.NO_ERROR) {
      console.error('WebGL texture error');
      return;
    }

    this.textures.set(name, texture);
    const location = this.uniformLocations[name];
    if (location) {
      this.gl.uniform1i(location, unit);
      const aspectLocation = this.uniformLocations[`${name}AspectRatio`];
      if (aspectLocation) {
        if (source instanceof HTMLImageElement) {
          this.gl.uniform1f(aspectLocation, source.naturalWidth / source.naturalHeight);
        } else if (source instanceof HTMLVideoElement) {
          this.gl.uniform1f(aspectLocation, (source.videoWidth || 1) / (source.videoHeight || 1));
        } else if (source instanceof HTMLCanvasElement) {
          this.gl.uniform1f(aspectLocation, (source.width || 1) / (source.height || 1));
        }
      }
    }

    if (source instanceof HTMLVideoElement) {
      this.videoElements.set(name, source);
      if (this.rafId === null && !this.hasBeenDisposed) {
        this.lastRenderTime = performance.now();
        this.rafId = requestAnimationFrame(this.render);
      }
    }

    if (source instanceof HTMLCanvasElement) {
      this.canvasElements.set(name, source);
      if (this.rafId === null && !this.hasBeenDisposed) {
        this.lastRenderTime = performance.now();
        this.rafId = requestAnimationFrame(this.render);
      }
    }
  };

  areEqual = (left: unknown, right: unknown): boolean => {
    if (left === right) return true;
    if (Array.isArray(left) && Array.isArray(right) && left.length === right.length) {
      return left.every((value, index) => this.areEqual(value, right[index]));
    }
    return false;
  };

  setUniformValues = (uniforms: UniformMap) => {
    if (!this.program) return;
    this.gl.useProgram(this.program);

    Object.entries(uniforms).forEach(([key, value]) => {
      const cacheValue =
        value instanceof HTMLImageElement
          ? `${value.src.slice(0, 200)}|${value.naturalWidth}x${value.naturalHeight}`
          : value instanceof HTMLVideoElement
            ? value
            : value instanceof HTMLCanvasElement
              ? value
              : value;

      if (this.areEqual(this.uniformCache[key], cacheValue)) return;
      this.uniformCache[key] = cacheValue;

      const location = this.uniformLocations[key];
      if (!location) {
        console.warn('Uniform not found: ' + key);
        return;
      }

      if (value instanceof HTMLImageElement || value instanceof HTMLCanvasElement || value instanceof HTMLVideoElement) {
        this.setTextureUniform(key, value);
        return;
      }

      if (Array.isArray(value)) {
        const flattened = value.flat();
        const length = (Array.isArray(value[0]) ? value[0] : value).length;
        if (length === 2) this.gl.uniform2fv(location, flattened);
        else if (length === 3) this.gl.uniform3fv(location, flattened);
        else if (length === 4) this.gl.uniform4fv(location, flattened);
        return;
      }

      if (typeof value === 'number') {
        this.gl.uniform1f(location, value);
      } else if (typeof value === 'boolean') {
        this.gl.uniform1i(location, value ? 1 : 0);
      }
    });
  };

  setUniforms = (uniforms: UniformMap) => {
    this.setUniformValues(uniforms);
    this.providedUniforms = { ...this.providedUniforms, ...uniforms };
    this.render(performance.now());
  };

  setSpeed = (speed = 1) => {
    this.speed = speed;
    this.setCurrentSpeed(this.ownerDocument.hidden ? 0 : speed);
  };

  setCurrentSpeed = (speed: number) => {
    this.currentSpeed = speed;
    if (this.rafId === null && (speed !== 0 || this.videoElements.size > 0 || this.canvasElements.size > 0)) {
      this.lastRenderTime = performance.now();
      this.rafId = requestAnimationFrame(this.render);
    }
    if (this.rafId !== null && speed === 0 && this.videoElements.size === 0 && this.canvasElements.size === 0) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  };

  handleDocumentVisibilityChange = () => {
    this.setCurrentSpeed(this.ownerDocument.hidden ? 0 : this.speed);
  };

  dispose = () => {
    this.hasBeenDisposed = true;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.gl && this.program) {
      this.textures.forEach((texture) => this.gl.deleteTexture(texture));
      this.textures.clear();
      this.videoElements.clear();
      this.canvasElements.clear();
      this.gl.deleteProgram(this.program);
      this.program = null;
    }
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    window.visualViewport?.removeEventListener('resize', this.handleVisualViewportChange);
    this.ownerDocument.removeEventListener('visibilitychange', this.handleDocumentVisibilityChange);
    this.uniformLocations = {};
    this.canvasElement.remove();
    delete (this.parentElement as HTMLElement & { paperShaderMount?: ShaderMount }).paperShaderMount;
  };
}
